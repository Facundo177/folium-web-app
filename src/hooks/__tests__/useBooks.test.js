import { describe, it, expect } from "vitest";
import { MIN_PUBLICATION_YEAR, sanitizeYearParam } from "../useBooks";

describe("sanitizeYearParam", () => {
  it("acepta años de 4 dígitos dentro del rango histórico válido", () => {
    expect(sanitizeYearParam("0868")).toBe(String(MIN_PUBLICATION_YEAR));
    expect(sanitizeYearParam("1455")).toBe("1455");
    expect(sanitizeYearParam("2024")).toBe("2024");
    expect(sanitizeYearParam(" 1984 ")).toBe("1984");
  });

  it("descarta años parciales o fuera de rango para evitar 400 en el backend", () => {
    expect(sanitizeYearParam("")).toBe("");
    expect(sanitizeYearParam("20")).toBe("");
    expect(sanitizeYearParam("202")).toBe("");
    expect(sanitizeYearParam("12345")).toBe("");
    expect(sanitizeYearParam("867")).toBe("");
    expect(sanitizeYearParam("2099")).toBe("");
    expect(sanitizeYearParam("abcd")).toBe("");
  });
});
