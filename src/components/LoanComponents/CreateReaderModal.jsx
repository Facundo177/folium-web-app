import { useState, useEffect, useRef } from "react";
import { userService } from "../../api/services/userService";
import { X, UserPlus, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import FieldError from "../BasicUIComponents/FieldError";

export default function CreateReaderModal({
  isOpen,
  initialDni = "",
  onClose,
  onReaderCreated,
}) {
  const [formData, setFormData] = useState({
    dni: "",
    first_name: "",
    last_name: "",
    email: "",
    username: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef(null);

  // Al abrir, inicializar con el DNI buscado
  useEffect(() => {
    if (isOpen) {
      setFormData({
        dni: initialDni ? String(initialDni).trim() : "",
        first_name: "",
        last_name: "",
        email: "",
        username: "",
      });
      setFieldErrors({});
      setGeneralError("");
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialDni]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Sugerencia automática de nombre de usuario si no lo editó manualmente
      if (name === "first_name" || name === "dni") {
        const cleanName = (name === "first_name" ? value : prev.first_name)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        const cleanDni = (name === "dni" ? value : prev.dni).trim();
        if (cleanName && cleanDni && (!prev.username || prev.username.startsWith("lector_") || prev.username.includes("_"))) {
          updated.username = `${cleanName}_${cleanDni}`;
        }
      }
      return updated;
    });

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) setGeneralError("");
  };

  const validate = () => {
    const errors = {};
    const dniNum = Number(formData.dni);
    if (!formData.dni || isNaN(dniNum) || dniNum <= 0) {
      errors.dni = "El DNI debe ser un número entero positivo.";
    }

    if (!formData.first_name.trim()) {
      errors.first_name = "El nombre es obligatorio.";
    }

    if (!formData.last_name.trim()) {
      errors.last_name = "El apellido es obligatorio.";
    }

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Ingrese un correo electrónico con formato válido.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError("");

    const payload = {
      dni: Number(formData.dni),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim().toLowerCase(),
      rol: "USER",
    };

    if (formData.username.trim()) {
      payload.username = formData.username.trim().toLowerCase();
    }

    try {
      const response = await userService.createReader(payload);
      const newReader = response.data;
      if (onReaderCreated) {
        onReaderCreated(newReader);
      }
      onClose();
    } catch (err) {
      console.error("Error al registrar lector:", err);
      const errorData = err.response?.data;
      if (errorData && typeof errorData === "object") {
        const errors = {};
        let unhandledMsg = "";

        Object.entries(errorData).forEach(([key, val]) => {
          const message = Array.isArray(val) ? val.join(" ") : String(val);
          if (["dni", "first_name", "last_name", "email", "username"].includes(key)) {
            errors[key] = message;
          } else {
            unhandledMsg += `${key}: ${message} `;
          }
        });

        setFieldErrors(errors);
        if (unhandledMsg || Object.keys(errors).length === 0) {
          setGeneralError(unhandledMsg || "Ocurrió un error al registrar el lector en el servidor.");
        }
      } else {
        setGeneralError("No se pudo conectar con el servidor para registrar al lector.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-reader-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="create-reader-modal-title"
                className="text-lg font-serif font-bold text-on-surface leading-tight"
              >
                Alta Rápida de Lector
              </h2>
              <p className="text-xs text-on-surface-variant">
                Registra al usuario en el sistema para asignarle el préstamo físico.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-variant transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Formulario */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {generalError && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg flex items-start gap-2 text-error text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* DNI */}
          <div>
            <label
              htmlFor="reader-dni-input"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1"
            >
              DNI / Documento <span className="text-error">*</span>
            </label>
            <input
              id="reader-dni-input"
              ref={firstInputRef}
              type="number"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Ej: 42123456"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-mono"
              required
            />
            {fieldErrors.dni && <FieldError error={fieldErrors.dni} />}
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="reader-firstname-input"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1"
              >
                Nombre <span className="text-error">*</span>
              </label>
              <input
                id="reader-firstname-input"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ej: María"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
              {fieldErrors.first_name && <FieldError error={fieldErrors.first_name} />}
            </div>

            <div>
              <label
                htmlFor="reader-lastname-input"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1"
              >
                Apellido <span className="text-error">*</span>
              </label>
              <input
                id="reader-lastname-input"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Ej: Gonzalez"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
              {fieldErrors.last_name && <FieldError error={fieldErrors.last_name} />}
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label
              htmlFor="reader-email-input"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1"
            >
              Correo Electrónico <span className="text-error">*</span>
            </label>
            <input
              id="reader-email-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
            {fieldErrors.email && <FieldError error={fieldErrors.email} />}
          </div>

          {/* Nombre de Usuario (Opcional con auto-generación) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="reader-username-input"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface"
              >
                Nombre de Usuario
              </label>
              <span className="text-[11px] text-on-surface-variant/70 italic">
                Opcional (se genera automáticamente)
              </span>
            </div>
            <input
              id="reader-username-input"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="lector_42123456"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-mono text-xs"
            />
            {fieldErrors.username && <FieldError error={fieldErrors.username} />}
          </div>

          {/* Footer de Acciones */}
          <div className="mt-2 pt-4 border-t border-outline-variant/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-create-reader"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Crear y Asignar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
