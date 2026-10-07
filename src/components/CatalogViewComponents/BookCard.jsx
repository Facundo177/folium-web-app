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
  title,
  author,
  category,
  year,
  stock,
  tag,
  description,
  image,
}) {
  return (
    <div
      key={id}
      className={`coverflow-item absolute w-[360px] h-[550px] bg-[#f4ecd8] border-2 border-[#d8d0bb] rounded-md shadow-2xl p-4 flex flex-col transition-all ${idx === currentIndex ? "is-active" : "cursor-pointer"}`}
      style={styles}
      onClick={onClick}
    >
      {/* Contenedor de Imagen y Tag */}
      <div className="relative w-full h-[300px] mb-4 bg-surface-variant overflow-hidden border border-[#d8d0bb]">
        <img src={image} alt={title} className="w-full h-full object-cover" />

        <button className="absolute top-3 right-3 w-10 h-10 bg-surface-container-lowest/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface  hover:text-rose-400"
                onClick={onFavourite}>
                    <span className="w-full h-full content-center justify-items-center hover:scale-125 cursor-pointer">

          <HeartIcon />
                    </span>
        </button>

        <div className="absolute bottom-3 left-3 bg-[#1a1a1a] px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-white rounded-sm">
          {tag}
        </div>
      </div>

      {/* Información del Libro */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#8b4513]">
          {category} • {year}
        </span>
        <span className="text-[11px] font-bold text-[#059669]">● {stock}</span>
      </div>

      <h3 className="font-serif text-3xl text-on-surface leading-none mb-2">
        {title}
      </h3>
      <p className="font-serif italic text-lg text-on-surface-variant mb-4">
        {author}
      </p>

      <div className="flex flex-col flex-grow">
        <p className="font-body-md text-xs text-antique/80 dark:text-butcher/70 line-clamp-2 mb-3">
          {description}
        </p>

        {/* Botones de Acción */}
        <div className="flex justify-between items-center pt-4 border-t border-[#d8d0bb] mt-auto">
          <button
            className="text-[11px] font-bold tracking-widest uppercase text-[#8b4513] hover:text-[#5c1616] transition-colors cursor-pointer"
            onClick={quickView}
          >
            Vista rápida
          </button>
          <button
            className={`bg-[#5c1616] text-[#f4ecd8] px-6 py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm shadow-md transition-all ${idx == currentIndex ? "hover:bg-[#4a1010] cursor-pointer" : "pointer-events-none"}`}
            onClick={requestLoan}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}
