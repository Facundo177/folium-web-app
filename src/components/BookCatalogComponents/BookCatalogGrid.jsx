export default function BookCatalogGrid() {
  const books = [
    { id: 1, title: 'The Odyssey', author: 'Homer (Trans. Robert Fagles)', category: 'EPIC POETRY', year: '800 BCE', stock: 'In Stock', tag: 'CLOTHBOUND GOLD LEAF', image: 'https://via.placeholder.com/300x400?text=The+Odyssey' },
    { id: 2, title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', category: 'CLASSIC FICTION', year: '1844', stock: 'In Stock', tag: 'UNABRIDGED 2-VOL', image: 'https://via.placeholder.com/300x400?text=Monte+Cristo' },
    { id: 3, title: 'Meditations', author: 'Marcus Aurelius', category: 'PHILOSOPHY', year: '180 CE', stock: 'In Stock', tag: 'STOIC ARCHIVE', image: 'https://via.placeholder.com/300x400?text=Meditations' },
    { id: 4, title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', category: 'MAGIC REALISM', year: '1967', stock: '1 Copy Reserved', tag: '50TH ANNIV. EDITION', image: 'https://via.placeholder.com/300x400?text=Cien+Anos' },
    { id: 5, title: 'The Metamorphosis', author: 'Franz Kafka', category: 'MODERNIST PROSE', year: '1915', stock: 'In Stock', tag: 'SCHOCKEN CRITICAL', image: 'https://via.placeholder.com/300x400?text=Metamorphosis' },
  ];

  return (
    <section className="pt-2">
      {/* Header del Catálogo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-label-caps text-on-surface-variant mb-2">
            <span className="w-4 h-[1px] bg-outline-variant"></span> THE ARCHIVAL LEDGER
          </div>
          <h2 className="font-serif text-headline-md text-on-surface">Curated Discovery & Catalog</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Exquisite editions preserved under climate-governed chambers for lending and scholarly study.</p>
        </div>
        <button className="bg-surface-container-high text-on-surface font-medium px-4 py-2 rounded-DEFAULT flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
          <DiceIcon /> Surprise Me / Random Tome
        </button>
      </div>

      {/* Píldoras de Filtro */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-body-md font-medium">Curator's Choice</button>
        <button className="bg-surface-container-lowest border border-outline-variant text-on-surface px-4 py-1.5 rounded-full text-body-md hover:bg-surface-container transition-colors">Rare Classics</button>
        <button className="bg-surface-container-lowest border border-outline-variant text-on-surface px-4 py-1.5 rounded-full text-body-md hover:bg-surface-container transition-colors">Philosophical Inquiries</button>
        <button className="bg-surface-container-lowest border border-outline-variant text-on-surface px-4 py-1.5 rounded-full text-body-md hover:bg-surface-container transition-colors">Greek & Latin Epics</button>
        <button className="bg-surface-container-lowest border border-outline-variant text-on-surface px-4 py-1.5 rounded-full text-body-md hover:bg-surface-container transition-colors">Recently Acquired</button>
      </div>

      {/* Grid de Libros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}

function BookCard({ book }) {
  return (
    <div className="flex flex-col bg-surface-container-lowest border border-outline-variant rounded-DEFAULT overflow-hidden group">
      {/* Contenedor de Imagen */}
      <div className="relative aspect-[3/4] bg-surface-variant overflow-hidden">
        <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <button className="absolute top-2 right-2 w-8 h-8 bg-surface-container-lowest rounded-full flex items-center justify-center text-on-surface hover:text-tertiary-container shadow-sm">
          <HeartIcon />
        </button>
        <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-on-surface rounded-sm">
          {book.tag}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-label-caps text-on-surface-variant">{book.category} • {book.year}</span>
          <span className={`text-[10px] font-bold uppercase ${book.stock.includes('Stock') ? 'text-[#059669]' : 'text-on-surface-variant'}`}>{book.stock}</span>
        </div>
        
        <h3 className="font-serif text-title-lg text-on-surface leading-tight mb-1">{book.title}</h3>
        <p className="text-body-md text-on-surface-variant mb-4 flex-1">{book.author}</p>
        
        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/50 mt-auto">
          <button className="text-body-md text-on-surface-variant hover:text-on-surface transition-colors">Quick View</button>
          <button className="bg-primary text-on-primary px-4 py-2 text-sm font-medium rounded-DEFAULT hover:opacity-90 transition-opacity">Request Loan</button>
        </div>
      </div>
    </div>
  );
}

const DiceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/></svg>
);
const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);