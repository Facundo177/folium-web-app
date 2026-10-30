export default function FoliumLandingProducts({handleUserButtonClick, handleLibrarianButtonClick}) {

  return (
    <section id="tarjetas-lector-bibliotecario" className="bg-background py-stack-lg px-margin-edge font-sans scroll-mt-4">
      {/* Encabezado de la Sección */}
      <div className="max-w-4xl mx-auto text-center mb-stack-lg">
        <span className="text-label-caps text-on-surface-variant tracking-[0.2em] uppercase">
          Un ecosistema, dos experiencias
        </span>

        <h2 className="font-serif text-display-lg-mobile md:text-display-lg text-on-surface mt-4 mb-4 leading-tight">
          La plataforma que conecta a los lectores con sus bibliotecas.
        </h2>

        <p className="font-serif italic font-normal text-title-lg text-on-surface-variant max-w-3xl mx-auto">
          Acceso ágil al catálogo y reservas para quienes disfrutan de leer; control total de inventario y préstamos para quienes cuidan los libros.
        </p>
      </div>

      {/* Grid de Tarjetas */}
      <div id="tarjetas-grid" className="max-w-(--spacing-container-max) mx-auto grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        {/* Tarjeta 1: Lectores */}
        <div className="bg-surface-container-lowest border border-outline-variant p-stack-md md:p-stack-lg flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-stack-sm">
            <span className="text-label-caps text-on-surface-variant tracking-wider uppercase">
              Para lectores y comunidad
            </span>
            <div className="w-10 h-10 p-1 rounded-full bg-surface-variant flex items-center justify-center text-tertiary-container">
              <ReaderIcon />
            </div>
          </div>

          <h3 className="font-serif text-headline-md text-on-surface mb-4">
            Tu biblioteca abierta, en cualquier momento
          </h3>

          <p className="text-body-md text-on-surface-variant mb-stack-md pb-stack-md border-b border-outline-variant/50 leading-relaxed">
            Explora el catálogo general, comprueba la disponibilidad física de cada libro en tiempo real, reserva ejemplares con un clic y lleva el control de tus préstamos y lecturas favoritas.
          </p>

          <ul className="flex flex-col gap-4 mb-stack-lg flex-1">
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-xs bg-tertiary-container mt-2 shrink-0"></span>
              <span>
                <strong className="font-semibold text-on-surface">Catálogo en vivo:</strong> consulta disponibilidad inmediata y ubicación en sala.
              </span>
            </li>
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-xs bg-tertiary-container mt-2 shrink-0"></span>
              <span>
                <strong className="font-semibold text-on-surface">Reservas y préstamos:</strong> solicita títulos y revisa tus fechas de devolución.
              </span>
            </li>
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-xs bg-tertiary-container mt-2 shrink-0"></span>
              <span>
                <strong className="font-semibold text-on-surface">Espacio personal:</strong> guarda favoritos, califica lecturas y comparte opiniones.
              </span>
            </li>
          </ul>

          <button 
          className="w-full border border-on-surface text-on-surface text-label-caps uppercase tracking-wider py-4 px-6 flex justify-between items-center hover:bg-tertiary-container/5 transition-colors bg-surface-variant cursor-pointer"
          onClick={handleUserButtonClick}>
            Explorar el catálogo abierto
            <ArrowRightIcon />
          </button>
        </div>

        {/* Tarjeta 2: Bibliotecas */}
        <div className="bg-surface-container-lowest border border-outline-variant p-stack-md md:p-stack-lg flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-stack-sm">
            <span className="text-label-caps text-on-surface-variant tracking-wider uppercase">
              Para bibliotecas y administradores
            </span>
            <div className="w-10 h-10 p-1.5 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary">
              <InstitutionIcon />
            </div>
          </div>

          <h3 className="font-serif text-headline-md text-on-surface mb-4">
            Control integral de inventario y préstamos
          </h3>

          <p className="text-body-md text-on-surface-variant mb-stack-md pb-stack-md border-b border-outline-variant/50 leading-relaxed">
            Una herramienta moderna e intuitiva para simplificar la gestión bibliotecaria: registra libros y copias físicas, atiende reservas al instante y monitorea préstamos sin fricción.
          </p>

          <ul className="flex flex-col gap-4 mb-stack-lg flex-1">
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-xs bg-tertiary-container mt-2 shrink-0"></span>
              <span>
                <strong className="font-semibold text-on-surface">Inventario centralizado:</strong> alta rápida de libros, datos editoriales y copias.
              </span>
            </li>
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-xs bg-tertiary-container mt-2 shrink-0"></span>
              <span>
                <strong className="font-semibold text-on-surface">Circulación ágil:</strong> panel de préstamos activos, devoluciones y vencimientos.
              </span>
            </li>
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-xs bg-tertiary-container mt-2 shrink-0"></span>
              <span>
                <strong className="font-semibold text-on-surface">Atención a reservas:</strong> sincronización inmediata con las solicitudes de los usuarios.
              </span>
            </li>
          </ul>

          <button 
          className="w-full bg-tertiary-container border border-on-tertiary-container text-on-tertiary-container text-label-caps uppercase tracking-wider py-4 px-6 flex justify-between items-center hover:opacity-90 transition-opacity cursor-pointer"
          onClick={handleLibrarianButtonClick}>
            Ver propuestas para bibliotecas
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// Íconos SVG extraídos y adaptados
// ==========================================

const ReaderIcon = () => (
  <svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path d="M20.18,10.19A11.9,11.9,0,0,0,18,10c-.42,0-.83,0-1.24.08a5.91,5.91,0,0,0-1.91-1.65,3.81,3.81,0,0,0,1-2.57,3.86,3.86,0,0,0-7.72,0,3.81,3.81,0,0,0,1,2.57,6.11,6.11,0,0,0-1.91,1.64C6.83,10,6.42,10,6,10a11.9,11.9,0,0,0-2.18.21,1,1,0,0,0-.82,1v8.25a1,1,0,0,0,.36.77,1,1,0,0,0,.82.22A9.75,9.75,0,0,1,6,20.23a9.89,9.89,0,0,1,5.45,1.63h0l0,0,.13.05h0A1.09,1.09,0,0,0,12,22a.87.87,0,0,0,.28-.05l.07,0,.13-.05,0,0h0A9.89,9.89,0,0,1,18,20.23a9.75,9.75,0,0,1,1.82.18,1,1,0,0,0,.82-.22,1,1,0,0,0,.36-.77V11.17A1,1,0,0,0,20.18,10.19ZM12,4a1.86,1.86,0,0,1,0,3.71h0A1.86,1.86,0,0,1,12,4ZM11,19.33a11.92,11.92,0,0,0-5-1.1c-.33,0-.66,0-1,.05V12a9.63,9.63,0,0,1,2.52.05l.11,0A10,10,0,0,1,11,13.33Zm1-7.73a11.77,11.77,0,0,0-1.38-.68l-.06,0c-.33-.13-.66-.26-1-.36A4,4,0,0,1,12,9.69h0a4,4,0,0,1,2.44.85A12.43,12.43,0,0,0,12,11.6Zm7,6.68a11.6,11.6,0,0,0-6,1v-6a9.76,9.76,0,0,1,3.37-1.22l.2,0A9.39,9.39,0,0,1,19,12Z"></path>
    </g>
  </svg>
);

const InstitutionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M5 8V17.0192M9 8V17M15 8V17M19 8V17.0192M5 17.0192C5.31428 17 5.70173 17 6.2 17H17.8C18.2983 17 18.6857 17 19 17.0192M5 17.0192C4.60779 17.0431 4.32953 17.097 4.09202 17.218C3.71569 17.4097 3.40973 17.7157 3.21799 18.092C3 18.5198 3 19.0799 3 20.2V21H21V20.2C21 19.0799 21 18.5198 20.782 18.092C20.5903 17.7157 20.2843 17.4097 19.908 17.218C19.6705 17.097 19.3922 17.0431 19 17.0192M3 5.5V8H21V5.5L12 3L3 5.5Z"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>{" "}
    </g>
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
