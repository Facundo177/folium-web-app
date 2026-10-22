import { useState, useEffect } from "react";
import BookCard from "./BookCard";
import { useNavigate } from "react-router-dom";
import ScrollIndicator from "../BasicUIComponents/ScrollIndicator";
import { favoriteService } from "../../api/services/favoriteService";
import { reservationService } from "../../api/services/reservationService";
import { useAuth } from "../../auth/AuthProvider";

export default function BookCoverFlow({
  showToast,
  heroBooks,
  favoritesMap = {},
  onToggleFavorite,
  onRequireAuth,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spacing, setSpacing] = useState(210);
  const navigate = useNavigate();
  const { user } = useAuth();
  const totalBooks = heroBooks.length;

  useEffect(() => {
    const handleResize = () => setSpacing(window.innerWidth < 640 ? 130 : 210);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getInitialDateTime = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

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
    if (!totalBooks) return;
    setCurrentIndex((prev) => (prev + 1) % totalBooks);
  };

  const handlePrev = () => {
    if (!totalBooks) return;
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
                    if (!user || !user.id) {
                      onRequireAuth?.("consultar la ficha detallada y reseñas de este ejemplar");
                      return;
                    }
                    navigate(`/book/${book.id}`);
                  }}
                  requestLoan={async (e) => {
                    e.stopPropagation();
                    if (!user || !user.id) {
                      onRequireAuth?.("reservar un ejemplar de la colección");
                      return;
                    }
                    try {
                      await reservationService.create({
                        book: book.id,
                        expires_at: getInitialDateTime(14),
                      });
                      showToast(`Reserva confirmada para "${book.title}"`);
                    } catch (err) {
                      const detail = err.response?.data
                        ? Object.values(err.response.data).flat().join(" ")
                        : "No se pudo procesar la reserva";
                      showToast(detail);
                    }
                  }}
                  onFavourite={async () => {
                    if (onToggleFavorite) {
                      await onToggleFavorite(book);
                    } else {
                      try {
                        await favoriteService.create({ book: book.id });
                        showToast(`Guardado en favoritos`);
                      } catch {
                        showToast(`No se pudo guardar en favoritos`);
                      }
                    }
                  }}
                  isFavorite={Boolean(favoritesMap?.[book.id])}
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
