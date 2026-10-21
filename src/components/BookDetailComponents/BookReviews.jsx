import { useState, useEffect, useMemo } from "react";
import { reviewService } from "../../api/services/reviewService";
import { useAuth } from "../../auth/AuthProvider";
import FeedbackModal from "../BasicUIComponents/FeedbackModal";
import { Star, Trash2, Edit3, Send, MessageSquare } from "lucide-react";

const MAX_COMMENT_LENGTH = 500;
const MIN_COMMENT_LENGTH = 10;

export default function BookReviews({ bookId }) {
  const { user } = useAuth();
  const isModerator = ["LIBRARIAN", "ADMIN"].includes(user?.role);

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado del formulario de reseña
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Estados para modales personalizados
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "error",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!bookId) return;

    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await reviewService.getAll({ book: bookId });
        setReviews(data);
      } catch (err) {
        console.error("Error al cargar reseñas:", err);
        setError("No se pudieron cargar las reseñas de este volumen.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [bookId]);

  // Verificamos si el usuario actual ya dejó una reseña en este libro
  const myReview = useMemo(() => {
    if (!user?.id) return null;
    return reviews.find(
      (r) => (r.user_detail?.id ?? r.user) === user.id
    );
  }, [reviews, user]);

  // Promedio de calificación del libro
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleStartEdit = (review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment || "");
    setFormError(null);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment("");
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!user || !user.id || isModerator) {
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length < MIN_COMMENT_LENGTH) {
      setFormError(
        `El comentario debe tener al menos ${MIN_COMMENT_LENGTH} caracteres para aportar valor a la comunidad.`
      );
      return;
    }

    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      setFormError(
        `El comentario no puede superar los ${MAX_COMMENT_LENGTH} caracteres.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingReviewId) {
        const { data: updated } = await reviewService.patch(editingReviewId, {
          rating,
          comment: trimmedComment,
        });
        setReviews((prev) =>
          prev.map((r) => (r.id === editingReviewId ? updated : r))
        );
        setEditingReviewId(null);
      } else {
        const { data: created } = await reviewService.create({
          book: Number(bookId),
          rating,
          comment: trimmedComment,
        });
        setReviews((prev) => [created, ...prev]);
      }

      setRating(5);
      setComment("");
    } catch (err) {
      console.error("Error al guardar reseña:", err);
      if (err.response && err.response.data) {
        const messages = Object.values(err.response.data).flat().join(" ");
        setFormError(messages);
      } else {
        setFormError("Ocurrió un error al publicar tu reseña.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);

    try {
      await reviewService.remove(reviewToDelete);
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete));
      if (editingReviewId === reviewToDelete) {
        handleCancelEdit();
      }
      setReviewToDelete(null);
    } catch (err) {
      console.error("Error al eliminar reseña:", err);
      setReviewToDelete(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al eliminar",
        message: "No se pudo eliminar la reseña.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-outline-variant bg-surface-container-lowest flex flex-col font-sans shadow-sm">
      {/* Cabecera */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-gutter border-b border-outline-variant">
        <div>
          <h3 className="text-title-lg text-on-surface">
            Reseñas de la Comunidad
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {isModerator
              ? "Vista de moderación: puedes eliminar comentarios inapropiados u ofensivos"
              : "Opiniones de lectores sobre esta obra"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {averageRating && (
            <div className="flex items-center gap-1.5 border border-outline-variant bg-surface-container px-3 py-1 rounded-sm">
              <Star className="w-4 h-4 text-primary fill-current" />
              <span className="text-body-md font-bold text-on-surface">
                {averageRating}
              </span>
              <span className="text-xs text-on-surface-variant">
                / 5 ({reviews.length})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Formulario para dejar o editar reseña (Solo para lectores, no bibliotecarios) */}
      {user && !isModerator && (!myReview || editingReviewId) ? (
        <form
          onSubmit={handleSubmit}
          className="p-gutter bg-surface-container-low/50 border-b border-outline-variant flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-label-caps text-on-surface">
              {editingReviewId ? "Editar tu reseña" : "Deja tu valoración"}
            </span>

            {/* Selector interactivo de estrellas (1 a 5) */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isActive = (hoverRating || rating) >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                    title={`${starValue} ${starValue === 1 ? "estrella" : "estrellas"}`}
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-primary fill-current"
                          : "text-outline-variant"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-bold text-on-surface-variant">
                {rating} / 5
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <textarea
              rows={3}
              maxLength={MAX_COMMENT_LENGTH}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte tu opinión sobre este libro (mínimo 10 caracteres)..."
              className="w-full border border-outline-variant bg-surface-container-lowest p-3 text-body-md text-on-surface placeholder:text-outline focus:border-primary outline-none transition-colors resize-y"
            />
            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span>
                {formError && (
                  <span className="text-error font-medium">{formError}</span>
                )}
              </span>
              <span>
                {comment.length} / {MAX_COMMENT_LENGTH}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editingReviewId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-on-primary px-5 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting
                ? "Publicando..."
                : editingReviewId
                ? "Guardar Cambios"
                : "Publicar Reseña"}
            </button>
          </div>
        </form>
      ) : null}

      {/* Tabla de Reseñas del Libro */}
      <div className="overflow-x-auto w-full">
        {isLoading ? (
          <div className="p-gutter text-body-md text-on-surface-variant">
            Cargando reseñas del volumen...
          </div>
        ) : error ? (
          <div className="p-gutter text-body-md text-error font-medium">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-gutter py-12 flex flex-col items-center justify-center text-center text-on-surface-variant">
            <MessageSquare className="w-8 h-8 text-outline mb-2 opacity-70" />
            <p className="text-body-md font-medium text-on-surface">
              Aún no hay reseñas para este libro
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {isModerator
                ? "Los lectores todavía no han publicado comentarios en este volumen."
                : "¡Sé el primero en compartir tu opinión con la comunidad!"}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low/30">
                <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant font-medium">
                  Fecha
                </th>
                <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant font-medium">
                  Lector
                </th>
                <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant font-medium">
                  Calificación
                </th>
                <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant font-medium">
                  Comentario
                </th>
                <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant font-medium text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((item) => {
                const isOwner =
                  user?.id && (item.user_detail?.id ?? item.user) === user.id;
                const displayName =
                  item.user_detail?.full_name ||
                  item.user_detail?.username ||
                  `Lector #${item.user}`;
                const starsCount = Math.max(
                  0,
                  Math.min(5, Number(item.rating) || 0)
                );

                return (
                  <tr
                    key={item.id}
                    className="border-b border-outline-variant hover:bg-surface/40 transition-colors"
                  >
                    <td className="py-stack-sm px-gutter text-body-md text-on-surface whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-stack-sm px-gutter whitespace-nowrap">
                      <span className="border border-outline-variant bg-surface-container px-3 py-1 text-label-caps text-on-surface rounded-full">
                        {displayName}
                      </span>
                    </td>
                    <td className="py-stack-sm px-gutter">
                      <div className="flex items-center gap-0.5 text-primary">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < starsCount
                                ? "text-primary fill-current"
                                : "text-outline-variant"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant max-w-md break-words">
                      {item.comment || "Sin comentario."}
                    </td>
                    <td className="py-stack-sm px-gutter text-right whitespace-nowrap">
                      {isModerator ? (
                        <button
                          type="button"
                          onClick={() => setReviewToDelete(item.id)}
                          title="Eliminar reseña ofensiva"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-error/40 text-error hover:bg-error hover:text-on-error rounded-sm text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      ) : isOwner ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            title="Editar mi reseña"
                            className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewToDelete(item.id)}
                            title="Eliminar mi reseña"
                            className="p-1.5 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de confirmación de eliminación de reseña */}
      <FeedbackModal
        isOpen={!!reviewToDelete}
        type="error"
        title={isModerator ? "Eliminar reseña por moderación" : "Eliminar tu reseña"}
        message={
          isModerator
            ? "¿Estás seguro de que deseas eliminar esta reseña por moderación?"
            : "¿Estás seguro de que deseas eliminar tu reseña?"
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isLoading={isDeleting}
        onClose={() => setReviewToDelete(null)}
        onConfirm={confirmDeleteReview}
      />

      {/* Modal de error */}
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
