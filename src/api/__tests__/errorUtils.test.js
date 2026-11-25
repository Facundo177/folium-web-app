import { describe, it, expect } from "vitest";
import {
  translateErrorMessage,
  formatApiError,
  formatFieldErrors,
} from "../errorUtils";

describe("errorUtils", () => {
  it("traduce mensajes conocidos de SimpleJWT y DRF al español", () => {
    expect(
      translateErrorMessage("No active account found with the given credentials")
    ).toBe("No se encontró una cuenta activa con esas credenciales.");

    expect(translateErrorMessage("This field may not be blank.")).toBe(
      "Este campo es obligatorio."
    );

    expect(
      translateErrorMessage("Ensure this field has at least 8 characters.")
    ).toBe("Debe tener al menos 8 caracteres.");
  });

  it("formatea payloads de campos DRF con etiquetas en español", () => {
    const error = {
      response: {
        data: {
          email: ["Enter a valid email address."],
          dni: ["This field may not be blank."],
        },
      },
    };

    const msg = formatApiError(error, "Fallback", { separator: "\n" });
    expect(msg).toContain("Correo electrónico: Ingresá un correo electrónico válido.");
    expect(msg).toContain("DNI: Este campo es obligatorio.");
  });

  it("ignora HTML crudo de errores 500 y devuelve el fallback", () => {
    const error = {
      response: { data: "<!DOCTYPE html><html><body>500</body></html>" },
    };
    expect(formatApiError(error, "Error del servidor.")).toBe("Error del servidor.");
  });

  it("separa errores por campo y errores generales en formatFieldErrors", () => {
    const error = {
      response: {
        data: {
          email: ["Enter a valid email address."],
          detail: "You do not have permission to perform this action.",
        },
      },
    };

    const { fieldErrors, generalError } = formatFieldErrors(error, ["email", "dni"]);
    expect(fieldErrors.email).toEqual(["Ingresá un correo electrónico válido."]);
    expect(fieldErrors.dni).toBeUndefined();
    expect(generalError).toBe("No tenés permisos para realizar esta acción.");
  });
});
