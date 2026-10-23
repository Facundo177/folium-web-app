import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  X,
  AlertTriangle,
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
import FeedbackModal from "../components/BasicUIComponents/FeedbackModal";
import { useBook } from "../hooks/useBook";
import { adaptBookDetail } from "../api/adapters";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

import { bookService } from "../api/services/bookService";
import { authorService } from "../api/services/authorService";
import { genreService } from "../api/services/genreService";
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

  // Estados del formulario de edición
  const [formDataValues, setFormDataValues] = useState({
    title: "",
    editorial: "",
    isbn: "",
    publication_year: "",
    description: "",
  });
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Catálogos de autores y géneros para edición
  const [allAuthors, setAllAuthors] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [authorSearch, setAuthorSearch] = useState("");
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const authorWrapperRef = useRef(null);

  // Sub-formularios para nuevo autor / género durante edición
  const [showNewAuthorModal, setShowNewAuthorModal] = useState(false);
  const [newAuthorData, setNewAuthorData] = useState({ name: "", last_name: "", biography: "" });
  const [isCreatingAuthor, setIsCreatingAuthor] = useState(false);

  const [showNewGenreModal, setShowNewGenreModal] = useState(false);
  const [newGenreData, setNewGenreData] = useState({ name: "", description: "" });
  const [isCreatingGenre, setIsCreatingGenre] = useState(false);

  // Estados para lectores (Favoritos y Reservas)
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  // Modal de notificación
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  // Cerrar dropdown de autores al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authorWrapperRef.current && !authorWrapperRef.current.contains(event.target)) {
        setShowAuthorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        if (current) {
          setIsFavorited(true);
          setFavoriteId(current.id);
        } else {
          setIsFavorited(false);
          setFavoriteId(null);
        }
      })
      .catch((err) => {
        console.warn("No se pudieron cargar los favoritos:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [id, user, canManageBook]);

  // Cargar autores y géneros cuando se abre el modo edición
  useEffect(() => {
    if (!isEditing) return;
    const fetchCatalogs = async () => {
      try {
        const [authorsRes, genresRes] = await Promise.all([
          authorService.getAll(),
          genreService.getAll(),
        ]);
        setAllAuthors(authorsRes.data.results || authorsRes.data);
        setAllGenres(genresRes.data.results || genresRes.data);
      } catch (err) {
        console.error("Error cargando catálogos para edición:", err);
      }
    };
    fetchCatalogs();
  }, [isEditing]);

  // Inicializar formulario con los datos actuales del libro al abrir edición
  const handleOpenEdit = () => {
    if (!book) return;
    setFormDataValues({
      title: book.title || "",
      editorial: book.editorial || "",
      isbn: book.isbn || "",
      publication_year: book.publication_year ?? "",
      description: book.description || "",
    });
    setSelectedAuthors(book.authors || []);
    setSelectedGenres((book.genres || []).map((g) => g.id));
    setCoverFile(null);
    setCoverPreview(book.cover_image || null);
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSelectAuthor = (author) => {
    if (!selectedAuthors.some((a) => a.id === author.id)) {
      setSelectedAuthors([...selectedAuthors, author]);
    }
    setAuthorSearch("");
    setShowAuthorDropdown(false);
  };

  const handleRemoveAuthor = (idToRemove) => {
    setSelectedAuthors(selectedAuthors.filter((a) => a.id !== idToRemove));
  };

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((gId) => gId !== genreId) : [...prev, genreId]
    );
  };

  const handleCreateAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthorData.name.trim() || !newAuthorData.last_name.trim()) return;
    setIsCreatingAuthor(true);
    try {
      const response = await authorService.create(newAuthorData);
      const created = response.data;
      setAllAuthors((prev) => [...prev, created]);
      setSelectedAuthors((prev) => [...prev, created]);
      setShowNewAuthorModal(false);
      setNewAuthorData({ name: "", last_name: "", biography: "" });
      setAuthorSearch("");
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al crear autor",
        message: err.response?.data
          ? Object.values(err.response.data).flat().join("\n")
          : "No se pudo registrar el nuevo autor.",
      });
    } finally {
      setIsCreatingAuthor(false);
    }
  };

  const handleCreateGenre = async (e) => {
    e.preventDefault();
    if (!newGenreData.name.trim()) return;
    setIsCreatingGenre(true);
    try {
      const response = await genreService.create(newGenreData);
      const created = response.data;
      setAllGenres((prev) => [...prev, created]);
      setSelectedGenres((prev) => [...prev, created.id]);
      setShowNewGenreModal(false);
      setNewGenreData({ name: "", description: "" });
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al crear género",
        message: err.response?.data
          ? Object.values(err.response.data).flat().join("\n")
          : "No se pudo registrar el nuevo género.",
      });
    } finally {
      setIsCreatingGenre(false);
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (selectedAuthors.length === 0) {
      setSaveError("El libro debe tener al menos un autor asignado.");
      return;
    }
    if (selectedGenres.length === 0) {
      setSaveError("El libro debe tener al menos un género asignado.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", formDataValues.title.trim());
      formData.append("editorial", formDataValues.editorial.trim());
      formData.append("isbn", formDataValues.isbn.trim());
      formData.append("publication_year", parseInt(formDataValues.publication_year, 10));
      formData.append("description", formDataValues.description);

      selectedAuthors.forEach((a) => formData.append("authors", a.id));
      if (selectedAuthors.length === 1) {
        formData.append("authors", selectedAuthors[0].id);
      }

      selectedGenres.forEach((gId) => formData.append("genres", gId));
      if (selectedGenres.length === 1) {
        formData.append("genres", selectedGenres[0]);
      }

      if (coverFile instanceof File) {
        formData.append("cover_image", coverFile);
      }

      await bookService.patch(id, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refetch();
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Error actualizando el libro:", err);
      if (err.response?.data && typeof err.response.data === "object") {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
          .join(" | ");
        setSaveError(messages || "No se pudieron guardar los cambios del libro.");
      } else {
        setSaveError("Error de conexión al intentar actualizar el libro.");
      }
    } finally {
      setIsSaving(false);
    }
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
      if (isFavorited && favoriteId) {
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

  if (isLoading) return <p className="p-gutter">Cargando libro…</p>;
  if (error) return <p className="p-gutter">{error}</p>;
  if (!book) return <p className="p-gutter">No se encontró información del libro.</p>;

  const data = adaptBookDetail(book);



  const filteredAuthors = allAuthors.filter((a) =>
    `${a.name} ${a.last_name}`.toLowerCase().includes(authorSearch.toLowerCase())
  );

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

            <div className="w-16 h-px bg-on-secondary mb-6" />

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
          >
            ×
          </button>
        </div>
      )}

      {/* Grid Principal */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${canManageBook ? "items-start" : "items-stretch"}`}>
        {/* Columna izquierda */}
        <div className={`lg:col-span-4 lg:order-2 flex flex-col gap-6 ${canManageBook ? "lg:sticky lg:top-6" : ""}`}>

          {/* Disponibilidad y acciones */}
          <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-DEFAULT p-5 shadow-xs font-sans flex flex-col flex-1">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/50">
              <span className="text-label-caps text-on-surface-variant font-bold">
                Disponibilidad
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  data.availableItems > 0
                    ? "bg-surface-container text-on-surface border-outline-variant"
                    : "bg-error-container text-on-error-container border-error/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    data.availableItems > 0 ? "bg-primary" : "bg-error"
                  }`}
                />
                {data.availableItems > 0 ? "Disponible" : "Sin ejemplares"}
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
                  disabled={isReserving || data.availableItems <= 0}
                  className={`w-full py-2.5 px-4 rounded-DEFAULT text-label-caps transition-colors inline-flex items-center justify-center gap-2 shadow-2xs cursor-pointer ${
                    data.availableItems > 0
                      ? "bg-primary text-on-primary hover:bg-inverse-surface"
                      : "bg-surface-container text-outline cursor-not-allowed"
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4" />
                  {isReserving ? "RESERVANDO..." : "RESERVAR EJEMPLAR"}
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading}
                  className="w-full py-2 px-4 rounded-DEFAULT text-label-caps border border-outline text-on-surface hover:bg-surface-container transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorited ? "fill-primary text-primary" : "text-on-surface-variant"
                    }`}
                  />
                  {isFavorited ? "EN TUS FAVORITOS" : "GUARDAR EN FAVORITOS"}
                </button>
              </div>
            )}

            {/* Visitantes no autenticados (GUEST): Ficha limitada con invitación */}
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
                  onClick={handleOpenEdit}
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

        {/* Columna derecha */}
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-sans">
                    <thead className="border-b border-outline-variant/40 text-label-caps text-on-surface-variant">
                      <tr>
                        <th className="py-2 px-3">Código</th>
                        <th className="py-2 px-3">Ubicación</th>
                        <th className="py-2 px-3">Estado</th>
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

      {/* MODAL DE EDICIÓN DE LIBRO (Bibliotecario / Admin) */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-surface border border-outline-variant rounded-sm shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            <div className="px-6 py-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
              <div>
                <span className="text-label-caps text-primary block">
                  Gestión de Catálogo
                </span>
                <h2 className="text-headline-sm font-serif text-on-surface">
                  Modificar Datos del Libro
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBook} className="p-6 overflow-y-auto space-y-5 flex-1">
              {saveError && (
                <div className="p-3 bg-error-container border border-error text-on-error-container text-sm rounded-sm">
                  {saveError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1.5">
                    Título del Libro *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDataValues.title}
                    onChange={(e) =>
                      setFormDataValues({ ...formDataValues, title: e.target.value })
                    }
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1.5">
                    Editorial *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDataValues.editorial}
                    onChange={(e) =>
                      setFormDataValues({ ...formDataValues, editorial: e.target.value })
                    }
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1.5">
                    ISBN (10 o 13 dígitos) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    value={formDataValues.isbn}
                    onChange={(e) =>
                      setFormDataValues({
                        ...formDataValues,
                        isbn: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1.5">
                    Año de Publicación *
                  </label>
                  <input
                    type="number"
                    required
                    min={868}
                    max={new Date().getFullYear()}
                    value={formDataValues.publication_year}
                    onChange={(e) =>
                      setFormDataValues({
                        ...formDataValues,
                        publication_year: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Autores */}
              <div ref={authorWrapperRef} className="relative">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-label-caps text-on-surface-variant">
                    Autores *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewAuthorModal(true)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    + Crear nuevo autor
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedAuthors.map((author) => (
                    <span
                      key={author.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-medium rounded-full"
                    >
                      {author.name} {author.last_name}
                      <button
                        type="button"
                        onClick={() => handleRemoveAuthor(author.id)}
                        className="hover:text-error font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <input
                  type="text"
                  value={authorSearch}
                  onFocus={() => setShowAuthorDropdown(true)}
                  onChange={(e) => {
                    setAuthorSearch(e.target.value);
                    setShowAuthorDropdown(true);
                  }}
                  placeholder="Buscar autor para agregar..."
                  className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                />

                {showAuthorDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-surface-container-lowest border border-outline-variant shadow-lg max-h-44 overflow-y-auto rounded-sm">
                    {filteredAuthors.length > 0 ? (
                      filteredAuthors.map((author) => {
                        const isSelected = selectedAuthors.some((a) => a.id === author.id);
                        return (
                          <div
                            key={author.id}
                            onClick={() => !isSelected && handleSelectAuthor(author)}
                            className={`p-2.5 text-sm border-b border-surface-container last:border-0 flex justify-between items-center ${
                              isSelected
                                ? "bg-surface-container text-outline cursor-not-allowed"
                                : "hover:bg-primary/5 cursor-pointer text-on-surface"
                            }`}
                          >
                            <span>
                              {author.name} {author.last_name}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] uppercase tracking-wider">
                                Seleccionado
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-xs text-outline text-center">
                        No se encontraron autores con ese nombre.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Géneros */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-label-caps text-on-surface-variant">
                    Géneros Literarios *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewGenreModal(true)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    + Crear nuevo género
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 p-3 bg-surface-container-lowest border border-outline-variant rounded-sm max-h-36 overflow-y-auto">
                  {allGenres.map((genre) => {
                    const isSelected = selectedGenres.includes(genre.id);
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => toggleGenre(genre.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border cursor-pointer ${
                          isSelected
                            ? "bg-primary text-on-primary border-primary shadow-xs"
                            : "bg-surface text-on-surface border-outline-variant hover:border-primary"
                        }`}
                      >
                        {genre.name} {isSelected ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Portada */}
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-1.5">
                  Imagen de Portada (opcional)
                </label>
                <div className="flex items-center gap-4">
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Vista previa de portada"
                      className="w-16 h-24 object-cover rounded-sm border border-outline-variant shrink-0"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="w-full p-2 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface file:mr-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-container cursor-pointer"
                  />
                </div>
              </div>

              {/* Sinopsis */}
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-1.5">
                  Sinopsis / Descripción
                </label>
                <textarea
                  rows={4}
                  value={formDataValues.description}
                  onChange={(e) =>
                    setFormDataValues({ ...formDataValues, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Escribí una breve reseña o sinopsis del libro..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-outline-variant text-on-surface hover:bg-surface-container rounded-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-primary text-on-primary hover:opacity-90 rounded-sm shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Guardando cambios..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: CREAR NUEVO AUTOR */}
      {showNewAuthorModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface p-6 rounded-sm shadow-xl max-w-md w-full border border-outline-variant">
            <h4 className="font-serif text-lg font-bold text-on-surface mb-4">
              Añadir Nuevo Autor
            </h4>
            <form onSubmit={handleCreateAuthor} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-outline mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={newAuthorData.name}
                  onChange={(e) => setNewAuthorData({ ...newAuthorData, name: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-outline mb-1">Apellido *</label>
                <input
                  type="text"
                  required
                  value={newAuthorData.last_name}
                  onChange={(e) =>
                    setNewAuthorData({ ...newAuthorData, last_name: e.target.value })
                  }
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-outline mb-1">Biografía</label>
                <textarea
                  rows={3}
                  value={newAuthorData.biography}
                  onChange={(e) =>
                    setNewAuthorData({ ...newAuthorData, biography: e.target.value })
                  }
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAuthorModal(false)}
                  className="px-4 py-2 text-xs text-outline hover:text-on-surface cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAuthor}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-sm cursor-pointer"
                >
                  {isCreatingAuthor ? "Guardando..." : "Guardar Autor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: CREAR NUEVO GÉNERO */}
      {showNewGenreModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface p-6 rounded-sm shadow-xl max-w-md w-full border border-outline-variant">
            <h4 className="font-serif text-lg font-bold text-on-surface mb-4">
              Crear Nuevo Género
            </h4>
            <form onSubmit={handleCreateGenre} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-outline mb-1">
                  Nombre del Género *
                </label>
                <input
                  type="text"
                  required
                  value={newGenreData.name}
                  onChange={(e) => setNewGenreData({ ...newGenreData, name: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-outline mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={newGenreData.description}
                  onChange={(e) =>
                    setNewGenreData({ ...newGenreData, description: e.target.value })
                  }
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewGenreModal(false)}
                  className="px-4 py-2 text-xs text-outline hover:text-on-surface cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGenre}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-sm cursor-pointer"
                >
                  {isCreatingGenre ? "Guardando..." : "Guardar Género"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface border border-outline-variant rounded-sm shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-3">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="text-headline-sm font-serif text-on-surface">
                ¿Eliminar este libro?
              </h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-4">
              Estás por eliminar permanentemente{" "}
              <strong className="text-on-surface">&ldquo;{data.title}&rdquo;</strong> y sus
              ejemplares asociados del catálogo. Esta acción no se puede deshacer.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-error-container border border-error text-on-error-container text-xs rounded-sm">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-outline-variant text-on-surface hover:bg-surface-container rounded-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteBook}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-error text-on-error hover:opacity-90 rounded-sm shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Eliminando..." : "Sí, Eliminar Libro"}
              </button>
            </div>
          </div>
        </div>
      )}

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
