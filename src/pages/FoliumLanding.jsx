import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScrollIndicator from "../components/BasicUIComponents/ScrollIndicator";
import FoliumLandingBackground from "../components/FoliumLandingComponents/FoliumLandingBackground";
import FoliumLandingHero from "../components/FoliumLandingComponents/FoliumLandingHero";
import FoliumLandingNavbar from "../components/FoliumLandingComponents/FoliumLandingNavbar";
import FoliumLandingProducts from "../components/FoliumLandingComponents/FoliumLandingProducts";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export default function FoliumLanding() {
  const navigate = useNavigate();

  useDocumentMetadata({
    title: "Inicio — Preservación y Catálogo",
    description: "Folium: El software de gestión silencioso para bibliotecas, lectura pública y archivos de patrimonio cultural.",
  });

  const handleUserButtonClick = () => navigate("/user");
  const handleLibrarianButtonClick = () => navigate("/librarian");

  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");

    root.classList.remove("dark");

    return () => {
      // Al salir de la landing page, restauramos el modo oscuro si correspondía
      const savedTheme = localStorage.getItem("theme") || localStorage.getItem("folium-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = savedTheme ? savedTheme === "dark" : (hadDark || prefersDark);

      if (shouldBeDark) {
        root.classList.add("dark");
      }
    };
  }, []);

  return (
    <div className="force-light bg-background text-on-background min-h-screen">
      <div className="relative min-h-screen bg-background overflow-hidden font-sans selection:bg-tertiary-container/20 flex flex-col">
        <FoliumLandingBackground />

        <FoliumLandingNavbar />

        <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-margin-edge mt-stack-lg md:mt-0">
          <FoliumLandingHero />
        </section>

        <ScrollIndicator />
      </div>

      <FoliumLandingProducts
        handleUserButtonClick={handleUserButtonClick}
        handleLibrarianButtonClick={handleLibrarianButtonClick}
      />
    </div>
  );
}
