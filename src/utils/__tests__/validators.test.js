import { describe, it, expect } from "vitest";
import {
  isNonEmpty,
  hasMinLength,
  isValidEmail,
  isValidDni,
} from "../validators";

describe("validators", () => {
  it("valida cadenas no vacías ignorando espacios", () => {
    expect(isNonEmpty("Folium")).toBe(true);
    expect(isNonEmpty("   ")).toBe(false);
    expect(isNonEmpty("")).toBe(false);
    expect(isNonEmpty(null)).toBe(false);
  });

  it("valida longitud mínima tras recortar espacios", () => {
    expect(hasMinLength("abc", 3)).toBe(true);
    expect(hasMinLength("  ab ", 3)).toBe(false);
    expect(hasMinLength("12345678", 8)).toBe(true);
  });

  it("valida correos electrónicos con formato estándar", () => {
    expect(isValidEmail("lector@folium.org")).toBe(true);
    expect(isValidEmail("sin-arroba.com")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });

  it("valida DNI numérico entre 6 y 10 dígitos", () => {
    expect(isValidDni("40123456")).toBe(true);
    expect(isValidDni("123456")).toBe(true);
    expect(isValidDni("12345")).toBe(false);
    expect(isValidDni("40.123.456")).toBe(false);
  });
});
