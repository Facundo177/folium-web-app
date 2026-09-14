import { useState } from 'react';

export default function Book3DCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState("Curator's Choice");

  const filters = [
    "Curator's Choice", "Rare Classics", "Philosophical Inquiries", 
    "Greek & Latin Epics", "Recently Acquired"
  ];

  // Datos ampliados para incluir descripciones como en la imagen
  const books = [
    { 
      id: 1, title: 'The Odyssey', author: 'Homer (Trans. Robert Fagles)', 
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
      tag: '50TH ANNIV. EDITION', 
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

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : books.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < books.length - 1 ? prev + 1 : 0));
  };

  // Lógica para calcular la posición 3D de cada tarjeta respecto a la actual
  const getCardStyles = (index) => {
    const offset = index - currentIndex;
    const absOffset = Math.abs(offset);
    const direction = Math.sign(offset); // 1 (derecha), -1 (izquierda), 0 (centro)
    
    // Si está muy lejos, lo ocultamos para mejorar rendimiento
    if (absOffset > 3) return { display: 'none' };

    // Cálculos de 3D Cover Flow
    const scale = 1 - absOffset * 0.25; // Se achica un % por cada lugar de distancia
    const translateX = `${offset * 55}%`; // Se desplaza hacia los lados
    const rotateY = `${-direction * 15}deg`; // Gira x grados mirando hacia el centro
    const opacity = 1 - absOffset * 0.35; // Se vuelve más transparente
    const zIndex = 50 - absOffset; // El central siempre está por encima
    
    return {
      transform: `translateX(${translateX}) scale(${scale}) perspective(1000px) rotateY(${rotateY})`,
      zIndex: zIndex,
      opacity: opacity,
      transition: 'all 0.3s',
      // Efecto de reflejo en el suelo compatible con Webkit
      WebkitBoxReflect: 'below 2px linear-gradient(transparent, transparent 70%, rgba(255,255,255,0.3))'
    };
  };

  return (
    <section className="relative w-full min-h-[80vh] flex flex-col items-center bg-[#fdfbf7] py-12 font-sans overflow-hidden">
      
      {/* Filtros Superiores */}
      <div className="flex flex-wrap gap-3 mb-16 z-50">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 text-label-caps tracking-widest text-[11px] rounded-full border transition-all duration-300 ${
              activeFilter === filter
                ? 'bg-[#5c1616] text-[#f4ecd8] border-[#5c1616] shadow-md' // Color Burdeos activo
                : 'bg-[#ede6d3] text-[#5a5446] border-[#d8d0bb] hover:bg-[#e4dcbc]' // Color Pergamino inactivo
            }`}
          >
            {filter.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Contenedor del Carrusel 3D */}
      <div className="relative w-full max-w-4xl h-[600px] flex items-center justify-center perspective-[1200px]">
        
        {books.map((book, index) => {
          const isCenter = index === currentIndex;
          
          return (
            <div
              key={book.id}
              className="absolute w-[360px] h-[550px] bg-[#f4ecd8] border-2 border-[#d8d0bb] rounded-md shadow-2xl p-4 flex flex-col cursor-pointer transform-gpu origin-center"
              style={getCardStyles(index)}
              onClick={() => setCurrentIndex(index)} // Clic para centrar el libro
            >
              {/* Contenedor de Imagen y Tag */}
              <div className="relative w-full h-[300px] mb-4 bg-surface-variant overflow-hidden border border-[#d8d0bb]">
                <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                
                <button className="absolute top-3 right-3 w-10 h-10 bg-surface-container-lowest/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface hover:text-[#5c1616] shadow-sm transition-colors">
                  <HeartIcon />
                </button>
                
                <div className="absolute bottom-3 left-3 bg-[#1a1a1a] px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-white rounded-sm">
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
              
              <h3 className="font-serif text-3xl text-on-surface leading-none mb-2">{book.title}</h3>
              <p className="font-serif italic text-lg text-on-surface-variant mb-4">{book.author}</p>
              
              <p className="text-body-sm text-on-surface-variant mb-6 flex-1 line-clamp-3">
                {book.description}
              </p>
              
              {/* Botones de Acción */}
              <div className="flex justify-between items-center pt-4 border-t border-[#d8d0bb] mt-auto">
                <button className="text-[11px] font-bold tracking-widest uppercase text-[#8b4513] hover:text-[#5c1616] transition-colors">
                  Quick View
                </button>
                <button 
                  className={`bg-[#5c1616] text-[#f4ecd8] px-6 py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm shadow-md transition-all ${isCenter ? 'hover:bg-[#4a1010] cursor-pointer' : 'pointer-events-none'}`}
                >
                  Request Loan
                </button>
              </div>
            </div>
          );
        })}

      </div>

      {/* Controles de Navegación (Flechas laterales) */}
      <button 
        onClick={handlePrev}
        className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#ede6d3] border border-[#d8d0bb] text-[#5c1616] rounded-md shadow-md flex items-center justify-center hover:bg-[#e4dcbc] transition-colors z-50"
      >
        <ChevronLeftIcon />
      </button>

      <button 
        onClick={handleNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#ede6d3] border border-[#d8d0bb] text-[#5c1616] rounded-md shadow-md flex items-center justify-center hover:bg-[#e4dcbc] transition-colors z-50"
      >
        <ChevronRightIcon />
      </button>

    </section>
  );
}

// Iconos SVG
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);
const ChevronLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const ChevronRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);