import FoliumLandingBackground from "../components/FoliumLandingComponents/FoliumLandingBackground";
import FoliumLandingHero from "../components/FoliumLandingComponents/FoliumLandingHero";
import FoliumLandingNavbar from "../components/FoliumLandingComponents/FoliumLandingNavbar";

export default function FoliumLanding() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden font-sans selection:bg-tertiary-container/20 flex flex-col">
      <FoliumLandingBackground />
      
      {/* Navbar Superior */}
      <FoliumLandingNavbar />

      {/* Contenido Principal (Hero) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-margin-edge mt-stack-lg md:mt-0">
        <FoliumLandingHero />
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