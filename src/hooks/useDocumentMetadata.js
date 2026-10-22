import { useEffect } from "react";

/**
 * Hook ligero nativo para actualizar el título del documento,
 * meta description y etiquetas Open Graph dinámicamente según la página.
 *
 * @param {Object} options
 * @param {string} [options.title] - Título de la página actual
 * @param {string} [options.description] - Descripción breve para SEO
 * @param {string} [options.ogImage] - URL absoluta de la portada o imagen representativa
 */
export function useDocumentMetadata({ title, description, ogImage } = {}) {
  useEffect(() => {
    const baseTitle = "Folium — Archivo y Biblioteca";
    const fullTitle = title ? `${title} | Folium` : baseTitle;
    document.title = fullTitle;

    const setMetaTag = (attribute, name, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    if (description) {
      setMetaTag("name", "description", description);
      setMetaTag("property", "og:description", description);
    }

    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:type", "website");

    if (ogImage) {
      setMetaTag("property", "og:image", ogImage);
    }
  }, [title, description, ogImage]);
}

export default useDocumentMetadata;
