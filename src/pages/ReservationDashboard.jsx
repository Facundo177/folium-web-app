import { useState, useEffect, useMemo } from "react";
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
  Search,
  Filter,
  Check,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  BookMarked,
  RotateCcw,
} from "lucide-react";

export default function ReservationDashboard() {
  useDocumentMetadata({
    title: "Registro de Reservas — Folium",
    description: "Panel de supervisión y resolución notarial de reservas para bibliotecarios.",
    noIndex: true,
  });

  const [reservations, setReservations] = useState([]);
  const [summary, setSummary] = useState({
    pending: 0,
    completed: 0,
    cancelled: 0,
    expiring_soon: 0,
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

  // Estados para modales de confirmación y feedback
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

        // Uso defensivo de Promise.allSettled: si el backend aún no expone /summary/
        // la vista NO colapsa; calcula el resumen a partir de las reservas cargadas.
        const [resListResult, summaryResult] = await Promise.allSettled([
          reservationService.getAll(params),
          reservationService.getSummary(),
        ]);

        if (resListResult.status === "rejected") {
          throw resListResult.reason;
        }

        const rawData = resListResult.value.data;
        const resList = Array.isArray(rawData) ? rawData : rawData?.results || [];

        const now = new Date();
        const todayStr = now.toDateString();

        let resolvedSummary =
          summaryResult.status === "fulfilled" && summaryResult.value?.data
            ? summaryResult.value.data
            : null;

        // Fallback robusto para conteos en caso de que el endpoint summary no esté disponible
        const expiringSoonCount = resList.filter((r) => {
          if (r.status !== "PENDING") return false;
          const exp = new Date(r.expires_at);
          return exp.toDateString() === todayStr || (exp > now && exp - now < 86400000);
        }).length;

        if (!resolvedSummary) {
          resolvedSummary = {
            pending: resList.filter(
              (r) => r.status === "PENDING" && new Date(r.expires_at) > now
            ).length,
            completed: resList.filter((r) => r.status === "COMPLETED").length,
            cancelled: resList.filter(
              (r) => r.status === "CANCELLED" || r.status === "CANCELED"
            ).length,
            expiring_soon: expiringSoonCount,
          };
        } else {
          resolvedSummary.expiring_soon = expiringSoonCount;
        }

        if (isMounted) {
          setReservations(resList);
          setSummary(resolvedSummary);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error al cargar reservas:", err);
          setError("No se pudo cargar el registro de reservas. Verifica la conexión con el servidor.");
        }
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
          message: `Todos los ejemplares físicos de "${bookTitle}" se encuentran prestados o no disponibles en sala actualmente.`,
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
        title: "Reserva formalizada con éxito",
        message: `Se ha registrado el préstamo del ejemplar signatura #${targetItem.inventory_code || itemToLoan} para "${bookTitle}".`,
      });
    } catch (err) {
      console.error("Error al aceptar la reserva:", err);
      setReservationToAccept(null);
      if (err.response?.data) {
        const errorMessages = Object.values(err.response.data)
          .flat()
          .join("\n");
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Error al formalizar el préstamo",
          message: `No se pudo procesar la solicitud:\n${errorMessages}`,
        });
      } else {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Error de comunicación",
          message: err.message || "Verifica la conexión con el servidor bibliotecario.",
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
        type: "info",
        title: "Reserva cancelada",
        message: `La solicitud de reserva de "${bookTitle}" ha sido archivada como cancelada.`,
      });
    } catch (err) {
      console.error("Error al cancelar la reserva:", err);
      const errorMessages = err.response?.data
        ? Object.values(err.response.data).flat().join("\n")
        : err.message || "Verifica la conexión con el servidor.";

      setReservationToCancel(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al cancelar la reserva",
        message: `No se pudo cancelar el registro:\n${errorMessages}`,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusStamp = (status, expiresAt) => {
    if (status === "COMPLETED") {
      return {
        label: "Completada",
        classes:
          "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-600/30",
        indicator: "bg-emerald-600",
      };
    }
    if (status === "CANCELLED" || status === "CANCELED") {
      return {
        label: "Cancelada",
        classes:
          "text-on-surface-variant/70 bg-surface-container-low border border-outline-variant/50 line-through",
        indicator: "bg-outline-variant",
      };
    }

    const now = new Date();
    const expDate = new Date(expiresAt);
    if (status === "EXPIRED" || (status === "PENDING" && expDate <= now)) {
      return {
        label: "Expirada",
        classes:
          "text-error dark:text-red-400 bg-error/10 border border-error/30 font-semibold",
        indicator: "bg-error",
      };
    }

    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return {
        label: "Vence hoy",
        classes:
          "text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-600/30 font-semibold",
        indicator: "bg-amber-600 animate-pulse",
      };
    }

    if (diffDays === 1) {
      return {
        label: "Expira en 24h",
        classes:
          "text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-600/30",
        indicator: "bg-amber-600",
      };
    }

    return {
      label: `Vigente (${diffDays}d)`,
      classes:
        "text-on-surface bg-surface-container-low border border-outline-variant/60",
      indicator: "bg-primary/70",
    };
  };

  const isPendingReservation = (reservation) =>
    reservation.status === "PENDING" &&
    new Date(reservation.expires_at) > new Date();

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      user: "",
      book: "",
      status: "",
      ordering: "-created_at",
    });
  };

  const activeFiltersCount = useMemo(() => {
    let c = 0;
    if (filters.user.trim()) c++;
    if (filters.book.trim()) c++;
    if (filters.status) c++;
    if (filters.ordering !== "-created_at") c++;
    return c;
  }, [filters]);

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-in font-sans">
        <div className="w-9 h-9 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant text-xs font-mono uppercase tracking-widest">
          Consultando libro notarial de reservas…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 md:p-12 animate-fade-in font-sans">
        <div className="border border-error/40 bg-error/5 p-8 rounded-xs flex flex-col items-center text-center gap-4">
          <AlertTriangle className="w-8 h-8 text-error" />
          <h2 className="font-serif text-2xl text-on-surface font-medium">
            Registro temporalmente inaccesible
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-primary text-on-primary rounded-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar lectura
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12 font-sans animate-fade-in">
      {/* Botón de navegación previa */}
      <div className="mb-6">
        <GoBackButton />
      </div>

      {/* Encabezado Editorial Archival */}
      <header className="mb-8 border-b border-outline-variant/60 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-primary/80 font-bold bg-primary/10 px-2 py-0.5 rounded-xs">
                Control de Circulación
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant">
                Folio Notarial #{new Date().getFullYear()}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-on-surface tracking-tight">
              Libro de Reservas Bibliotecarias
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant mt-1.5 max-w-3xl leading-relaxed">
              Supervisión de solicitudes activas de lectores. Valida la disponibilidad de ejemplares en depósito y formaliza el préstamo en mostrador.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Sincronizado con acervo central</span>
          </div>
        </div>
      </header>

      {/* Cinta Contable de Reservas (Cinta continua de 4 columnas) */}
      <section
        aria-label="Cinta de control de reservas"
        className="mb-8 grid grid-cols-2 lg:grid-cols-4 border border-outline-variant/60 bg-surface-container-lowest divide-y lg:divide-y-0 lg:divide-x divide-outline-variant/40 shadow-xs"
      >
        {/* Columna 1: Pendientes Vigentes */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">
              Pendientes de Retiro
            </span>
            <Clock className="w-4 h-4 text-primary/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-on-surface tabular-nums">
              {summary.pending}
            </span>
            <span className="text-xs text-on-surface-variant">solicitudes</span>
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-2">
            Lectores a la espera de formalización
          </p>
        </div>

        {/* Columna 2: En Límite de Vencimiento */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">
              Límite Inminente / Hoy
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-amber-700 dark:text-amber-400 tabular-nums">
              {summary.expiring_soon || 0}
            </span>
            <span className="text-xs text-on-surface-variant">reservas</span>
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-2">
            Plazo de caducidad en menos de 24 horas
          </p>
        </div>

        {/* Columna 3: Completadas */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">
              Formalizadas
            </span>
            <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-emerald-700 dark:text-emerald-400 tabular-nums">
              {summary.completed}
            </span>
            <span className="text-xs text-on-surface-variant">préstamos</span>
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-2">
            Ejemplar entregado en mostrador
          </p>
        </div>

        {/* Columna 4: Total en Registro */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">
              Total Fichas Visibles
            </span>
            <BookMarked className="w-4 h-4 text-on-surface-variant/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-on-surface tabular-nums">
              {reservations.length}
            </span>
            <span className="text-xs text-on-surface-variant">registros</span>
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-2">
            {summary.cancelled} canceladas archivadas
          </p>
        </div>
      </section>

      {/* Consola Notarial de Búsqueda y Filtros */}
      <section
        aria-label="Filtros de reservas"
        className="mb-8 border border-outline-variant/60 bg-surface-container-lowest p-5 md:p-6 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Cotejo y Filtrado del Registro
            </h2>
            {activeFiltersCount > 0 && (
              <span className="text-[11px] font-mono bg-primary/10 text-primary px-1.5 py-0.2 rounded-xs font-bold">
                {activeFiltersCount} activo{activeFiltersCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer font-mono"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Lector */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-res-user"
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Lector solicitante
            </label>
            <div className="flex items-center gap-2 border-b border-outline/40 hover:border-outline focus-within:border-primary transition-colors py-1">
              <User className="w-4 h-4 text-on-surface-variant/60 shrink-0" />
              <input
                id="filter-res-user"
                type="search"
                value={filters.user}
                onChange={(e) => updateFilter("user", e.target.value)}
                placeholder="Nombre, usuario o DNI…"
                className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              />
            </div>
          </div>

          {/* Libro */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-res-book"
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Volumen bibliográfico
            </label>
            <div className="flex items-center gap-2 border-b border-outline/40 hover:border-outline focus-within:border-primary transition-colors py-1">
              <Search className="w-4 h-4 text-on-surface-variant/60 shrink-0" />
              <input
                id="filter-res-book"
                type="search"
                value={filters.book}
                onChange={(e) => updateFilter("book", e.target.value)}
                placeholder="Título, ISBN o ID…"
                className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-res-status"
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Estado de la reserva
            </label>
            <select
              id="filter-res-status"
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="w-full border border-outline-variant/70 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface rounded-xs focus:border-primary outline-none transition-colors"
            >
              <option value="">Todas las fichas</option>
              <option value="pending">Pendientes de retiro</option>
              <option value="expired">Expiradas / No retiradas</option>
              <option value="completed">Completadas (Prestadas)</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-res-ordering"
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Criterio de ordenación
            </label>
            <div className="relative">
              <select
                id="filter-res-ordering"
                value={filters.ordering}
                onChange={(e) => updateFilter("ordering", e.target.value)}
                className="w-full border border-outline-variant/70 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface rounded-xs focus:border-primary outline-none transition-colors appearance-none pr-8"
              >
                <option value="-created_at">Fecha solicitud (Más reciente)</option>
                <option value="created_at">Fecha solicitud (Más antigua)</option>
                <option value="title">Título de la obra (A–Z)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-on-surface-variant/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Vista de Tarjetas Archivísticas para Móvil (< md) */}
      <div className="block md:hidden border border-outline-variant/60 bg-surface-container-lowest divide-y divide-outline-variant/40 mb-8 shadow-xs">
        {isFetching ? (
          <div className="p-8 text-center text-sm font-mono text-on-surface-variant flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Actualizando libro de reservas…
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-sm text-on-surface-variant font-serif italic">
            No se hallaron reservas que coincidan con los términos de cotejo.
          </div>
        ) : (
          reservations.map((reservation) => {
            const stamp = getStatusStamp(reservation.status, reservation.expires_at);
            const isPending = isPendingReservation(reservation);

            return (
              <article
                key={reservation.id}
                className={`p-4 flex flex-col gap-3 transition-colors ${
                  !isPending ? "bg-surface-container-lowest/50" : "bg-surface-container-lowest"
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-outline-variant/30 pb-2">
                  <span className="font-mono text-xs font-semibold text-on-surface-variant">
                    Ficha #{reservation.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[11px] font-mono tracking-wide ${stamp.classes}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${stamp.indicator}`} />
                    {stamp.label}
                  </span>
                </div>

                {/* Libro */}
                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-serif text-base font-medium leading-snug text-on-surface">
                      {reservation.book_detail?.title || `Libro #${reservation.book}`}
                    </h2>
                    <span className="text-xs font-mono text-on-surface-variant">
                      ID Obra: #{reservation.book_detail?.id || reservation.book}
                      {reservation.book_detail?.editorial?.name &&
                        ` · ${reservation.book_detail.editorial.name}`}
                    </span>
                  </div>
                </div>

                {/* Lector y Fecha */}
                <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant pt-2 border-t border-outline-variant/30">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span className="truncate">
                      {reservation.user_detail?.full_name ||
                        reservation.user_detail?.username ||
                        `Lector #${reservation.user}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end font-mono">
                    <Calendar className="w-3.5 h-3.5 text-on-surface-variant/60 shrink-0" />
                    <span>{new Date(reservation.created_at).toLocaleDateString("es-AR")}</span>
                  </div>
                </div>

                {/* Acciones en Móvil */}
                <div className="pt-2 flex gap-2">
                  {isPending ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setReservationToAccept(reservation)}
                        disabled={isProcessing || isCancelling}
                        className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs bg-primary text-on-primary hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 text-center"
                      >
                        Prestar
                      </button>
                      <button
                        type="button"
                        onClick={() => setReservationToCancel(reservation)}
                        disabled={isProcessing || isCancelling}
                        className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs border border-error/70 bg-error/10 text-error hover:bg-error hover:text-on-error hover:border-error dark:border-red-400/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600 transition-all duration-150 cursor-pointer disabled:opacity-50 text-center"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <span className="w-full py-1.5 text-center text-xs font-mono uppercase text-on-surface-variant/70 bg-surface-container-low border border-outline-variant/30 rounded-xs">
                      {stamp.label}
                    </span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Tabla Notarial de Reservas para Escritorio (>= md) */}
      <div className="hidden md:block border border-outline-variant/60 bg-surface-container-lowest shadow-xs overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="bg-surface-container/60 border-b border-outline-variant">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant font-sans w-16"
                >
                  Folio
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant font-sans"
                >
                  Lector Solicitante
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant font-sans"
                >
                  Obra Reservada
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant font-sans w-32"
                >
                  Fecha Solicitud
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant font-sans w-40"
                >
                  Estado / Plazo
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant font-sans text-center w-56"
                >
                  Resolución Mostrador
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-sm">
              {isFetching ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <span className="inline-flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Consultando libro de reservas…
                    </span>
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-12 text-center text-on-surface-variant font-serif italic text-base"
                  >
                    No se hallaron reservas que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => {
                  const stamp = getStatusStamp(
                    reservation.status,
                    reservation.expires_at
                  );
                  const isPending = isPendingReservation(reservation);

                  return (
                    <tr
                      key={reservation.id}
                      className={`hover:bg-surface-container/40 transition-colors ${
                        !isPending ? "opacity-75 bg-surface-container-lowest/50" : ""
                      }`}
                    >
                      {/* Folio / ID */}
                      <td className="px-4 py-3.5 font-mono text-xs text-on-surface-variant font-semibold">
                        #{reservation.id}
                      </td>

                      {/* Lector */}
                      <td className="px-4 py-3.5">
                        <div className="font-sans font-medium text-on-surface">
                          {reservation.user_detail?.full_name ||
                            reservation.user_detail?.username ||
                            `Lector #${reservation.user}`}
                        </div>
                        <span className="text-xs font-mono text-on-surface-variant/80">
                          {reservation.user_detail?.username
                            ? `@${reservation.user_detail.username}`
                            : `ID: ${reservation.user_detail?.id || reservation.user}`}
                        </span>
                      </td>

                      {/* Obra */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-serif text-base font-medium text-on-surface leading-snug line-clamp-1">
                          {reservation.book_detail?.title ||
                            `Libro #${reservation.book}`}
                        </div>
                        <span className="text-xs font-mono text-on-surface-variant/80">
                          Obra #{reservation.book_detail?.id || reservation.book}
                          {reservation.book_detail?.editorial?.name &&
                            ` · ${reservation.book_detail.editorial.name}`}
                        </span>
                      </td>

                      {/* Fecha Solicitud */}
                      <td className="px-4 py-3.5 font-mono text-xs text-on-surface-variant whitespace-nowrap">
                        {new Date(reservation.created_at).toLocaleDateString("es-AR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Estado / Plazo */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-mono tracking-wide ${stamp.classes}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${stamp.indicator}`}
                          />
                          {stamp.label}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3.5 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setReservationToAccept(reservation)}
                              disabled={isProcessing || isCancelling}
                              className="w-24 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xs bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-2xs cursor-pointer disabled:opacity-50 text-center"
                              title="Asignar ejemplar y registrar préstamo"
                            >
                              Prestar
                            </button>
                            <button
                              type="button"
                              onClick={() => setReservationToCancel(reservation)}
                              disabled={isProcessing || isCancelling}
                              className="w-24 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xs border border-error/70 bg-error/10 text-error hover:bg-error hover:text-on-error hover:border-error dark:border-red-400/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600 transition-all duration-150 cursor-pointer disabled:opacity-50 text-center"
                              title="Cancelar solicitud"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-on-surface-variant/60 uppercase">
                            Archivada
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
      </div>

      {/* Modal de confirmación para aceptar reserva */}
      <FeedbackModal
        isOpen={Boolean(reservationToAccept)}
        type="warning"
        title="Formalizar Préstamo de Reserva"
        message={
          reservationToAccept
            ? `¿Deseas formalizar el préstamo para "${
                reservationToAccept.book_detail?.title ||
                `Libro #${reservationToAccept.book}`
              }" a nombre de ${
                reservationToAccept.user_detail?.full_name ||
                reservationToAccept.user_detail?.username ||
                `Lector #${reservationToAccept.user}`
              }? Se asignará automáticamente el primer ejemplar disponible en sala.`
            : ""
        }
        confirmText="Aceptar y generar préstamo"
        cancelText="Volver al registro"
        isLoading={isProcessing}
        onClose={() => setReservationToAccept(null)}
        onConfirm={confirmAcceptReservation}
      />

      {/* Modal de confirmación para cancelar reserva */}
      <FeedbackModal
        isOpen={Boolean(reservationToCancel)}
        type="warning"
        title="Cancelar Reserva Bibliográfica"
        message={
          reservationToCancel
            ? `¿Confirmas la cancelación de la reserva de "${
                reservationToCancel.book_detail?.title ||
                `Libro #${reservationToCancel.book}`
              }" para ${
                reservationToCancel.user_detail?.full_name ||
                reservationToCancel.user_detail?.username ||
                `el lector #${reservationToCancel.user}`
              }? La obra quedará disponible para otros lectores.`
            : ""
        }
        confirmText="Sí, archivar como cancelada"
        cancelText="Conservar reserva"
        isLoading={isCancelling}
        onClose={() => setReservationToCancel(null)}
        onConfirm={confirmCancelReservation}
      />

      {/* Modal de notificación / feedback */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() =>
          setFeedbackModal((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}
