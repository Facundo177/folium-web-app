import { useState, useEffect } from "react";
import { loanService } from "../api/services/loanService"

export default function LoansDashboard() {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    // 1. Declaramos la función asíncrona directamente dentro del efecto
    const fetchLoans = async () => {
      setIsLoading(true);
      try {
        const { data } = await loanService.getAll();
        setLoans(data);
      } catch (err) {
        setError("Error al cargar el registro de préstamos.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // 2. La ejecutamos inmediatamente
    fetchLoans();
    
    // 3. El array de dependencias queda vacío, garantizando que solo se ejecute al montar
  }, []);

  // Manejador para interrumpir/finalizar el préstamo
  const handleInterruptLoan = async (loanId) => {
    if (!window.confirm("¿Estás seguro de que deseas interrumpir este préstamo y marcar el ejemplar como devuelto?")) {
      return;
    }

    try {
      const currentTime = new Date().toISOString();
      // Usamos PATCH para actualizar solo la fecha de devolución
      await loanService.patch(loanId, { returned_at: currentTime });
      
      // Actualizamos el estado local para reflejar el cambio al instante sin recargar
      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan.id === loanId ? { ...loan, returned_at: currentTime } : loan
        )
      );
    } catch (err) {
      console.error("Error al finalizar el préstamo:", err);
      alert("No se pudo procesar la devolución. Verifica la conexión con el servidor.");
    }
  };

  // Función para calcular el tiempo restante y su color
  const getStatusInfo = (dueAt, returnedAt) => {
    if (returnedAt) {
      return { text: "Devuelto", colorClass: "text-secondary font-bold" }; // Slate Blue
    }

    const now = new Date();
    const dueDate = new Date(dueAt);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        text: `Vencido (${Math.abs(diffDays)} días)`, 
        colorClass: "text-error font-bold" 
      };
    }
    if (diffDays === 0) {
      return { 
        text: "Vence hoy", 
        colorClass: "text-tertiary font-bold" // Antique Gold
      };
    }
    return { 
      text: `${diffDays} días rest.`, 
      colorClass: "text-on-surface" 
    };
  };

  if (isLoading) {
    return <div className="p-8 text-on-background font-sans">Cargando archivo de préstamos...</div>;
  }

  if (error) {
    return <div className="p-8 text-error font-bold font-sans">{error}</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 font-sans animate-fade-in">
      
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-headline-md font-serif text-on-background mb-2">
          Registro de Préstamos Activos
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Supervisa el estado de los ejemplares prestados, verifica vencimientos y gestiona devoluciones.
        </p>
      </div>

      {/* Tabla de Dashboard */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-surface-container border-b border-outline-variant/50">
            <tr>
              <th className="p-4 text-label-caps text-on-surface font-bold">ID Préstamo</th>
              <th className="p-4 text-label-caps text-on-surface font-bold">Lector (ID)</th>
              <th className="p-4 text-label-caps text-on-surface font-bold">Ejemplar (ID)</th>
              <th className="p-4 text-label-caps text-on-surface font-bold">Fecha de Retiro</th>
              <th className="p-4 text-label-caps text-on-surface font-bold">Estado / Restante</th>
              <th className="p-4 text-label-caps text-on-surface font-bold text-center">Acciones</th>
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
                const isReturned = !!loan.returned_at;
                
                return (
                  <tr 
                    key={loan.id} 
                    className={`border-b border-outline-variant/30 hover:bg-surface-container/50 transition-colors ${
                      isReturned ? "opacity-60" : ""
                    }`}
                  >
                    {/* Ejemplar */}
                    <td className="p-4 text-body-md text-on-surface">
                        Ejemplar #{loan.item?.id || loan.item}
                    </td>
                    {/* Lector */}
                    <td className="p-4 text-body-md text-on-surface">
                        {loan.user?.username || `Usuario #${loan.user}`}
                        <span className="block text-xs text-on-surface-variant">
                            ID: {loan.user?.id || loan.user}
                        </span>
                    </td>
                    <td className="p-4 text-body-md text-on-surface">
                      Item #{loan.item}
                    </td>
                    <td className="p-4 text-body-md text-on-surface-variant">
                      {new Date(loan.loaned_at).toLocaleDateString("es-AR")}
                    </td>
                    
                    {/* Celda de Estado (Días restantes o Vencido) */}
                    <td className={`p-4 text-body-md ${status.colorClass}`}>
                      {status.text}
                    </td>
                    
                    {/* Botón de Interrupción */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleInterruptLoan(loan.id)}
                        disabled={isReturned}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors shadow-sm ${
                          isReturned
                            ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                            : "bg-primary text-on-primary hover:opacity-90"
                        }`}
                      >
                        {isReturned ? "Finalizado" : "Interrumpir"}
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