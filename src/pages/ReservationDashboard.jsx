import { useState, useEffect } from "react";
import { reservationService } from "../api/services/reservationService";
import { loanService } from "../api/services/loanService";
import { itemService } from "../api/services/itemService";
import FeedbackModal from "../components/BasicUIComponents/FeedbackModal";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { BookOpen, User, Calendar, Clock, CheckCircle } from "lucide-react";

export default function ReservationDashboard() {
  useDocumentMetadata({
    title: "Gestión de Reservas — Folium",
    description: "Panel de administración de reservas de ejemplares físicos para bibliotecarios.",
    noIndex: true,
  });
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para modales
  const [reservationToAccept, setReservationToAccept] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const { data } = await reservationService.getAll();
        if (isMounted) setReservations(data);
      } catch (err) {
        if (isMounted) setError("Error al cargar el registro de reservas.");
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReservations();
    return () => {
      isMounted = false;
    };
  }, []);

  const confirmAcceptReservation = async () => {
    if (!reservationToAccept) return;
    const reservation = reservationToAccept;
    const bookTitle =
      reservation.book_detail?.title || `Libro #${reservation.book}`;

    setIsProcessing(true);
    try {
      const { data: items } = await itemService.getAll({
        book: reservation.book,
      });
      const bookItems = items.filter((item) => item.book == reservation.book);
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
      } else {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Error de conexión",
          message: "No se pudo procesar la aceptación. Verifica la conexión con el servidor.",
        });
      }
    } finally {
      setIsProcessing(false);
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
    if (status === "EXPIRED") {
      return { text: "Expirado", colorClass: "text-error font-bold" };
    }

    const now = new Date();
    const expDate = new Date(expiresAt);
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

      {/* Vista Móvil (Tarjetas apiladas para < md) */}
      <div className="block md:hidden divide-y divide-outline-variant/60 bg-surface-container-lowest border border-outline-variant rounded-md shadow-xs mb-8">
        {reservations.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant italic text-sm">
            No hay reservas registradas en el archivo.
          </div>
        ) : (
          reservations.map((reservation) => {
            const status = getStatusInfo(reservation.status, reservation.expires_at);
            const isPending = reservation.status === "PENDING";

            return (
              <div
                key={reservation.id}
                className={`p-4 flex flex-col gap-3 transition-colors ${
                  !isPending ? "opacity-60 bg-surface-container-low" : "bg-surface-container-lowest"
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
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setReservationToAccept(reservation)}
                    disabled={!isPending}
                    className={`w-full py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors shadow-xs ${
                      !isPending
                        ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                        : "bg-primary text-on-primary hover:opacity-90 cursor-pointer"
                    }`}
                  >
                    {isPending ? "Aceptar y Prestar" : reservation.status_display || "Procesada"}
                  </button>
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
        aria-label="Registro de reservas de ejemplares"
        className="hidden md:block w-full bg-surface-container-lowest border border-outline-variant rounded-md shadow-xs overflow-x-auto focus:outline-none focus:ring-1 focus:ring-primary/40"
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
            {reservations.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-on-surface-variant italic">
                  No hay reservas registradas en el archivo.
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => {
                const status = getStatusInfo(
                  reservation.status,
                  reservation.expires_at
                );
                const isPending = reservation.status === "PENDING";

                return (
                  <tr
                    key={reservation.id}
                    className={`border-b border-outline-variant/30 hover:bg-surface-container/50 transition-colors ${
                      !isPending ? "opacity-60" : ""
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
                      <button
                        type="button"
                        onClick={() => setReservationToAccept(reservation)}
                        disabled={!isPending}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors shadow-xs ${
                          !isPending
                            ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                            : "bg-primary text-on-primary hover:opacity-90 cursor-pointer"
                        }`}
                      >
                        {isPending
                          ? "Aceptar"
                          : reservation.status_display || "Aceptada"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación para aceptar reserva */}
      <FeedbackModal
        isOpen={Boolean(reservationToAccept)}
        type="warning"
        title="Confirmar aceptación de reserva"
        message={
          reservationToAccept
            ? `¿Estás seguro de que deseas aceptar la reserva de "${
                reservationToAccept.book_detail?.title ||
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
