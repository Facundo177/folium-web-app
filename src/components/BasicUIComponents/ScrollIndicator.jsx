import { useState, useEffect } from 'react';

export default function ScrollIndicator() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // 150 es la cantidad de píxeles que el usuario debe bajar para que desaparezca por completo.
      // Puedes aumentar o disminuir este número según prefieras.
      const newOpacity = Math.max(0, 1 - scrollY / 700);
      setOpacity(newOpacity);
    };

    // Añadimos el evento de scroll con { passive: true } para mejor rendimiento
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Limpiamos el evento al desmontar el componente
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Si la opacidad llega a 0, podemos evitar renderizarlo o dejar que style maneje la opacidad
  if (opacity <= 0) return null;

  return (
    <div 
      style={{ opacity }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-stack-sm z-10 transition-opacity duration-75 pointer-events-none"
    >
      <span className="text-label-caps text-on-surface-variant">
        Desplazar
      </span>
      <svg
        className="w-4 h-4 text-on-surface-variant"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}