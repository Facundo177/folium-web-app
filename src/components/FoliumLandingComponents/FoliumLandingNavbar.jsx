import { Link } from "react-router-dom";
import FoliumSmallLogo from "../BasicUIComponents/FoliumSmallLogo";

export default function FoliumLandingNavbar() {
  return (
    <header className="relative z-20 w-full flex justify-between items-center py-stack-sm px-margin-edge border-b border-outline-variant/30 bg-background/80 backdrop-blur-sm">
      {/* Logo y Marca */}
      <div className="flex items-center gap-base group text-inherit no-underline">
        <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary shadow-sm">
          <FoliumSmallLogo />
        </div>
        <span className="font-serif text-headline-md text-on-surface group-hover:text-tertiary-container transition-colors">
          folium
        </span>
      </div>

      {/* Acciones (Login y Registro) */}
      <div className="flex items-center gap-gutter">
        <Link
          to="/login"
          className="hidden sm:block cursor-pointer text-label-caps text-on-surface-variant hover:text-tertiary-container transition-colors no-underline"
        >
          Acceso
        </Link>
        <Link
          to="/register"
          className="cursor-pointer px-5 py-3 bg-tertiary-container border border-on-tertiary-container text-on-tertiary-container text-label-caps rounded-DEFAULT hover:opacity-90 transition-opacity shadow-sm no-underline inline-block"
        >
          Registrarse
        </Link>
      </div>
    </header>
  );
}
