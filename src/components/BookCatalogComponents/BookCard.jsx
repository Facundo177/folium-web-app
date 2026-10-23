import { useBook } from "../../hooks/useBook";
import HeartIcon from "../BasicUIComponents/HeartIcon";

export default function BookCard({
  book: initialBook,
  quickView,
  requestLoan,
  onFavourite,
  isFavorite = false,
  isReservedByUser = false,
  styles,
  onClick,
  idx,
  currentIndex,
  id,
}) {
  const { book: fetchedBook, isLoading: fetchingBook, error: fetchError } = useBook(
    initialBook ? null : id
  );
  const book = initialBook || fetchedBook;
  const isLoading = !book && fetchingBook;
  const error = !book && fetchError;
  const isActive = idx === currentIndex;

  // Estado de Carga: Mantiene la estructura y dimensiones exactas del Coverflow
  if (isLoading || !book) {
    return (
      <div
        className="coverflow-item absolute w-90 h-160 bg-surface-container border-2 border-outline-variant/50 rounded-md shadow-2xl p-5 flex flex-col items-center justify-center transition-all duration-500"
        style={styles}
      >
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="font-serif italic text-sm text-on-surface-variant tracking-wide">
          Consultando archivo…
        </span>
      </div>
    );
  }

  // Estado de Error
  if (error) {
    return (
      <div
        className="coverflow-item absolute w-90 h-160 bg-surface-container border-2 border-error/50 rounded-md shadow-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-500"
        style={styles}
      >
        <span className="text-error font-bold text-xs uppercase tracking-widest">
          Error al cargar datos
        </span>
      </div>
    );
  }

  // Extracción segura de datos con Optional Chaining (?.) por si la base de datos devuelve arrays vacíos
  const title = book.title;
  const author =
    (Array.isArray(book.authors) && book.authors.length > 0
      ? book.authors
          .map((a) =>
            typeof a === "object" && a !== null
              ? `${a.name || ""} ${a.last_name || ""}`.trim()
              : String(a || "")
          )
          .filter(Boolean)
          .join(", ")
      : null) ||
    (typeof book.author === "string" ? book.author : null) ||
    "Autor desconocido";
  const category =
    (Array.isArray(book.genres) && book.genres.length > 0
      ? book.genres
          .map((g) =>
            typeof g === "object" && g !== null
              ? g.name
              : typeof g === "string"
              ? g
              : ""
          )
          .filter(Boolean)
          .join(", ")
      : null) ||
    (typeof book.category === "string" ? book.category : null) ||
    "General";
  const year = book.publication_year ?? book.year ?? "";
  const availableItems =
    typeof book.available_items === "number"
      ? book.available_items
      : Array.isArray(book.available_items)
      ? book.available_items.length
      : Array.isArray(book.items)
      ? book.items.filter((i) => i.status === "AVAILABLE").length
      : typeof book.availableItems === "number"
      ? book.availableItems
      : typeof book.stock === "number"
      ? book.stock
      : null;

  const totalItems =
    typeof book.total_items === "number"
      ? book.total_items
      : Array.isArray(book.total_items)
      ? book.total_items.length
      : Array.isArray(book.items)
      ? book.items.length
      : typeof book.totalItems === "number"
      ? book.totalItems
      : null;

  // Determinar si hay ejemplares libres para reservar
  const hasAvailableCopies =
    availableItems !== null
      ? availableItems > 0
      : totalItems !== null && totalItems === 0
      ? false
      : book.stock
      ? book.stock !== "Sin ejemplares" && book.stock !== "Agotado"
      : false;

  const isReservable = hasAvailableCopies && !isReservedByUser;

  const stock = isReservedByUser
    ? "Reservado"
    : hasAvailableCopies
    ? "Disponible"
    : "Sin ejemplares";
  const tag = book.tag || "ARCHIVO";
  const description = book.description;
  const image = book.cover_image ?? book.cover ?? null;

  return (
    <div
      key={id}
      className={`coverflow-item group/card absolute w-90 h-160 bg-surface-container rounded-md p-5 flex flex-col transition-all duration-500 ${
        isActive
          ? "is-active border-2 border-outline/70 shadow-[0_25px_50px_-12px_rgba(28,19,20,0.55)]"
          : "cursor-pointer border-2 border-outline-variant/50 shadow-2xl hover:border-outline/50"
      }`}
      style={styles}
      onClick={onClick}
    >
      {/* Marco interior ornamental sutil */}
      <div className="pointer-events-none absolute inset-1.5 border border-outline-variant/25 rounded-[3px]" />

      {/* Cinta Marcadora (Favoritos) */}
      <div className="absolute -top-1.5 right-6 z-50 flex drop-shadow-md">
        {/* El doblez 3D (Triángulo oscuro que se mete por detrás del borde de la tarjeta) */}
        <div
          className="w-1.5 h-1.5 bg-outline-variant absolute -left-1.5 top-0"
          style={{
            clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
            filter: "brightness(0.55)",
          }}
        />

        <button
          title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          className={`w-10 h-16 hover:h-17.5 flex flex-col items-center pt-4 transition-all duration-300 group/fav cursor-pointer border-x border-b border-outline-variant/60 ${
            isFavorite
              ? "bg-primary text-on-primary"
              : "bg-surface-container-lowest hover:bg-primary"
          }`}
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onFavourite(e);
          }}
        >
          <span
            className={`transition-all transform group-hover/fav:scale-110 duration-200 ${
              isFavorite
                ? "text-on-primary"
                : "text-on-surface-variant group-hover/fav:text-on-primary"
            }`}
          >
            <HeartIcon className="w-5 h-5" filled={isFavorite} />
          </span>
        </button>
      </div>

      {/* Pedestal y Volumen del Libro (Efecto de Encuadernación Física) */}
      <div className="relative w-full py-3 mb-3 flex items-center justify-center bg-surface-container-low/45 border border-outline-variant/30 rounded-sm shadow-inner">
        {/* Contenedor del Tomo 3D */}
        <div
          className="relative w-54 h-82  overflow-hidden transition-transform duration-500 group-hover/card:scale-[1.04]"
          //  style={{
          //    boxShadow:
          //      "2px 0 0 #fbf6ec, 3px 0 0 #cbb89d, 4px 0 0 #fbf6ec, 5px 0 0 #b8a386, 10px 14px 24px -4px rgba(20, 13, 14, 0.45), 0 4px 10px rgba(20, 13, 14, 0.2)",
          //  }}
        >
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover object-top transition-transform duration-700"
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
                  {author}
                </span>
                <div className="w-6 h-[1px] bg-outline/50 mx-auto mt-3" />
              </div>

              <span className="text-[9px] tracking-[0.2em] uppercase text-outline/75 text-center font-bold z-10 mb-1">
                {year || tag}
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


          {/* Brillo ambiental sutil sobre la cubierta */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/15 z-10" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/15 rounded-l-[2px] rounded-r-[4px] z-20" />
       
        </div>
      </div>

      {/* Metadatos del Libro (Categoría, Año y Disponibilidad) */}
      <div className="flex justify-between items-center gap-2 mb-2 z-10">
        <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-primary dark:text-outline truncate">
          {category} {year ? `• ${year}` : ""}
        </span>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wider uppercase transition-colors ${
            isReservedByUser
              ? "bg-secondary-container/40 border-secondary/30 text-on-surface"
              : hasAvailableCopies
              ? "bg-surface-container-lowest/75 border-outline-variant/40 text-on-surface-variant"
              : "bg-error-container/20 border-error/30 text-error"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isReservedByUser
                ? "bg-secondary"
                : hasAvailableCopies
                ? "bg-primary animate-pulse"
                : "bg-error"
            }`}
          />
          {stock}
        </span>
      </div>

      {/* Título y Autor */}
      <div className="z-10 mb-2">
        <h3
          className="font-serif text-[26px] font-medium text-on-surface leading-tight tracking-tight line-clamp-1"
          title={title}
        >
          {title}
        </h3>
        <p
          className="font-serif italic text-base text-on-surface-variant line-clamp-1 mt-0.5"
          title={author}
        >
          {author}
        </p>
      </div>

      {/* Descripción y Botones de Acción */}
      <div className="flex flex-col flex-grow z-10">
        <p className="font-sans text-xs text-on-surface/75 leading-relaxed line-clamp-2 mb-3">
          {description || "Ejemplar catalogado en la colección general de Folium."}
        </p>

        {/* Botones de Acción */}
        <div className="flex justify-between items-center pt-3 border-t border-outline-variant/40 mt-auto">
          <button
            className="group/qv inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              quickView(e);
            }}
          >
            <span className="border-b border-transparent group-hover/qv:border-primary transition-colors pb-0.5">
              Vista rápida
            </span>
          </button>

          <button
            disabled={!isReservable}
            className={`border px-5 py-2 text-[11px] font-bold tracking-widest uppercase rounded-sm shadow-md transition-all duration-200 ${
              !isReservable
                ? "bg-surface-container-highest text-on-surface-variant/40 border-outline-variant/30 cursor-not-allowed pointer-events-none opacity-60"
                : isActive
                ? "bg-primary text-on-primary border-outline/30 hover:opacity-95 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                : "bg-primary text-on-primary border-outline/30 pointer-events-none opacity-45"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isReservable) return;
              requestLoan(e);
            }}
          >
            {isReservedByUser
              ? "Ya reservado"
              : hasAvailableCopies
              ? "Reservar"
              : "Sin stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
