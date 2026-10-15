import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import PasswordEye from "../BasicUIComponents/PasswordEye";
import { useAuth } from "../../auth/AuthProvider";
import { LogIn } from "lucide-react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { username, password, setUsername, setPassword } = useOutletContext();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const loggedUser = await login(username, password);

      // Redirección condicional según rol:
      if (loggedUser?.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (loggedUser?.role === "LIBRARIAN") {
        navigate("/librarian/inventory", { replace: true });
      } else {
        // Lector (USER) o por defecto
        navigate("/user/catalog", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Credenciales incorrectas. Verificá tu usuario y contraseña.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] flex flex-col items-center animate-fade-in">
      {/* Toggle Iniciar sesión / Crear cuenta */}
      <div className="w-full bg-surface-variant rounded-lg p-1 flex mb-12 shadow-inner">
        <button className="flex-1 bg-surface-container-lowest text-primary text-body-md font-bold py-2 rounded shadow-sm border border-outline-variant/30 transition-colors">
          Iniciar sesión
        </button>
        <Link
          to="/register"
          className="flex-1 text-on-surface-variant text-body-md font-medium py-2 rounded hover:text-on-surface transition-colors text-center"
        >
          Crear cuenta
        </Link>
      </div>

      {/* Textos de Bienvenida */}
      <div className="w-full mb-8">
        <h2 className="text-headline-md font-serif text-on-surface mb-2">
          Bienvenido de nuevo
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Ingresa tus datos para acceder al archivo.
        </p>
      </div>

      {/* Formulario */}
      <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* Campo Usuario */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">
            USUARIO
          </label>
          <input
            required
            type="text"
            placeholder="Ej: lrodriguez"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
          />
        </div>

        {/* Campo Contraseña */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">
            CONTRASEÑA
          </label>
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <PasswordEye open={showPassword} />
            </button>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <p className="text-body-sm text-on-error bg-error px-3 py-2 rounded-lg font-medium shadow-sm animate-fade-in">
            {error}
          </p>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-on-primary text-body-lg font-bold tracking-widest uppercase py-3 rounded-lg mt-4 hover:opacity-90 shadow-md transition-all disabled:opacity-60 flex justify-center items-center gap-2"
        >
          {isLoading ? "Ingresando..." : "Entrar"}
          {!isLoading && <LogIn className="w-5 h-5" />}
        </button>
      </form>

      {/* Recuperar Contraseña */}
      <p className="text-body-md text-on-surface-variant mt-8">
        ¿Olvidaste tu contraseña?{" "}
        <a
          href="#"
          className="text-primary font-bold hover:underline underline-offset-4 transition-colors"
        >
          Recuperar acceso
        </a>
      </p>
    </div>
  );
}
