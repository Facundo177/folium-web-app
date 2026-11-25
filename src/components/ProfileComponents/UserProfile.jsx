import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useUserProfile } from "../../hooks/useUserProfile";
import { userService } from "../../api/services/userService";
import { formatApiError } from "../../api/errorUtils";
import {
  isNonEmpty,
  hasMinLength,
  isValidEmail,
  isValidDni,
} from "../../utils/validators";
import GoBackButton from "../BasicUIComponents/GoBackButton";
import PasswordEye from "../BasicUIComponents/PasswordEye";
import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  Edit2,
  Save,
  X,
  IdCard,
  KeyRound,
} from "lucide-react";

export default function UserProfile() {
  const { profile, setProfile, isLoading, error, refetch } = useUserProfile();

  // Estados para la edición
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [formData, setFormData] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const passwordDialogRef = useRef(null);

  useEffect(() => {
    const dialog = passwordDialogRef.current;
    if (!dialog) return;

    if (isPasswordModalOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isPasswordModalOpen && dialog.open) {
      dialog.close();
    }
  }, [isPasswordModalOpen]);

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
    const { name, value } = e.target;
    if (editError) setEditError("");
    if (profileSuccess) setProfileSuccess("");
    if (name === "dni") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => {
    setFormData({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      username: profile.username || "",
      email: profile.email || "",
      dni:
        profile.dni !== undefined && profile.dni !== null
          ? String(profile.dni)
          : "",
    });
    setEditError("");
    setProfileSuccess("");
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditError("");
    setProfileSuccess("");

    if (!isNonEmpty(formData.first_name) || !isNonEmpty(formData.last_name)) {
      setEditError("El nombre y el apellido son obligatorios.");
      return;
    }

    if (!hasMinLength(formData.username, 3)) {
      setEditError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }

    if (!isValidDni(formData.dni)) {
      setEditError("Ingresá un DNI válido (entre 6 y 10 dígitos numéricos).");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setEditError("Ingresá un correo electrónico con formato válido.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        dni: parseInt(formData.dni, 10),
      };
      const { data } = await userService.updateProfile(payload);
      setProfile(data);
      setIsEditing(false);
      setProfileSuccess("Tus datos personales se actualizaron correctamente.");
    } catch (err) {
      setEditError(
        formatApiError(
          err,
          "Ocurrió un error inesperado al actualizar el perfil.",
          { separator: "\n" }
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((previous) => ({ ...previous, [name]: value }));
    setPasswordChangeError("");
    setPasswordChangeSuccess("");
  };

  const openPasswordModal = () => {
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    });
    setPasswordChangeError("");
    setPasswordChangeSuccess("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (isChangingPassword) return;

    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    });
    setPasswordChangeError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setIsPasswordModalOpen(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordChangeError("");
    setPasswordChangeSuccess("");

    if (!passwordForm.current_password) {
      setPasswordChangeError("Ingresá tu contraseña actual.");
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordChangeError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setPasswordChangeError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await userService.changePassword(passwordForm);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });
      setPasswordChangeSuccess("Tu contraseña se actualizó correctamente.");
      setIsPasswordModalOpen(false);
    } catch (err) {
      setPasswordChangeError(
        formatApiError(
          err,
          "Ocurrió un error inesperado al actualizar la contraseña.",
          { separator: "\n" }
        )
      );
    } finally {
      setIsChangingPassword(false);
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
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 animate-fade-in font-sans px-4">
        <p role="alert" className="text-on-error bg-error px-6 py-3 rounded-md font-bold shadow-md text-center">
          {error || "No se pudo localizar el perfil."}
        </p>
        <button
          type="button"
          onClick={refetch}
          className="px-5 py-2.5 rounded-sm bg-primary text-on-primary text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-10 font-sans animate-fade-in pb-16">
      <div className="mb-6">
        <GoBackButton />
      </div>

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-headline-md font-serif text-on-surface mb-2">
            Mi Credencial
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Consulta y actualiza tu información dentro del archivo de Folium.
          </p>
        </div>
        {!isEditing && (
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <button
              type="button"
              onClick={openPasswordModal}
              className="flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-on-primary shadow-xs transition-all hover:opacity-90 cursor-pointer"
            >
              <KeyRound className="h-4 w-4" />
              Cambiar contraseña
            </button>
            {passwordChangeSuccess && (
              <p
                role="status"
                className="rounded-sm bg-secondary/10 px-3 py-2 text-body-sm font-medium text-secondary"
              >
                {passwordChangeSuccess}
              </p>
            )}
          </div>
        )}
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
          <p className="text-body-md text-on-surface-variant mb-2 font-sans tabular-nums text-xs">
            @{profile.username}
          </p>

          {profile.dni && (
            <p className="text-xs text-on-surface-variant/90 font-sans tabular-nums mb-5 bg-surface-container px-3 py-1 rounded-full border border-outline-variant/60 inline-flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5 text-primary" />
              <span>DNI {profile.dni}</span>
            </p>
          )}

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

          {!isEditing && profileSuccess && (
            <p
              role="status"
              aria-live="polite"
              className="mb-6 rounded-sm bg-secondary/10 border border-secondary/30 px-3 py-2 text-body-sm font-medium text-secondary"
            >
              {profileSuccess}
            </p>
          )}

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
                <p className="text-body-lg text-on-surface font-medium font-sans tabular-nums text-sm">
                  @{profile.username}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-primary" /> Documento (DNI)
                </p>
                <p className="text-body-lg text-on-surface font-medium font-sans tabular-nums">
                  {profile.dni || "No especificado"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Correo Electrónico
                </p>
                <p className="text-body-lg text-on-surface font-medium break-all">
                  {profile.email}
                </p>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-primary" /> Miembro desde
                </p>
                <p className="text-body-lg text-on-surface font-medium">
                  {formatDate(profile.date_joined)}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} noValidate className="flex flex-col gap-5 animate-fade-in">
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
                    className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-sm text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors font-sans tabular-nums text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="profile-dni" className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    DNI *
                  </label>
                  <input
                    id="profile-dni"
                    type="text"
                    inputMode="numeric"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    required
                    placeholder="Sin puntos ni espacios"
                    className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-sm text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors font-sans tabular-nums text-sm"
                  />
                </div>
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

      {isPasswordModalOpen &&
        createPortal(
          <dialog
            ref={passwordDialogRef}
            onCancel={(event) => {
              event.preventDefault();
              closePasswordModal();
            }}
            aria-labelledby="change-password-title"
            className="m-auto max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-sm border-0 bg-transparent p-0 shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-xs focus:outline-none"
          >
            <div className="overflow-hidden rounded-sm border border-outline-variant bg-surface font-sans">
              <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <h2
                    id="change-password-title"
                    className="text-headline-sm font-serif text-on-surface"
                  >
                    Cambiar contraseña
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={isChangingPassword}
                  aria-label="Cerrar ventana"
                  className="cursor-pointer p-1 text-on-surface-variant transition-colors hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} noValidate className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label
                      htmlFor="current-password"
                      className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                    >
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordFormChange}
                        autoComplete="current-password"
                        required
                        className="w-full rounded-sm border border-outline-variant bg-surface-container px-4 py-2.5 pr-12 text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword((visible) => !visible)
                        }
                        aria-label={
                          showCurrentPassword
                            ? "Ocultar contraseña actual"
                            : "Ver contraseña actual"
                        }
                        aria-pressed={showCurrentPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-on-surface-variant transition-colors hover:text-primary"
                      >
                        <PasswordEye open={showCurrentPassword} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="new-password"
                      className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                    >
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordFormChange}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        className="w-full rounded-sm border border-outline-variant bg-surface-container px-4 py-2.5 pr-12 text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((visible) => !visible)}
                        aria-label={
                          showNewPassword
                            ? "Ocultar nueva contraseña"
                            : "Ver nueva contraseña"
                        }
                        aria-pressed={showNewPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-on-surface-variant transition-colors hover:text-primary"
                      >
                        <PasswordEye open={showNewPassword} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="confirm-new-password"
                      className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                    >
                      Confirmar nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-new-password"
                        type={showConfirmNewPassword ? "text" : "password"}
                        name="confirm_new_password"
                        value={passwordForm.confirm_new_password}
                        onChange={handlePasswordFormChange}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        className="w-full rounded-sm border border-outline-variant bg-surface-container px-4 py-2.5 pr-12 text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmNewPassword((visible) => !visible)
                        }
                        aria-label={
                          showConfirmNewPassword
                            ? "Ocultar confirmación de contraseña"
                            : "Ver confirmación de contraseña"
                        }
                        aria-pressed={showConfirmNewPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-on-surface-variant transition-colors hover:text-primary"
                      >
                        <PasswordEye open={showConfirmNewPassword} />
                      </button>
                    </div>
                  </div>
                </div>

                {passwordChangeError && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="whitespace-pre-wrap rounded-sm bg-error px-3 py-2 text-body-sm font-medium text-on-error"
                  >
                    {passwordChangeError}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-outline-variant/50 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    disabled={isChangingPassword}
                    className="flex items-center justify-center gap-2 rounded-sm border border-outline-variant px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    <X className="h-4 w-4" /> Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-on-primary shadow-xs transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    {isChangingPassword
                      ? "Actualizando..."
                      : "Actualizar contraseña"}
                  </button>
                </div>
              </form>
            </div>
          </dialog>,
          document.body
        )}
    </div>
  );
}
