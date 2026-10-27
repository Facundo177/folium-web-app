import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookmarkCheck,
  Heart,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Sparkles,
  UserPlus,
  LogIn,
} from "lucide-react";
import BookCover from "../components/BookDetailComponents/BookCover";
import BookDetailHeader from "../components/BookDetailComponents/BookDetailHeader";
import BookInfo from "../components/BookDetailComponents/BookInfo";
import BookReviews from "../components/BookDetailComponents/BookReviews";
import BookEditModal from "../components/BookDetailComponents/BookEditModal";
import FeedbackModal from "../components/BasicUIComponents/FeedbackModal";
import { useBook } from "../hooks/useBook";
import { adaptBookDetail } from "../api/adapters";
import { bookService } from "../api/services/bookService";
import { reservationService } from "../api/services/reservationService";
import { favoriteService } from "../api/services/favoriteService";
import { useAuth } from "../auth/AuthProvider";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { book, isLoading, error, refetch } = useBook(id);

  const canManageBook = ["LIBRARIAN", "ADMIN"].includes(user?.role);

  // Estados para modales de Edición y Eliminación de Libro
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados para lectores (Favoritos y Reservas)
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  // Valores derivados para lectores activos
  const isReservedByUser = Boolean(user?.id && !canManageBook && isReserved);
  const isFavoritedByUser = Boolean(user?.id && !canManageBook && isFavorited);

  // Modal de notificación general
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  // Cargar estado de favoritos si el usuario es un lector autenticado
  useEffect(() => {
    if (!user?.id || canManageBook) return;

    let isMounted = true;
    favoriteService
      .getAll()
      .then((res) => {
        if (!isMounted) return;
        const favList = res.data?.results || res.data || [];
        const current = favList.find(
          (f) => f.book === parseInt(id, 10) || f.book?.id === parseInt(id, 10)
        );
        setIsFavorited(Boolean(current));
        setFavoriteId(current ? current.id : null);
      })
      .catch((err) => {
        console.warn("No se pudieron cargar los favoritos:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [id, user, canManageBook]);

  // Cargar estado de reserva activa si el usuario es un lector autenticado
  useEffect(() => {
    if (!user?.id || canManageBook) return;

    let isMounted = true;
    reservationService
      .getAll()
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.results || res.data || [];
        const current = list.find((r) => {
          if (r.status !== "PENDING") return false;
          const bId = r.book?.id ?? r.book;
          return String(bId) === String(id);
        });
        setIsReserved(Boolean(current));
      })
      .catch((err) => {
        console.warn("No se pudieron cargar las reservas:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [id, user, canManageBook]);

  const handleSavedEdit = async () => {
    await refetch();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleDeleteBook = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await bookService.remove(id);
      navigate("/librarian/inventory", { replace: true });
    } catch (err) {
      console.error("Error eliminando el libro:", err);
      setDeleteError(
        err.response?.data?.detail ||
          "No se pudo eliminar el libro. Verificá que no tenga préstamos o reservas activas."
      );
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reserva de libro para lectores
  const handleReserveBook = async () => {
    if (!user || !user.id) {
      setFeedbackModal({
        isOpen: true,
        type: "info",
        title: "Inicio de sesión requerido",
        message: "Debes iniciar sesión con tu cuenta de lector para reservar un ejemplar físico.",
      });
      return;
    }

    if (isReservedByUser) {
      setFeedbackModal({
        isOpen: true,
        type: "info",
        title: "Ya reservado",
        message: "Ya tienes una reserva activa pendiente para este ejemplar.",
      });
      return;
    }

    if (data.availableItems <= 0) {
      setFeedbackModal({
        isOpen: true,
        type: "warning",
        title: "Sin ejemplares disponibles",
        message: "Actualmente no quedan ejemplares físicos disponibles para reservar.",
      });
      return;
    }

    setIsReserving(true);
    try {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const expiresAt = d.toISOString().slice(0, 16);

      await reservationService.create({
        book: data.id,
        expires_at: expiresAt,
      });

      setIsReserved(true);

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Reserva confirmada",
        message: `Has reservado con éxito un ejemplar de "${data.title}".`,
      });
      await refetch();
    } catch (err) {
      console.error("Error al procesar la reserva:", err);
      const errorMsg = err.response?.data
        ? Object.values(err.response.data).flat().join(" ")
        : "Ocurrió un error al procesar tu solicitud de reserva.";
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "No se pudo realizar la reserva",
        message: errorMsg,
      });
    } finally {
      setIsReserving(false);
    }
  };

  // Guardar / Quitar favorito
  const handleToggleFavorite = async () => {
    if (!user || !user.id) {
      setFeedbackModal({
        isOpen: true,
        type: "info",
        title: "Inicio de sesión requerido",
        message: "Debes iniciar sesión para poder guardar este volumen en favoritos.",
      });
      return;
    }

    setIsFavoriteLoading(true);
    try {
      if (isFavoritedByUser && favoriteId) {
        await favoriteService.remove(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
      } else {
        const { data: newFav } = await favoriteService.create({ book: data.id });
        setIsFavorited(true);
        setFavoriteId(newFav?.id ?? null);
      }
    } catch (err) {
      console.error("Error al alternar favorito:", err);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error en favoritos",
        message: "No se pudo actualizar el estado de favoritos. Por favor intentá nuevamente.",
      });
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  if (isLoading) return <p className="p-gutter text-on-surface">Cargando libro…</p>;
  if (error) return <p className="p-gutter text-error">{error}</p>;
  if (!book) return <p className="p-gutter text-on-surface">No se encontró información del libro.</p>;

  const data = adaptBookDetail(book);

  const locations =
    data.items && data.items.length > 0
      ? [...new Set(data.items.map((i) => i.location).filter(Boolean))].join(", ")
      : "";

  return (
    <div className="max-w-(--spacing-container-max) mx-auto p-gutter bg-background min-h-screen">
      <BookDetailHeader category={data.category} />

      {/* HERO: portada protagonista + título, autor y datos clave */}
      <section className="relative overflow-hidden rounded-DEFAULT bg-primary-container text-on-primary-container border border-outline/30 shadow-md mb-stack-lg">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-secondary-container" />
        <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full border border-outline/20" />
        <div className="pointer-events-none absolute -right-12 -top-12 w-56 h-56 rounded-full border border-outline/20" />

        <div className="relative grid grid-cols-1 md:grid-cols-[18rem_1fr] gap-8 md:gap-12 p-6 md:p-10 items-center">
          <div className="w-64 md:w-72 mx-auto -rotate-2 hover:rotate-0 transition-transform duration-500 drop-shadow-2xl">
            <BookCover imageSrc={data.cover} title={data.title} />
          </div>

          <div className="font-sans">
            {data.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {data.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 text-label-caps rounded-DEFAULT border border-on-secondary/60 text-on-secondary"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <h1 className="font-serif font-normal text-4xl md:text-5xl lg:text-6xl leading-tight mb-3">
              {data.title}
            </h1>
            <p className="font-serif text-xl md:text-2xl opacity-80 mb-6">
              por {data.author}
            </p>

            <div className="w-full h-px bg-on-secondary mb-6" />

            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
              <div>
                <dt className="text-label-caps opacity-70 mb-1">DISPONIBLES</dt>
                <dd className="font-serif text-2xl">
                  {typeof data.availableItems === "number" ? data.availableItems : (Array.isArray(data.availableItems) ? data.availableItems.length : 0)}
                  <span className="text-base opacity-60"> / {typeof data.totalItems === "number" ? data.totalItems : (data.items?.length || 0)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-label-caps opacity-70 mb-1">AÑO</dt>
                <dd className="font-serif text-2xl">{typeof data.year === "object" ? "—" : (data.year || "—")}</dd>
              </div>
              <div>
                <dt className="text-label-caps opacity-70 mb-1">EDITORIAL</dt>
                <dd className="text-body-lg font-medium">{typeof data.editorial === "string" ? (data.editorial || "—") : "—"}</dd>
              </div>
              <div>
                <dt className="text-label-caps opacity-70 mb-1">ISBN</dt>
                <dd className="text-body-lg font-medium">
                  {data.isbn && typeof data.isbn === "string"
                    ? data.isbn.length > 3
                      ? `${data.isbn.slice(0, 3)}-${data.isbn.slice(3)}`
                      : data.isbn
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Notificación de éxito tras editar */}
      {saveSuccess && (
        <div className="mb-stack-md p-3.5 bg-surface-container border border-outline text-on-surface rounded-DEFAULT flex items-center justify-between text-body-md shadow-xs">
          <span className="font-medium">Los datos del libro se actualizaron correctamente.</span>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-on-surface hover:opacity-75 font-bold px-2 cursor-pointer"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      )}

      {/* Grid Principal */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${canManageBook ? "items-start" : "items-stretch"}`}>
        {/* Columna de disponibilidad y acciones */}
        <div className={`lg:col-span-4 lg:order-2 flex flex-col gap-6 ${canManageBook ? "lg:sticky lg:top-6" : ""}`}>
          <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-DEFAULT p-5 shadow-xs font-sans flex flex-col flex-1">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/50">
              <span className="text-label-caps text-on-surface-variant font-bold">
                Disponibilidad
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  isReservedByUser
                    ? "bg-secondary-container/40 border-secondary/30 text-on-surface"
                    : data.availableItems > 0
                    ? "bg-surface-container text-on-surface border-outline-variant"
                    : "bg-error-container text-on-error-container border-error/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isReservedByUser
                      ? "bg-secondary"
                      : data.availableItems > 0
                      ? "bg-primary animate-pulse"
                      : "bg-error"
                  }`}
                />
                {isReservedByUser
                  ? "Reservado por ti"
                  : data.availableItems > 0
                  ? "Disponible"
                  : "Sin ejemplares"}
              </span>
            </div>

            <div className="my-4">
              <span className="text-4xl font-serif font-bold text-on-surface block">
                {data.availableItems}
              </span>
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                {data.availableItems === 1 ? "ejemplar disponible" : "ejemplares disponibles"} de{" "}
                {data.totalItems || data.items?.length || 0}
              </span>
            </div>

            {locations && (
              <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-DEFAULT border border-outline-variant/50 mb-4">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">
                  Ubicación: <strong className="text-on-surface font-medium">{locations}</strong>
                </span>
              </div>
            )}

            {/* Lectores autenticados */}
            {!canManageBook && user && (
              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleReserveBook}
                  disabled={isReserving || isReservedByUser || data.availableItems <= 0}
                  className={`w-full py-2.5 px-4 rounded-DEFAULT text-label-caps transition-colors inline-flex items-center justify-center gap-2 shadow-2xs ${
                    isReservedByUser
                      ? "bg-surface-container-highest text-on-surface-variant/40 border border-outline-variant/30 cursor-not-allowed pointer-events-none opacity-60"
                      : data.availableItems <= 0
                      ? "bg-surface-container text-outline border border-outline-variant/30 cursor-not-allowed pointer-events-none"
                      : "bg-primary text-on-primary hover:bg-inverse-surface cursor-pointer"
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4" />
                  {isReserving
                    ? "RESERVANDO..."
                    : isReservedByUser
                    ? "YA RESERVADO"
                    : data.availableItems <= 0
                    ? "SIN EJEMPLARES DISPONIBLES"
                    : "RESERVAR EJEMPLAR"}
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading}
                  className="w-full py-2 px-4 rounded-DEFAULT text-label-caps border border-outline text-on-surface hover:bg-surface-container transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavoritedByUser ? "fill-primary text-primary" : "text-on-surface-variant"
                    }`}
                  />
                  {isFavoritedByUser ? "EN TUS FAVORITOS" : "GUARDAR EN FAVORITOS"}
                </button>
              </div>
            )}

            {/* Visitantes no autenticados (GUEST): Ficha con invitación accesible */}
            {!user && (
              <div className="mt-2 p-4 bg-surface-container/70 border border-outline-variant/60 rounded-DEFAULT flex flex-col gap-3">
                <div className="inline-flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Modo Lectura Limitada</span>
                </div>
                <h4 className="font-serif text-lg text-on-surface font-medium leading-snug">
                  Viví la experiencia completa
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Para solicitar préstamos físicos, reservar este volumen o compartir tus reseñas con la comunidad, unite a Folium.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/register"
                    className="w-full py-2 px-3 rounded-DEFAULT text-label-caps bg-primary text-on-primary hover:opacity-90 transition-opacity text-center text-xs font-bold uppercase tracking-wider no-underline inline-flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Crear cuenta gratis
                  </Link>
                  <Link
                    to="/login"
                    className="w-full py-1.5 px-3 rounded-DEFAULT text-label-caps border border-outline text-on-surface hover:bg-surface-container transition-colors text-center text-xs font-bold uppercase tracking-wider no-underline inline-flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Iniciar sesión
                  </Link>
                </div>
              </div>
            )}

            {/* Bibliotecarios */}
            {canManageBook && (
              <div className="pt-4 border-t border-outline-variant/60 flex flex-col gap-2">
                <span className="text-label-caps text-outline font-bold tracking-wider mb-1">
                  Gestión de Obra
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2 px-3 rounded-DEFAULT text-label-caps border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar Libro
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/librarian/inventory/newItem")}
                  className="w-full py-2 px-3 rounded-DEFAULT text-label-caps bg-primary text-on-primary hover:bg-inverse-surface transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir Ejemplar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full py-1.5 px-3 rounded-DEFAULT text-label-caps text-error border border-error/40 hover:bg-error hover:text-on-error transition-colors inline-flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar Libro
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Columna de Información del Libro */}
        <div className="lg:col-span-8 lg:order-1 flex flex-col gap-6">
          <BookInfo
            className="flex-1"
            description={data.description}
          />

          {/* Ejemplares físicos (solo bibliotecarios) */}
          {canManageBook && (
            <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-DEFAULT p-5 shadow-2xs font-sans">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-outline-variant/40">
                <h3 className="text-label-caps text-primary font-bold uppercase tracking-widest">
                  Ejemplares Físicos{" "}
                  <span className="text-on-surface-variant font-normal">
                    ({data.items?.length || 0})
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/librarian/inventory/newItem")}
                  className="text-label-caps text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir ejemplar
                </button>
              </div>

              {data.items && data.items.length > 0 ? (
                <div
                  tabIndex={0}
                  role="region"
                  aria-label="Ejemplares físicos registrados"
                  className="overflow-x-auto focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  <table className="w-full text-left text-sm font-sans">
                    <thead className="border-b border-outline-variant/40 text-label-caps text-on-surface-variant">
                      <tr>
                        <th scope="col" className="py-2 px-3">Código</th>
                        <th scope="col" className="py-2 px-3">Ubicación</th>
                        <th scope="col" className="py-2 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 text-on-surface">
                      {data.items.map((item) => {
                        const isAvailable = item.status === "AVAILABLE";
                        return (
                          <tr key={item.id} className="hover:bg-surface-container/30 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-medium text-primary">
                              {item.inventory_code}
                            </td>
                            <td className="py-2.5 px-3 text-on-surface-variant">
                              {item.location || "Sin asignar"}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                  isAvailable
                                    ? "bg-surface-container text-on-surface border-outline-variant"
                                    : "bg-tertiary-fixed text-on-tertiary-fixed-variant border-transparent"
                                }`}
                              >
                                {item.status_display || item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-body-md text-on-surface-variant py-2">
                  No hay ejemplares físicos registrados para esta obra.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reseñas a todo el ancho (solo para lectores registrados y bibliotecarios) */}
      {user && (
        <div className="mt-stack-lg">
          <BookReviews bookId={data.id} />
        </div>
      )}

      {/* Modal accesible de edición de libro */}
      <BookEditModal
        isOpen={isEditing}
        book={book}
        onClose={() => setIsEditing(false)}
        onSaved={handleSavedEdit}
      />

      {/* Modal accesible de confirmación de eliminación de libro */}
      <FeedbackModal
        isOpen={showDeleteConfirm}
        type="warning"
        title="¿Eliminar este libro?"
        message={
          data
            ? `Estás por eliminar permanentemente "${data.title}" y sus ejemplares asociados del catálogo. Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Sí, Eliminar Libro"
        cancelText="Cancelar"
        isLoading={isDeleting}
        onConfirm={handleDeleteBook}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteConfirm(false);
          }
        }}
      />

      {/* Modal accesible de error al eliminar libro */}
      <FeedbackModal
        isOpen={Boolean(deleteError)}
        type="error"
        title="Error al eliminar libro"
        message={deleteError || ""}
        confirmText="Entendido"
        onClose={() => setDeleteError(null)}
      />

      {/* Modal accesible de notificaciones de usuario */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
