export default function BookCover({ imageSrc, title }) {
  return (
    <div className="border border-outline-variant rounded-DEFAULT bg-surface-container-lowest p-gutter flex flex-col justify-center items-center h-full shadow-sm">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={title}
          decoding="async"
          className="w-full max-w-62 object-contain drop-shadow-md aspect-[2/3]"
        />
      ) : (
        /* Portada Clásica Ornamental cuando no hay imagen */
        <div className="w-70 h-100 flex flex-col justify-between p-5 bg-primary-container text-on-primary-container relative select-none">
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
