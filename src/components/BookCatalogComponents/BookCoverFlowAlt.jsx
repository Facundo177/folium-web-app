import { useState } from "react";
import { motion } from "framer-motion";

export default function BookCoverFlowAlt() {
  const [activeIndex, setActiveIndex] = useState(2);
  const [activeFilter, setActiveFilter] = useState("Curator's Choice");

  const filters = [
    "Curator's Choice", "Rare Classics", "Philosophical Inquiries", 
    "Greek & Latin Epics", "Recently Acquired"
  ];

  const books = [
    { 
      id: 1, title: 'The Odyssey', author: 'Homer (Trans. Fagles)', 
      category: 'EPIC POETRY', year: '800 BCE', stock: 'In Stock', 
      tag: 'CLOTHBOUND GOLD LEAF', 
      description: 'The definitive heroic saga of Odysseus\'s ten-year journey home from Troy, illustrated with archival engravings.',
      image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=600&auto=format&fit=crop' 
    },
    { 
      id: 2, title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', 
      category: 'CLASSIC FICTION', year: '1844', stock: 'In Stock', 
      tag: 'UNABRIDGED 2-VOL', 
      description: 'An intricate masterpiece of retribution, hidden identities, and ultimate justice set across the Mediterranean.',
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop' 
    },
    { 
      id: 3, title: 'Meditations', author: 'Marcus Aurelius', 
      category: 'PHILOSOPHY', year: '180 CE', stock: 'In Stock', 
      tag: 'STOIC ARCHIVE', 
      description: 'Intimate spiritual and stoic reflections written during military campaigns, offering timeless wisdom.',
      image: 'https://images.unsplash.com/photo-1555448248-2571daf6344b?q=80&w=600&auto=format&fit=crop' 
    },
    { 
      id: 4, title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', 
      category: 'MAGIC REALISM', year: '1967', stock: '1 Copy Reserved', 
      tag: '50TH ANNIV.', 
      description: 'The rise and fall of Macondo told across seven generations of the Buendía family in a magical reality.',
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop' 
    },
    { 
      id: 5, title: 'The Metamorphosis', author: 'Franz Kafka', 
      category: 'MODERNIST PROSE', year: '1915', stock: 'In Stock', 
      tag: 'SCHOCKEN CRITICAL', 
      description: 'Gregor Samsa awakes to find himself transformed into an insect in this surreal existential classic.',
      image: 'https://images.unsplash.com/photo-1589998059171-9899ea86252b?q=80&w=600&auto=format&fit=crop' 
    }
  ];

  const toPrev = (e) => {
    e.stopPropagation();
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  const toNext = (e) => {
    e.stopPropagation();
    setActiveIndex(prev => Math.min(books.length - 1, prev + 1));
  };

  const toSlide = (e, index) => {
    e.stopPropagation();
    setActiveIndex(index);
  };

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center bg-[#fdfbf7] py-12 font-sans overflow-hidden select-none">
      
      {/* Filtros Superiores */}
      <div className="flex flex-wrap justify-center gap-3 mb-12 z-50">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 text-label-caps tracking-widest text-[11px] rounded-full border transition-all duration-300 ${
              activeFilter === filter
                ? 'bg-[#5c1616] text-[#f4ecd8] border-[#5c1616] shadow-md' 
                : 'bg-[#ede6d3] text-[#5a5446] border-[#d8d0bb] hover:bg-[#e4dcbc]' 
            }`}
          >
            {filter.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Contenedor Principal del Carrusel (con perspectiva 3D) */}
      <div className="w-full max-w-6xl flex justify-center items-center relative h-[580px] [transform-style:preserve-3d]" style={{ perspective: '1200px' }}>
        
        {books.map((book, i) => {
          const isActive = activeIndex === i;
          const offset = i - activeIndex;
          const absOffset = Math.abs(offset);
          const isPast = i < activeIndex;
          
          return (
            <motion.div 
              key={book.id}
              className="absolute w-[340px] md:w-[360px] h-[550px] bg-[#f4ecd8] border border-[#d8d0bb] rounded-md shadow-2xl p-4 flex flex-col cursor-pointer"
              initial={false}
              animate={{ 
                x: offset * 220, // Separación horizontal entre tarjetas
                rotateY: isActive ? 0 : (isPast ? 35 : -35), // Ángulo de giro
                z: isActive ? 50 : -absOffset * 120, // Profundidad hacia el fondo
                scale: isActive ? 1 : 1 - (absOffset * 0.1), // Encogimiento
                opacity: absOffset > 2 ? 0 : 1 - (absOffset * 0.25) // Desvanecimiento
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 28 }}
              style={{ 
                zIndex: 100 - absOffset,
                // Mantenemos el hermoso reflejo en el suelo
                WebkitBoxReflect: 'below 2px linear-gradient(transparent, transparent 75%, rgba(255,255,255,0.4))'
              }}
              onClick={(e) => toSlide(e, i)}
            >
              
              {/* Contenedor de Imagen */}
              <div className="relative w-full h-[280px] mb-4 bg-surface-variant overflow-hidden border border-[#d8d0bb]">
                <img src={book.image} alt={book.title} className="w-full h-full object-cover pointer-events-none" />
                <button className="absolute top-3 right-3 w-10 h-10 bg-surface-container-lowest/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface hover:text-[#5c1616] shadow-sm transition-colors z-10">
                  <HeartIcon />
                </button>
                <div className="absolute bottom-3 left-3 bg-[#1a1a1a] px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-white rounded-sm">
                  {book.tag}
                </div>
              </div>

              {/* Información del Libro */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#8b4513]">
                  {book.category} • {book.year}
                </span>
                <span className="text-[11px] font-bold text-[#059669]">
                  ● {book.stock}
                </span>
              </div>
              
              <h3 className="font-serif text-3xl text-on-surface leading-tight mb-1">{book.title}</h3>
              <p className="font-serif italic text-lg text-on-surface-variant mb-3">{book.author}</p>
              <p className="text-body-sm text-on-surface-variant mb-4 flex-1 line-clamp-3">
                {book.description}
              </p>
              
              {/* Botones de Acción */}
              <div className="flex justify-between items-center pt-4 border-t border-[#d8d0bb] mt-auto">
                <button className="text-[11px] font-bold tracking-widest uppercase text-[#8b4513] hover:text-[#5c1616] transition-colors">
                  Quick View
                </button>
                <button 
                  className={`bg-[#5c1616] text-[#f4ecd8] px-5 py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm shadow-md transition-all ${isActive ? 'hover:bg-[#4a1010]' : 'pointer-events-none opacity-80'}`}
                >
                  Request Loan
                </button>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Controles de Navegación (Píldora Inferior) */}
      <div className="mt-12 px-2 py-2 flex items-center justify-center gap-4 text-[#5c1616] rounded-full bg-[#ede6d3] border border-[#d8d0bb] shadow-md z-20">
        
        <button onClick={toPrev} className="p-2 cursor-pointer rounded-full transition-colors hover:bg-[#d8d0bb]">
          <ChevronLeftIcon />
        </button>
        
        <div className="flex justify-center items-center gap-2 px-2">
          {books.map((_, i) => (
            <div 
              key={i} 
              onClick={(e) => toSlide(e, i)}
              className={`rounded-full cursor-pointer h-2 transition-all duration-300 ${
                activeIndex === i ? 'w-6 bg-[#5c1616]' : 'w-2 bg-[#bdae93] hover:bg-[#8b4513]'
              }`}
            />
          ))}
        </div>

        <button onClick={toNext} className="p-2 cursor-pointer rounded-full transition-colors hover:bg-[#d8d0bb]">
          <ChevronRightIcon />
        </button>

      </div>
    </section>
  );
}

// Iconos SVG (Reemplazando a lucide-react para mantener tu sistema libre de dependencias extra)
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);