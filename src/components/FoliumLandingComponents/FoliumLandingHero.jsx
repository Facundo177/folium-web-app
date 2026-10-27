import { Link } from "react-router-dom";
import FoliumFullLogo from "../BasicUIComponents/FoliumFullLogo";

export default function FoliumLandingHero() {
  return (
    <div className="max-w-4xl w-full flex flex-col items-center text-center pb-stack-lg">
      
      {/* Sello de Autenticidad Patrimonial */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-sm border border-outline-variant/60 bg-surface-container-lowest/80 backdrop-blur-xs text-caption uppercase tracking-[0.2em] text-on-surface-variant mb-stack-md font-sans shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
        <span>Custodia &middot; Catálogo &middot; Archivo Histórico</span>
      </div>

      {/* Tipografía Principal con texto accesible para SEO */}
      <h1 className="font-serif text-tertiary-container leading-none mb-stack-sm flex flex-col items-center">
        <span className="sr-only">Folium — Gestión de Archivo y Biblioteca</span>
        <div className="w-80 sm:w-104 sm:pl-6" aria-hidden="true">
          <FoliumFullLogo />
        </div>
      </h1>

      {/* Subtítulo Editorial */}
      <h2 className="font-serif text-headline-sm sm:text-headline-md italic text-on-surface max-w-2xl mb-stack-sm font-normal leading-relaxed">
        El software silencioso para bibliotecas públicas y fondos de patrimonio.
      </h2>

      {/* Descripción de propósito */}
      <p className="text-body-md sm:text-body-lg text-on-surface-variant max-w-xl mb-stack-lg leading-relaxed font-sans">
        Diseñado para que los lectores descubran obras físicas en sala y los archivistas custodien sus colecciones con total precisión y serenidad.
      </p>
      
      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row items-center gap-stack-sm w-full sm:w-auto mb-stack-xl">
        <Link 
          to="/catalog"
          className="w-full sm:w-auto bg-primary text-on-primary border border-primary px-8 py-3.5 text-label-caps tracking-wider rounded-sm transition-all hover:opacity-95 flex items-center justify-center gap-base no-underline shadow-sm font-medium"
        >
          <span>Explorar Catálogo Abierto</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
        <Link
          to="/pricing"
          className="w-full sm:w-auto px-7 py-3.5 text-label-caps tracking-wider text-on-surface border border-outline-variant hover:border-primary hover:text-primary transition-colors text-center no-underline rounded-sm bg-surface-container-lowest/50"
        >
          Planes Institucionales
        </Link>
      </div>

      {/* Pilares Tangibles de Confianza */}
      <div className="w-full max-w-2xl pt-stack-md border-t border-outline-variant/40 grid grid-cols-1 sm:grid-cols-3 gap-stack-sm text-left font-sans">
        <div className="p-3 rounded-sm bg-surface-container-lowest/50 border border-outline-variant/30">
          <span className="block text-caption uppercase tracking-wider text-tertiary font-semibold mb-0.5">Disponibilidad en Sala</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">Ubicación exacta por sala, estantería y signatura topográfica.</p>
        </div>
        <div className="p-3 rounded-sm bg-surface-container-lowest/50 border border-outline-variant/30">
          <span className="block text-caption uppercase tracking-wider text-tertiary font-semibold mb-0.5">Circulación Activa</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">Préstamos, renovaciones y reservas en tiempo real.</p>
        </div>
        <div className="p-3 rounded-sm bg-surface-container-lowest/50 border border-outline-variant/30">
          <span className="block text-caption uppercase tracking-wider text-tertiary font-semibold mb-0.5">Control de Fondo</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">Trazabilidad de copias físicas y estado de preservación.</p>
        </div>
      </div>

    </div>    
  );
}
