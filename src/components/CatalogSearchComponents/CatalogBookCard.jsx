export default function CatalogBookCard({ book }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-inverse-surface border border-outline-variant/20 rounded-md p-4 flex flex-col hover:border-on-tertiary-container transition-colors group cursor-pointer shadow-lg animate-fade-in">
      {/* Tapa del Libro */}
      <div className="relative w-full aspect-[2/3] bg-primary-container border border-outline-variant/30 mb-5 flex flex-col justify-between p-3 overflow-hidden shadow-inner">
        <div className="flex items-start justify-between z-10">
          <span className="bg-tertiary-container text-on-tertiary px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm">
            ★ {book.tag}
          </span>
          <button className="text-outline hover:text-on-tertiary-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              favorite
            </span>
          </button>
        </div>

        <div className="my-auto text-center z-10">
          <span className="text-[9px] text-on-tertiary-container tracking-[0.2em] uppercase font-bold block mb-1">
            {book.coverTitle}
          </span>
          <span className="font-serif text-3xl text-on-primary italic font-normal px-2 block leading-none">
            {book.title}
          </span>
        </div>

        <span className="text-[9px] text-outline uppercase tracking-[0.2em] text-center font-bold z-10">
          {book.binding}
        </span>
      </div>

      {/* Información y Acción */}
      <div className="flex flex-col flex-1">
        <h4 className="text-sm text-on-primary font-bold uppercase tracking-widest mb-1 line-clamp-1">
          {book.title}
        </h4>
        <p className="text-xs text-outline mb-2 font-serif italic">
          {book.author}
        </p>
        <span className="text-lg text-on-primary font-bold mb-5">
          {formatPrice(book.price)}
        </span>

        {/* Botón Comprar/Reservar */}
        <button className="mt-auto w-full bg-tertiary-container hover:bg-on-tertiary-fixed-variant text-on-tertiary py-2.5 rounded-sm flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors">
          Comprar
          <span className="material-symbols-outlined text-[16px]">lock</span>
        </button>
      </div>
    </div>
  );
}
