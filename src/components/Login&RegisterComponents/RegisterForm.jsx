import { useState } from "react";
import { Link } from "react-router-dom";
import PasswordEye from "../BasicUIComponents/PasswordEye";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    fechaNacimiento: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos al backend (ej. Spring Boot)
    console.log("Datos de registro:", formData);
  };

  return (
    <div className="w-full max-w-[450px] flex flex-col items-center">
      {/* Toggle Iniciar sesión / Crear cuenta */}
      <div className="w-full bg-surface-container rounded-lg p-1 flex mb-10">
        <Link
          to="/login"
          className="flex-1 text-on-surface-variant text-body-md font-medium py-2 rounded hover:text-on-surface transition-colors text-center"
        >
          Iniciar sesión
        </Link>
        <button className="flex-1 bg-surface-container-lowest text-on-surface text-body-md font-medium py-2 rounded shadow-sm">
          Crear cuenta
        </button>
      </div>

      {/* Textos de Bienvenida */}
      <div className="w-full mb-8">
        <h2 className="text-headline-md font-serif text-on-surface mb-2">
          Únete a Folium
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Completa tus datos para crear tu credencial de Lector.
        </p>
      </div>

      {/* Formulario de Registro */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        {/* Fila 1: Nombre y Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              NOMBRE
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Gabriel"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-outline-variant"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              APELLIDO
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Ej. García"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-outline-variant"
            />
          </div>
        </div>

        {/* Fila 2: DNI y Fecha de Nacimiento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              DNI
            </label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Sin puntos ni espacios"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-outline-variant"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              FECHA DE NACIMIENTO
            </label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors text-on-surface-variant"
            />
          </div>
        </div>

        {/* Campo Correo */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">
            CORREO ELECTRÓNICO
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@correo.com"
            required
            className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-outline-variant"
          />
        </div>

        {/* Campo Contraseña */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">
            CONTRASEÑA
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-outline-variant"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors"
            >
              <PasswordEye open={showPassword}/>
            </button>
          </div>
          <span className="text-[11px] text-on-surface-variant mt-1">
            Debe contener al menos 8 caracteres.
          </span>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          className="w-full bg-on-tertiary-fixed-variant text-on-tertiary text-body-lg font-medium py-3 rounded-lg mt-4 hover:opacity-90 transition-opacity"
        >
          Registrarse
        </button>
      </form>

      {/* Enlace de regreso al login */}
      <p className="text-body-md text-on-surface-variant mt-8">
        ¿Ya tienes una cuenta?{" "}
        <Link
          to="/login"
          className="text-on-tertiary-fixed-variant underline underline-offset-4 hover:text-on-tertiary-container transition-colors"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}


