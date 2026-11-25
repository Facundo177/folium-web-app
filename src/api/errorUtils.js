const FIELD_LABELS_ES = {
  username: "Nombre de usuario",
  password: "Contraseña",
  current_password: "Contraseña actual",
  new_password: "Nueva contraseña",
  confirm_new_password: "Confirmación de contraseña",
  email: "Correo electrónico",
  dni: "DNI",
  first_name: "Nombre",
  last_name: "Apellido",
  address: "Dirección",
  phone: "Teléfono",
  title: "Título",
  isbn: "ISBN",
  publication_year: "Año de publicación",
  editorial: "Editorial",
  editorial_id: "Editorial",
  authors: "Autores",
  authors_ids: "Autores",
  genres: "Géneros",
  genres_ids: "Géneros",
  description: "Sinopsis",
  cover_image: "Portada",
  full_name: "Nombre completo",
  name: "Nombre",
  book: "Libro",
  item: "Ejemplar",
  inventory_code: "Código de inventario",
  location: "Ubicación",
  status: "Estado",
  rating: "Calificación",
  comment: "Comentario",
  expires_at: "Fecha de vencimiento",
  due_at: "Fecha de vencimiento",
  plan: "Plan",
  plan_id: "Plan",
  non_field_errors: null,
  detail: null,
  error: null,
  message: null,
};

const EXACT_ERROR_TRANSLATIONS = new Map([
  [
    "no active account found with the given credentials",
    "No se encontró una cuenta activa con esas credenciales.",
  ],
  [
    "unable to log in with provided credentials.",
    "No se pudo iniciar sesión con las credenciales ingresadas.",
  ],
  ["this field may not be blank.", "Este campo es obligatorio."],
  ["this field may not be null.", "Este campo es obligatorio."],
  ["this field is required.", "Este campo es obligatorio."],
  ["enter a valid email address.", "Ingresá un correo electrónico válido."],
  ["enter a valid integer.", "Ingresá un número entero válido."],
  ["enter a valid number.", "Ingresá un número válido."],
  ["enter a valid date.", "Ingresá una fecha válida."],
  ["enter a valid date/time.", "Ingresá una fecha y hora válida."],
  ["a valid integer is required.", "Se requiere un número entero válido."],
  [
    "given token not valid for any token type",
    "Tu sesión venció. Volvé a iniciar sesión.",
  ],
  [
    "token is invalid or expired",
    "Tu sesión venció o es inválida. Volvé a iniciar sesión.",
  ],
  [
    "authentication credentials were not provided.",
    "Debés iniciar sesión para realizar esta acción.",
  ],
  [
    "you do not have permission to perform this action.",
    "No tenés permisos para realizar esta acción.",
  ],
  ["not found.", "No se encontró el recurso solicitado."],
  [
    "network error",
    "No se pudo conectar con el servidor. Verificá tu conexión.",
  ],
]);

const PATTERN_ERROR_TRANSLATIONS = [
  [
    /^Ensure this field has at least (\d+) characters?\.?$/i,
    (_, n) => `Debe tener al menos ${n} caracteres.`,
  ],
  [
    /^Ensure this field has no more than (\d+) characters?\.?$/i,
    (_, n) => `No puede superar los ${n} caracteres.`,
  ],
  [
    /^Ensure this value is greater than or equal to ([^.]+)\.?$/i,
    (_, min) => `El valor debe ser mayor o igual a ${min}.`,
  ],
  [
    /^Ensure this value is less than or equal to ([^.]+)\.?$/i,
    (_, max) => `El valor debe ser menor o igual a ${max}.`,
  ],
  [
    /^A user with that username already exists\.?$/i,
    () => "Ya existe una cuenta con ese nombre de usuario.",
  ],
  [
    /^User with this (.+) already exists\.?$/i,
    () => "Ya existe una cuenta registrada con ese dato.",
  ],
  [/already exists\.?$/i, () => "Ya existe un registro con ese valor."],
  [
    /^This password is too short\. It must contain at least (\d+) characters\.?$/i,
    (_, n) => `La contraseña es demasiado corta (mínimo ${n} caracteres).`,
  ],
  [
    /^This password is too common\.?$/i,
    () => "La contraseña elegida es demasiado común.",
  ],
  [
    /^This password is entirely numeric\.?$/i,
    () => "La contraseña no puede ser completamente numérica.",
  ],
  [
    /^The password is too similar to/i,
    () => "La contraseña es demasiado similar a tus datos personales.",
  ],
  [
    /^Invalid pk\b/i,
    () => "El registro seleccionado no es válido.",
  ],
  [
    /^No .+ matches the given query\.?$/i,
    () => "No se encontró el registro solicitado.",
  ],
  [
    /^timeout of \d+ms exceeded$/i,
    () => "La solicitud tardó demasiado. Intentá nuevamente.",
  ],
];

