export default function BookCuratedCollection() {
  const books = [
    {
      id: 1,
      edition: "EDICIÓN 1897",
      coverSubtitle: "TOMO DE ARCHIVO",
      coverTitle: "Archibald Constable",
      binding: "GILT-STAMPED MOROCCO",
      category: "GÓTICO • 1897",
      statusText: "Disponible en Sala",
      statusColor: "text-[#059669]", // Verde
      dotColor: "bg-[#059669]",
      title: "Drácula",
      author: "Bram Stoker",
      description: "La crónica epistolar definitiva del conde transilvano y su travesía espectral hacia Whitby y Londres."
    },
    {
      id: 2,
      edition: "LONDRES 1818",
      coverSubtitle: "THE MODERN PROMETHEUS",
      coverTitle: "Lackington, Hughes",
      binding: "PERGAMINO E HILO DE LINO",
      category: "TERROR ROMÁNTICO • 1818",
      statusText: "1 Ejemplar",
      statusColor: "text-[#059669]",
      dotColor: "bg-[#059669]",
      title: "Frankenstein",
      author: "Mary Shelley",
      description: "El moderno Prometeo y la desgarradora meditación sobre la creación, la soledad y la arrogancia científica."
    },
    {
      id: 3,
      edition: "FILADELFIA 1843",
      coverSubtitle: "TALES OF THE GROTESQUE",
      coverTitle: "The Saturday Post",
      binding: "ENCUADERNACIÓN EN TELA NEGRA",
      category: "RELATO MACABRO • 1843",
      statusText: "Disponible en Sala",
      statusColor: "text-[#059669]",
      dotColor: "bg-[#059669]",
      title: "El gato negro y otros relatos",
      author: "Edgar Allan Poe",
      description: "Exploración vertiginosa de la culpa, la demencia y la perversidad humana ilustrada por Harry Clarke."
    },
    {
      id: 4,
      edition: "WEIRD TALES 1928",
      coverSubtitle: "CTHULHU MYTHOS ARC",
      coverTitle: "Arkham House Archive",
      binding: "CUSTODIA ESPECIAL R-IV",
      category: "HORROR COSMICO • 1928",
      statusText: "En Custodia",
      statusColor: "text-[#d97706]", // Naranja/Amarillo oscuro
      dotColor: "bg-[#d97706]",
      title: "La llamada de Cthulhu",
      author: "H.P. Lovecraft",
      description: "El pavor primordial ante los Primigenios sumergidos en la ciudad no euclidiana de R'lyeh."
    }
  ];

  return (
    <section className="relative w-full bg-[#fdfbf7] py-16 px-6 md:px-12 font-sans overflow-hidden">

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Cabecera de la Sección */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
          
          <div className="flex-1">
            {/* Eyebrow / Etiqueta superior */}
            <div className="flex items-center gap-3 text-[#5c1616] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              <span className="w-12 h-[1px] bg-[#5c1616]"></span>
              Gabinete Especial • Curaduría Selecta
            </div>
            
            {/* Título Principal */}
            <h2 className="font-serif text-4xl md:text-5xl text-[#d1c5a5] drop-shadow-sm mb-3">
              Terror Gótico & Clásicos Oscuros
            </h2>
            
            {/* Subtítulo */}
            <p className="font-serif italic text-lg text-[#5a5446]">
              Manuscritos, primeras ediciones victorianas y volúmenes de horror cósmico preservados en la cámara baja.
            </p>
          </div>

          {/* Acciones del lado derecho */}
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-[#8b7d6b] tracking-[0.15em] uppercase font-semibold">
              4 Volúmenes Catalogados
            </span>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#ede6d3] border border-[#d8d0bb] text-[#5a5446] text-[10px] font-bold tracking-widest uppercase hover:bg-[#e4dcbc] transition-colors rounded-sm shadow-sm">
              Ver Serie Completa
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        {/* Grilla de Libros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div 
              key={book.id} 
              className="bg-[#f4ecd8] border border-[#d8d0bb] rounded-md p-3.5 shadow-lg flex flex-col hover:shadow-xl transition-shadow duration-300"
            >
              
              {/* Representación de la Tapa del Libro (Área Oscura) */}
              <div className="relative w-full h-[340px] bg-[#1a1a1a] rounded-sm p-5 flex flex-col items-center justify-center border-4 border-[#2a2a2a] overflow-hidden">
                
                {/* Marco interno fino (filigrana) */}
                <div className="absolute inset-2 border border-white/10 pointer-events-none"></div>

                {/* Badge Superior Izquierdo */}
                <span className="absolute top-4 left-4 text-[#f4ecd8] text-[8px] font-bold tracking-[0.2em] uppercase bg-[#1a1a1a] px-1">
                  {book.edition}
                </span>

                {/* Icono Superior Derecho */}
                <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                  <HeartIcon />
                </button>

                {/* Textos Centrales de la Tapa */}
                <span className="text-[#c2b280] text-[9px] tracking-[0.25em] uppercase mb-3 text-center">
                  {book.coverSubtitle}
                </span>
                <h3 className="font-serif italic text-2xl text-[#f4ecd8] text-center px-4 leading-snug">
                  {book.coverTitle}
                </h3>

                {/* Badge Inferior */}
                <span className="absolute bottom-5 text-[#f4ecd8] text-[8px] font-bold tracking-[0.2em] uppercase bg-[#141414] px-3 py-1 border border-[#5c1616]/30">
                  {book.binding}
                </span>
              </div>

              {/* Contenido / Información del Libro */}
              <div className="flex flex-col flex-1 pt-5 px-1">
                
                {/* Metadatos (Categoría y Estado) */}
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#5a5446]">
                    {book.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${book.dotColor}`}></span>
                    <span className={`text-[10px] font-semibold ${book.statusColor}`}>
                      {book.statusText}
                    </span>
                  </div>
                </div>

                {/* Título y Autor */}
                <h4 className="font-serif text-2xl text-[#1a1a1a] leading-none mb-1.5">
                  {book.title}
                </h4>
                <p className="font-serif italic text-[15px] text-[#8b7d6b] mb-3">
                  {book.author}
                </p>

                {/* Descripción */}
                <p className="text-[12px] text-[#5a5446] leading-relaxed flex-1">
                  {book.description}
                </p>

                {/* Botones de Acción */}
                <div className="flex justify-between items-center pt-5 mt-4 border-t border-[#d8d0bb]">
                  <button className="text-[#8b4513] text-[10px] uppercase font-bold tracking-[0.2em] hover:text-[#5c1616] transition-colors">
                    Ver Ficha
                  </button>
                  <button className="bg-[#5c1616] text-[#f4ecd8] px-5 py-2 text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#4a1010] shadow-sm transition-all active:scale-95">
                    Reservar
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ==========================================
// Íconos SVG
// ==========================================

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);