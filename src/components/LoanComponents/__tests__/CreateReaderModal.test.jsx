import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateReaderModal from "../CreateReaderModal";
import { userService } from "../../../api/services/userService";

vi.mock("../../../api/services/userService", () => ({
  userService: {
    createReader: vi.fn(),
  },
}));

describe("CreateReaderModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra mensajes FieldError con aria-invalid y aria-describedby al fallar validación", () => {
    const { container } = render(
      <CreateReaderModal isOpen={true} onClose={vi.fn()} onReaderCreated={vi.fn()} />
    );

    const form = container.querySelector("form");
    fireEvent.submit(form);

    const dniInput = screen.getByLabelText(/DNI \/ Documento/i);
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);

    expect(dniInput).toHaveAttribute("aria-invalid", "true");
    expect(dniInput).toHaveAttribute("aria-describedby", "reader-dni-error");
    expect(document.getElementById("reader-dni-error")).toHaveTextContent(
      "El DNI debe ser un número entero positivo."
    );

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", "reader-email-error");
    expect(document.getElementById("reader-email-error")).toHaveTextContent(
      "El correo electrónico es obligatorio."
    );
    expect(userService.createReader).not.toHaveBeenCalled();
  });

  it("traduce errores de campo DRF devueltos por el servidor", async () => {
    userService.createReader.mockRejectedValue({
      response: {
        data: {
          email: ["Enter a valid email address."],
        },
      },
    });

    const { container } = render(
      <CreateReaderModal isOpen={true} initialDni="40123456" onClose={vi.fn()} />
    );

    fireEvent.change(document.getElementById("reader-firstname-input"), {
      target: { value: "Ana" },
    });
    fireEvent.change(document.getElementById("reader-lastname-input"), {
      target: { value: "Pérez" },
    });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: "ana@ejemplo.com" },
    });

    fireEvent.submit(container.querySelector("form"));

    expect(
      await screen.findByText("Ingresá un correo electrónico válido.")
    ).toBeInTheDocument();
  });
});
