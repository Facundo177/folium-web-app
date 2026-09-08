export default function FoliumLandingBackground() {
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