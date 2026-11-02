import { useState, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { reservationService } from "../../api/services/reservationService";
import { favoriteService } from "../../api/services/favoriteService";
import { Heart, LockKeyhole } from "lucide-react";

function CatalogBookCard({
  book,
  isFavorite = false,
  favoriteId = null,
  isReservedByUser = false,
  reservationId = null,
  onReservationSuccess,
  onCancelSuccess,
  onToggleFavorite,
  onRequireAuth,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(isFavorite);
  const [currentFavId, setCurrentFavId] = useState(favoriteId);
  const [confirmAction, setConfirmAction] = useState(null); // null | "reserve" | "cancel"
  const [processing, setProcessing] = useState(false);

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
    } else {
      navigate("/register");
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();

    // 1. Si no está logueado, disparar prompt para invitados
    if (!user || !user.id) {
      promptGuestRegistration("guardar este volumen en tu lista de favoritos");
      return;
    }

    if (onToggleFavorite) {
      onToggleFavorite(book);
      return;
    }

    // 2. Comportamiento autónomo si no se pasa handler externo
    if (favorited && currentFavId) {
      try {
        await favoriteService.remove(currentFavId);
        setFavorited(false);
        setCurrentFavId(null);
      } catch (err) {
        console.error("Error al quitar favorito:", err);
      }
    } else {
      try {
        const { data: newFav } = await favoriteService.create({ book: book.id });
        setFavorited(true);
        setCurrentFavId(newFav.id);
      } catch (err) {
        console.error("Error al añadir favorito:", err);
      }
    }
  };

  const handleQuickView = () => {
    navigate(`/book/${book.id}`);
  };

  // El botón solo abre el modal de confirmación
  const handleActionClick = (e) => {
    e.stopPropagation();

    if (!user || !user.id) {
      promptGuestRegistration("reservar un ejemplar físico de la colección");
      return;
    }

    setConfirmAction(isReservedByUser ? "cancel" : "reserve");
  };

  // La reserva real se hace al confirmar en el modal
  const handleConfirmReserve = async () => {
    setProcessing(true);
    try {
      const { data: newReservation } = await reservationService.create({
        book: book.id,
        expires_at: getInitialDateTime(14),
      });
      onReservationSuccess?.(book.id, newReservation?.id);
      setConfirmAction(null);
    } catch (err) {
      console.error("Error al reservar:", err);
    } finally {
      setProcessing(false);
    }
  };

  // La cancelación real se hace al confirmar en el modal
  const handleConfirmCancel = async () => {
    setProcessing(true);
    try {
      await reservationService.remove(reservationId);
      onCancelSuccess?.(book.id);
      setConfirmAction(null);
    } catch (err) {
      console.error("Error al cancelar la reserva:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <article
      onClick={handleQuickView}
      className="group bg-surface-container border border-outline-variant/60 rounded-md p-5 flex flex-col justify-between hover:border-primary/40 transition-colors duration-200 shadow-sm relative overflow-hidden cursor-pointer"
    >
      <div className="pointer-events-none absolute inset-1 border border-outline-variant/20 rounded-sm" />

      {/* --- PARTE SUPERIOR: Tag + Favorito --- */}
      <div className="flex justify-between items-start gap-2 mb-4 relative z-10">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 truncate max-w-[170px]">
          {book.category || "General"}
        </span>

        {/* Botón de Favorito */}
        <button
          onClick={handleToggleFavorite}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors border cursor-pointer shrink-0 ${
            favorited
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:text-primary hover:border-primary"
          }`}
          title={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* --- IMAGEN DE PORTADA / PORTADA EDITORIAL CON FRAME --- */}
      <div className="relative w-full aspect-[2/3] max-h-56 mb-4 flex items-center justify-center bg-surface-container-low border border-outline-variant/40 rounded-sm overflow-hidden z-10">
        {book.cover && (
          <img
            src={book.cover}
            alt={book.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {book.cover && (
          <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none" />
        )}

        {!book.cover && (
          <>
            <div className="pointer-events-none absolute inset-2 border border-outline-variant/40 rounded-[2px]" />
            <div className="pointer-events-none absolute inset-3 border border-outline-variant/20 rounded-[1px]" />

            <div className="p-4 text-center z-10 flex flex-col items-center justify-center h-full">
              <span className="font-serif italic text-lg text-on-surface line-clamp-3 leading-snug">
                {book.title}
              </span>
              <span className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant mt-2 line-clamp-1">
                {book.author}
              </span>
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-4 z-10"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.15) 35%, transparent 100%)",
              }}
            />
          </>
        )}
      </div>

      {/* --- INFORMACIÓN: Título, Autor, Editorial, Ejemplares --- */}
      <div className="flex flex-col flex-grow z-10">
        <h3
          className="font-serif text-lg text-on-surface font-medium leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors"
          title={book.title}
        >
          <Link
            to={`/book/${book.id}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-primary transition-colors no-underline text-inherit"
          >
            {book.title}
          </Link>
        </h3>

        <p className="font-serif italic text-sm text-on-surface-variant line-clamp-1 mb-2">
          {book.author}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-4">
          <span className="truncate max-w-[140px]">{book.editorial || "Edición General"}</span>
          <span>•</span>
          <span>{book.year || "—"}</span>
        </div>

        {/* --- DISPONIBILIDAD Y BOTÓN DE ACCIÓN --- */}
        {(() => {
          const availableCount =
            typeof book.availableItems === "number"
              ? book.availableItems
              : typeof book.available_items === "number"
              ? book.available_items
              : Array.isArray(book.available_items)
              ? book.available_items.length
              : null;

          const totalCount =
            typeof book.totalItems === "number"
              ? book.totalItems
              : typeof book.total_items === "number"
              ? book.total_items
              : Array.isArray(book.total_items)
              ? book.total_items.length
              : null;

          const hasAvailableCopies =
            availableCount !== null
              ? availableCount > 0
              : totalCount !== null && totalCount === 0
              ? false
              : true;

          const isGuestUser = !user || !user.id;
          const isReservable = hasAvailableCopies && !isReservedByUser;
          const canClick = !isGuestUser && (isReservable || isReservedByUser);

          return (
            <button
              onClick={handleActionClick}
              disabled={!canClick}
              className={`mt-auto w-full border py-2.5 rounded-sm flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors ${
                !canClick
                  ? "bg-surface-container-highest text-on-surface-variant/40 border-outline-variant/30 cursor-not-allowed pointer-events-none opacity-60"
                  : "bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container border-outline-variant/30 cursor-pointer"
              }`}
            >
              {isGuestUser
                ? "Iniciá sesión para reservar"
                : isReservedByUser
                ? "Cancelar reserva"
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

      {/* --- MODAL DE CONFIRMACIÓN (reservar / cancelar) --- */}
      {confirmAction &&
        createPortal(
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!processing) setConfirmAction(null);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container border border-outline-variant/60 rounded-md p-6 w-full max-w-sm shadow-lg"
            >
              <h4 className="font-serif text-lg text-on-surface mb-2">
                {confirmAction === "cancel" ? "Cancelar reserva" : "Confirmar reserva"}
              </h4>
              <p className="text-sm text-on-surface-variant mb-6">
                {confirmAction === "cancel"
                  ? `¿Seguro que querés cancelar la reserva de "${book.title}"?`
                  : `¿Querés reservar "${book.title}"?`}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={processing}
                  className="px-4 py-2 text-xs font-bold tracking-widest uppercase border border-outline-variant/40 rounded-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer disabled:opacity-50"
                >
                  Volver
                </button>
                <button
                  onClick={
                    confirmAction === "cancel" ? handleConfirmCancel : handleConfirmReserve
                  }
                  disabled={processing}
                  className="px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-sm bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container transition-colors cursor-pointer disabled:opacity-50"
                >
                  {processing
                    ? "Procesando..."
                    : confirmAction === "cancel"
                    ? "Sí, cancelar"
                    : "Sí, reservar"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </article>
  );
}

export default memo(CatalogBookCard);