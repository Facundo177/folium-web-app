const gothicBooks = [
  {
    id: 1,
    title: "Drácula",
    author: "Bram Stoker",
    edition: "Edición 1897",
    binding: "Gilt-Stamped Morocco",
    tag: "Archival Tome",
    coverTitle: "Archibald Constable",
    category: "Gótico • 1897",
    status: "Disponible en Sala",
    desc: "La crónica epistolar definitiva del conde transilvano...",
  },
  {
    id: 2,
    title: "Frankenstein",
    author: "Mary Shelley",
    edition: "Londres 1818",
    binding: "Pergamino & Hilo Lino",
    tag: "The Modern Prometheus",
    coverTitle: "Lackington, Hughes",
    category: "Terror Romántico • 1818",
    status: "1 Ejemplar",
    desc: "El moderno Prometeo y la desgarradora meditación...",
  },
];

export default function CuratedCollection({ onOpenModal, showToast }) {
  return (
    <section className="w-full max-w-container-max mx-auto px-margin-edge py-stack-lg border-t border-butcher/30 dark:border-rooster">
      {/* SECCIÓN 1 */}
      <div className="flex flex-col gap-stack-lg">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-butcher/30 dark:border-rooster">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-[2px] bg-vampire"></span>
              </div>
              <h3
                className="font-headline-md text-3xl sm:text-[42px] font-normal tracking-wide text-[#c8b99d]"
                style={{
                  textShadow:
                    "rgba(181, 151, 133, 0.4) 0px 2px 8px, rgba(85, 65, 47, 0.25) 0px 1px 2px",
                }}
              >
                Terror Gótico & Clásicos Oscuros
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-cinzel text-xs text-antique/70 dark:text-butcher/70 tracking-wider uppercase">
                2 Volúmenes
              </span>
              <button className="px-4 py-2 rounded bg-[#ede6d8] dark:bg-rooster/80 border border-[#d8cfbe] dark:border-rooster font-cinzel text-xs font-semibold tracking-wider flex items-center gap-1.5 uppercase">
                Ver serie completa{" "}
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {gothicBooks.map((book) => (
              <div
                key={book.id}
                className="bg-parchment-card dark:bg-[#1b1513] rounded-xl p-5 border border-butcher/40 dark:border-rooster antique-box-border shadow-xl hover:border-vampire dark:hover:border-butcher/60 transition-all flex flex-col justify-between group"
              >
                {/* Tapa del Libro Estilizada */}
                <div className="relative w-full aspect-[2/3] rounded-lg bg-[#181210] overflow-hidden mb-4 border border-butcher/20 dark:border-rooster flex flex-col justify-between p-4 shadow-inner">
                  <div className="flex items-start justify-between">
                    <span className="px-2 py-0.5 bg-rooster text-[#f4ecd8] border border-vampire/50 rounded text-[10px] font-cinzel uppercase font-semibold">
                      {book.edition}
                    </span>
                    <button
                      className="w-8 h-8 rounded-full bg-sheep/90 text-butcher hover:text-rose-400 border border-rooster flex items-center justify-center shadow-sm transition-colors"
                      onClick={() => showToast(`Guardado en favoritos`)}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        favorite
                      </span>
                    </button>
                  </div>
                  <div className="my-auto text-center py-6">
                    <span className="font-cinzel text-[10px] text-butcher tracking-[0.2em] uppercase block mb-1">
                      {book.tag}
                    </span>
                    <span className="font-headline-sm text-2xl text-[#f4ecd8] italic font-normal">
                      {book.coverTitle}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-sheep/90 text-[10px] font-cinzel text-butcher border border-rooster rounded text-center">
                    {book.binding}
                  </span>
                </div>

                <div className="flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-cinzel text-[11px] text-vampire dark:text-butcher uppercase font-semibold">
                      {book.category}
                    </span>
                    <span className="text-[12px] text-emerald-700 dark:text-amber-300 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-amber-400"></span>
                      {book.status}
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-[21px] text-sheep dark:text-[#f4ecd8] font-normal leading-tight">
                    {book.title}
                  </h4>
                  <p className="font-body-md text-sm text-antique dark:text-butcher/90 mb-2 italic">
                    {book.author}
                  </p>
                  <p className="font-body-md text-xs text-antique/80 dark:text-butcher/70 line-clamp-2 mb-4 leading-relaxed">
                    {book.desc}
                  </p>

                  <div className="mt-auto pt-3 border-t border-butcher/30 dark:border-rooster flex items-center justify-between gap-2">
                    <button
                      className="font-cinzel text-xs text-vampire dark:text-butcher hover:underline tracking-wider"
                      onClick={() => onOpenModal(book)}
                    >
                      Ver Ficha
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-vampire hover:bg-rooster text-[#f4ecd8] border border-vampire font-cinzel text-xs tracking-wider"
                      onClick={() =>
                        showToast(`Reserva iniciada para ${book.title}`)
                      }
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
