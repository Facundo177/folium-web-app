import { useState } from "react";
import { useUserProfile } from "../../hooks/useUserProfile";
import { userService } from "../../api/services/userService";
import GoBackButton from "../BasicUIComponents/GoBackButton";
import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  Edit2,
  Save,
  X,
} from "lucide-react";

export default function UserProfile() {
  const { profile, setProfile, isLoading, error } = useUserProfile();

  // Estados para la edición
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [formData, setFormData] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha desconocida";
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleLabel = (role) => {
    const roles = {
      USER: "Lector",
      LIBRARIAN: "Bibliotecario",
      ADMIN: "Administrador",
    };
    return roles[role] || role;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    setFormData({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      username: profile.username || "",
      email: profile.email || "",
    });
    setEditError("");
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError("");

    try {
      const { data } = await userService.updateProfile(formData);
      setProfile(data);
      setIsEditing(false);
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data)
          .flat()
          .join("\n");
        setEditError(errorMessages);
      } else {
        setEditError("Ocurrió un error inesperado al actualizar el perfil.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 animate-fade-in font-sans">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-bold tracking-widest uppercase text-xs">
          Cargando datos...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center animate-fade-in font-sans">
        <p className="text-on-error bg-error px-6 py-3 rounded-md font-bold shadow-md">
          {error || "No se pudo localizar el perfil."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-10 font-sans animate-fade-in pb-16">
      <div className="mb-6">
        <GoBackButton />
      </div>

      <div className="mb-8">
        <h1 className="text-headline-md font-serif text-on-surface mb-2">
          Mi Credencial
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Consulta y actualiza tu información dentro del archivo de Folium.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* PANEL IZQUIERDO: Tarjeta de Identidad */}
        <div className="col-span-1 bg-surface-container-lowest border border-outline-variant/50 rounded-md p-8 flex flex-col items-center text-center shadow-xs h-fit">
          <div className="w-28 h-28 bg-primary text-on-primary rounded-full flex items-center justify-center text-3xl font-serif mb-6 shadow-md border-4 border-surface-container-lowest outline outline-1 outline-outline-variant/30">
            {profile.first_name
              ? profile.first_name[0].toUpperCase()
              : profile.username[0].toUpperCase()}
          </div>

          <h2 className="text-title-lg text-on-surface font-bold mb-1">
            {profile.first_name} {profile.last_name}
          </h2>
          <p className="text-body-md text-on-surface-variant mb-6 font-mono text-xs">
            @{profile.username}
          </p>

          <span className="bg-primary/10 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4" />
            {getRoleLabel(profile.rol)}
          </span>
        </div>

        {/* PANEL DERECHO: Detalles y Edición */}
        <div className="col-span-1 md:col-span-2 bg-surface-container-lowest border border-outline-variant/50 rounded-md p-8 shadow-xs flex flex-col">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3 mb-8">
            <h3 className="text-label-caps text-on-surface font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              INFORMACIÓN PERSONAL
            </h3>

            {!isEditing && (
              <button
                type="button"
                onClick={handleEditClick}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Editar
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                  Nombre y Apellido
                </p>
                <p className="text-body-lg text-on-surface font-medium">
                  {profile.first_name} {profile.last_name}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                  Nombre de Usuario
                </p>
                <p className="text-body-lg text-on-surface font-medium font-mono text-sm">
                  {profile.username}
                </p>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-primary" /> Correo Electrónico
                </p>
                <p className="text-body-lg text-on-surface font-medium">
                  {profile.email}
                </p>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarDays className="w-3 h-3 text-primary" /> Miembro desde
                </p>
                <p className="text-body-lg text-on-surface font-medium">
                  {formatDate(profile.date_joined)}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="profile-first-name" className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    Nombre *
                  </label>
                  <input
                    id="profile-first-name"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-sm text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="profile-last-name" className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    Apellido *
                  </label>
                  <input
                    id="profile-last-name"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-sm text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="profile-username" className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    Usuario *
                  </label>
                  <input
                    id="profile-username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-sm text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="profile-email" className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    Correo Electrónico *
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-sm text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {editError && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="text-body-sm text-on-error bg-error px-3 py-2 rounded-sm font-medium shadow-xs whitespace-pre-wrap"
                >
                  {editError}
                </p>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex-1 flex justify-center items-center gap-2 bg-surface-variant text-on-surface hover:bg-outline-variant py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex justify-center items-center gap-2 bg-primary text-on-primary hover:opacity-90 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />{" "}
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
