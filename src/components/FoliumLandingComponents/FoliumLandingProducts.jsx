export default function FoliumLandingProducts({ handleUserButtonClick, handleLibrarianButtonClick }) {
  return (
    <section className="bg-background py-stack-xl px-margin-edge font-sans border-t border-outline-variant/30">
      {/* Encabezado Editorial */}
      <div className="max-w-3xl mx-auto text-center mb-stack-xl">
        <div className="inline-flex items-center gap-2 text-caption uppercase tracking-[0.2em] text-on-surface-variant/80 border-b border-outline-variant/50 pb-1 mb-4 font-sans">
          Un ecosistema &middot; Dos perspectivas
        </div>

        <h2 className="font-serif text-display-lg-mobile md:text-display-lg text-on-surface mb-4 leading-tight font-normal">
          La plataforma que conecta a los lectores con sus bibliotecas
        </h2>

        <p className="font-serif italic text-title-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Acceso ágil y reservas para quienes disfrutan de leer; control riguroso de inventario y circulación para quienes cuidan los libros.
        </p>
      </div>

      {/* Grid de Experiencias Tangibles */}
      <div className="max-w-(--spacing-container-max) mx-auto grid grid-cols-1 lg:grid-cols-2 gap-stack-lg items-stretch">
        
        {/* Tarjeta 1: Lectores y Comunidad */}
        <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-sm p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-outline-variant/40">
              <span className="text-caption uppercase tracking-[0.18em] text-primary font-semibold font-sans">
                Para Lectores & Investigadores
              </span>
              <span className="px-2.5 py-0.5 text-xs font-serif italic text-on-surface-variant bg-surface-container/60 rounded-xs border border-outline-variant/40">
                Consulta en Sala
              </span>
            </div>

            <h3 className="font-serif text-headline-md text-on-surface mb-3 leading-snug font-normal">
              Tu biblioteca viva, abierta al descubrimiento
            </h3>

            <p className="text-body-md text-on-surface-variant mb-5 leading-relaxed">
              Explora el fondo bibliográfico general, comprueba si el ejemplar físico está en sala antes de salir de casa y gestiona tus reservas personales sin demoras.
            </p>

            {/* Fragmento Tangible de UI: Ficha de Disponibilidad Real */}
            <div className="bg-background/90 border border-outline-variant/70 rounded-sm p-4 mb-6 shadow-xs font-sans">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-16 bg-primary/10 border border-primary/20 rounded-xs flex flex-col items-center justify-center text-primary shrink-0">
                  <span className="font-serif text-xs font-bold leading-none">VOL.</span>
                  <span className="font-mono text-[10px] text-primary/80 mt-1">1967</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-600/10 px-2 py-0.5 rounded-xs border border-emerald-600/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Disponible en Sala Central
                    </span>
                    <span className="text-xs text-on-surface-variant/80 font-mono">EST-04B</span>
                  </div>
                  <h4 className="font-serif text-title-md font-medium text-on-surface mt-1.5 truncate">
                    Cien años de soledad
                  </h4>
                  <p className="text-xs text-on-surface-variant truncate">
                    Gabriel García Márquez &middot; Editorial Sudamericana
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant">
                <span>Signatura: <strong className="text-on-surface font-mono font-medium">LIT-HIS-042</strong></span>
                <span className="text-primary font-medium">Reserva activa inmediata</span>
              </div>
            </div>

            {/* Capacidades Clave */}
            <ul className="space-y-3 mb-stack-lg text-body-sm text-on-surface-variant">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold select-none">&bull;</span>
                <span><strong className="text-on-surface font-semibold">Catálogo en tiempo real:</strong> disponibilidad física y ubicación precisa en sala.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold select-none">&bull;</span>
                <span><strong className="text-on-surface font-semibold">Reserva anticipada:</strong> asegura tu ejemplar antes de acudir a la institución.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold select-none">&bull;</span>
                <span><strong className="text-on-surface font-semibold">Cuaderno del lector:</strong> historial de obras prestadas, favoritos y valoraciones.</span>
              </li>
            </ul>
          </div>

          {/* Botón de Entrada */}
          <button 
            type="button"
            className="w-full bg-surface-container-lowest border border-primary text-primary hover:bg-primary hover:text-on-primary py-3.5 px-6 rounded-sm text-label-caps uppercase tracking-wider flex items-center justify-between transition-colors font-medium shadow-xs cursor-pointer group"
            onClick={handleUserButtonClick}
          >
            <span>Explorar el Catálogo Abierto</span>
            <span className="transition-transform group-hover:translate-x-1">
              <ArrowRightIcon />
            </span>
          </button>
        </div>

        {/* Tarjeta 2: Bibliotecas y Custodios */}
        <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-sm p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-outline-variant/40">
              <span className="text-caption uppercase tracking-[0.18em] text-tertiary font-semibold font-sans">
                Para Instituciones & Custodios
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider text-on-surface-variant bg-surface-container/60 rounded-xs border border-outline-variant/40">
                Mesa de Control
              </span>
            </div>

            <h3 className="font-serif text-headline-md text-on-surface mb-3 leading-snug font-normal">
              Control integral de fondo, inventario y circulación
            </h3>

            <p className="text-body-md text-on-surface-variant mb-5 leading-relaxed">
              La herramienta profesional que simplifica la administración diaria: altas con signatura, mesa de préstamos en mostrador y control estricto de ejemplares.
            </p>

            {/* Fragmento Tangible de UI: Registro de Préstamo y Estado */}
            <div className="bg-background/90 border border-outline-variant/70 rounded-sm p-4 mb-6 shadow-xs font-sans">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-on-surface">#PR-2026-142</span>
                  <span className="text-xs text-on-surface-variant">&middot; Lector: M. Valenzuela</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-900 bg-amber-600/10 px-2 py-0.5 rounded-xs border border-amber-600/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700"></span>
                  En Término (Vence en 4d)
                </span>
              </div>
              <div className="text-xs text-on-surface-variant mb-3">
                Ejemplar: <span className="font-serif italic text-on-surface font-medium">Don Quijote de la Mancha (Tomo I)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-outline-variant/40 text-center text-xs">
                <div>
                  <span className="block font-mono font-bold text-on-surface">1,420</span>
                  <span className="text-[10px] uppercase text-on-surface-variant/80">Volúmenes</span>
                </div>
                <div>
                  <span className="block font-mono font-bold text-emerald-800">98.2%</span>
                  <span className="text-[10px] uppercase text-on-surface-variant/80">En Sala</span>
                </div>
                <div>
                  <span className="block font-mono font-bold text-on-surface">0</span>
                  <span className="text-[10px] uppercase text-on-surface-variant/80">Extravíos</span>
                </div>
              </div>
            </div>

            {/* Capacidades Clave */}
            <ul className="space-y-3 mb-stack-lg text-body-sm text-on-surface-variant">
              <li className="flex items-start gap-3">
                <span className="text-tertiary font-bold select-none">&bull;</span>
                <span><strong className="text-on-surface font-semibold">Inventario centralizado:</strong> alta ágil, carga masiva (.xlsx, .csv, .bib) y signaturas.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-tertiary font-bold select-none">&bull;</span>
                <span><strong className="text-on-surface font-semibold">Circulación ágil:</strong> préstamos activos, devoluciones y vencimientos en un solo tablero.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-tertiary font-bold select-none">&bull;</span>
                <span><strong className="text-on-surface font-semibold">Atención a reservas:</strong> sincronización inmediata con las solicitudes de los usuarios.</span>
              </li>
            </ul>
          </div>

          {/* Botón de Administración */}
          <button 
            type="button"
            className="w-full bg-tertiary-container border border-on-tertiary-container text-on-tertiary-container hover:opacity-95 py-3.5 px-6 rounded-sm text-label-caps uppercase tracking-wider flex items-center justify-between transition-opacity font-medium shadow-xs cursor-pointer group"
            onClick={handleLibrarianButtonClick}
          >
            <span>Gestionar mi Biblioteca</span>
            <span className="transition-transform group-hover:translate-x-1">
              <ArrowRightIcon />
            </span>
          </button>
        </div>

      </div>
    </section>
  );
}

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
