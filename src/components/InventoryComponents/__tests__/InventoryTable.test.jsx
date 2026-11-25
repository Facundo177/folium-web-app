import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InventoryTable from "../InventoryTable";
import { ITEM_STATUS } from "../../../api/constants";
import { itemService } from "../../../api/services/itemService";

vi.mock("../../../api/services/itemService", () => ({
  itemService: {
    patch: vi.fn(),
    markReviewed: vi.fn(),
    remove: vi.fn(),
  },
}));

const rows = [
  {
    id: 11,
    bookId: 1,
    code: "INV-011",
    title: "Ficciones",
    author: "Jorge Luis Borges",
    status: ITEM_STATUS.DAMAGED,
    statusLabel: "Dañado",
    location: "Estante B2",
    isbn: "9789500400001",
    genres: ["Cuentos"],
    cover: null,
  },
  {
    id: 12,
    bookId: 1,
    code: "INV-012",
    title: "Ficciones",
    author: "Jorge Luis Borges",
    status: ITEM_STATUS.AVAILABLE,
    statusLabel: "Disponible",
    location: "Estante B2",
    isbn: "9789500400001",
    genres: ["Cuentos"],
    cover: null,
  },
];

describe("InventoryTable (B5 - Habilitar tras revisión)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra 'Habilitar tras revisión' solo para ítems DAMAGED/LOST y llama a itemService.markReviewed", async () => {
    itemService.markReviewed.mockResolvedValue({
      data: { id: 11, status: ITEM_STATUS.AVAILABLE },
    });
    const onRefetch = vi.fn().mockResolvedValue();

    render(<InventoryTable rows={rows} books={[]} onRefetch={onRefetch} />);

    const reviewButtons = screen.getAllByRole("button", {
      name: "Habilitar ejemplar INV-011 tras revisión",
    });
    expect(reviewButtons).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Habilitar ejemplar INV-012 tras revisión" })
    ).not.toBeInTheDocument();

    fireEvent.click(reviewButtons[0]);

    const confirmButtons = await screen.findAllByRole("button", {
      name: "Habilitar tras revisión",
    });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(itemService.markReviewed).toHaveBeenCalledWith(11);
      expect(onRefetch).toHaveBeenCalledTimes(1);
    });
  });

  it("deshabilita la transición directa a Disponible dentro de ItemEditModal para ítems DAMAGED", () => {
    render(<InventoryTable rows={rows} books={[{ id: 1, title: "Ficciones" }]} />);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Editar ejemplar INV-011" })[0]
    );

    const availableOption = screen.getByRole("option", {
      name: /Disponible \(requiere revisión\)/i,
    });
    expect(availableOption).toBeDisabled();
    expect(
      screen.getAllByRole("button", { name: "Habilitar tras revisión" }).length
    ).toBeGreaterThanOrEqual(1);
  });
});
