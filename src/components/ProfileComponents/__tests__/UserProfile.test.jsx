import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserProfile from "../UserProfile";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { userService } from "../../../api/services/userService";

vi.mock("../../../hooks/useUserProfile", () => ({
  useUserProfile: vi.fn(),
}));

vi.mock("../../../api/services/userService", () => ({
  userService: {
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));

const baseProfile = {
  id: 1,
  first_name: "Sofía",
  last_name: "Linares",
  username: "slinares",
  email: "sofia@folium.org",
  dni: 38123456,
  rol: "USER",
  date_joined: "2025-01-10T00:00:00Z",
};

describe("UserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra botón Reintentar cuando falla la carga del perfil", () => {
    const refetch = vi.fn();
    useUserProfile.mockReturnValue({
      profile: null,
      setProfile: vi.fn(),
      isLoading: false,
      error: "Error al cargar los datos del perfil.",
      refetch,
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("valida correo y confirmación de contraseña programáticamente antes de llamar a la API", () => {
    useUserProfile.mockReturnValue({
      profile: baseProfile,
      setProfile: vi.fn(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Editar/i }));
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: "correo-invalido" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Guardar Cambios/i }));

    expect(
      screen.getByText("Ingresá un correo electrónico con formato válido.")
    ).toBeInTheDocument();
    expect(userService.updateProfile).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
    fireEvent.click(screen.getByRole("button", { name: /Cambiar contraseña/i }));
    fireEvent.change(screen.getByLabelText("Contraseña actual"), {
      target: { value: "actual123" },
    });
    fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
      target: { value: "nueva1234" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), {
      target: { value: "otra1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Actualizar contraseña/i }));

    expect(
      screen.getByText("La nueva contraseña y su confirmación no coinciden.")
    ).toBeInTheDocument();
    expect(userService.changePassword).not.toHaveBeenCalled();
  });
});
