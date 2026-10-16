import { useState, useEffect } from "react";
import BookCard from "./BookCard";
import { useNavigate } from "react-router-dom";
import ScrollIndicator from "../BasicUIComponents/ScrollIndicator";

export default function BookCoverFlow({
  showToast,
  heroBooks,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spacing, setSpacing] = useState(210);
  const navigate = useNavigate();
  const totalBooks = heroBooks.length;

  useEffect(() => {
    const handleResize = () => setSpacing(window.innerWidth < 640 ? 130 : 210);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStyles = (idx) => {
    // Calculamos el offset normal
    let offset = idx - currentIndex;

    // MAGIA CIRCULAR: Encontramos la ruta más corta en el círculo
    if (offset > Math.floor(totalBooks / 2)) {
      offset -= totalBooks;
    } else if (offset < -Math.floor(totalBooks / 2)) {
      offset += totalBooks;
    }

    const absOffset = Math.abs(offset);

    // Si el libro está en el centro
    if (offset === 0) {
      return {
        transform: "translateX(0px) rotateY(0deg)",
        zIndex: 30,
        opacity: 1,
        filter: "brightness(1)",
        pointerEvents: "auto",
      };
    }

    // Calculamos posición para los libros laterales
    const direction = offset < 0 ? -1 : 1;
    const tx = offset * spacing + direction * 40;
    const tz = -Math.min(absOffset * 100, 320);
    const rot = -direction * 38;
    const scale = Math.max(0.85 - absOffset * 0.05, 0.7);

    // Si el libro está a más de 2 posiciones, lo volvemos invisible.
    // Esto garantiza que solo se vean los 5 centrales (el centro + 2 de cada lado)
    // y permite que los demás se reposicionen "ocultos por detrás" sin que el usuario lo note.
    const isVisible = absOffset <= 2;

    return {
      transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${rot}deg) scale(${scale})`,
      zIndex: 20 - absOffset,
      // Si está más lejos de 2, la opacidad es 0
      opacity: isVisible ? (absOffset === 2 ? 0.55 : 0.85) : 0,
      filter: `brightness(${Math.max(0.45, 0.9 - absOffset * 0.2)})`,
      pointerEvents: isVisible ? "auto" : "none", // Desactiva clics en libros invisibles
    };
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalBooks);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalBooks) % totalBooks);
  };

  return (
    <section className="relative w-full min-h-screen content-center pt-8 pb-14 px-4 sm:px-8 overflow-hidden transition-colors duration-300">
      <div className="max-w-container-max mx-auto flex flex-col items-center">
        <div className="relative w-full py-4 select-none">
          {/* Controles de Navegación Infinitos */}
          <button
            onClick={handlePrev}
            className="opacity-70 absolute left-0 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#ede6d3] border border-[#d8d0bb] text-[#5c1616] rounded-md shadow-md flex items-center justify-center hover:bg-[#e4dcbc] transition-colors z-40 cursor-pointer"
          >
            <ChevronLeftIcon />
          </button>

          <button
            onClick={handleNext}
            className="opacity-70 absolute right-0 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#ede6d3] border border-[#d8d0bb] text-[#5c1616] rounded-md shadow-md flex items-center justify-center hover:bg-[#e4dcbc] transition-colors z-40 cursor-pointer"
          >
            <ChevronRightIcon />
          </button>

          {/* Stage 3D */}
          <div className="coverflow-stage w-full min-h-[580px] sm:min-h-[620px] flex items-center justify-center relative">
            <div className="coverflow-track relative w-full max-w-4xl h-[600px] flex items-center justify-center perspective-[1200px]">
              {heroBooks.map((book, idx) => (
                <BookCard
                  key={book.id}
                  quickView={(e) => {
                    e.stopPropagation();
                    navigate(`/book/${book.id}`);
                  }}
                  requestLoan={(e) => {
                    e.stopPropagation();
                    showToast(`Reserva solicitada para ${book.title}`);
                  }}
                  onFavourite={() => showToast(`Guardado en favoritos`)}
                  styles={getStyles(idx)}
                  onClick={() => setCurrentIndex(idx)}
                  idx={idx}
                  currentIndex={currentIndex}
                  id={book.id}
                />
              ))}
            </div>
          </div>

          {/* Paginador */}
          <div className="z-50 flex items-center justify-center gap-2 mt-10">
            {heroBooks.map((_, idx) => (
              <button
                key={idx}
                className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-8 bg-[#5c1616] dark:bg-[#f4ecd8]"
                    : "w-2.5 bg-[#5c1616] dark:bg-[#f4ecd8] opacity-60 hover:opacity-95"
                }`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>
      </div>
      <ScrollIndicator />
    </section>
  );
}

const ChevronLeftIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// import { useState, useEffect } from "react";
// import BookCard from "./BookCard";
// import { useNavigate } from "react-router-dom";

// // Datos ampliados para incluir descripciones como en la imagen
// const heroBooks = [
//   {
//     id: 1,
//     title: "The Odyssey",
//     author: "Homer (Trans. Robert Fagles)",
//     category: "EPIC POETRY",
//     year: "800 BCE",
//     stock: "In Stock",
//     tag: "CLOTHBOUND GOLD LEAF",
//     description:
//       "The definitive heroic saga of Odysseus's ten-year journey home from Troy, illustrated with archival engravings.",
//     image:
//       "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=600&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     title: "The Count of Monte Cristo",
//     author: "Alexandre Dumas",
//     category: "CLASSIC FICTION",
//     year: "1844",
//     stock: "In Stock",
//     tag: "UNABRIDGED 2-VOL",
//     description:
//       "An intricate masterpiece of retribution, hidden identities, and ultimate justice set across the Mediterranean.",
//     image:
//       "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop",
//   },
//   {
//     id: 3,
//     title: "Meditations",
//     author: "Marcus Aurelius",
//     category: "PHILOSOPHY",
//     year: "180 CE",
//     stock: "In Stock",
//     tag: "STOIC ARCHIVE",
//     description:
//       "Intimate spiritual and stoic reflections written during military campaigns, offering timeless wisdom.",
//     image:
//       "https://images.unsplash.com/photo-1555448248-2571daf6344b?q=80&w=600&auto=format&fit=crop",
//   },
//   {
//     id: 4,
//     title: "One Hundred Years of Solitude",
//     author: "Gabriel García Márquez",
//     category: "MAGIC REALISM",
//     year: "1967",
//     stock: "1 Copy Reserved",
//     tag: "50TH ANNIV. EDITION",
//     description:
//       "The rise and fall of Macondo told across seven generations of the Buendía family in a magical reality.",
//     image:
//       "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop",
//   },
//   {
//     id: 5,
//     title: "The Metamorphosis",
//     author: "Franz Kafka",
//     category: "MODERNIST PROSE",
//     year: "1915",
//     stock: "In Stock",
//     tag: "SCHOCKEN CRITICAL",
//     description:
//       "Gregor Samsa awakes to find himself transformed into an insect in this surreal existential classic.",
//     image:
//       "https://images.unsplash.com/photo-1589998059171-9899ea86252b?q=80&w=600&auto=format&fit=crop",
//   },
// ];

// export default function BookCoverFlow({ showToast }) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [spacing, setSpacing] = useState(210);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleResize = () => setSpacing(window.innerWidth < 640 ? 130 : 210);
//     window.addEventListener("resize", handleResize);
//     handleResize();
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const getStyles = (idx) => {
//     const offset = idx - currentIndex;
//     const absOffset = Math.abs(offset);

//     if (offset === 0) {
//       return {
//         transform: "translateX(0px) rotateY(0deg)",
//         zIndex: 30,
//         opacity: 1,
//         filter: "brightness(1)",
//         pointerEvents: "auto",
//       };
//     }

//     const direction = offset < 0 ? -1 : 1;
//     const tx = offset * spacing + direction * 40;
//     const tz = -Math.min(absOffset * 100, 320);
//     const rot = -direction * 38;
//     const scale = Math.max(0.85 - absOffset * 0.05, 0.7);

//     return {
//       transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${rot}deg) scale(${scale})`,
//       zIndex: 20 - absOffset,
//       opacity: absOffset > 2 ? 0.2 : absOffset === 2 ? 0.55 : 0.85,
//       filter: `brightness(${Math.max(0.45, 0.9 - absOffset * 0.2)})`,
//       pointerEvents: "auto",
//     };
//   };

//   return (
//     <section className="relative w-full min-h-screen content-center  pt-8 pb-14 px-4 sm:px-8 overflow-hidden transition-colors duration-300">
//       <div className="max-w-container-max mx-auto flex flex-col items-center">
//         <div className="relative w-full py-4 select-none">
//           {/* Controles de Navegación (Flechas laterales) */}
//           <button
//             onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
//             className="opacity-70 absolute left-0 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#ede6d3] border border-[#d8d0bb] text-[#5c1616] rounded-md shadow-md flex items-center justify-center hover:bg-[#e4dcbc] transition-colors z-40 cursor-pointer"
//           >
//             <ChevronLeftIcon />
//           </button>

//           <button
//             onClick={() =>
//               setCurrentIndex((prev) =>
//                 Math.min(heroBooks.length - 1, prev + 1),
//               )
//             }
//             className=" opacity-70 absolute right-0 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#ede6d3] border border-[#d8d0bb] text-[#5c1616] rounded-md shadow-md flex items-center justify-center hover:bg-[#e4dcbc] transition-colors z-40 cursor-pointer"
//           >
//             <ChevronRightIcon />
//           </button>

//           {/* Stage 3D */}
//           <div className="coverflow-stage w-full min-h-[580px] sm:min-h-[620px] flex items-center justify-center relative">
//             <div className="coverflow-track relative w-full max-w-4xl h-[600px] flex items-center justify-center perspective-[1200px]">
//               {heroBooks.map((book, idx) => (
//                 <BookCard
//                   quickView={(e) => {
//                     e.stopPropagation();
//                     navigate(`/book/${book.id}`);
//                   }}
//                   requestLoan={(e) => {
//                     e.stopPropagation();
//                     showToast(`Loan request for ${book.title}`);
//                   }}
//                   onFavourite={() => showToast(`Guardado en favoritos`)}
//                   styles={getStyles(idx)}
//                   onClick={() => setCurrentIndex(idx)}
//                   idx={idx}
//                   currentIndex={currentIndex}
//                   id={book.id}
//                   title={book.title}
//                   author={book.author}
//                   category={book.category}
//                   year={book.year}
//                   stock={book.stock}
//                   tag={book.tag}
//                   description={book.description}
//                   image={book.image}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Paginador */}
//           <div className="z-50 flex items-center justify-center gap-2 mt-4">
//             {heroBooks.map((_, idx) => (
//               <button
//                 key={idx}
//                 className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${idx === currentIndex ? "w-8 bg-[#5c1616]  dark:bg-[#f4ecd8]" : "w-2.5 bg-[#5c1616]  dark:bg-[#f4ecd8] opacity-60 hover:opacity-95"}`}
//                 onClick={() => setCurrentIndex(idx)}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// const ChevronLeftIcon = () => (
//   <svg
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2.5"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="m15 18-6-6 6-6" />
//   </svg>
// );
// const ChevronRightIcon = () => (
//   <svg
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2.5"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="m9 18 6-6-6-6" />
//   </svg>
// );
