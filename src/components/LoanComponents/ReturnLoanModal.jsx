import { createPortal } from "react-dom";
import { RETURN_CONDITIONS } from "../../api/constants";
import FieldError from "../BasicUIComponents/FieldError";

// Ventana para cerrar un préstamo indicando en qué estado vuelve el libro.
export default function ReturnLoanModal({
  loan,
  condition,
  onConditionChange,
  error,
  isLoading,
  onClose,
  onConfirm,
}) {
  // Sin préstamo seleccionado, la ventana no se muestra.
  if (!loan) return null;

  // El portal dibuja la ventana en <body>, así el fondo gris cubre la pantalla visible y no toda la tabla.
  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={isLoading ? undefined : onClose}
    >
      {/* Panel: el stopPropagation evita que un clic adentro cierre la ventana. */}
      <div
        className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-lg shadow-2xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="text-title-lg font-serif text-on-surface mb-1">Cerrar préstamo</h3>
          <p className="text-body-md text-on-surface-variant">
            {loan.book?.title || `Ejemplar #${loan.item}`}: ¿en qué estado vuelve el libro?
          </p>
        </div>

        {/* Una opción por estado; la marcada es la que llega por la prop "condition". */}
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Estado del libro</legend>
          {RETURN_CONDITIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 px-4 py-3 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container transition-colors"
            >
              <input
                type="radio"
                name="return-condition"
                value={option.value}
                checked={condition === option.value}
                onChange={() => onConditionChange(option.value)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="text-body-md text-on-surface">{option.label}</span>
            </label>
          ))}
        </fieldset>

        {/* Error del servidor, para poder reintentar sin cerrar la ventana. */}
        <FieldError messages={error} />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-outline-variant rounded-md text-on-surface hover:bg-surface-container disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-primary text-on-primary rounded-md hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? "Guardando..." : "Aceptar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}