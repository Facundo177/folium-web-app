import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CatalogBookCard from "../CatalogBookCard";
import { reservationService } from "../../../api/services/reservationService";

vi.mock("../../../auth/AuthProvider", () => ({
  useAuth: () => ({ user: { id: 10, role: "USER" } }),
}));

vi.mock("../../../api/services/reservationService", () => ({
  reservationService: {
    create: vi.fn(),
    cancel: vi.fn(),
  },
}));

vi.mock("../../../api/services/favoriteService", () => ({
  favoriteService: {
    create: vi.fn(),
    remove: vi.fn(),
  },
}));

const sampleBook = {
  id: 7,
  title: "Rayuela",
  author: "Julio Cortázar",
  editorial: "Sudamericana",
  year: 1963,
  category: "Novela",
  availableItems: 2,
  totalItems: 3,
};

describe("CatalogBookCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usa reservationService.cancel() con el id real al confirmar cancelación", async () => {
    reservationService.cancel.mockResolvedValue({ data: { status: "CANCELLED" } });
    const onCancelSuccess = vi.fn();

    render(
      <MemoryRouter>
        <CatalogBookCard
          book={sampleBook}
          isReservedByUser={true}
          reservationId={42}
          onCancelSuccess={onCancelSuccess}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar reserva" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, cancelar" }));

    await waitFor(() => {
      expect(reservationService.cancel).toHaveBeenCalledWith(42);
      expect(onCancelSuccess).toHaveBeenCalledWith(7);
    });
  });

  it("bloquea la cancelación si reservationId es booleano en lugar de ID", async () => {
    const onCancelError = vi.fn();

    render(
      <MemoryRouter>
        <CatalogBookCard
          book={sampleBook}
          isReservedByUser={true}
          reservationId={true}
          onCancelError={onCancelError}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar reserva" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, cancelar" }));

    await waitFor(() => {
      expect(reservationService.cancel).not.toHaveBeenCalled();
      expect(onCancelError).toHaveBeenCalledWith(
        expect.stringContaining("No se encontró el identificador de la reserva")
      );
    });
  });
});
