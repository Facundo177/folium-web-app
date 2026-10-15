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

  // NUEVO: Cargamos los datos al estado de edición SOLO cuando se hace clic en "Editar"
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
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-sans font-bold tracking-widest uppercase text-xs">
          Cargando datos...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center animate-fade-in">
        <p className="text-on-error bg-error px-6 py-3 rounded-lg font-bold font-sans shadow-md">
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
        <div className="col-span-1 bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-8 flex flex-col items-center text-center shadow-md h-fit">
          <div className="w-28 h-28 bg-primary text-on-primary rounded-full flex items-center justify-center text-display-lg-mobile font-serif mb-6 shadow-lg border-4 border-surface-container-lowest outline outline-1 outline-outline-variant/30">
            {profile.first_name
              ? profile.first_name[0].toUpperCase()
              : profile.username[0].toUpperCase()}
          </div>

          <h2 className="text-title-lg text-on-surface font-bold mb-1">
            {profile.first_name} {profile.last_name}
          </h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            @{profile.username}
          </p>

          <span className="bg-tertiary/20 text-on-tertiary border border-tertiary/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-8">
            <ShieldCheck className="w-4 h-4" />
            {getRoleLabel(profile.rol)}
          </span>

        </div>

        {/* PANEL DERECHO: Detalles y Edición */}
        <div className="col-span-1 md:col-span-2 bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-8 shadow-md flex flex-col">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3 mb-8">
            <h3 className="text-label-caps text-on-surface font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              INFORMACIÓN PERSONAL
            </h3>

            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-tertiary transition-colors"
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
                <p className="text-body-lg text-on-surface font-medium">
                  {profile.username}
                </p>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Correo Electrónico
                </p>
                <p className="text-body-lg text-on-surface font-medium">
                  {profile.email}
                </p>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarDays className="w-3 h-3" /> Miembro desde
                </p>
                <p className="text-body-lg text-on-surface font-medium">
                  {formatDate(profile.date_joined)}
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSave}
              className="flex flex-col gap-5 animate-fade-in"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    Usuario
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {editError && (
                <p className="text-body-sm text-on-error bg-error px-3 py-2 rounded-lg font-medium shadow-sm whitespace-pre-wrap">
                  {editError}
                </p>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex-1 flex justify-center items-center gap-2 bg-surface-variant text-on-surface hover:bg-outline-variant py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex justify-center items-center gap-2 bg-primary text-on-primary hover:opacity-90 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />{" "}
                  {isSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
