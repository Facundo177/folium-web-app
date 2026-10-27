export default function FoliumLandingProducts({ handleUserButtonClick, handleLibrarianButtonClick }) {
  return (
    <section className="bg-background py-stack-xl px-margin-edge font-sans border-t border-outline-variant/30">
      {/* Encabezado Editorial de la Sección */}
      <div className="max-w-3xl mx-auto text-center mb-stack-xl">
        <div className="inline-flex items-center gap-2 text-caption uppercase tracking-[0.2em] text-on-surface-variant/70 border-b border-outline-variant/40 pb-1 mb-4 font-sans">
          Dos dimensiones &middot; Un mismo fondo bibliográfico
        </div>

        <h2 className="font-serif text-display-lg-mobile md:text-display-lg text-on-surface mb-4 leading-tight font-normal">
          La plataforma que conecta a los lectores con sus bibliotecas
        </h2>

        <p className="font-serif italic text-title-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Consulta ágil y reservas para quienes buscan conocimiento; control riguroso de inventario y circulación para quienes custodian los ejemplares.
        </p>
      </div>

      {/* Doble Pliego Editorial Asimétrico */}
      <div className="max-w-(--spacing-container-max) mx-auto grid grid-cols-1 lg:grid-cols-2 gap-stack-lg items-stretch">
        
        {/* Folio I: El Salón de Lectura (Comunidad y Lectores) */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 p-stack-md md:p-stack-lg flex flex-col justify-between shadow-xs relative">
          <div>
            {/* Cabecera de Pliego */}
            <div className="border-b border-outline-variant/50 pb-3 mb-stack-md flex justify-between items-baseline">
              <span className="text-caption uppercase tracking-[0.18em] text-tertiary-container font-semibold font-sans">
                Folio I &mdash; Lectura y Consulta
              </span>
              <span className="text-caption text-on-surface-variant/60 font-serif italic">
                Acceso libre a la comunidad
              </span>
            </div>

            <h3 className="font-serif text-headline-md text-on-surface mb-3 leading-snug font-normal">
              Tu biblioteca viva, abierta al descubrimiento
            </h3>

            <p className="text-body-md text-on-surface-variant mb-stack-md leading-relaxed">
              Explora el catálogo general sin fricciones: comprueba la disponibilidad física de cada volumen en tiempo real, reserva ejemplares antes de visitar la sala y organiza tu propio registro de lecturas.
            </p>

            {/* Índice Tipográfico de Capacidades */}
            <div className="space-y-4 mb-stack-lg pt-stack-xs border-t border-outline-variant/30">
              <div className="flex items-start gap-4">
                <span className="font-serif italic text-tertiary-container text-title-md font-semibold select-none leading-none pt-0.5">
                  01
                </span>
                <div>
                  <h4 className="text-body-md font-semibold text-on-surface mb-0.5">Catálogo en sala y depósito</h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    Disponibilidad inmediata, signatura topográfica y estado de conservación de cada ejemplar en tiempo real.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="font-serif italic text-tertiary-container text-title-md font-semibold select-none leading-none pt-0.5">
                  02
                </span>
                <div>
                  <h4 className="text-body-md font-semibold text-on-surface mb-0.5">Reservas y préstamos inmediatos</h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    Solicitud anticipada con fecha de retiro garantizada y alertas de devolución para mantener tus lecturas al día.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="font-serif italic text-tertiary-container text-title-md font-semibold select-none leading-none pt-0.5">
                  03
                </span>
                <div>
                  <h4 className="text-body-md font-semibold text-on-surface mb-0.5">Cuaderno del lector</h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    Historial de obras consultadas, favoritos anotados y valoraciones críticas compartidas con la comunidad.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Entrada */}
          <button 
            type="button"
            className="w-full border border-on-surface text-on-surface hover:bg-tertiary-container hover:text-on-tertiary-container hover:border-tertiary-container text-label-caps uppercase tracking-wider py-4 px-6 flex justify-between items-center transition-all bg-surface-container-lowest group cursor-pointer"
            onClick={handleUserButtonClick}
          >
            <span>Ingresar a la sala de consulta</span>
            <span className="transition-transform group-hover:translate-x-1">
              <ArrowRightIcon />
            </span>
          </button>
        </div>

        {/* Folio II: Ficha de Custodia (Bibliotecas y Administradores) */}
        <div className="bg-surface-container-lowest border border-outline-variant/80 p-stack-md md:p-stack-lg flex flex-col justify-between shadow-xs relative">
          <div>
            {/* Cabecera Técnica de Registro */}
            <div className="border-b border-outline-variant/60 pb-3 mb-stack-md flex justify-between items-baseline bg-surface-container/20 -mx-stack-md -mt-stack-md p-stack-md md:-mx-stack-lg md:-mt-stack-lg md:p-stack-lg md:pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-tertiary-container rounded-xs"></span>
                <span className="text-caption uppercase tracking-[0.18em] text-on-surface font-semibold font-sans">
                  Folio II &mdash; Custodia & Depósito
                </span>
              </div>
              <span className="text-caption text-on-surface-variant font-mono text-xs uppercase tracking-wider">
                REG. ARCHIVO
              </span>
            </div>

            <h3 className="font-serif text-headline-md text-on-surface mb-3 leading-snug font-normal">
              Control integral de fondo, inventario y circulación
            </h3>

            <p className="text-body-md text-on-surface-variant mb-stack-md leading-relaxed">
              Una herramienta sobria y rigurosa para la gestión bibliotecaria: registro de volúmenes y ejemplares físicos, atención de reservas al instante y monitoreo continuo de circulación.
            </p>

            {/* Asignaturas Técnicas */}
            <div className="space-y-4 mb-stack-lg pt-stack-xs border-t border-outline-variant/30">
              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-on-surface-variant bg-surface-variant/70 border border-outline-variant/40 px-2 py-0.5 rounded-xs select-none mt-0.5 font-medium shrink-0">
                  CAT-A
                </span>
                <div>
                  <h4 className="text-body-md font-semibold text-on-surface mb-0.5">Inventario y catalogación centralizada</h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    Alta masiva de libros, asignación de signaturas, ISBN/ISSN y trazabilidad individual de cada copia física.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-on-surface-variant bg-surface-variant/70 border border-outline-variant/40 px-2 py-0.5 rounded-xs select-none mt-0.5 font-medium shrink-0">
                  CIRC-B
                </span>
                <div>
                  <h4 className="text-body-md font-semibold text-on-surface mb-0.5">Mesa de préstamos y circulación ágil</h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    Tablero de control para préstamos activos, devoluciones pendientes y alertas preventivas de vencimiento.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-on-surface-variant bg-surface-variant/70 border border-outline-variant/40 px-2 py-0.5 rounded-xs select-none mt-0.5 font-medium shrink-0">
                  CUST-C
                </span>
                <div>
                  <h4 className="text-body-md font-semibold text-on-surface mb-0.5">Gestión de usuarios y reservas en cola</h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    Atención prioritaria según orden de solicitud, control de carnets y registro histórico de movimientos institucionales.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Administración */}
          <button 
            type="button"
            className="w-full bg-tertiary-container border border-on-tertiary-container text-on-tertiary-container hover:opacity-90 text-label-caps uppercase tracking-wider py-4 px-6 flex justify-between items-center transition-opacity shadow-sm group cursor-pointer"
            onClick={handleLibrarianButtonClick}
          >
            <span>Administrar biblioteca o archivo</span>
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
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
