import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "../LoginForm";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();
let mockContext = {
  username: "",
  password: "",
  setUsername: vi.fn(),
  setPassword: vi.fn(),
};

vi.mock("../../../auth/AuthProvider", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useOutletContext: () => mockContext,
  };
});

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      username: "",
      password: "",
      setUsername: vi.fn(),
      setPassword: vi.fn(),
    };
  });

  it("valida campos vacíos programáticamente sin llamar a login", async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText("Ingresá tu usuario y contraseña para continuar.")
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("redirige a ADMIN hacia /librarian/inventory tras iniciar sesión", async () => {
    mockContext.username = "admin";
    mockContext.password = "secret123";
    mockLogin.mockResolvedValue({ role: "ADMIN" });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/librarian/inventory", {
        replace: true,
      });
    });
  });

  it("redirige a USER hacia /catalog tras iniciar sesión", async () => {
    mockContext.username = "lector";
    mockContext.password = "secret123";
    mockLogin.mockResolvedValue({ role: "USER" });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/catalog", { replace: true });
    });
  });

  it("traduce errores de SimpleJWT al español", async () => {
    mockContext.username = "baduser";
    mockContext.password = "badpass";
    mockLogin.mockRejectedValue({
      response: {
        data: { detail: "No active account found with the given credentials" },
      },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText(
        "No se encontró una cuenta activa con esas credenciales."
      )
    ).toBeInTheDocument();
  });
});
