export default function FoliumLanding() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden font-sans selection:bg-tertiary-container/20 flex flex-col">
      <BackgroundElements />
      
      {/* Navbar Superior */}
      <Navbar />

      {/* Contenido Principal (Hero) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-margin-edge mt-stack-lg md:mt-0">
        <Hero />
      </main>

      {/* Indicador de Scroll Inferior */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-stack-sm z-10">
        <span className="text-label-caps text-on-surface-variant">Desplazar</span>
        <svg className="w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>


    </div>
  );
}

// ==========================================
// 1. Navegación (Navbar)
// ==========================================
function Navbar() {
  return (
    <header className="relative z-20 w-full flex justify-between items-center py-stack-sm px-margin-edge border-b border-outline-variant/30 bg-background/80 backdrop-blur-sm">
      
      {/* Logo y Marca */}
      <div className="flex items-center gap-base cursor-pointer group">
        <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary shadow-sm">
          <FoliumPenLogo />
        </div>
        <span className="text-headline-md text-on-surface group-hover:text-tertiary-container transition-colors">
          folium
        </span>
      </div>

      {/* Enlaces Centrales (Ocultos en móviles) */}
      <nav className="hidden md:flex items-center gap-gutter">
        <a href="#modulos" className="text-label-caps text-on-surface-variant hover:text-tertiary-container transition-colors">Módulos</a>
        <a href="#precision" className="text-label-caps text-on-surface-variant hover:text-tertiary-container transition-colors">Precisión</a>
        <a href="#instituciones" className="text-label-caps text-on-surface-variant hover:text-tertiary-container transition-colors">Instituciones</a>
      </nav>

      {/* Acciones (Login y Demo) */}
      <div className="flex items-center gap-gutter">
        <a href="/login" className="hidden sm:block text-label-caps text-on-surface-variant hover:text-tertiary-container transition-colors">
          Acceso
        </a>
        <button className="px-5 py-3 bg-tertiary-container text-on-tertiary text-label-caps rounded-DEFAULT hover:opacity-90 transition-opacity shadow-sm">
          Solicitar Demo
        </button>
      </div>
    </header>
  );
}

// ==========================================
// 2. Sección Principal (Hero)
// ==========================================
function Hero() {
  return (
    <div className="max-w-4xl w-full flex flex-col items-center text-center pb-stack-lg">
      
      {/* Etiqueta superior */}
      <div className="flex items-center gap-base text-label-caps text-on-surface-variant mb-stack-md">
        <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
        Edición de archivo & patrimonio
      </div>

      {/* Tipografía Principal (Escalada mediante clamp para ocupar el centro) */}
      <h1 className="font-serif text-tertiary-container leading-none mb-stack-sm" style={{ fontSize: 'clamp(4rem, 12vw, 8rem)' }}>
        folium
      </h1>

      {/* Subtítulo en itálicas (Uso de text-headline-sm de tu sistema) */}
      <h2 className="text-headline-sm italic text-on-surface-variant max-w-2xl mb-stack-md">
        El software de gestión silencioso para bibliotecas y archivos de patrimonio.
      </h2>

      {/* Pilares (Uso de text-label-caps) */}
      <p className="text-label-caps text-outline max-w-2xl mb-stack-lg flex flex-wrap justify-center items-center gap-x-2">
        <span>Catalogación Precisa</span>
        <span className="text-outline-variant text-lg leading-none">&middot;</span>
        <span>Circulación en Calma</span>
        <span className="text-outline-variant text-lg leading-none">&middot;</span>
        <span>Preservación Perenne</span>
      </p>
      
      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row items-center gap-stack-sm w-full sm:w-auto">
        <button className="w-full sm:w-auto bg-tertiary-container text-on-tertiary px-8 py-4 text-label-caps rounded-DEFAULT transition-opacity hover:opacity-90 flex items-center justify-center gap-base">
          Solicitar Demostración 
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
        <button className="w-full sm:w-auto bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:border-tertiary-container hover:text-tertiary-container px-8 py-4 text-label-caps rounded-DEFAULT transition-colors shadow-sm">
          Explorar Folium
        </button>
      </div>

    </div>
  );
}

// ==========================================
// 3. Fondos, Ondas y Caligrafía
// ==========================================
function BackgroundElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Resplandor radial central (Veladura usando tu color tertiary-container) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[30rem] bg-tertiary-container opacity-[0.03] rounded-full blur-[100px]" />
      <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-tertiary-container opacity-[0.02] rounded-full blur-[120px]" />

      {/* Líneas onduladas (Guilloche) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" preserveAspectRatio="none" viewBox="0 0 1440 800">
        <path d="M-100 400 C 300 200, 700 350, 1500 200" stroke="currentColor" className="text-tertiary-container" strokeWidth="1.5" fill="none" />
        <path d="M-100 500 C 400 700, 900 300, 1500 400" stroke="currentColor" className="text-tertiary-container" strokeWidth="1" fill="none" />
        <path d="M-100 650 C 500 450, 800 800, 1500 600" stroke="currentColor" className="text-tertiary-container" strokeWidth="1" fill="none" />
      </svg>

      {/* Caligrafía cursiva (Filigrana - Requiere fuente Great Vibes u otra cursiva en tu HTML) */}
      <div 
        className="absolute top-[30%] left-[8%] md:left-[15%] opacity-[0.04] text-tertiary-container -rotate-[10deg] select-none whitespace-nowrap"
        style={{ fontFamily: "'Great Vibes', 'Cedarville Cursive', cursive", fontSize: '4rem' }}
      >
        Carpe librum
        
      </div>
      <div 
        className="absolute bottom-[20%] right-[5%] md:right-[15%] opacity-[0.04] text-tertiary-container -rotate-[8deg] select-none whitespace-nowrap"
        style={{ fontFamily: "'Great Vibes', 'Cedarville Cursive', cursive", fontSize: '3.5rem' }}
      >
        Ex Libris et Memoria
      </div>
    </div>
  );
}

// ==========================================
// Ícono: "F" estilizada con pluma
// ==========================================
const FoliumPenLogo = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 3V14C8 15.5 9 16.5 10.5 16.5H13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M8 5H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M8 10H12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M13 16.5L16 21.5L10 21.5L13 16.5Z" fill="currentColor" />
    <line x1="13" y1="18" x2="13" y2="21.5" stroke="currentColor" strokeWidth="1.5" className="text-tertiary-container" />
  </svg>
);