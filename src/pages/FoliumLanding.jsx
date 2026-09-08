import ScrollIndicator from "../components/BasicUIComponents/ScrollIndicator";
import FoliumLandingBackground from "../components/FoliumLandingComponents/FoliumLandingBackground";
import FoliumLandingHero from "../components/FoliumLandingComponents/FoliumLandingHero";
import FoliumLandingNavbar from "../components/FoliumLandingComponents/FoliumLandingNavbar";
import FoliumLandingProducts from "../components/FoliumLandingComponents/FoliumLandingProducts";

export default function FoliumLanding() {
  return (
    <div>
      <div className="relative min-h-screen bg-background overflow-hidden font-sans selection:bg-tertiary-container/20 flex flex-col">
        
        <FoliumLandingBackground />

        <FoliumLandingNavbar />

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-margin-edge mt-stack-lg md:mt-0">
          <FoliumLandingHero />
        </main>

        <ScrollIndicator/>

      </div>

      <FoliumLandingProducts />
      
    </div>
  );
}
