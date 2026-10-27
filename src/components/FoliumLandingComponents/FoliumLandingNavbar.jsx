import { Link } from "react-router-dom";
import FoliumSmallLogo from "../BasicUIComponents/FoliumSmallLogo";

export default function FoliumLandingNavbar() {
  return (
    <header className="relative z-20 w-full flex justify-between items-center py-stack-sm px-margin-edge border-b border-outline-variant/40 bg-background/80 backdrop-blur-sm font-sans">
      {/* Logo y Marca */}
      <Link to="/" className="flex items-center gap-base group text-inherit no-underline">
        <div className="w-10 h-10 rounded-sm bg-tertiary-container flex items-center justify-center text-on-tertiary shadow-xs">
          <FoliumSmallLogo />
        </div>
        <span className="font-serif text-headline-md text-on-surface group-hover:text-primary transition-colors">
          folium
        </span>
      </Link>

      {/* Enlaces y Acciones */}
      <nav aria-label="Navegación principal" className="flex items-center gap-gutter">
        <Link
          to="/catalog"
          className="hidden md:inline-block cursor-pointer text-label-caps text-on-surface-variant hover:text-primary transition-colors no-underline"
        >
          Catálogo
        </Link>
        <Link
          to="/pricing"
          className="hidden md:inline-block cursor-pointer text-label-caps text-on-surface-variant hover:text-primary transition-colors no-underline"
        >
          Planes
        </Link>
        <Link
          to="/login"
          className="hidden sm:inline-block cursor-pointer text-label-caps text-on-surface-variant hover:text-primary transition-colors no-underline"
        >
          Acceso
        </Link>
        <Link
          to="/register"
          className="cursor-pointer px-4.5 py-2.5 bg-primary border border-primary text-on-primary text-label-caps rounded-sm hover:opacity-95 transition-opacity shadow-xs no-underline inline-block font-medium"
        >
          Registrarse
        </Link>
      </nav>
    </header>
  );
}
