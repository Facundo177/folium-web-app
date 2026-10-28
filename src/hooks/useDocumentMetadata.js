import { useEffect } from "react";

const SITE_ORIGIN = "https://folium-psi.vercel.app";
const DEFAULT_TITLE = "Folium — Archivo y Biblioteca de Patrimonio";
const DEFAULT_DESCRIPTION =
  "Plataforma de preservación, consulta y gestión de colecciones bibliográficas, libros raros y archivos patrimoniales.";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/favicon.svg`;

/**
 * Hook universal para gestión de SEO, Meta Tags sociales, URLs Canónicas
 * y Datos Estructurados JSON-LD (Schema.org).
 *
 * @param {Object} options
 * @param {string} [options.title] - Título representativo de la vista
 * @param {string} [options.description] - Descripción concisa optimizada para SERPs
 * @param {string} [options.ogImage] - URL absoluta o relativa de la imagen/portada
 * @param {string} [options.canonicalPath] - Ruta canónica relativa (ej. "/catalog")
 * @param {boolean} [options.noIndex=false] - Si es true, inyecta 'noindex, nofollow' para rutas privadas
 * @param {Object|Array} [options.schema] - Objeto o arreglo Schema.org para JSON-LD
 */
export function useDocumentMetadata({
  title,
  description,
  ogImage,
  canonicalPath,
  noIndex = false,
  schema,
} = {}) {
  useEffect(() => {
    // 1. Título del Documento
    const fullTitle = title
      ? title.includes("Folium")
        ? title
        : `${title} | Folium`
      : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper para crear o actualizar etiquetas <meta>
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

    // 2. Descripción Meta, Open Graph y Twitter
    const descContent = description || DEFAULT_DESCRIPTION;
    setMetaTag("name", "description", descContent);
    setMetaTag("property", "og:description", descContent);
    setMetaTag("name", "twitter:description", descContent);

    // 3. Título Open Graph y Twitter
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:site_name", "Folium");
    setMetaTag("property", "og:locale", "es_ES");
    setMetaTag("name", "twitter:card", "summary_large_image");

    // 4. Imagen Open Graph y Twitter
    const imageContent = ogImage
      ? ogImage.startsWith("http")
        ? ogImage
        : `${SITE_ORIGIN}${ogImage}`
      : DEFAULT_IMAGE;
    setMetaTag("property", "og:image", imageContent);
    setMetaTag("name", "twitter:image", imageContent);

    // 5. Directiva Robots (Crawl Budget y Privacidad)
    setMetaTag("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    // 6. URL Canónica y og:url
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    const fullCanonicalUrl = canonicalPath
      ? `${SITE_ORIGIN}${canonicalPath.startsWith("/") ? "" : "/"}${canonicalPath}`
      : window.location.origin + window.location.pathname;
    canonicalLink.setAttribute("href", fullCanonicalUrl);
    setMetaTag("property", "og:url", fullCanonicalUrl);

    // 7. Schema.org JSON-LD Dinámico
    const scriptId = "dynamic-jsonld-schema";
    let scriptTag = document.getElementById(scriptId);

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = scriptId;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // Limpieza al desmontar
    return () => {
      const activeScript = document.getElementById(scriptId);
      if (activeScript) {
        activeScript.remove();
      }
    };
  }, [title, description, ogImage, canonicalPath, noIndex, schema]);
}

export default useDocumentMetadata;
