import { useState, useEffect } from "react";
import { loanService } from "../api/services/loanService";
import FeedbackModal from "../components/BasicUIComponents/FeedbackModal";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { itemService } from "../api/services/itemService";
import { ITEM_STATUS } from "../api/constants";
import { Link } from "react-router-dom";
import ReturnLoanModal from "../components/LoanComponents/ReturnLoanModal";
import {
  BookOpen,
  User,
  Calendar,
  BookOpenCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Archive,
  ArrowRight,
  Filter,
} from "lucide-react";

const PAGE_SIZE = 20;

export default function LoansDashboard() {
  useDocumentMetadata({
    title: "Control de Préstamos — Folium",
    description: "Panel de control y registro de préstamos activos e históricos para bibliotecarios.",
    noIndex: true,
  });

  const [loans, setLoans] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState({
    due_today: 0,
    due_total: 0,
    overdue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    user: "",
    item: "",
    status: "",
    ordering: "-loaned_at",
  });
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados para modales de retorno e interrupción
  const [loanToInterrupt, setLoanToInterrupt] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [returnCondition, setReturnCondition] = useState(ITEM_STATUS.AVAILABLE);
  const [returnError, setReturnError] = useState("");
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: "error",
    title: "",
    message: "",
  });

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsFetching(true);
      setError(null);
      try {
        const params = {
          page,
          page_size: PAGE_SIZE,
          ordering: filters.ordering,
        };
        if (filters.user.trim()) params.user = filters.user.trim();
        if (filters.item.trim()) params.item = filters.item.trim();
        if (filters.status) params.status = filters.status;

        const { data } = await loanService.getAll(params);
        if (isMounted) {
          const results = Array.isArray(data) ? data : data?.results || [];
          setLoans(results);
          setTotalCount(Array.isArray(data) ? data.length : data?.count || 0);
          
          let computedSummary = data?.summary;
          if (!computedSummary && results.length > 0) {
            const now = new Date();
            const todayStr = now.toDateString();
            computedSummary = {
              due_total: results.filter((l) => !l.returned_at).length,
              overdue: results.filter((l) => !l.returned_at && new Date(l.due_at) < now).length,
              due_today: results.filter((l) => {
                if (l.returned_at) return false;
                const d = new Date(l.due_at);
                return d.toDateString() === todayStr;
              }).length,
            };
          }
          setSummary(computedSummary || { due_today: 0, due_total: 0, overdue: 0 });
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar el registro de préstamos.");
        console.error(err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filters, page, refreshKey]);

  const openInterruptModal = (loan) => {
    setReturnCondition(ITEM_STATUS.AVAILABLE);
    setReturnError("");
    setLoanToInterrupt(loan);
  };

  const markLoanAsReturned = (loanId, returnedAt) => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) =>
        loan.id === loanId ? { ...loan, returned_at: returnedAt } : loan
      )
    );
  };

  const confirmInterruptLoan = async () => {
    if (!loanToInterrupt) return;
    setIsProcessing(true);
    setReturnError("");

    const currentTime = new Date().toISOString();
    let loanClosed = false;

    try {
      await loanService.patch(loanToInterrupt.id, { returned_at: currentTime });
      loanClosed = true;

      await itemService.patch(loanToInterrupt.item, { status: returnCondition });

      markLoanAsReturned(loanToInterrupt.id, currentTime);
      setLoanToInterrupt(null);
      setPage(1);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Error al finalizar el préstamo:", err);

      if (loanClosed) {
        markLoanAsReturned(loanToInterrupt.id, currentTime);
        setLoanToInterrupt(null);
        setPage(1);
        setRefreshKey((prev) => prev + 1);
        setAlertModal({
          isOpen: true,
          type: "error",
          title: "Estado del ejemplar sin actualizar",
          message:
            "El préstamo se cerró, pero no se pudo actualizar el estado del ejemplar. Actualícelo desde el inventario.",
        });
      } else {
        const data = err.response?.data;
        const backendMessage =
          data && typeof data === "object" ? Object.values(data).flat().join(" ") : "";
        setReturnError(
          backendMessage || "No se pudo cerrar el préstamo. Verifique la conexión con el servidor."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusInfo = (dueAt, returnedAt) => {
    if (returnedAt) {
      return {
        text: "Devuelto",
        badgeStyle: "bg-surface-container text-on-surface-variant border-outline-variant/60",
      };
    }

    const now = new Date();
    const dueDate = new Date(dueAt);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Mora (${Math.abs(diffDays)}d)`,
        badgeStyle: "bg-error/10 text-error border-error/30 font-bold",
      };
    }
    if (diffDays === 0) {
      return {
        text: "Vence hoy",
        badgeStyle: "bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/30 font-bold",
      };
    }
    return {
      text: `${diffDays}d restantes`,
      badgeStyle: "bg-surface-container-low text-on-surface border-outline-variant/40 font-sans font-medium",
    };
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageNumbers = [
    ...new Set(
      [1, totalPages, page - 2, page - 1, page, page + 1, page + 2].filter(
        (pageNumber) => pageNumber >= 1 && pageNumber <= totalPages
      )
    ),
  ].sort((a, b) => a - b);

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 animate-fade-in font-sans">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-sans text-xs">
          Consultando libro mayor de circulación...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center animate-fade-in font-sans p-6">
        <p className="text-on-error bg-error px-6 py-3 rounded-sm font-sans text-xs font-medium shadow-sm">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 font-sans animate-fade-in text-on-surface">
      {/* =========================================================
          ENCABEZADO EDITORIAL DE CIRCULACIÓN
      ========================================================= */}
      <div className="border-b border-outline-variant/60 pb-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <GoBackButton />
          <div className="flex items-center gap-2 text-xs font-sans text-on-surface-variant">
            <Archive className="w-3.5 h-3.5 text-primary" />
            <span>Libro Mayor de Circulación</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-serif font-normal text-on-surface tracking-tight mb-2">
              Control y Registro de Préstamos
            </h1>
            <p className="text-sm md:text-[15px] text-on-surface-variant leading-relaxed">
              Auditoría cronológica de ejemplares físicos retirados en sala, plazos de tenencia reglamentaria y tramitación de devoluciones.
            </p>
          </div>

          <Link
            to="/librarian/loans/counter"
            id="btn-goto-counter"
            className="inline-flex items-center gap-2 self-start lg:self-auto px-5 py-2.5 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-sm shadow-xs hover:opacity-95 transition-opacity cursor-pointer shrink-0"
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>Ir a Mostrador de Préstamos</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>

      {/* =========================================================
          LIBRO MAYOR DE CIRCULACIÓN (CINTA CONTABLE SIN CLICHÉS DE IA)
      ========================================================= */}
      <section
        aria-label="Balance de préstamos"
        className="mb-8 bg-surface-container-lowest border border-outline-variant/80 rounded-sm"
      >
        <div className="px-6 py-3 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-2 text-xs font-sans font-medium text-on-surface-variant">
            <span>Balance Técnico de Circulación</span>
          </div>
          <span className="text-xs font-sans tabular-nums text-on-surface-variant">
            {totalCount} asientos registrados
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/60">
          {/* 1. Total Préstamos */}
          <div className="p-5 md:p-6">
            <span className="text-xs font-sans font-medium text-on-surface-variant block">
              Préstamos Registrados
            </span>
            <p className="font-serif text-3xl text-on-surface mt-1.5 font-normal tabular-nums">
              {totalCount}
            </p>
            <span className="text-xs text-on-surface-variant mt-0.5 block">
              Histórico general
            </span>
          </div>

          {/* 2. En Circulación Activa */}
          <div className="p-5 md:p-6">
            <span className="text-xs font-sans font-medium text-on-surface-variant block">
              En Circulación Activa
            </span>
            <p className="font-serif text-3xl text-on-surface mt-1.5 font-normal tabular-nums">
              {summary.due_total}
            </p>
            <span className="text-xs text-on-surface-variant mt-0.5 block">
              Ejemplares fuera de sala
            </span>
          </div>

          {/* 3. A Devolver Hoy */}
          <div className="p-5 md:p-6">
            <span className="text-xs font-sans font-medium text-on-surface-variant block">
              Vencen en la Jornada
            </span>
            <p className="font-serif text-3xl text-tertiary mt-1.5 font-normal tabular-nums">
              {summary.due_today}
            </p>
            <span className="text-xs text-on-surface-variant mt-0.5 block">
              Esperados en mostrador
            </span>
          </div>

          {/* 4. En Mora / Vencidos */}
          <div className="p-5 md:p-6">
            <span className="text-xs font-sans font-medium text-amber-800 dark:text-amber-400 block">
              En Estado de Mora
            </span>
            <p className="font-serif text-3xl text-amber-700 dark:text-amber-400 mt-1.5 font-normal tabular-nums">
              {summary.overdue}
            </p>
            <span className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-0.5 block">
              Plazo de 14 días vencido
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONSOLA DE FILTROS & TABLA DE REGISTROS
      ========================================================= */}
      <section
        aria-label="Filtros y resultados de préstamos"
        className="mb-8 w-full bg-surface-container-lowest border border-outline-variant/80 rounded-sm"
      >
        {/* Barra Técnica de Filtros */}
        <div className="p-5 border-b border-outline-variant/60 bg-surface-container-low/30">
          <div className="flex items-center gap-2 mb-3 text-xs font-sans font-semibold text-on-surface-variant">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Criterios de Inspección y Ordenamiento</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Filtro Lector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loans-user-filter" className="text-xs font-sans font-medium text-on-surface">
                Lector (Nombre o ID)
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="loans-user-filter"
                  type="search"
                  value={filters.user}
                  onChange={(event) => updateFilter("user", event.target.value)}
                  placeholder="Filtrar por lector..."
                  className="w-full pl-8 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-sm text-xs font-sans text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Filtro Ejemplar */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loans-item-filter" className="text-xs font-sans font-medium text-on-surface">
                Ejemplar (Título o Signatura)
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="loans-item-filter"
                  type="search"
                  value={filters.item}
                  onChange={(event) => updateFilter("item", event.target.value)}
                  placeholder="Filtrar por obra o código..."
                  className="w-full pl-8 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-sm text-xs font-sans text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Selector de Estado */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loans-status-select" className="text-xs font-sans font-medium text-on-surface">
                Estado de Préstamo
              </label>
              <select
                id="loans-status-select"
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-sm px-3 py-2 text-xs font-sans text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">Todos los asientos</option>
                <option value="active">En circulación (con tiempo)</option>
                <option value="overdue">En mora (vencidos)</option>
                <option value="returned">Devueltos / Finalizados</option>
              </select>
            </div>

            {/* Ordenamiento */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loans-ordering-select" className="text-xs font-sans font-medium text-on-surface">
                Criterio de Orden
              </label>
              <select
                id="loans-ordering-select"
                value={filters.ordering}
                onChange={(event) => updateFilter("ordering", event.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-sm px-3 py-2 text-xs font-sans text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="-loaned_at">Retiro más reciente</option>
                <option value="loaned_at">Retiro más antiguo</option>
                <option value="item">Título / Ejemplar (A–Z)</option>
                <option value="remaining">Vencimiento más próximo</option>
                <option value="-remaining">Vencimiento más lejano</option>
                <option value="id">Folio ID ascendente</option>
                <option value="-id">Folio ID descendente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vista Móvil (Fichas de Asiento para pantallas pequeñas) */}
        <div className="block divide-y divide-outline-variant/60 md:hidden">
          {isFetching ? (
            <div
              role="status"
              className="flex min-h-32 items-center justify-center gap-2 p-8 text-xs font-sans text-primary"
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Actualizando asientos...</span>
            </div>
          ) : loans.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant font-serif italic text-sm">
              No existen préstamos que concuerden con los criterios seleccionados.
            </div>
          ) : (
            loans.map((loan) => {
              const status = getStatusInfo(loan.due_at, loan.returned_at);
              const isReturned = Boolean(loan.returned_at);

              return (
                <div
                  key={loan.id}
                  className={`p-4 flex flex-col gap-3 transition-colors ${
                    isReturned ? "opacity-60 bg-surface-container-low/30" : "bg-surface-container-lowest"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans tabular-nums text-xs font-bold text-on-surface">
                      Folio #{loan.id}
                    </span>
                    <span
                      className={`text-xs font-sans font-medium px-2 py-0.5 border rounded-xs ${status.badgeStyle}`}
                    >
                      {status.text}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-on-surface">
                    <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-serif text-base font-medium leading-snug">
                        {loan.book?.title || `Libro #${loan.book}`}
                      </h2>
                      <span className="text-xs font-sans tabular-nums text-on-surface-variant">
                        Ejemplar signatura #{loan.item}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-sans tabular-nums text-on-surface-variant pt-2 border-t border-outline-variant/40">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                      <span className="truncate">
                        {loan.user?.full_name || `Lector #${loan.user?.id || loan.user}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                      <span>{new Date(loan.loaned_at).toLocaleDateString("es-AR")}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => openInterruptModal(loan)}
                      disabled={isReturned}
                      className={`w-full py-2 text-xs font-sans font-bold rounded-sm transition-colors ${
                        isReturned
                          ? "bg-surface-container text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/40"
                          : "bg-primary text-on-primary hover:opacity-95 cursor-pointer shadow-xs"
                      }`}
                    >
                      {isReturned ? "Asiento Cerrado" : "Registrar Devolución"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tabla de Libro Mayor para Escritorio */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Registro de préstamos activos e históricos"
          className="hidden w-full overflow-x-auto focus:outline-none focus:ring-1 focus:ring-primary/40 md:block"
        >
          <table className="w-full text-left border-collapse min-w-[840px]">
            <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-sans text-xs font-semibold">
              <tr>
                <th scope="col" className="py-3 px-5 w-20">Folio</th>
                <th scope="col" className="py-3 px-5">Lector Titular</th>
                <th scope="col" className="py-3 px-5">Obra & Ejemplar</th>
                <th scope="col" className="py-3 px-5">Fecha Retiro</th>
                <th scope="col" className="py-3 px-5">Vencimiento / Estado</th>
                <th scope="col" className="py-3 px-5 text-right">Trámite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-xs">
              {isFetching ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center font-sans text-xs text-primary">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Actualizando libro mayor...</span>
                    </div>
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-on-surface-variant font-serif italic text-sm">
                    No existen préstamos que concuerden con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => {
                  const status = getStatusInfo(loan.due_at, loan.returned_at);
                  const isReturned = Boolean(loan.returned_at);

                  return (
                    <tr
                      key={loan.id}
                      className={`hover:bg-surface-container-low/40 transition-colors ${
                        isReturned ? "opacity-60 bg-surface-container-low/10" : ""
                      }`}
                    >
                      {/* Folio */}
                      <td className="py-3.5 px-5 font-sans tabular-nums text-xs text-on-surface-variant font-semibold">
                        #{loan.id}
                      </td>

                      {/* Lector */}
                      <td className="py-3.5 px-5">
                        <div className="font-sans font-medium text-on-surface">
                          {loan.user?.full_name || `Lector #${loan.user}`}
                        </div>
                        <span className="font-sans tabular-nums text-xs text-on-surface-variant block mt-0.5">
                          ID: {loan.user?.id || loan.user}
                        </span>
                      </td>

                      {/* Ejemplar */}
                      <td className="py-3.5 px-5">
                        <div className="font-serif text-sm font-medium text-on-surface leading-snug">
                          {loan.book?.title || `Libro #${loan.book}`}
                        </div>
                        <span className="font-sans tabular-nums text-xs text-on-surface-variant block mt-0.5">
                          Signatura Ejemplar: #{loan.item}
                        </span>
                      </td>

                      {/* Fecha Retiro */}
                      <td className="py-3.5 px-5 font-sans tabular-nums text-xs text-on-surface-variant">
                        {new Date(loan.loaned_at).toLocaleDateString("es-AR")}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block text-xs font-sans font-medium px-2 py-0.5 border rounded-xs ${status.badgeStyle}`}
                        >
                          {status.text}
                        </span>
                      </td>

                      {/* Acción */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => openInterruptModal(loan)}
                          disabled={isReturned}
                          className={`px-3 py-1.5 text-xs font-sans font-medium rounded-sm transition-colors ${
                            isReturned
                              ? "text-on-surface-variant/40 italic cursor-not-allowed"
                              : "bg-primary text-on-primary hover:opacity-95 cursor-pointer shadow-2xs font-bold"
                          }`}
                        >
                          {isReturned ? "Cerrado" : "Finalizar"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <nav
            aria-label="Paginación de préstamos"
            className="flex items-center justify-between border-t border-outline-variant/60 px-6 py-4 bg-surface-container-low/20"
          >
            <div className="text-xs font-sans tabular-nums text-on-surface-variant">
              Página <strong className="text-on-surface">{page}</strong> de <strong className="text-on-surface">{totalPages}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || isFetching}
                className="p-1.5 rounded-sm border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageNumbers.map((pageNumber, index) => (
                <span key={pageNumber} className="inline-flex items-center gap-1">
                  {index > 0 && pageNumber - pageNumbers[index - 1] > 1 && (
                    <span className="text-outline text-xs px-1 font-sans" aria-hidden="true">
                      …
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    disabled={isFetching}
                    aria-current={page === pageNumber ? "page" : undefined}
                    className={`min-w-7 h-7 px-1.5 rounded-sm text-xs font-sans tabular-nums transition-colors cursor-pointer disabled:opacity-50 ${
                      page === pageNumber
                        ? "bg-primary text-on-primary font-bold"
                        : "border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary"
                    }`}
                  >
                    {pageNumber}
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || isFetching}
                className="p-1.5 rounded-sm border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </nav>
        )}
      </section>

      {/* Ventana Modal para registrar la devolución y estado físico */}
      <ReturnLoanModal
        loan={loanToInterrupt}
        condition={returnCondition}
        onConditionChange={setReturnCondition}
        error={returnError}
        isLoading={isProcessing}
        onClose={() => setLoanToInterrupt(null)}
        onConfirm={confirmInterruptLoan}
      />

      {/* Modal de Alerta */}
      <FeedbackModal
        isOpen={alertModal.isOpen}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
