export default function FoliumLandingProducts() {
  return (
    <section className="bg-background py-stack-lg px-margin-edge font-sans">
      {/* Encabezado de la Sección */}
      <div className="max-w-4xl mx-auto text-center mb-stack-lg">
        <span className="text-label-caps text-tertiary-container tracking-[0.2em] uppercase">
          Dos perspectivas, una sola vocación
        </span>

        <h2 className="font-serif text-display-lg-mobile md:text-display-lg text-on-surface mt-4 mb-4 leading-tight">
          El puente entre lectores devotos y custodios del saber.
        </h2>

        <p className="font-serif italic text-title-lg text-on-surface-variant max-w-3xl mx-auto">
          Una arquitectura concebida tanto para la contemplación literaria como
          para la rigurosa administración bibliográfica.
        </p>
      </div>

      {/* Grid de Tarjetas */}
      <div className="max-w-(--spacing-container-max) mx-auto grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        {/* Tarjeta 1: Lectores */}
        <div className="bg-surface-container-lowest border border-outline-variant p-stack-md md:p-stack-lg flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-stack-sm">
            <span className="text-label-caps text-on-surface-variant tracking-wider uppercase">
              Para lectores y comunidad
            </span>
            <div className="w-10 h-10 p-1 rounded-full bg-error-container/30 flex items-center justify-center text-tertiary-container">
              <ReaderIcon />
            </div>
          </div>

          <h3 className="font-serif text-headline-md text-on-surface mb-4">
            Explora libros y comparte tus reseñas
          </h3>

          <p className="text-body-md text-on-surface-variant mb-stack-md pb-stack-md border-b border-outline-variant/50 leading-relaxed">
            Descubre obras recomendadas por la comunidad, accede a notas de
            lectura y publica tus propias valoraciones críticas sobre ejemplares
            únicos.
          </p>

          <ul className="flex flex-col gap-4 mb-stack-lg flex-1">
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="text-tertiary-container text-lg leading-none">
                ✦
              </span>
              Catálogo colaborativo y recomendaciones
            </li>
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="text-tertiary-container text-lg leading-none">
                ✦
              </span>
              Anotaciones al margen y reseñas verificadas
            </li>
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="text-tertiary-container text-lg leading-none">
                ✦
              </span>
              Colección personal de favoritos
            </li>
          </ul>

          <button className="w-full border border-tertiary-container text-tertiary-container text-label-caps uppercase tracking-wider py-4 px-6 flex justify-between items-center hover:bg-tertiary-container/5 transition-colors">
            Explorar catálogo y reseñas
            <ArrowRightIcon />
          </button>
        </div>

        {/* Tarjeta 2: Bibliotecas */}
        <div className="bg-surface-container-lowest border border-outline-variant p-stack-md md:p-stack-lg flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-stack-sm">
            <span className="text-label-caps text-tertiary-container tracking-wider uppercase">
              Para bibliotecas y archivos
            </span>
            <div className="w-10 h-10 p-1.5 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary">
              <InstitutionIcon />
            </div>
          </div>

          <h3 className="font-serif text-headline-md text-on-surface mb-4">
            Gestión integral de inventario y colecciones
          </h3>

          <p className="text-body-md text-on-surface-variant mb-stack-md pb-stack-md border-b border-outline-variant/50 leading-relaxed">
            Una solución moderna y eficiente diseñada para simplificar el
            catalogado, la trazabilidad por RFID/código de barras y el control
            de fondos patrimoniales sin fricción.
          </p>

          <ul className="flex flex-col gap-4 mb-stack-lg flex-1">
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="text-tertiary-container text-lg leading-none">
                ✦
              </span>
              Catalogación normalizada MARC21 & RDA
            </li>
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="text-tertiary-container text-lg leading-none">
                ✦
              </span>
              Trazabilidad y auditoría de fondos en tiempo real
            </li>
            <li className="flex items-start gap-3 text-body-md text-on-surface-variant">
              <span className="text-tertiary-container text-lg leading-none">
                ✦
              </span>
              Automatización de préstamos y reportes
            </li>
          </ul>

          <button className="w-full bg-tertiary-container text-on-tertiary text-label-caps uppercase tracking-wider py-4 px-6 flex justify-between items-center hover:opacity-90 transition-opacity">
            Conocer la solución institucional
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
  //   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
  //     <g
  //       id="SVGRepo_tracerCarrier"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //     ></g>
  //     <g id="SVGRepo_iconCarrier">
  //       {" "}
  //       <path
  //         d="M5 19V6.2C5 5.0799 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.0799 3 8.2 3H15.8C16.9201 3 17.4802 3 17.908 3.21799C18.2843 3.40973 18.5903 3.71569 18.782 4.09202C19 4.51984 19 5.0799 19 6.2V17H7C5.89543 17 5 17.8954 5 19ZM5 19C5 20.1046 5.89543 21 7 21H19M18 17V21M15 13.5C14.7164 12.3589 13.481 11.5 12 11.5C10.519 11.5 9.28364 12.3589 9 13.5M12 7.5H12.01M13 7.5C13 8.05228 12.5523 8.5 12 8.5C11.4477 8.5 11 8.05228 11 7.5C11 6.94772 11.4477 6.5 12 6.5C12.5523 6.5 13 6.94772 13 7.5Z"
  //         stroke="#000000"
  //         strokeWidth="2"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //       ></path>{" "}
  //     </g>
  //   </svg>
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
