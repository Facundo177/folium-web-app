import FoliumFullLogo from "../BasicUIComponents/FoliumFullLogo";

export default function FoliumLandingHero({handleCatalogButtonClick}) {
  return (
    <div className="max-w-4xl w-full flex flex-col items-center text-center pb-stack-lg">
      
      {/* Etiqueta superior */}
      <div className="flex items-center gap-base text-label-caps text-on-surface-variant mb-stack-md">
        <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
        Edición de archivo & patrimonio
      </div>

      {/* Tipografía Principal (Escalada mediante clamp para ocupar el centro) */}
      <h1 className="font-serif text-tertiary-container leading-none mb-stack-sm" style={{ fontSize: 'clamp(4rem, 12vw, 8rem)' }}>
        <div className="w-80 sm:w-100 sm:pl-6 ">
        <FoliumFullLogo />
        </div>
      </h1>

      {/* Subtítulo en itálicas (Uso de text-headline-sm de tu sistema) */}
      <h2 className="text-headline-sm italic text-on-surface-variant max-w-2xl mb-stack-md">
        El software de gestión silencioso para bibliotecas y archivos de patrimonio.
      </h2>

      {/* Pilares (Uso de text-label-caps) */}
      <p className="text-label-caps text-outline max-w-2xl mb-stack-lg flex flex-wrap justify-center items-center gap-x-2">
        <span>Cultura en un solo lugar</span>
        <span className="text-outline-variant text-lg leading-none">&middot;</span>
        <span>Comunicacion inmediata con bibliotecas</span>
       
      </p>
      
      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row items-center gap-stack-sm w-full sm:w-auto">
        <button 
        onClick={handleCatalogButtonClick}
        className="w-full sm:w-auto bg-tertiary-container text-on-tertiary-container border border-on-tertiary-container px-8 py-4 text-label-caps rounded-DEFAULT transition-opacity hover:opacity-90 flex items-center justify-center gap-base">
          Explorar Folium 
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
        {/* <button className="w-full sm:w-auto bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:border-tertiary-container hover:text-tertiary-container px-8 py-4 text-label-caps rounded-DEFAULT transition-colors shadow-sm">
          Solicitar Demostración
        </button> */}
      </div>

    </div>    
  );
}