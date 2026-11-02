import { useState, useEffect } from "react";
import { loanService } from "../api/services/loanService";
import FeedbackModal from "../components/BasicUIComponents/FeedbackModal";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { itemService } from "../api/services/itemService";
import { ITEM_STATUS } from "../api/constants";
import { Link } from "react-router-dom";
import ReturnLoanModal from "../components/LoanComponents/ReturnLoanModal";
import { BookOpen, User, Calendar, BookOpenCheck, CalendarClock, TriangleAlert, ChevronLeft, ChevronRight, Search } from "lucide-react";

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

  // Estados para modales
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
          setSummary(data?.summary || { due_today: 0, due_total: 0, overdue: 0 });
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
      return { text: "Devuelto", colorClass: "text-secondary font-bold" };
    }

    const now = new Date();
    const dueDate = new Date(dueAt);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Vencido (${Math.abs(diffDays)} días)`,
        colorClass: "text-error font-bold",
      };
    }
    if (diffDays === 0) {
      return {
        text: "Vence hoy",
        colorClass: "text-tertiary font-bold",
      };
    }
    return {
      text: `${diffDays} días rest.`,
      colorClass: "text-on-surface",
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
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-bold tracking-widest uppercase text-xs">
          Cargando archivo de préstamos...
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-serif text-on-surface mb-2">
            Control de Préstamos
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Filtra por lector, ejemplar o estado; ordena y gestiona las devoluciones físicas.
          </p>
        </div>
        <Link
          to="/librarian/loans/counter"
          id="btn-goto-counter"
          className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer shrink-0"
        >
          <BookOpenCheck className="w-4 h-4" />
          <span>Mostrador de Préstamos</span>
        </Link>
      </div>

      <section
        aria-label="Resumen de préstamos"
        className="mb-8 grid grid-cols-1 sm:grid-cols-4 gap-4"
      >
        <article className="flex items-center gap-4 border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              A devolver hoy
            </p>
            <p className="text-2xl font-bold text-on-surface">{summary.due_today}</p>
          </div>
        </article>
        <article className="flex items-center gap-4 border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              A devolver en total
            </p>
            <p className="text-2xl font-bold text-on-surface">{summary.due_total}</p>
          </div>
        </article>
        <article className="flex items-center gap-4 border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Vencidos
            </p>
            <p className="text-2xl font-bold text-on-surface">{summary.overdue}</p>
          </div>
        </article>
        <article className="flex items-center gap-4 border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Préstamos totales
            </p>
            <p className="text-2xl font-bold text-on-surface">{totalCount}</p>
          </div>
        </article>
      </section>

      <section
        aria-label="Filtros y resultados de préstamos"
        className="mb-8 w-full overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest shadow-xs"
      >
        <section
          aria-label="Filtros y ordenamiento de préstamos"
          className="grid grid-cols-1 gap-4 border-b border-outline-variant p-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="loans-user-filter" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Usuario
            </label>
            <div className="flex items-center gap-base border-b border-outline w-full">
              <Search className="w-[18px] h-[18px] text-on-surface-variant shrink-0" />
              <input
                id="loans-user-filter"
                type="search"
                value={filters.user}
                onChange={(event) => updateFilter("user", event.target.value)}
                placeholder="Nombre, apellido o ID"
                className="bg-transparent border-none outline-none text-sm py-2.5 w-full text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="loans-item-filter" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Ejemplar
            </label>
            <div className="flex items-center gap-base border-b border-outline w-full">
              <Search className="w-[18px] h-[18px] text-on-surface-variant shrink-0" />
              <input
                id="loans-item-filter"
                type="search"
                value={filters.item}
                onChange={(event) => updateFilter("item", event.target.value)}
                placeholder="Título, código o ID"
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
              <option value="active">Con tiempo restante</option>
              <option value="overdue">Vencidos</option>
              <option value="returned">Devueltos</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Ordenar por
            <select
              value={filters.ordering}
              onChange={(event) => updateFilter("ordering", event.target.value)}
              className="w-full rounded-sm border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-primary"
            >
              <option value="item">Ejemplar (A–Z)</option>
              <option value="id">ID (menor a mayor)</option>
              <option value="-id">ID (mayor a menor)</option>
              <option value="loaned_at">Fecha de retiro (más antigua)</option>
              <option value="-loaned_at">Fecha de retiro (más reciente)</option>
              <option value="remaining">Tiempo restante (menor a mayor)</option>
              <option value="-remaining">Tiempo restante (mayor a menor)</option>
            </select>
          </label>
        </section>

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
        ) : loans.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant italic text-sm">
            No hay préstamos que coincidan con los filtros.
          </div>
        ) : (
          loans.map((loan) => {
            const status = getStatusInfo(loan.due_at, loan.returned_at);
            const isReturned = Boolean(loan.returned_at);

            return (
              <div
                key={loan.id}
                className={`p-4 flex flex-col gap-3 border border-outline-variant rounded-none transition-colors ${
                  isReturned ? "opacity-60 bg-surface-container-low" : "bg-surface-container-lowest"
                }`}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold bg-surface-container px-2 py-0.5 rounded border border-outline-variant text-on-surface">
                    Préstamo #{loan.id}
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
                      {loan.book?.title || `Libro #${loan.book}`}
                    </h2>
                    <span className="text-xs font-mono text-on-surface-variant">
                      Item #{loan.item}
                    </span>
                  </div>
                </div>

                {/* Lector y Fecha */}
                <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant pt-2 border-t border-outline-variant/40">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{loan.user?.full_name || `Lector #${loan.user?.id || loan.user}`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-outline shrink-0" />
                    <span>{new Date(loan.loaned_at).toLocaleDateString("es-AR")}</span>
                  </div>
                </div>

                {/* Botón Acción Móvil */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openInterruptModal(loan)}
                    disabled={isReturned}
                    className={`w-full py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors shadow-xs ${
                      isReturned
                        ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                        : "bg-primary text-on-primary hover:opacity-90 cursor-pointer"
                    }`}
                  >
                    {isReturned ? "Finalizado" : "Finalizar Préstamo"}
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
        aria-label="Registro de préstamos activos"
        className="hidden w-full overflow-x-auto focus:outline-none focus:ring-1 focus:ring-primary/40 md:block"
      >
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-1 bg-surface-container border-b border-outline-variant">
            <tr>
              <th scope="col" className="p-4 text-label-caps text-on-surface font-bold">ID</th>
              <th scope="col" className="p-4 text-label-caps text-on-surface font-bold">Lector (ID)</th>
              <th scope="col" className="p-4 text-label-caps text-on-surface font-bold">Ejemplar (ID)</th>
              <th scope="col" className="p-4 text-label-caps text-on-surface font-bold">Fecha de Retiro</th>
              <th scope="col" className="p-4 text-label-caps text-on-surface font-bold">Estado / Restante</th>
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
            ) : loans.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-on-surface-variant italic">
                  No hay préstamos que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              loans.map((loan) => {
                const status = getStatusInfo(loan.due_at, loan.returned_at);
                const isReturned = Boolean(loan.returned_at);

                return (
                  <tr
                    key={loan.id}
                    className={`border-b border-outline-variant/30 hover:bg-surface-container/50 transition-colors ${
                      isReturned ? "opacity-60" : ""
                    }`}
                  >
                    <td className="p-4 text-body-md text-on-surface font-mono text-xs">
                      #{loan.id}
                    </td>
                    <td className="p-4 text-body-md text-on-surface">
                      {loan.user?.full_name || `Usuario #${loan.user}`}
                      <span className="block text-xs font-mono text-on-surface-variant">
                        ID: {loan.user?.id || loan.user}
                      </span>
                    </td>
                    <td className="p-4 text-body-md text-on-surface">
                      {loan.book?.title}
                      <span className="block text-xs font-mono text-on-surface-variant">
                        Item #{loan.item}
                      </span>
                    </td>
                    <td className="p-4 text-body-md text-on-surface-variant font-mono text-xs">
                      {new Date(loan.loaned_at).toLocaleDateString("es-AR")}
                    </td>

                    <td className={`p-4 text-body-md ${status.colorClass}`}>
                      {status.text}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => openInterruptModal(loan)}
                        disabled={isReturned}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors shadow-xs ${
                          isReturned
                            ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                            : "bg-primary text-on-primary hover:opacity-90 cursor-pointer"
                        }`}
                      >
                        {isReturned ? "Finalizado" : "Finalizar"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Paginación de préstamos"
          className="flex items-center justify-center gap-2 border-t border-outline-variant px-4 py-4"
        >
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isFetching}
            className="p-2 rounded-sm border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageNumbers.map((pageNumber, index) => (
            <span key={pageNumber} className="inline-flex items-center gap-2">
              {index > 0 && pageNumber - pageNumbers[index - 1] > 1 && (
                <span className="text-outline text-xs px-1" aria-hidden="true">
                  …
                </span>
              )}
              <button
                type="button"
                onClick={() => setPage(pageNumber)}
                disabled={isFetching}
                aria-current={page === pageNumber ? "page" : undefined}
                className={`w-8 h-8 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 ${
                  page === pageNumber
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary"
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
            className="p-2 rounded-sm border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
      </section>

      {/* Ventana para cerrar el préstamo indicando el estado del libro */}
      <ReturnLoanModal
        loan={loanToInterrupt}
        condition={returnCondition}
        onConditionChange={setReturnCondition}
        error={returnError}
        isLoading={isProcessing}
        onClose={() => setLoanToInterrupt(null)}
        onConfirm={confirmInterruptLoan}
      />

      {/* Aviso cuando el préstamo se cerró pero el ejemplar no se pudo actualizar */}
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
