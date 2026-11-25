const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DNI_REGEX = /^\d{6,10}$/;

export function isNonEmpty(value) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined && String(value).trim().length > 0;
}

export function hasMinLength(value, minLength) {
  return String(value ?? "").trim().length >= minLength;
}

export function isValidEmail(value) {
  return EMAIL_REGEX.test(String(value ?? "").trim());
}

export function isValidDni(value) {
  return DNI_REGEX.test(String(value ?? "").trim());
}
