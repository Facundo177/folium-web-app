import { Link } from "react-router-dom";
import FoliumFullLogo from "../BasicUIComponents/FoliumFullLogo";

export default function FoliumLandingHero() {
  return (
    <div className="max-w-4xl w-full flex flex-col items-center text-center pb-stack-lg">
      
      {/* Sello de procedencia bibliográfica */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-outline-variant/60 bg-surface-container-lowest/60 backdrop-blur-xs text-caption uppercase tracking-[0.2em] text-on-surface-variant mb-stack-md font-sans shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
        <span>Fondo Bibliográfico &middot; Consulta Pública</span>
      </div>

      {/* Tipografía Principal con texto accesible para SEO */}
      <h1 className="font-serif text-tertiary-container leading-none mb-stack-sm flex flex-col items-center">
        <span className="sr-only">Folium — Gestión de Archivo y Biblioteca</span>
        <div className="w-80 sm:w-100 sm:pl-6" aria-hidden="true">
          <FoliumFullLogo />
        </div>
      </h1>

      {/* Subtítulo Editorial */}
      <h2 className="font-serif text-headline-sm sm:text-headline-md italic text-on-surface max-w-2xl mb-stack-xs leading-relaxed font-normal">
        Donde la memoria impresa se preserva y la lectura comunitaria cobra vida.
      </h2>

      {/* Filigrana Folium (Detalle botánico editorial) */}
      <div className="flex items-center justify-center gap-3 text-outline-variant/70 my-stack-sm" aria-hidden="true">
        <span className="h-[1px] w-8 sm:w-12 bg-outline-variant/60"></span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6" />
        </svg>
        <span className="h-[1px] w-8 sm:w-12 bg-outline-variant/60"></span>
      </div>

      {/* Texto descriptivo de propósito */}
      <p className="text-body-md text-on-surface-variant max-w-xl mb-stack-lg leading-relaxed font-sans">
        Accede al catálogo vivo de tu biblioteca: descubre qué ejemplares están disponibles en sala, resérvalos al instante y acompaña la custodia de nuestro patrimonio cultural.
      </p>
      
      {/* Botón de Acción */}
      <div className="flex flex-col sm:flex-row items-center gap-stack-sm w-full sm:w-auto">
        <Link 
          to="/catalog"
          className="w-full sm:w-auto bg-tertiary-container text-on-tertiary-container border border-on-tertiary-container px-8 py-4 text-label-caps tracking-wider rounded-DEFAULT transition-all hover:opacity-90 hover:shadow-sm flex items-center justify-center gap-3 no-underline group cursor-pointer"
        >
          <span>Explorar el Catálogo Abierto</span>
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>

    </div>    
  );
}
