import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordEye from "../BasicUIComponents/PasswordEye";
import { UserPlus } from "lucide-react";
import { userService } from "../../api/services/userService";

export default function RegisterForm() {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    // Mapeamos los datos para que coincidan con el UserSerializer de Django
    const payload = {
      first_name: formData.nombre,
      last_name: formData.apellido,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      // dni: formData.dni // Descomentar si a futuro agregas el campo 'dni' en el backend
    };

    try {
      await userService.register(payload);
      alert("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
      navigate("/login"); // Redirigir al login tras el éxito
    } catch (err) {
      // Capturamos los errores de validación de Django (ej: "Ese username ya existe")
      if (err.response && err.response.data) {
        // Aplanamos el objeto de errores de DRF para mostrar el mensaje
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
        <button className="flex-1 bg-surface-container-lowest text-primary text-body-md font-bold py-2 rounded shadow-sm border border-outline-variant/30 transition-colors">
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
            <label className="text-label-caps text-on-surface font-bold">NOMBRE</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Gabriel"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">APELLIDO</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Ej. García"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">DNI</label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Sin puntos ni espacios"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">NOMBRE DE USUARIO</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ej. ggarcia"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">CORREO ELECTRÓNICO</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@correo.com"
            required
            className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">CONTRASEÑA</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <PasswordEye open={showPassword}/>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">REPETIR CONTRASEÑA</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <PasswordEye open={showConfirmPassword}/>
              </button>
            </div>
          </div>
        </div>
        <span className="text-[11px] text-on-surface-variant mt-[-10px]">
          Debe contener al menos 8 caracteres.
        </span>

        {/* Mensaje de error dinámico */}
        {error && (
          <p className="text-body-sm text-on-error bg-error px-3 py-2 rounded-lg font-medium shadow-sm animate-fade-in mt-2 whitespace-pre-wrap">
            {error}
          </p>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-on-primary text-body-lg font-bold tracking-widest uppercase py-3 rounded-lg mt-2 hover:opacity-90 shadow-md transition-all disabled:opacity-60 flex justify-center items-center gap-2"
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
    </div>
  );
}