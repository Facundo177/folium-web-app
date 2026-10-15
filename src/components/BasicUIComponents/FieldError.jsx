// Muestra el error de un campo. Acepta una lista (formato del back) o un texto.
// Se usa en todos los formularios para que los errores se vean igual.
export default function FieldError({ messages }) {
  if (!messages) return null;
  const text = Array.isArray(messages) ? messages.join(" ") : messages;
  return <p className="text-error text-xs mt-1">{text}</p>;
}