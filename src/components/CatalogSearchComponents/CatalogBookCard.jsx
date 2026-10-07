import { useNavigate } from "react-router-dom";

export default function CatalogBookCard({ book }) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/book/${book.id}`)}
      className="bg-surface-container border border-outline-variant/50 rounded-md p-4 flex flex-col hover:border-primary transition-colors group cursor-pointer shadow-md hover:shadow-lg animate-fade-in"
    >
      {/* Tapa del Libro */}
      <div className="relative w-full aspect-[2/3] bg-surface-container-highest border border-outline-variant/30 mb-5 flex flex-col justify-between p-3 overflow-hidden shadow-inner rounded-sm">
        
        {/* 1. Imagen real (solo si existe) */}
        {book.cover && (
          <img
            src={book.cover}
            alt={book.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Overlay sutil para garantizar lectura de la etiqueta y el corazón si hay imagen */}
        {book.cover && <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none" />}

        {/* 2. Fila de arriba: SIEMPRE se muestra */}
        <div className="flex items-start justify-between z-10">
          <span className="bg-primary text-on-primary px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
            ★ {book.category}
          </span>
          <button 
            onClick={(e) => e.stopPropagation()} 
            className="text-outline hover:text-primary transition-colors bg-surface-container-lowest/60 backdrop-blur-sm rounded-full p-1 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[16px] block">favorite</span>
          </button>
        </div>

        {/* 3. Portada de texto: SOLO si NO hay imagen */}
        {!book.cover && (
          <>
            <div className="my-auto text-center z-10">
              <span className="font-serif text-3xl text-on-surface italic font-normal px-2 block leading-none">
                {book.title}
              </span>
            </div>

            <span className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] text-center font-bold z-10">
              {book.year}
            </span>
          </>
        )}
      </div>

      {/* Información y Acción */}
      <div className="flex flex-col flex-1">
        <h4 className="text-sm text-on-surface font-bold uppercase tracking-widest mb-1 line-clamp-1">
          {book.title}
        </h4>
        <p className="text-xs text-on-surface-variant mb-4 font-serif italic">
          {book.author}
        </p>

        {/* Botón Comprar/Reservar */}
        <button 
          onClick={(e) => e.stopPropagation()} 
          className="mt-auto w-full bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container border border-outline-variant/30 py-2.5 rounded-sm flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Reservar
          <span className="material-symbols-outlined text-[16px]">lock</span>
        </button>
      </div>
    </div>
  );
}