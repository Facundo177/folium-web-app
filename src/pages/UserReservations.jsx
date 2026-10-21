import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { reservationService } from "../api/services/reservationService";
import { useBooks } from "../hooks/useBooks";
import { adaptBook } from "../api/adapters";
import FeedbackModal from "../components/BasicUIComponents/FeedbackModal";
import { BookLock, Calendar, Clock, XCircle, CheckCircle2, AlertCircle } from "lucide-react";

export default function UserReservations() {
  const navigate = useNavigate();
  const { books, isLoading: loadingBooks } = useBooks();

  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Estados para modales personalizados
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "error",
    title: "",
    message: "",
  });

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const { data } = await reservationService.getAll();
        setReservations(data);
      } catch (err) {
        setError("Error al cargar tus reservas.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Diccionario de libros adaptados por ID para obtener portada, autor, categoría y año
  const booksById = useMemo(() => {
    return Object.fromEntries(
      books.map((b) => {
        const adapted = adaptBook(b);
        return [adapted.id, adapted];
      })
    );
  }, [books]);

  // Combinamos cada reserva con los datos visuales del libro
  const enrichedReservations = useMemo(() => {
    return reservations.map((res) => {
      const fullBook = booksById[res.book];
      const detail = res.book_detail || {};

      return {
        ...res,
        bookData: fullBook || {
          id: detail.id || res.book,
          title: detail.title || `Volumen #${res.book}`,
          author: detail.editorial || "Archivo Folium",
          category: "Archivo",
          year: "",
          cover: detail.cover_image || null,
        },
      };
    });
  }, [reservations, booksById]);

  const filteredReservations = useMemo(() => {
    if (statusFilter === "ALL") return enrichedReservations;
    if (statusFilter === "PENDING") {
      return enrichedReservations.filter((r) => r.status === "PENDING");
    }
    return enrichedReservations.filter((r) => r.status !== "PENDING");
  }, [enrichedReservations, statusFilter]);

  const handleRequestCancel = (e, reservation) => {
    e.stopPropagation();
    setReservationToCancel(reservation);
  };

  const confirmCancelReservation = async () => {
    if (!reservationToCancel) return;
    setIsCancelling(true);

    try {
      const { data: updated } = await reservationService.patch(
        reservationToCancel.id,
        {
          status: "CANCELLED",
        }
      );

      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationToCancel.id
            ? {
                ...res,
                status: updated?.status || "CANCELLED",
                status_display: updated?.status_display || "Cancelado",
              }
            : res
        )
      );
      setReservationToCancel(null);
    } catch (err) {
      console.error("Error al cancelar la reserva:", err);
      setReservationToCancel(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al cancelar",
        message: "No se pudo cancelar la reserva. Intenta nuevamente.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status, expiresAt) => {
    if (status === "COMPLETED") {
      return {
        label: "Préstamo Otorgado",
        subtext: "Reserva completada",
        badgeClass: "bg-secondary text-on-secondary",
        icon: CheckCircle2,
      };
    }
    if (status === "CANCELLED") {
      return {
        label: "Cancelada",
        subtext: "Reserva sin efecto",
        badgeClass: "bg-surface-variant text-on-surface-variant",
        icon: XCircle,
      };
    }

    const now = new Date();
    const expDate = new Date(expiresAt);
    const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

    if (status === "EXPIRED" || diffDays < 0) {
      return {
        label: "Expirada",
        subtext: `Venció hace ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? "día" : "días"}`,
        badgeClass: "bg-error text-on-error",
        icon: AlertCircle,
      };
    }

    if (diffDays === 0) {
      return {
        label: "Expira Hoy",
        subtext: "Retiro pendiente hoy",
        badgeClass: "bg-tertiary text-on-tertiary",
        icon: Clock,
      };
    }

    return {
      label: "Reservado",
      subtext: `${diffDays} ${diffDays === 1 ? "día restante" : "días restantes"}`,
      badgeClass: "bg-primary text-on-primary",
      icon: Clock,
    };
  };

  if (isLoading || loadingBooks) {
    return (
      <div className="p-8 text-on-background font-sans">
        Cargando tus volúmenes reservados...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-error font-bold font-sans">{error}</div>;
  }

  const pendingCount = enrichedReservations.filter(
    (r) => r.status === "PENDING"
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 font-sans animate-fade-in">
      {/* Cabecera */}
      <div className="mb-8 pb-4 border-b border-outline-variant/50 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-serif text-on-background mb-2">
            Mis Libros Reservados
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Consulta el estado visual de los volúmenes que has solicitado y su vigencia de retiro.
          </p>
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-2">
          {[
            { key: "ALL", label: `Todas (${enrichedReservations.length})` },
            { key: "PENDING", label: `Activas (${pendingCount})` },
            {
              key: "HISTORY",
              label: `Historial (${enrichedReservations.length - pendingCount})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer border ${
                statusFilter === tab.key
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/50 hover:border-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido Visual */}
      {filteredReservations.length === 0 ? (
        <div className="w-full py-24 bg-surface-container-lowest border border-outline-variant/50 rounded-lg flex flex-col items-center justify-center text-center p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mb-4">
            <BookLock className="w-6 h-6" />
          </div>
          <p className="text-sm uppercase tracking-widest font-bold text-on-surface mb-2">
            No tienes reservas en esta sección
          </p>
          <p className="text-body-md text-on-surface-variant max-w-md mb-6">
            Explora el catálogo general para reservar un ejemplar y asegurar su disponibilidad en biblioteca.
          </p>
          <button
            onClick={() => navigate("/catalog")}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReservations.map((reservation) => {
            const { bookData } = reservation;
            const statusInfo = getStatusBadge(
              reservation.status,
              reservation.expires_at
            );
            const StatusIcon = statusInfo.icon;
            const isPending = reservation.status === "PENDING";

            return (
              <div
                key={reservation.id}
                onClick={() => navigate(`/book/${bookData.id}`)}
                className={`bg-surface-container border border-outline-variant/50 rounded-md p-4 flex flex-col hover:border-primary transition-all group cursor-pointer shadow-md hover:shadow-lg animate-fade-in ${
                  !isPending ? "opacity-80" : ""
                }`}
              >
                {/* Portada del Libro */}
                <div className="relative w-full aspect-[2/3] bg-surface-container-highest border border-outline-variant/30 mb-4 flex flex-col justify-between p-3 overflow-hidden shadow-inner rounded-sm">
                  {bookData.cover && (
                    <img
                      src={bookData.cover}
                      alt={bookData.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {bookData.cover && (
                    <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />
                  )}

                  {/* Fila superior: Categoría y Estado de Reserva */}
                  <div className="flex items-start justify-between gap-2 z-10">
                    <span className="bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm truncate">
                      ★ {bookData.category}
                    </span>
                    <span
                      className={`${statusInfo.badgeClass} px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm flex items-center gap-1 shrink-0`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Portada tipográfica cuando no hay imagen */}
                  {!bookData.cover && (
                    <>
                      <div className="my-auto text-center z-10">
                        <span className="font-serif text-3xl text-on-surface italic font-normal px-2 block leading-none">
                          {bookData.title}
                        </span>
                      </div>

                      <span className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] text-center font-bold z-10">
                        {bookData.year}
                      </span>
                    </>
                  )}

                  {/* Cinta inferior de vigencia sobre la portada */}
                  <div className="z-10 mt-auto pt-2">
                    <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/40 rounded-sm px-2.5 py-1.5 flex items-center justify-between text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-on-surface">
                        {statusInfo.subtext}
                      </span>
                      <span className="text-on-surface-variant">
                        #{reservation.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información del Libro y de la Reserva */}
                <div className="flex flex-col flex-1">
                  <h4 className="text-sm text-on-surface font-bold uppercase tracking-widest mb-1 line-clamp-1">
                    {bookData.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant mb-3 font-serif italic line-clamp-1">
                    {bookData.author}
                  </p>

                  {/* Fechas de Reserva y Expiración */}
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-sm p-2.5 mb-4 text-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Solicitado:
                      </span>
                      <span className="font-medium text-on-surface">
                        {new Date(reservation.created_at).toLocaleDateString(
                          "es-AR"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-tertiary" />
                        Vencimiento:
                      </span>
                      <span className="font-medium text-on-surface">
                        {new Date(reservation.expires_at).toLocaleDateString(
                          "es-AR"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Acción según estado */}
                  {isPending ? (
                    <button
                      onClick={(e) => handleRequestCancel(e, reservation)}
                      className="mt-auto w-full bg-surface-container-lowest text-error hover:bg-error hover:text-on-error border border-error/40 py-2.5 rounded-sm flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer"
                    >
                      Cancelar Reserva
                      <XCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book/${bookData.id}`);
                      }}
                      className="mt-auto w-full bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container border border-outline-variant/30 py-2.5 rounded-sm flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer"
                    >
                      Ver Ficha del Libro
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación para cancelar reserva */}
      <FeedbackModal
        isOpen={!!reservationToCancel}
        type="error"
        title="¿Cancelar reserva?"
        message={
          reservationToCancel
            ? `¿Deseas cancelar tu reserva de "${reservationToCancel.bookData?.title}"?`
            : ""
        }
        confirmText="Sí, cancelar reserva"
        cancelText="Volver"
        isLoading={isCancelling}
        onClose={() => setReservationToCancel(null)}
        onConfirm={confirmCancelReservation}
      />

      {/* Modal de notificación / error */}
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
