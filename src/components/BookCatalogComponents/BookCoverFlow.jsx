import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import BookCard from "./BookCard";
import { useNavigate } from "react-router-dom";
import ScrollIndicator from "../BasicUIComponents/ScrollIndicator";
import { favoriteService } from "../../api/services/favoriteService";
import { reservationService } from "../../api/services/reservationService";
import { useAuth } from "../../auth/AuthProvider";

export default function BookCoverFlow({
  showToast,
  heroBooks = [],
  favoritesMap = {},
  userReservationsMap = {},
  onReservationSuccess,
  onToggleFavorite,
  onRequireAuth,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const navigate = useNavigate();
  const { user } = useAuth();
  const totalBooks = heroBooks.length;

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const spacing = isMobile ? 110 : isTablet ? 160 : 210;

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const getInitialDateTime = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleNext = useCallback(() => {
    if (!totalBooks) return;
    setCurrentIndex((prev) => (prev + 1) % totalBooks);
  }, [totalBooks]);

  const handlePrev = useCallback(() => {
    if (!totalBooks) return;
    setCurrentIndex((prev) => (prev - 1 + totalBooks) % totalBooks);
  }, [totalBooks]);

  // Soporte de navegación táctil (Swipe)
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const isSwipingRef = useRef(false);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      isSwipingRef.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isSwipingRef.current || touchStartXRef.current === null) return;
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    // Si el usuario está scrolleando verticalmente, cancelar el swipe horizontal
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 12) {
      isSwipingRef.current = false;
    }
  };

  const handleTouchEnd = (e) => {
    if (!isSwipingRef.current || touchStartXRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - touchStartXRef.current;
    const SWIPE_THRESHOLD = 40; // Desplazamiento mínimo para pasar de tomo

    if (Math.abs(diffX) >= SWIPE_THRESHOLD) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isSwipingRef.current = false;
  };

  // Navegación por teclado (Flechas Izquierda / Derecha)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  // Cálculo de transformación 3D optimizado por hardware
  const getStyles = useCallback(
    (idx) => {
      let offset = idx - currentIndex;

      // Circularidad de ruta más corta
      if (offset > Math.floor(totalBooks / 2)) {
        offset -= totalBooks;
      } else if (offset < -Math.floor(totalBooks / 2)) {
        offset += totalBooks;
      }

      const absOffset = Math.abs(offset);

      // Libro central activo
      if (offset === 0) {
        return {
          transform: "translateX(0px) translateZ(0px) rotateY(0deg) scale(1)",
          zIndex: 30,
          opacity: 1,
          pointerEvents: "auto",
        };
      }

      const direction = offset < 0 ? -1 : 1;

      // En mobile: menor rotación y profundidad para evitar desborde visual
      const tx = isMobile
        ? offset * spacing + direction * 15
        : offset * spacing + direction * 40;
      const tz = isMobile
        ? -Math.min(absOffset * 50, 160)
        : -Math.min(absOffset * 100, 320);
      const rot = isMobile ? -direction * 16 : -direction * 38;
      const scale = isMobile
        ? Math.max(0.88 - absOffset * 0.08, 0.72)
        : Math.max(0.85 - absOffset * 0.05, 0.7);

      // Solo visibles el centro y 2 laterales a cada lado (5 tomos activos)
      const isVisible = absOffset <= 2;

      return {
        transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${rot}deg) scale(${scale})`,
        zIndex: 20 - absOffset,
        opacity: isVisible ? (absOffset === 2 ? (isMobile ? 0.35 : 0.55) : 0.85) : 0,
        pointerEvents: isVisible ? "auto" : "none",
      };
    },
    [currentIndex, totalBooks, spacing, isMobile]
  );

  // Callbacks memorizados para cada tomo
  const handleCardQuickView = useCallback(
    (book) => (e) => {
      e.stopPropagation();
      navigate(`/book/${book.id}`);
    },
    [navigate]
  );

  const handleCardRequestLoan = useCallback(
    (book) => async (e) => {
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
        onReservationSuccess?.(book.id);
        showToast(`Reserva confirmada para "${book.title}"`);
      } catch (err) {
        const detail = err.response?.data
          ? Object.values(err.response.data).flat().join(" ")
          : "No se pudo procesar la reserva";
        showToast(detail);
      }
    },
    [user, onRequireAuth, onReservationSuccess, showToast]
  );

  const handleCardFavourite = useCallback(
    (book) => async (e) => {
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
    },
    [onToggleFavorite, showToast]
  );

  return (
    <section
      className="relative w-full min-h-[560px] sm:min-h-screen content-center pt-6 sm:pt-8 pb-10 sm:pb-14 px-2 sm:px-8 overflow-hidden transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-container-max mx-auto flex flex-col items-center">
        <div className="relative w-full py-2 sm:py-4 select-none">
          {/* Controles de Navegación con Accesibilidad */}
          <button
            onClick={handlePrev}
            aria-label="Tomo anterior"
            className="opacity-75 hover:opacity-100 absolute left-1 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-[#ede6d3] border border-[#d8d0bb] text-[#5c1616] rounded-md shadow-md flex items-center justify-center hover:bg-[#e4dcbc] transition-all z-40 cursor-pointer active:scale-95"
          >
            <ChevronLeftIcon />
          </button>

          <button
            onClick={handleNext}
            aria-label="Tomo siguiente"
            className="opacity-75 hover:opacity-100 absolute right-1 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-[#ede6d3] border border-[#d8d0bb] text-[#5c1616] rounded-md shadow-md flex items-center justify-center hover:bg-[#e4dcbc] transition-all z-40 cursor-pointer active:scale-95"
          >
            <ChevronRightIcon />
          </button>

          {/* Stage 3D Optimizado */}
          <div className="coverflow-stage w-full min-h-[540px] sm:min-h-[620px] flex items-center justify-center relative">
            <div className="coverflow-track relative w-full max-w-4xl h-[550px] sm:h-[600px] flex items-center justify-center perspective-[1200px]">
              {heroBooks.map((book, idx) => (
                <BookCard
                  key={book.id}
                  book={book}
                  quickView={handleCardQuickView(book)}
                  requestLoan={handleCardRequestLoan(book)}
                  onFavourite={handleCardFavourite(book)}
                  isFavorite={Boolean(favoritesMap?.[book.id])}
                  isReservedByUser={Boolean(userReservationsMap?.[book.id])}
                  styles={getStyles(idx)}
                  onClick={() => setCurrentIndex(idx)}
                  idx={idx}
                  currentIndex={currentIndex}
                  id={book.id}
                />
              ))}
            </div>
          </div>

          {/* Paginador y Pistas Visuales */}
          <div className="z-50 flex flex-col items-center justify-center gap-2 mt-6 sm:mt-10">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {heroBooks.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Ir al tomo ${idx + 1}`}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-7 sm:w-8 bg-[#5c1616] dark:bg-[#f4ecd8]"
                      : "w-2 sm:w-2.5 bg-[#5c1616] dark:bg-[#f4ecd8] opacity-50 hover:opacity-85"
                  }`}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>

            {/* Pista táctil sutil exclusiva para celulares */}
            <span className="sm:hidden text-[11px] font-sans text-on-surface-variant/70 tracking-wide mt-1">
              Deslizá horizontalmente para hojear
            </span>
          </div>
        </div>
      </div>
      <ScrollIndicator />
    </section>
  );
}

const ChevronLeftIcon = () => (
  <svg
    width="22"
    height="22"
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
    width="22"
    height="22"
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
