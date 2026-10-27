/**
 * Muestra el error de un campo de forma accesible con anuncio dinámico para lectores de pantalla.
 * Acepta una lista (formato DRF) o un string.
 */
export default function FieldError({ messages, id }) {
  if (!messages) return null;
  const text = Array.isArray(messages) ? messages.join(" ") : messages;
  if (!text) return null;

  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className="text-error text-xs mt-1 font-medium flex items-center gap-1"
    >
      {text}
    </p>
  );
}
