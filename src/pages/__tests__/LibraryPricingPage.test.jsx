import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LibraryPricingPage from "../LibraryPricingPage";
import { billingService } from "../../api/services/billingService";

vi.mock("../../api/services/billingService", () => ({
  billingService: {
    getPlans: vi.fn(),
    verifyPaymentStatus: vi.fn(),
    createCheckout: vi.fn(),
  },
}));

vi.mock("../../auth/AuthProvider", () => ({
  useAuth: () => ({ user: null }),
}));

describe("LibraryPricingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra error explícito y botón Reintentar si getPlans falla (sin fallback ficticio)", async () => {
    billingService.getPlans
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        plans: [
          {
            code: "BASIC",
            name: "Plan Base",
            tagline: "Inicial",
            monthly_price: 0,
            annual_total_price: 0,
            annual_monthly_equivalent: 0,
            features: ["Catálogo"],
          },
        ],
      });

    render(
      <MemoryRouter initialEntries={["/pricing"]}>
        <LibraryPricingPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/No pudimos cargar los planes desde el servidor/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    expect(await screen.findByText("Plan Base")).toBeInTheDocument();
    expect(billingService.getPlans).toHaveBeenCalledTimes(2);
  });

  it("no muestra suscripción activada si verifyPaymentStatus devuelve verified=false aunque la URL diga approved", async () => {
    billingService.getPlans.mockResolvedValue({ plans: [] });
    billingService.verifyPaymentStatus.mockResolvedValue({
      verified: false,
      status: "pending",
    });

    render(
      <MemoryRouter initialEntries={["/pricing?status=approved&payment_id=999"]}>
        <LibraryPricingPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Pago en proceso de acreditación")
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Suscripción institucional activada/i)
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(billingService.verifyPaymentStatus).toHaveBeenCalledWith({
        payment_id: "999",
        external_reference: null,
        payment_status: "approved",
      });
    });
  });
});
