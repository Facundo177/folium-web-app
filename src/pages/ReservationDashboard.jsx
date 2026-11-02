import { useState, useEffect } from "react";
import { reservationService } from "../api/services/reservationService";
import { loanService } from "../api/services/loanService";
import { itemService } from "../api/services/itemService";
import FeedbackModal from "../components/BasicUIComponents/FeedbackModal";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import {
  BookOpen,
  User,
  Calendar,
  CalendarClock,
  BookOpenCheck,
  CircleX,
  Search,
} from "lucide-react";

export default function ReservationDashboard() {
  useDocumentMetadata({
    title: "Gestión de Reservas — Folium",
    description: "Panel de administración de reservas de ejemplares físicos para bibliotecarios.",
    noIndex: true,
  });
  const [reservations, setReservations] = useState([]);
  const [summary, setSummary] = useState({
    pending: 0,
    completed: 0,
    cancelled: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    user: "",
    book: "",
    status: "",
    ordering: "-created_at",
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados para modales
  const [reservationToAccept, setReservationToAccept] = useState(null);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const getInitialDateTime = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsFetching(true);
      setError(null);
      try {
        const params = { ordering: filters.ordering };
        if (filters.user.trim()) params.user = filters.user.trim();
        if (filters.book.trim()) params.book = filters.book.trim();
        if (filters.status) params.status = filters.status;

        const [{ data }, { data: summaryData }] = await Promise.all([
          reservationService.getAll(params),
          reservationService.getSummary(),
        ]);
        if (isMounted) {
          setReservations(data);
          setSummary(summaryData);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar el registro de reservas.");
        console.error(err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filters, refreshKey]);

  const confirmAcceptReservation = async () => {
    if (!reservationToAccept) return;
    const reservation = reservationToAccept;
    const bookTitle =
      reservation.book_detail?.title || `Libro #${reservation.book}`;

    setIsProcessing(true);
    try {
      const { data } = await itemService.getAll({
        book: reservation.book,
      });
      const itemsList = Array.isArray(data) ? data : data?.results || [];
      const bookItems = itemsList.filter((item) => {
        const itemBookId = item.book?.id !== undefined ? item.book.id : item.book;
        return String(itemBookId) === String(reservation.book);
      });
      const reservedItem = bookItems.find((item) => item.status === "RESERVED");
      const availableItem = bookItems.find((item) => item.status === "AVAILABLE");
      const targetItem = reservedItem || availableItem;

      if (!targetItem) {
        setReservationToAccept(null);
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Sin ejemplares disponibles",
          message: `Lo sentimos. Todos los ejemplares de "${bookTitle}" se encuentran prestados o no disponibles actualmente.`,
        });
        return;
      }

      const itemToLoan = targetItem.id;
      const userId = reservation.user_detail?.id || reservation.user;

      const loanPayload = {
        item: itemToLoan,
        user: userId,
        loaned_at: getInitialDateTime(0),
        due_at: getInitialDateTime(14),
      };

      await loanService.create(loanPayload);

      const { data: updatedReservation } = await reservationService.patch(
        reservation.id,
        { status: "COMPLETED" }
      );

      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservation.id
            ? {
              ...res,
              status: updatedReservation?.status || "COMPLETED",
              status_display:
                updatedReservation?.status_display || "Completado",
            }
            : res
        )
      );
      setRefreshKey((prev) => prev + 1);

      setReservationToAccept(null);
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "¡Reserva aceptada!",
        message: `Se ha generado el préstamo del ejemplar #${itemToLoan} para "${bookTitle}".`,
      });
    } catch (err) {
      console.error("Error al aceptar la reserva:", err);
      setReservationToAccept(null);
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data)
          .flat()
          .join("\n");
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Error al aceptar reserva",
          message: `No se pudo procesar la aceptación de la reserva:\n${errorMessages}`,
        });
      } else if (err.response) {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Error del servidor",
          message: `El servidor respondió con código ${err.response.status}.`,
        });
      } else {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Error al procesar",
          message: err.message || "No se pudo procesar la aceptación. Verifica la conexión con el servidor.",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmCancelReservation = async () => {
    if (!reservationToCancel) return;
    const reservation = reservationToCancel;
    const bookTitle =
      reservation.book_detail?.title || `Libro #${reservation.book}`;

    setIsCancelling(true);
    try {
      const { data: updatedReservation } = await reservationService.patch(
        reservation.id,
        { status: "CANCELLED" }
      );

      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservation.id
            ? {
                ...res,
                status: updatedReservation?.status || "CANCELLED",
                status_display:
                  updatedReservation?.status_display || "Cancelado",
              }
            : res
        )
      );
      setRefreshKey((prev) => prev + 1);
      setReservationToCancel(null);
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Reserva cancelada",
        message: `Se canceló la reserva de "${bookTitle}".`,
      });
    } catch (err) {
      console.error("Error al cancelar la reserva:", err);
      const errorMessages = err.response?.data
        ? Object.values(err.response.data).flat().join("\n")
        : err.response
          ? `El servidor respondió con código ${err.response.status}.`
          : err.message || "Verifica la conexión con el servidor.";

      setReservationToCancel(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al cancelar reserva",
        message: `No se pudo cancelar la reserva:\n${errorMessages}`,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusInfo = (status, expiresAt) => {
    if (status === "COMPLETED") {
      return { text: "Completado", colorClass: "text-secondary font-bold" };
    }
    if (status === "CANCELLED") {
      return {
        text: "Cancelado",
        colorClass: "text-on-surface-variant font-bold",
      };
    }
    const now = new Date();
    const expDate = new Date(expiresAt);
    if (
      status === "EXPIRED" ||
      (status === "PENDING" && expDate <= now)
    ) {
      return { text: "Expirado", colorClass: "text-error font-bold" };
    }

    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Expirada (${Math.abs(diffDays)} días)`,
        colorClass: "text-error font-bold",
      };
    }
    if (diffDays === 0) {
      return {
        text: "Pendiente (Expira hoy)",
        colorClass: "text-tertiary font-bold",
      };
    }
    return {
      text: `Pendiente (${diffDays} días rest.)`,
      colorClass: "text-on-surface",
    };
  };

  const isPendingReservation = (reservation) =>
    reservation.status === "PENDING" &&
    new Date(reservation.expires_at) > new Date();

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 animate-fade-in font-sans">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-bold tracking-widest uppercase text-xs">
          Cargando archivo de reservas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center animate-fade-in font-sans p-6">
        <p className="text-on-error bg-error px-6 py-3 rounded-md font-bold shadow-md">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 font-sans animate-fade-in">
      <div className="mb-4">
        <GoBackButton />
      </div>

      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-headline-md font-serif text-on-surface mb-2">
          Registro de Reservas
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Supervisa las solicitudes de reserva de los lectores y acéptalas para generar el préstamo correspondiente.
        </p>
      </div>

      <section
        aria-label="Resumen de reservas"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <article className="flex items-center gap-4 rounded-md border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Pendientes
            </p>
            <p className="text-2xl font-bold text-on-surface">{summary.pending}</p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-md border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Completadas
            </p>
            <p className="text-2xl font-bold text-on-surface">{summary.completed}</p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-md border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
            <CircleX className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Canceladas
            </p>
            <p className="text-2xl font-bold text-on-surface">{summary.cancelled}</p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-md border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Reservas totales
            </p>
            <p className="text-2xl font-bold text-on-surface">{reservations.length}</p>
          </div>
        </article>
      </section>

      <section
        aria-label="Filtros y resultados de reservas"
        className="mb-8 w-full overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest shadow-xs"
      >
        <div
          aria-label="Filtros y ordenamiento de reservas"
          className="grid grid-cols-1 gap-4 border-b border-outline-variant p-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reservations-user-filter" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Lector
            </label>
            <div className="flex items-center gap-base border-b border-outline w-full">
              <Search className="w-[18px] h-[18px] text-on-surface-variant shrink-0" />
              <input
                id="reservations-user-filter"
                type="search"
                value={filters.user}
                onChange={(event) => updateFilter("user", event.target.value)}
                placeholder="Nombre, apellido o ID"
                className="bg-transparent border-none outline-none text-sm py-2.5 w-full text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reservations-book-filter" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Libro
            </label>
            <div className="flex items-center gap-base border-b border-outline w-full">
              <Search className="w-[18px] h-[18px] text-on-surface-variant shrink-0" />
              <input
                id="reservations-book-filter"
                type="search"
                value={filters.book}
                onChange={(event) => updateFilter("book", event.target.value)}
                placeholder="Título, ISBN o ID"
                className="bg-transparent border-none outline-none text-sm py-2.5 w-full text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          </div>
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Estado
            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="w-full rounded-sm border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-primary"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="expired">Expiradas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Ordenar por
            <select
              value={filters.ordering}
              onChange={(event) => updateFilter("ordering", event.target.value)}
              className="w-full rounded-sm border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-primary"
            >
              <option value="-created_at">Fecha (más reciente)</option>
              <option value="created_at">Fecha (más antigua)</option>
              <option value="title">Libro (A–Z)</option>
            </select>
          </label>
        </div>

      {/* Vista Móvil (Tarjetas apiladas para < md) */}
      <div className="block divide-y divide-outline-variant/60 md:hidden">
        {isFetching ? (
          <div
            role="status"
            className="flex min-h-32 items-center justify-center gap-3 p-8 text-base font-semibold text-primary"
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Actualizando…
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant italic text-sm">
            No hay reservas que coincidan con los filtros.
          </div>
        ) : (
          reservations.map((reservation) => {
            const status = getStatusInfo(reservation.status, reservation.expires_at);
            const isPending = isPendingReservation(reservation);

            return (
              <div
                key={reservation.id}
                className={`p-4 flex flex-col gap-3 transition-colors ${!isPending ? "opacity-60 bg-surface-container-low" : "bg-surface-container-lowest"
                  }`}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold bg-surface-container px-2 py-0.5 rounded border border-outline-variant text-on-surface">
                    Reserva #{reservation.id}
                  </span>
                  <span className={`text-xs ${status.colorClass}`}>
                    {status.text}
                  </span>
                </div>

                {/* Libro */}
                <div className="flex items-start gap-2 text-on-surface">
                  <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-serif text-base font-medium leading-snug">
                      {reservation.book_detail?.title || `Libro #${reservation.book}`}
                    </h2>
                    <span className="text-xs font-mono text-on-surface-variant">
                      ID Obra: #{reservation.book_detail?.id || reservation.book}
                    </span>
                  </div>
                </div>

                {/* Lector y Fecha */}
                <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant pt-2 border-t border-outline-variant/40">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">
                      {reservation.user_detail?.full_name || reservation.user_detail?.username || `Lector #${reservation.user}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-outline shrink-0" />
                    <span>{new Date(reservation.created_at).toLocaleDateString("es-AR")}</span>
                  </div>
                </div>

                {/* Botón Acción Móvil */}
                <div className="pt-2 flex gap-2">
                  {isPending ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setReservationToAccept(reservation)}
                        disabled={isProcessing || isCancelling}
                        className="flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors shadow-xs bg-primary text-on-primary hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Aceptar y Prestar
                      </button>
                      <button
                        type="button"
                        onClick={() => setReservationToCancel(reservation)}
                        disabled={isProcessing || isCancelling}
                        className="flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors border border-error text-error hover:bg-error/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <span className="w-full py-2 text-center text-xs font-bold uppercase tracking-widest rounded-sm bg-surface-variant text-on-surface-variant">
                      {status.text}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabla de Dashboard Escritorio (Visible en md en adelante con scroll accesible) */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Registro de reservas"
        className="hidden w-full overflow-x-auto focus:outline-none focus:ring-1 focus:ring-primary/40 md:block"
      >
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-1 bg-surface-container border-b border-outline-variant">
            <tr>
              <th scope="col" className="p-4 text-label-caps text-on-surface font-bold">ID</th>
              <th scope="col" className="p-4 text-label-caps text-on-surface font-bold">Lector (ID)</th>
              <th scope="col" className="p-4 text-label-caps text-on-surface font-bold">Libro (ID)</th>
              <th scope="col" className="p-4 text-label-caps text-on-surface font-bold">Fecha de Reserva</th>
              <th scope="col" className="p-4 text-label-caps text-on-surface font-bold">Estado / Vencimiento</th>
              <th scope="col" className="p-4 text-label-caps text-on-surface font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr>
                <td colSpan="6" className="p-8 text-center">
                  <span
                    role="status"
                    className="inline-flex items-center gap-3 text-base font-semibold text-primary"
                  >
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Actualizando…
                  </span>
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-on-surface-variant italic">
                  No hay reservas que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => {
                const status = getStatusInfo(
                  reservation.status,
                  reservation.expires_at
                );
                const isPending = isPendingReservation(reservation);

                return (
                  <tr
                    key={reservation.id}
                    className={`border-b border-outline-variant/30 hover:bg-surface-container/50 transition-colors ${!isPending ? "opacity-60" : ""
                      }`}
                  >
                    <td className="p-4 text-body-md text-on-surface font-mono text-xs">
                      #{reservation.id}
                    </td>

                    <td className="p-4 text-body-md text-on-surface">
                      {reservation.user_detail?.full_name ||
                        reservation.user_detail?.username ||
                        `Usuario #${reservation.user}`}
                      <span className="block text-xs font-mono text-on-surface-variant">
                        ID: {reservation.user_detail?.id || reservation.user}
                      </span>
                    </td>

                    <td className="p-4 text-body-md text-on-surface">
                      {reservation.book_detail?.title ||
                        `Libro #${reservation.book}`}
                      <span className="block text-xs font-mono text-on-surface-variant">
                        Libro #{reservation.book_detail?.id || reservation.book}
                      </span>
                    </td>

                    <td className="p-4 text-body-md text-on-surface-variant font-mono text-xs">
                      {new Date(reservation.created_at).toLocaleDateString(
                        "es-AR"
                      )}
                    </td>

                    <td className={`p-4 text-body-md ${status.colorClass}`}>
                      {status.text}
                    </td>

                    <td className="p-4 text-center">
                      {isPending ? (
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReservationToAccept(reservation)}
                            disabled={isProcessing || isCancelling}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors shadow-xs bg-primary text-on-primary hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Aceptar
                          </button>
                          <button
                            type="button"
                            onClick={() => setReservationToCancel(reservation)}
                            disabled={isProcessing || isCancelling}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors border border-error text-error hover:bg-error/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span className="inline-block px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm bg-surface-variant text-on-surface-variant">
                          {reservation.status === "CANCELLED"
                            ? "CANCELADO"
                            : reservation.status_display || "Aceptada"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      </section>

      {/* Modal de confirmación para aceptar reserva */}
      <FeedbackModal
        isOpen={Boolean(reservationToAccept)}
        type="warning"
        title="Confirmar aceptación de reserva"
        message={
          reservationToAccept
            ? `¿Estás seguro de que deseas aceptar la reserva de "${reservationToAccept.book_detail?.title ||
            `Libro #${reservationToAccept.book}`
            }" y generar el préstamo correspondiente?`
            : ""
        }
        confirmText="Sí, aceptar y prestar"
        cancelText="Cancelar"
        isLoading={isProcessing}
        onClose={() => setReservationToAccept(null)}
        onConfirm={confirmAcceptReservation}
      />

      {/* Modal de confirmación para cancelar reserva */}
      <FeedbackModal
        isOpen={Boolean(reservationToCancel)}
        type="warning"
        title="Cancelar reserva"
        message={
          reservationToCancel
            ? `¿Estás seguro de que deseas cancelar la reserva de "${reservationToCancel.book_detail?.title || `Libro #${reservationToCancel.book}`}" para ${reservationToCancel.user_detail?.full_name || reservationToCancel.user_detail?.username || `el lector #${reservationToCancel.user}`}?`
            : ""
        }
        confirmText="Sí, cancelar reserva"
        cancelText="Conservar reserva"
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
