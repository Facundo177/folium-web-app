import { CheckCircle2 } from "lucide-react";

export default function ProfileSettings() {
  return (
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm animate-fade-in">
      {/* Cabecera */}
      <div className="mb-8">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Configuración de perfil
        </span>
        <h2 className="font-serif text-3xl text-on-surface mt-1 mb-2 font-normal">
          Modificar Datos de la Cuenta
        </h2>
        <p className="font-sans text-sm text-on-surface-variant">
          Actualiza tu nombre de registro, contacto archivístico y contraseña de
          acceso.
        </p>
      </div>

      {/* Formulario */}
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Fila 1: Nombre y Handle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface">
              Nombre Completo
            </label>
            <input
              type="text"
              defaultValue="Gia Moreno"
              className="bg-surface-container rounded-md px-4 py-2.5 outline-none focus:ring-1 focus:ring-on-tertiary-container text-sm font-sans text-on-surface transition-shadow"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface">
              Nombre de usuario (Handle)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-on-surface-variant text-sm font-sans">
                @
              </span>
              <input
                type="text"
                defaultValue="gia1989103"
                className="bg-surface-container w-full rounded-md pl-8 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-on-tertiary-container text-sm font-sans text-on-surface transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Fila 2: Correo e Insignia Verificado */}
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface">
            Correo electrónico de investigador
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="email"
              defaultValue="giamoreno1989@gmail.com"
              className="bg-surface-container w-full flex-1 rounded-md px-4 py-2.5 outline-none focus:ring-1 focus:ring-on-tertiary-container text-sm font-sans text-on-surface transition-shadow"
            />
            <div className="bg-surface-variant w-full sm:w-auto px-4 py-2.5 rounded-md flex items-center justify-center gap-1.5 text-on-surface-variant text-sm font-sans font-medium border border-outline-variant/20">
              <span className="text-[16px]">
                <CheckCircle2/>
              </span>
              Verificado
            </div>
          </div>
        </div>

        {/* Fila 3: Textarea Biografía */}
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface">
            Biografía curatorial / Filiación
          </label>
          <textarea
            rows={3}
            defaultValue="Especialista en primeras ediciones iberoamericanas y literatura comparada del siglo XX. Investigadora asociada al Archivo Central."
            className="bg-surface-container rounded-md px-4 py-2.5 outline-none focus:ring-1 focus:ring-on-tertiary-container text-sm font-sans text-on-surface resize-y leading-relaxed transition-shadow"
          />
        </div>

        {/* Fila 4: Contraseñas */}
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface">
            Cambiar contraseña de acceso
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="bg-surface-container rounded-md px-4 py-2.5 outline-none focus:ring-1 focus:ring-on-tertiary-container text-sm font-sans text-on-surface placeholder:text-on-surface-variant transition-shadow"
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              className="bg-surface-container rounded-md px-4 py-2.5 outline-none focus:ring-1 focus:ring-on-tertiary-container text-sm font-sans text-on-surface placeholder:text-on-surface-variant transition-shadow"
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-6 pt-6 border-t border-outline-variant/20">
          <button
            type="button"
            className="w-full sm:w-auto font-sans text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2.5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto bg-primary text-on-primary font-sans text-sm font-bold px-8 py-2.5 rounded-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