export function translateErrorMessage(rawMessage) {
  if (rawMessage === null || rawMessage === undefined) return "";
  const text = String(rawMessage).trim();
  if (!text) return "";

  const exact = EXACT_ERROR_TRANSLATIONS.get(text.toLowerCase());
  if (exact) return exact;

  for (const [pattern, formatter] of PATTERN_ERROR_TRANSLATIONS) {
    const match = text.match(pattern);
    if (match) return formatter(...match);
  }

  return text;
}

function flattenValues(value) {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(flattenValues);
  if (typeof value === "object") {
    return Object.values(value).flatMap(flattenValues);
  }
  const translated = translateErrorMessage(value);
  return translated ? [translated] : [];
}

function getFieldLabel(key) {
  if (Object.prototype.hasOwnProperty.call(FIELD_LABELS_ES, key)) {
    return FIELD_LABELS_ES[key];
  }
  return key;
}

export function formatApiError(
  error,
  fallback = "Ocurrió un error inesperado. Intentá nuevamente.",
  options = {}
) {
  const separator = options.separator ?? " ";
  if (!error) return fallback;
  if (typeof error === "string") {
    return translateErrorMessage(error) || fallback;
  }

  const data = error?.response?.data;
  if (!data) {
    if (error?.code === "ECONNABORTED") {
      return "La solicitud tardó demasiado. Intentá nuevamente.";
    }
    if (error?.message === "Network Error") {
      return "No se pudo conectar con el servidor. Verificá tu conexión.";
    }
    return fallback;
  }

  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed || trimmed.startsWith("<")) return fallback;
    return translateErrorMessage(trimmed) || fallback;
  }

  if (Array.isArray(data)) {
    const msgs = [...new Set(flattenValues(data))];
    return msgs.length > 0 ? msgs.join(separator) : fallback;
  }

  if (typeof data === "object") {
    const parts = [];
    for (const [key, val] of Object.entries(data)) {
      const msgs = [...new Set(flattenValues(val))];
      if (msgs.length === 0) continue;
      const label = getFieldLabel(key);
      const joined = msgs.join(" ");
      parts.push(label ? `${label}: ${joined}` : joined);
    }
    const uniqueParts = [...new Set(parts)];
    return uniqueParts.length > 0 ? uniqueParts.join(separator) : fallback;
  }

  return fallback;
}

export function formatFieldErrors(
  error,
  allowedFields = null,
  fallback = "Ocurrió un error inesperado. Verificá los datos."
) {
  const data = error?.response?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      fieldErrors: {},
      generalError: formatApiError(error, fallback),
    };
  }

  const fieldErrors = {};
  const generalParts = [];

  for (const [key, val] of Object.entries(data)) {
    const msgs = [...new Set(flattenValues(val))];
    if (msgs.length === 0) continue;

    const label = getFieldLabel(key);
    const isField =
      label !== null && (!allowedFields || allowedFields.includes(key));

    if (isField) {
      fieldErrors[key] = msgs;
    } else {
      generalParts.push(label ? `${label}: ${msgs.join(" ")}` : msgs.join(" "));
    }
  }

  const uniqueGeneral = [...new Set(generalParts)];
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    generalError:
      uniqueGeneral.length > 0
        ? uniqueGeneral.join(" ")
        : hasFieldErrors
          ? null
          : fallback,
  };
}
