import { useState, useEffect } from "react";
import { reservationService } from "../api/services/reservationService";
import { loanService } from "../api/services/loanService";
import { itemService } from "../api/services/itemService";

export default function ReservationDashboard() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función auxiliar para obtener las fechas en el formato correcto (YYYY-MM-DDTHH:mm)
  const getInitialDateTime = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const { data } = await reservationService.getAll();
        setReservations(data);
      } catch (err) {
        setError("Error al cargar el registro de reservas.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Manejador para aceptar la reserva y generar el préstamo (loan)
  const handleAcceptReservation = async (reservation) => {
    const bookTitle = reservation.book_detail?.title || `Libro #${reservation.book}`;

    if (
      !window.confirm(
        `¿Estás seguro de que deseas aceptar la reserva de "${bookTitle}" y generar el préstamo correspondiente?`
      )
    ) {
      return;
    }

    try {
      // 1. Buscamos los ejemplares físicos disponibles de este libro
      const { data: items } = await itemService.getAll({ book: reservation.book });
      const bookItems = items.filter((item) => item.book == reservation.book);
      const availableItems = bookItems.filter((item) => item.status === "AVAILABLE");

      if (availableItems.length === 0) {
        alert(
          `Lo sentimos. Todos los ejemplares de "${bookTitle}" se encuentran prestados o no disponibles actualmente.`
        );
        return;
      }

      const itemToLoan = availableItems[0].id;
      const userId = reservation.user_detail?.id || reservation.user;

      // 2. Creamos el préstamo (loan) con el primer ejemplar físico disponible
      const loanPayload = {
        item: itemToLoan,
        user: userId,
        loaned_at: getInitialDateTime(0),
        due_at: getInitialDateTime(14),
      };

      await loanService.create(loanPayload);

      // 3. Actualizamos la reserva para que deje de estar como pendiente/reservada
      const { data: updatedReservation } = await reservationService.patch(
        reservation.id,
        { status: "COMPLETED" }
      );

      // 4. Actualizamos el estado local para reflejar el cambio al instante
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservation.id
            ? {
                ...res,
                status: updatedReservation?.status || "COMPLETED",
                status_display: updatedReservation?.status_display || "Completado",
              }
            : res
        )
      );

      alert(
        `¡Reserva aceptada!\nSe ha creado el préstamo del ejemplar #${itemToLoan} para "${bookTitle}".`
      );
    } catch (err) {
      console.error("Error al aceptar la reserva:", err);
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat().join("\n");
        alert(`No se pudo procesar la aceptación de la reserva:\n${errorMessages}`);
      } else {
        alert("No se pudo procesar la aceptación. Verifica la conexión con el servidor.");
      }
    }
  };

  // Función para calcular el estado de la reserva y su color
  const getStatusInfo = (status, expiresAt) => {
    if (status === "COMPLETED") {
      return { text: "Completado", colorClass: "text-secondary font-bold" };
    }
    if (status === "CANCELLED") {
      return { text: "Cancelado", colorClass: "text-on-surface-variant font-bold" };
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
      <div className="p-8 text-on-background font-sans">
        Cargando archivo de reservas...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-error font-bold font-sans">{error}</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 font-sans animate-fade-in">
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-headline-md font-serif text-on-background mb-2">
          Registro de Reservas
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Supervisa las solicitudes de reserva de los lectores y acéptalas para generar el préstamo correspondiente.
        </p>
      </div>

      {/* Tabla de Dashboard */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-surface-container border-b border-outline-variant/50">
            <tr>
              <th className="p-4 text-label-caps text-on-surface font-bold">ID</th>
              <th className="p-4 text-label-caps text-on-surface font-bold">Lector (ID)</th>
              <th className="p-4 text-label-caps text-on-surface font-bold">Libro (ID)</th>
              <th className="p-4 text-label-caps text-on-surface font-bold">Fecha de Reserva</th>
              <th className="p-4 text-label-caps text-on-surface font-bold">Estado / Vencimiento</th>
              <th className="p-4 text-label-caps text-on-surface font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-on-surface-variant italic"
                >
                  No hay reservas registradas en el archivo.
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => {
                const status = getStatusInfo(reservation.status, reservation.expires_at);
                const isPending = reservation.status === "PENDING";

                return (
                  <tr
                    key={reservation.id}
                    className={`border-b border-outline-variant/30 hover:bg-surface-container/50 transition-colors ${
                      !isPending ? "opacity-60" : ""
                    }`}
                  >
                    {/* ID */}
                    <td className="p-4 text-body-md text-on-surface">
                      {reservation.id}
                    </td>

                    {/* Lector */}
                    <td className="p-4 text-body-md text-on-surface">
                      {reservation.user_detail?.full_name ||
                        reservation.user_detail?.username ||
                        `Usuario #${reservation.user}`}
                      <span className="block text-xs text-on-surface-variant">
                        ID: {reservation.user_detail?.id || reservation.user}
                      </span>
                    </td>

                    {/* Libro */}
                    <td className="p-4 text-body-md text-on-surface">
                      {reservation.book_detail?.title || `Libro #${reservation.book}`}
                      <span className="block text-xs text-on-surface-variant">
                        Libro #{reservation.book_detail?.id || reservation.book}
                      </span>
                    </td>

                    {/* Fecha de creación */}
                    <td className="p-4 text-body-md text-on-surface-variant">
                      {new Date(reservation.created_at).toLocaleDateString("es-AR")}
                    </td>

                    {/* Estado */}
                    <td className={`p-4 text-body-md ${status.colorClass}`}>
                      {status.text}
                    </td>

                    {/* Botón de Aceptar */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleAcceptReservation(reservation)}
                        disabled={!isPending}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors shadow-sm ${
                          !isPending
                            ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                            : "bg-primary text-on-primary hover:opacity-90"
                        }`}
                      >
                        {isPending ? "Aceptar" : reservation.status_display || "Aceptada"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
