import { Link } from "react-router-dom";
import FoliumFullLogo from "../BasicUIComponents/FoliumFullLogo";

export default function FoliumLandingHero() {
  return (
    <div className="max-w-4xl w-full flex flex-col items-center text-center pb-stack-lg">
      
      {/* Sello de procedencia editorial / Colofón */}
      <div className="inline-flex items-center gap-3 text-caption uppercase tracking-[0.2em] text-on-surface-variant/80 border-b border-outline-variant/40 pb-1 mb-stack-md font-sans">
        Fondo bibliográfico institucional
      </div>

      {/* Tipografía Principal con texto accesible para SEO */}
      <h1 className="font-serif text-tertiary-container leading-none mb-stack-sm flex flex-col items-center">
        <span className="sr-only">Folium — Gestión de Archivo y Biblioteca</span>
        <div className="w-80 sm:w-100 sm:pl-6" aria-hidden="true">
          <FoliumFullLogo />
        </div>
      </h1>

      {/* Subtítulo en itálicas con peso natural */}
      <h2 className="font-serif text-headline-sm sm:text-headline-md italic text-on-surface/90 max-w-2xl mb-stack-sm font-normal leading-relaxed">
        El software de gestión silencioso para bibliotecas y archivos de patrimonio.
      </h2>

      {/* Declaración descriptiva editorial */}
      <p className="text-body-md text-on-surface-variant max-w-xl mb-stack-lg leading-relaxed font-sans">
        Consulta de ejemplares en sala, préstamos comunitarios y administración integral de inventario en una plataforma sobria y atemporal.
      </p>
      
      {/* Acciones de Entrada */}
      <div className="flex flex-col sm:flex-row items-center gap-stack-sm w-full sm:w-auto">
        <Link 
          to="/catalog"
          className="w-full sm:w-auto bg-tertiary-container text-on-tertiary-container border border-on-tertiary-container px-8 py-4 text-label-caps rounded-DEFAULT transition-opacity hover:opacity-90 flex items-center justify-center gap-base no-underline shadow-sm"
        >
          Explorar Catálogo 
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
        <Link
          to="/pricing"
          className="w-full sm:w-auto px-6 py-4 text-label-caps text-on-surface-variant hover:text-tertiary-container transition-colors text-center no-underline border border-transparent hover:border-outline-variant/40 rounded-DEFAULT"
        >
          Planes para instituciones &rarr;
        </Link>
      </div>

    </div>    
  );
}
