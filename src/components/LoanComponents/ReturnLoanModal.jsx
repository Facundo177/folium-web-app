import FeedbackModal from "../BasicUIComponents/FeedbackModal";
import FieldError from "../BasicUIComponents/FieldError";
import { RETURN_CONDITIONS } from "../../api/constants";

// Ventana para cerrar un préstamo: usa el mismo FeedbackModal que el resto de la app, con las opciones adentro.
export default function ReturnLoanModal({
  loan,
  condition,
  onConditionChange,
  error,
  isLoading,
  onClose,
  onConfirm,
}) {
  return (
    <FeedbackModal
      isOpen={!!loan}
      type="warning"
      title="Cerrar préstamo"
      message={
        loan
          ? `${loan.book?.title || `Ejemplar #${loan.item}`}: ¿en qué estado vuelve el libro?`
          : ""
      }
      confirmText="Aceptar"
      cancelText="Cancelar"
      isLoading={isLoading}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      {/* Una opción por estado; la marcada es la que llega por la prop "condition" */}
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Estado del libro</legend>
        {RETURN_CONDITIONS.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 px-4 py-3 border border-outline-variant rounded-sm cursor-pointer hover:bg-surface-container transition-colors"
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

      {/* Error del servidor, para poder reintentar sin cerrar la ventana */}
      <FieldError messages={error} />
    </FeedbackModal>
  );
}