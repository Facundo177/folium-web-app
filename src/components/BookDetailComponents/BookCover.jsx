import { useRef } from "react";

export default function BookCover({ imageSrc, title }) {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      // Coordenadas normalizadas [-1, 1] respecto al centro del rectángulo
      const normX = Math.max(-1, Math.min(1, (x / rect.width) * 2 - 1));
      const normY = Math.max(-1, Math.min(1, (y / rect.height) * 2 - 1));

      const maxRotateX = 12; // Grados máximos de inclinación vertical
      const maxRotateY = 14; // Grados máximos de inclinación horizontal

      // Inclinación dinámica hacia la posición del cursor
      const rotX = (-normY * maxRotateX).toFixed(2);
      const rotY = (normX * maxRotateY).toFixed(2);

      // Desplazamiento dinámico de la sombra
      const shadowX = (-normX * 16).toFixed(1);
      const shadowY = (16 - normY * 10).toFixed(1);

      if (cardRef.current) {
        cardRef.current.style.transition = "transform 0.08s ease-out, filter 0.08s ease-out";
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.025, 1.025, 1.025)`;
        cardRef.current.style.filter = `drop-shadow(${shadowX}px ${shadowY}px 28px rgba(0, 0, 0, 0.35))`;
      }

      if (glareRef.current) {
        glareRef.current.style.opacity = "0.35";
        glareRef.current.style.background = `radial-gradient(circle 260px at ${x}px ${y}px, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0) 70%)`;
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      cardRef.current.style.filter = "drop-shadow(0 14px 24px rgba(0, 0, 0, 0.22))";
    }

    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
      glareRef.current.style.transition = "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleMouseLeave}
      className="relative select-none cursor-pointer book-interactive-tilt rounded-DEFAULT w-full aspect-[2/3] overflow-hidden flex items-center justify-center"
      style={{
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        filter: "drop-shadow(0 14px 24px rgba(0, 0, 0, 0.22))",
        willChange: "transform, filter",
      }}
    >
      {/* Capa de reflejo especular reactivo al cursor */}
      <div
        ref={glareRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 rounded-DEFAULT opacity-0 transition-opacity duration-300"
        style={{ mixBlendMode: "overlay" }}
      />

      {imageSrc ? (
        <img
          src={imageSrc}
          alt={title}
          decoding="async"
          fetchPriority="high"
          className="w-full h-full object-cover rounded-DEFAULT pointer-events-none"
        />
      ) : (
        /* Portada Clásica Ornamental cuando no hay imagen */
        <div className="w-full h-full flex flex-col justify-between p-5 bg-primary-container text-on-primary-container relative select-none">
          {/* Marco dorado interno de encuadernación */}
          <div className="pointer-events-none absolute inset-2.5 border border-outline/40 rounded-[2px]" />
          <div className="pointer-events-none absolute inset-3.5 border border-outline/20 rounded-[1px]" />

          <span className="text-[9px] tracking-[0.25em] uppercase text-outline text-center font-bold z-10 mt-1">
            Edición de Archivo
          </span>

          <div className="my-auto text-center z-10 px-2">
            <div className="w-6 h-[1px] bg-outline/50 mx-auto mb-3" />
            <span className="font-serif italic text-2xl text-on-primary-container leading-snug line-clamp-3 block">
              {title}
            </span>
            <span className="font-sans text-[10px] uppercase tracking-widest text-outline/80 mt-2 block line-clamp-1">
             
            </span>
            <div className="w-6 h-[1px] bg-outline/50 mx-auto mt-3" />
          </div>

          <span className="text-[9px] tracking-[0.2em] uppercase text-outline/75 text-center font-bold z-10 mb-1">
            
          </span>
          {/* Efecto de Lomo y Pliegue de Encuadernación (Spine crease & lighting) */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-6 z-20"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(255,255,255,0.18) 28%, rgba(0,0,0,0.22) 52%, rgba(255,255,255,0.08) 70%, transparent 100%)",
            }}
          />
          {/* Hendidura del lomo */}
          <div className="pointer-events-none absolute inset-y-0 left-3 w-[1px] bg-black/30 shadow-[1px_0_0_rgba(255,255,255,0.2)] z-20" />
        </div>
      )}
    </div>
  );
}
