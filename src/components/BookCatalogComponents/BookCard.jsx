import { useBook } from "../../hooks/useBook";
import HeartIcon from "../BasicUIComponents/HeartIcon";

export default function BookCard({
  quickView,
  requestLoan,
  onFavourite,
  styles,
  onClick,
  idx,
  currentIndex,
  id,
}) {
  const { book, isLoading, error } = useBook(id);

  // Estado de Carga: Mantiene la estructura del Coverflow para que no se rompa la vista 3D
  if (isLoading || !book) {
    return (
      <div
        className="coverflow-item absolute w-[360px] h-[550px] bg-surface-container border-2 border-outline-variant/50 rounded-md shadow-2xl p-4 flex flex-col items-center justify-center transition-all"
        style={styles}
      >
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Estado de Error
  if (error) {
    return (
      <div
        className="coverflow-item absolute w-[360px] h-[550px] bg-surface-container border-2 border-error/50 rounded-md shadow-2xl p-4 flex flex-col items-center justify-center text-center transition-all"
        style={styles}
      >
        <span className="text-error font-bold text-sm">Error al cargar datos</span>
      </div>
    );
  }

  // Extracción segura de datos con Optional Chaining (?.) por si la base de datos devuelve arrays vacíos
  const title = book.title;
  const author = book.authors?.map((a) => a.name + " " + a.last_name).join(", ") || "Autor desconocido";
  const category = book.genres?.map((g) => g.name).join(", ") || "General";
  const year = book.publication_year;
  const stock = book.stock || "Disponible"; // Fallback si no tienes el campo en Django
  const tag = book.tag || "ARCHIVO"; 
  const description = book.description;
  const image = book.cover_image;

  return (
    <div
      key={id}
      className={`coverflow-item absolute w-90 h-160 bg-surface-container border-2 border-outline-variant/50 rounded-md shadow-2xl p-4 flex flex-col transition-all ${idx === currentIndex ? "is-active" : "cursor-pointer"}`}
      style={styles}
      onClick={onClick}
    >
      {/* Contenedor de Imagen y Tag */}
      <div className="relative w-full h-100 mb-4 bg-surface-container-highest overflow-hidden border border-outline-variant/30 rounded-sm">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover object-top" />  // object-cover
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container-highest text-on-surface-variant font-serif italic">
            Sin portada
          </div>
        )}

        <button 
          className="absolute top-3 right-3 w-10 h-10 bg-surface-container-lowest/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface hover:text-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation(); // Evita que gire el coverflow
            onFavourite(e);
          }}
        >
          <span className="w-full h-full content-center justify-items-center hover:scale-110 transition-transform cursor-pointer">
            <HeartIcon />
          </span>
        </button>

        <div className="absolute bottom-3 left-3 bg-inverse-surface px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-inverse-on-surface rounded-sm shadow-sm">
          {tag}
        </div>
      </div>

      {/* Información del Libro */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold tracking-widest uppercase text-on-tertiary">
          {category} • {year}
        </span>
        <span className="text-[11px] font-bold text-on-surface-variant">
          ● {stock}
        </span>
      </div>

      <h3 className="font-serif text-3xl text-on-surface leading-none mb-1 pb-2 line-clamp-1">
        {title}
      </h3>
      <p className="font-serif italic text-lg text-on-surface-variant mb-4 line-clamp-1">
        {author}
      </p>

      <div className="flex flex-col flex-grow">
        <p className="font-body-md text-xs text-on-surface-variant/80 line-clamp-2 mb-3">
          {description}
        </p>

        {/* Botones de Acción */}
        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30 mt-auto">
          <button
            className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              quickView(e);
            }}
          >
            Vista rápida
          </button>
          
          <button
            className={`bg-primary text-on-primary px-6 py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm shadow-md transition-all ${
              idx === currentIndex 
                ? "hover:opacity-90 cursor-pointer" 
                : "pointer-events-none opacity-50"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              requestLoan(e);
            }}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}