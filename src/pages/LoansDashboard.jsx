import { useState, useEffect } from "react";
import { loanService } from "../api/services/loanService";
import FeedbackModal from "../components/BasicUIComponents/FeedbackModal";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { itemService } from "../api/services/itemService";
import { ITEM_STATUS } from "../api/constants";
import { Link } from "react-router-dom";
import ReturnLoanModal from "../components/LoanComponents/ReturnLoanModal";
import { BookOpen, User, Calendar, Clock, BookOpenCheck } from "lucide-react";

export default function LoansDashboard() {
  useDocumentMetadata({
    title: "Control de Préstamos — Folium",
    description: "Panel de control y registro de préstamos activos e históricos para bibliotecarios.",
    noIndex: true,
  });
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchLoans = async () => {
      setIsLoading(true);
      try {
        const { data } = await loanService.getAll();
        if (isMounted) setLoans(data);
      } catch (err) {
        if (isMounted) setError("Error al cargar el registro de préstamos.");
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLoans();
    return () => {
      isMounted = false;
    };
  }, []);

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
    } catch (err) {
      console.error("Error al finalizar el préstamo:", err);

      if (loanClosed) {
        markLoanAsReturned(loanToInterrupt.id, currentTime);
        setLoanToInterrupt(null);
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
            Control de Préstamos Activos
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Supervisa el estado de los ejemplares prestados, verifica vencimientos y gestiona devoluciones físicas.
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

      {/* Vista Móvil (Tarjetas apiladas para < md) */}
      <div className="block md:hidden divide-y divide-outline-variant/60 bg-surface-container-lowest border border-outline-variant rounded-md shadow-xs mb-8">
        {loans.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant italic text-sm">
            No hay préstamos registrados en el archivo.
          </div>
        ) : (
          loans.map((loan) => {
            const status = getStatusInfo(loan.due_at, loan.returned_at);
            const isReturned = Boolean(loan.returned_at);

            return (
              <div
                key={loan.id}
                className={`p-4 flex flex-col gap-3 transition-colors ${
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
        className="hidden md:block w-full bg-surface-container-lowest border border-outline-variant rounded-md shadow-xs overflow-x-auto focus:outline-none focus:ring-1 focus:ring-primary/40"
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
            {loans.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-on-surface-variant italic">
                  No hay préstamos registrados en el archivo.
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
