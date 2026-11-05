import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Componente utilitario que asegura que la vista siempre comience
 * desde el límite superior (scrollY = 0) al cambiar de ruta,
 * salvo cuando la URL incluye un hash específico (#ancla).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Si la URL contiene un ancla interna (ej: #faq o #planes), permitir el scroll al elemento
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Al navegar a una nueva vista, resetear el scroll al tope inmediatamente
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname, hash]);

  return null;
}
