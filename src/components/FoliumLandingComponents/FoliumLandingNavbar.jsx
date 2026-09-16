import FoliumSmallLogo from "../BasicUIComponents/FoliumSmallLogo";

export default function FoliumLandingNavbar({
  handleLoginButtonClick,
  handleRegisterButtonClick,
}) {
  return (
    <header className="relative z-20 w-full flex justify-between items-center py-stack-sm px-margin-edge border-b border-outline-variant/30 bg-background/80 backdrop-blur-sm">
      {/* Logo y Marca */}
      <div className="flex items-center gap-base group">
        <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary shadow-sm">
          <FoliumSmallLogo />
        </div>
        <span className="font-serif text-headline-md text-on-surface group-hover:text-tertiary-container transition-colors">
          folium
        </span>
      </div>

      {/* Enlaces Centrales (Ocultos en móviles) */}
      {/* <nav className="hidden md:flex items-center gap-gutter">
        <a
          href="#modulos"
          className="text-label-caps text-on-surface-variant hover:text-tertiary-container transition-colors"
        >
          Módulos
        </a>
        <a
          href="#precision"
          className="text-label-caps text-on-surface-variant hover:text-tertiary-container transition-colors"
        >
          Precisión
        </a>
        <a
          href="#instituciones"
          className="text-label-caps text-on-surface-variant hover:text-tertiary-container transition-colors"
        >
          Instituciones
        </a>
      </nav> */}

      {/* Acciones (Login y Demo) */}
      <div className="flex items-center gap-gutter">
        <button
          onClick={handleLoginButtonClick}
          className="hidden sm:block cursor-pointer text-label-caps text-on-surface-variant hover:text-tertiary-container transition-colors"
        >
          Acceso
        </button>
        <button
          onClick={handleRegisterButtonClick}
          className="cursor-pointer px-5 py-3 bg-tertiary-container text-on-tertiary text-label-caps rounded-DEFAULT hover:opacity-90 transition-opacity shadow-sm"
        >
          Registrarse
        </button>
      </div>
    </header>
  );
}
