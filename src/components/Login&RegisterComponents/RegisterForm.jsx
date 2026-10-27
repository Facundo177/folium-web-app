import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordEye from "../BasicUIComponents/PasswordEye";
import FeedbackModal from "../BasicUIComponents/FeedbackModal";
import { UserPlus } from "lucide-react";
import { userService } from "../../api/services/userService";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones de frontend
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden. Por favor, verifícalas.");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setIsLoading(true);

    const payload = {
      first_name: formData.nombre,
      last_name: formData.apellido,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      dni: formData.dni,
    };

    try {
      await userService.register(payload);
      setSuccessModalOpen(true);
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat().join("\n");
        setError(errorMessages);
      } else {
        setError("Ocurrió un error inesperado al intentar registrarte.");
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    navigate("/login", {
      state: { message: "¡Cuenta creada exitosamente! Ya podés iniciar sesión con tus credenciales." },
    });
  };

  return (
    <div className="w-full max-w-[450px] flex flex-col items-center animate-fade-in">
      {/* Toggle Iniciar sesión / Crear cuenta */}
      <div className="w-full bg-surface-variant rounded-lg p-1 flex mb-10 shadow-inner">
        <Link
          to="/login"
          className="flex-1 text-on-surface-variant text-body-md font-medium py-2 rounded hover:text-on-surface transition-colors text-center"
        >
          Iniciar sesión
        </Link>
        <button
          type="button"
          className="flex-1 bg-surface-container-lowest text-primary text-body-md font-bold py-2 rounded shadow-sm border border-outline-variant/30 transition-colors"
        >
          Crear cuenta
        </button>
      </div>

      {/* Textos de Bienvenida */}
      <div className="w-full mb-8">
        <h2 className="text-headline-md font-serif text-on-surface mb-2">
          Únete al Archivo
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Completa tus datos para crear tu credencial de Lector.
        </p>
      </div>

      {/* Formulario de Registro */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="reg-nombre" className="text-label-caps text-on-surface font-bold">
              NOMBRE
            </label>
            <input
              id="reg-nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Gabriel"
              required
              autoComplete="given-name"
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="reg-apellido" className="text-label-caps text-on-surface font-bold">
              APELLIDO
            </label>
            <input
              id="reg-apellido"
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Ej. García"
              required
              autoComplete="family-name"
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="reg-dni" className="text-label-caps text-on-surface font-bold">
              DNI
            </label>
            <input
              id="reg-dni"
              type="text"
              name="dni"
              inputMode="numeric"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Sin puntos ni espacios"
              required
              autoComplete="off"
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="reg-username" className="text-label-caps text-on-surface font-bold">
              NOMBRE DE USUARIO
            </label>
            <input
              id="reg-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ej. ggarcia"
              required
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="reg-email" className="text-label-caps text-on-surface font-bold">
            CORREO ELECTRÓNICO
          </label>
          <input
            id="reg-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@correo.com"
            required
            autoComplete="email"
            className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="reg-password" className="text-label-caps text-on-surface font-bold">
              CONTRASEÑA
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                aria-describedby="reg-password-constraints"
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-1"
              >
                <PasswordEye open={showPassword} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reg-confirm-password" className="text-label-caps text-on-surface font-bold">
              REPETIR CONTRASEÑA
            </label>
            <div className="relative">
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                aria-describedby="reg-password-constraints"
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Ver confirmación de contraseña"}
                aria-pressed={showConfirmPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-1"
              >
                <PasswordEye open={showConfirmPassword} />
              </button>
            </div>
          </div>
        </div>
        <span id="reg-password-constraints" className="text-[11px] text-on-surface-variant mt-[-10px]">
          Debe contener al menos 8 caracteres.
        </span>

        {/* Mensaje de error dinámico anunciado para tecnologías asistivas */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="text-body-sm text-on-error bg-error px-3 py-2 rounded-lg font-medium shadow-sm animate-fade-in mt-2 whitespace-pre-wrap"
          >
            {error}
          </div>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-on-primary text-body-lg font-bold tracking-widest uppercase py-3 rounded-lg mt-2 hover:opacity-90 shadow-md transition-all disabled:opacity-60 flex justify-center items-center gap-2 cursor-pointer"
        >
          {isLoading ? "Registrando..." : "Registrarse"}
          {!isLoading && <UserPlus className="w-5 h-5" />}
        </button>
      </form>

      <p className="text-body-md text-on-surface-variant mt-8">
        ¿Ya tienes una cuenta?{" "}
        <Link
          to="/login"
          className="text-primary font-bold hover:underline underline-offset-4 transition-colors"
        >
          Inicia sesión
        </Link>
      </p>

      {/* Modal de Confirmación Accesible */}
      <FeedbackModal
        isOpen={successModalOpen}
        type="success"
        title="¡Cuenta Creada Exitosamente!"
        message="Tu credencial de lector ha sido registrada en el Archivo de Folium. Ahora puedes iniciar sesión con tu usuario y contraseña."
        confirmText="Ir a Iniciar Sesión"
        onClose={handleSuccessClose}
        onConfirm={handleSuccessClose}
      />
    </div>
  );
}
