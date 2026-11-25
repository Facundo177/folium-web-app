import { useState } from "react";

/**
 * Renderiza una imagen de portada con fallback automático ante error de carga (`onError`).
 * Reinicia el estado de error automáticamente si `src` cambia, sin requerir `useEffect`.
 */
export default function BookCoverImage({
  src,
  alt = "",
  className = "",
  fallback = null,
  overlay = null,
  ...imgProps
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const canRenderImage = Boolean(src) && failedSrc !== src;

  if (!canRenderImage) {
    return fallback;
  }

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setFailedSrc(src)}
        {...imgProps}
      />
      {overlay}
    </>
  );
}
