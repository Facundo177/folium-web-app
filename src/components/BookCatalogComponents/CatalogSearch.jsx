import { useState, useMemo, useEffect } from "react";
import FilterSidebar from "../CatalogSearchComponents/FilterSidebar";
import CatalogBookCard from "../CatalogSearchComponents/CatalogBookCard";
import { adaptBook } from "../../api/adapters";
import { Search } from "lucide-react";
import { useGenres } from "../../hooks/useGenres";

const ITEMS_PER_PAGE = 16;

export default function CatalogSearch({
  books,
  isLoading,
  error,
  favoritesMap = {},
  userReservationsMap = {},
  onReservationSuccess,
  onToggleFavorite,
  onRequireAuth,
}) {
  const { genres: apiGenres } = useGenres();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeEditorial, setActiveEditorial] = useState(null);
  const [yearRange, setYearRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);

  const adaptedBooks = useMemo(() => books.map(adaptBook), [books]);

  const categories = useMemo(() => {
    return apiGenres.map((genre) => genre.name).sort();
  }, [apiGenres]);

  const editorials = useMemo(() => {
    const allEditorials = adaptedBooks.map((b) => b.editorial).filter(Boolean);
    return [...new Set(allEditorials)].sort();
  }, [adaptedBooks]);

  // Filtrado reactivo optimizado
  const filteredBooks = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return adaptedBooks.filter((book) => {
      const matchText =
        !term ||
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term);

      const matchCategory = activeCategory
        ? book.genres.includes(activeCategory)
        : true;

      const matchEditorial = activeEditorial
        ? book.editorial === activeEditorial
        : true;

      let matchYear = true;
      const bookYear = Number(book.publication_year || book.year);

      if (yearRange.start && bookYear < Number(yearRange.start)) {
        matchYear = false;
      }
      if (yearRange.end && bookYear > Number(yearRange.end)) {
        matchYear = false;
      }

      return matchText && matchCategory && matchEditorial && matchYear;
    });
  }, [adaptedBooks, searchTerm, activeCategory, activeEditorial, yearRange]);

  // Reiniciar a la página 1 cuando el usuario altera cualquier filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory, activeEditorial, yearRange]);

  // Paginación en memoria
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const scrollToGridHeader = () => {
    document.getElementById("catalog-grid-header")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    scrollToGridHeader();
  };

  if (isLoading)
    return (
      <p className="pt-24 px-6 text-on-background font-sans">
        Cargando catálogo…
      </p>
    );
  if (error) return <p className="pt-24 px-6 text-error font-sans">{error}</p>;

  return (
    <div className="min-h-screen bg-background text-on-background font-sans pt-12 sm:pt-20 px-4 sm:px-6 md:px-12 transition-colors duration-300">
      {/* Barra de Búsqueda Superior */}
      <div className="max-w-[1400px] mx-auto mb-8 sm:mb-10">
        <div className="flex items-center bg-surface-container-lowest border border-outline/50 rounded-md px-4 py-3 shadow-sm focus-within:border-primary transition-colors">
          <span className="text-outline mr-3">
            <Search />
          </span>
          <input
            type="text"
            className="bg-transparent flex-1 outline-none font-serif italic text-on-surface placeholder:text-outline"
            placeholder="Buscar por título o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs text-outline hover:text-primary uppercase tracking-widest font-bold transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 pb-16">
        {/* Barra Lateral Izquierda (Filtros) */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <FilterSidebar
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            editorials={editorials}
            activeEditorial={activeEditorial}
            setActiveEditorial={setActiveEditorial}
            yearRange={yearRange}
            setYearRange={setYearRange}
          />
        </aside>

        {/* Panel Derecho (Resultados) */}
        <main className="flex-1">
          {/* Cabecera de Resultados */}
          <div
            id="catalog-grid-header"
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 pb-3 border-b border-outline-variant/50 scroll-mt-24"
          >
            <span className="text-xs text-primary uppercase tracking-widest font-bold">
              {filteredBooks.length} Volúmenes Disponibles{" "}
              <span className="text-outline font-normal ml-2">
                • Filtros: {activeCategory || "Todos los géneros"}
              </span>
            </span>

            {totalPages > 1 && (
              <span className="text-xs text-on-surface-variant font-medium">
                Página {currentPage} de {totalPages} (Mostrando {paginatedBooks.length} de {filteredBooks.length})
              </span>
            )}
          </div>

          {/* Grilla de Libros Paginada */}
          {paginatedBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {paginatedBooks.map((book) => (
                  <CatalogBookCard
                    key={book.id}
                    book={book}
                    isFavorite={Boolean(favoritesMap?.[book.id])}
                    favoriteId={favoritesMap?.[book.id] ?? null}
                    isReservedByUser={Boolean(userReservationsMap?.[book.id])}
                    onReservationSuccess={onReservationSuccess}
                    onToggleFavorite={onToggleFavorite}
                    onRequireAuth={onRequireAuth}
                  />
                ))}
              </div>

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-12 pt-6 border-t border-outline-variant/40">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    className="px-3.5 py-1.5 rounded-sm border border-outline-variant text-xs font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <span key={p} className="flex items-center gap-1">
                          {prev && p - prev > 1 && (
                            <span className="px-1 text-on-surface-variant/50">…</span>
                          )}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`w-8 h-8 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                              currentPage === p
                                ? "bg-primary text-on-primary shadow-sm"
                                : "border border-outline-variant/60 text-on-surface hover:bg-surface-container"
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      );
                    })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    className="px-3.5 py-1.5 rounded-sm border border-outline-variant text-xs font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full py-24 flex flex-col items-center justify-center text-center opacity-70 animate-fade-in">
              <p className="text-sm uppercase tracking-widest font-bold text-outline">
                Ningún volumen coincide con los criterios estipulados.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
