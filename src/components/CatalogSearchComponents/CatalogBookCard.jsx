import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { reservationService } from "../../api/services/reservationService";
import { favoriteService } from "../../api/services/favoriteService";
import FeedbackModal from "../BasicUIComponents/FeedbackModal";
import { Heart, LockKeyhole } from "lucide-react";

export default function CatalogBookCard({
  book,
  isFavorite = false,
  favoriteId = null,
  isReservedByUser = false,
  onReservationSuccess,
  onToggleFavorite,
  onRequireAuth,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(isFavorite);
  const [currentFavId, setCurrentFavId] = useState(favoriteId);
  const [modal, setModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    onConfirm: null,
  });

  useEffect(() => {
    setFavorited(isFavorite);
    setCurrentFavId(favoriteId);
  }, [isFavorite, favoriteId]);

  // Función auxiliar para obtener las fechas en el formato correcto (YYYY-MM-DDTHH:mm)
  const getInitialDateTime = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const promptGuestRegistration = (actionText) => {
    if (onRequireAuth) {
      onRequireAuth(actionText);
      return;
    }
    setModal({
      isOpen: true,
      type: "info",
      title: "Únete a la comunidad de Folium",
      message: `Estás explorando el catálogo como invitado.\n\nCrea una cuenta gratuita o inicia sesión para ${actionText}.`,
      confirmText: "Crear cuenta gratis",
      cancelText: "Seguir explorando",
      onConfirm: () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
        navigate("/register");
      },
    });
  };

  const handleCardClick = () => {
    if (!user || !user.id) {
      promptGuestRegistration("consultar la ficha detallada y reseñas de este ejemplar");
      return;
    }
    navigate(`/book/${book.id}`);
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();

    if (!user || !user.id) {
      promptGuestRegistration("guardar un volumen en tu colección de favoritos");
      return;
    }

    if (onToggleFavorite) {
      await onToggleFavorite(book);
      return;
    }

    try {
      if (favorited && currentFavId) {
        await favoriteService.remove(currentFavId);
        setFavorited(false);
        setCurrentFavId(null);
      } else {
        const { data } = await favoriteService.create({ book: book.id });
        setFavorited(true);
        setCurrentFavId(data?.id ?? null);
      }
    } catch (error) {
      console.error("Error al gestionar favorito:", error);
      setModal({
        isOpen: true,
        type: "error",
        title: "Error en favoritos",
        message: "No se pudo actualizar el estado de favoritos.",
        confirmText: "Aceptar",
        onConfirm: null,
      });
    }
  };

  const handleReserve = async (e) => {
    e.stopPropagation();

    if (!user || !user.id) {
      promptGuestRegistration("reservar un volumen de la colección");
      return;
    }

    try {
      const reservationPayload = {
        book: book.id,
        expires_at: getInitialDateTime(14),
      };

      await reservationService.create(reservationPayload);
      onReservationSuccess?.(book.id);
      setModal({
        isOpen: true,
        type: "success",
        title: "¡Reserva confirmada!",
        message: `Has reservado "${book.title}".`,
        confirmText: "Aceptar",
        onConfirm: null,
      });
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessages = Object.values(error.response.data)
          .flat()
          .join("\n");
        setModal({
          isOpen: true,
          type: "error",
          title: "No se pudo procesar la reserva",
          message: errorMessages,
          confirmText: "Aceptar",
          onConfirm: null,
        });
      } else {
        console.error("Error en la reserva:", error);
        setModal({
          isOpen: true,
          type: "error",
          title: "Error de conexión",
          message:
            "Ocurrió un error inesperado al intentar comunicarse con el archivo.",
          confirmText: "Aceptar",
          onConfirm: null,
        });
      }
    }
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        className="bg-surface-container border border-outline-variant/50 rounded-md p-4 flex flex-col hover:border-primary transition-colors group cursor-pointer shadow-md hover:shadow-lg animate-fade-in"
      >
        {/* Tapa del Libro */}
        <div className="relative w-full aspect-[2/3] bg-surface-container-highest border border-outline-variant/30 mb-5 flex flex-col justify-between p-3 overflow-hidden shadow-inner rounded-sm">
          {book.cover && (
            <img
              src={book.cover}
              alt={book.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {book.cover && (
            <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none" />
          )}

          <div className="flex items-start justify-between z-10">
            <span className="bg-primary text-on-primary px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
              ★ {book.category}
            </span>
            <button
              onClick={handleFavorite}
              title={favorited ? "Quitar de favoritos" : "Añadir a favoritos"}
              className={`transition-colors bg-surface-container-lowest/60 backdrop-blur-sm rounded-full p-1 flex items-center justify-center cursor-pointer ${
                favorited ? "text-primary" : "text-outline hover:text-primary"
              }`}
            >
              <span className="text-[16px] block">
                <Heart
                  className="w-4 h-4"
                  fill={favorited ? "currentColor" : "none"}
                />
              </span>
            </button>
          </div>

          {!book.cover && (
            <>
              <div className="my-auto text-center z-10">
                <span className="font-serif text-3xl text-on-surface italic font-normal px-2 block leading-none">
                  {book.title}
                </span>
              </div>

              <span className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] text-center font-bold z-10">
                {book.year}
              </span>
            </>
          )}
        </div>

        {/* Información y Acción */}
        <div className="flex flex-col flex-1">
          <h4 className="text-sm text-on-surface font-bold uppercase tracking-widest mb-1 line-clamp-1">
            {book.title}
          </h4>
          <p className="text-xs text-on-surface-variant mb-4 font-serif italic">
            {book.author}
          </p>

          {(() => {
            const availableItems =
              typeof book.available_items === "number"
                ? book.available_items
                : typeof book.availableItems === "number"
                ? book.availableItems
                : Array.isArray(book.available_items)
                ? book.available_items.length
                : Array.isArray(book.items)
                ? book.items.filter((i) => i.status === "AVAILABLE").length
                : typeof book.stock === "number"
                ? book.stock
                : null;

            const totalItems =
              typeof book.total_items === "number"
                ? book.total_items
                : typeof book.totalItems === "number"
                ? book.totalItems
                : Array.isArray(book.total_items)
                ? book.total_items.length
                : Array.isArray(book.items)
                ? book.items.length
                : null;

            const hasAvailableCopies =
              availableItems !== null
                ? availableItems > 0
                : totalItems !== null && totalItems === 0
                ? false
                : book.stock
                ? book.stock !== "Sin ejemplares" && book.stock !== "Agotado"
                : true;

            const isReservable = hasAvailableCopies && !isReservedByUser;

            return (
              <button
                onClick={handleReserve}
                disabled={!isReservable}
                className={`mt-auto w-full border py-2.5 rounded-sm flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors ${
                  !isReservable
                    ? "bg-surface-container-highest text-on-surface-variant/40 border-outline-variant/30 cursor-not-allowed pointer-events-none opacity-60"
                    : "bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container border-outline-variant/30 cursor-pointer"
                }`}
              >
                {isReservedByUser
                  ? "Ya reservado"
                  : hasAvailableCopies
                  ? "Reservar"
                  : "Sin ejemplares"}
                <span className="text-[16px]">
                  <LockKeyhole />
                </span>
              </button>
            );
          })()}
        </div>
      </article>

      <FeedbackModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
