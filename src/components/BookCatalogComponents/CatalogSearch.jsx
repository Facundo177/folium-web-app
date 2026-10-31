import { useMemo, useState, useEffect } from "react";
import FilterSidebar from "../CatalogSearchComponents/FilterSidebar";
import CatalogBookCard from "../CatalogSearchComponents/CatalogBookCard";
import { adaptBook } from "../../api/adapters";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useGenres } from "../../hooks/useGenres";

function CatalogSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`skel-${i}`}
          className="bg-surface-container border border-outline-variant/40 rounded-md p-5 flex flex-col justify-between h-[420px] shadow-xs"
        >
          <div className="w-24 h-4 bg-outline-variant/30 rounded-full mb-4" />
          <div className="w-full aspect-[2/3] max-h-56 bg-surface-container-low/70 rounded-sm mb-4" />
          <div className="space-y-2 mt-auto">
            <div className="w-3/4 h-4 bg-outline-variant/30 rounded" />
            <div className="w-1/2 h-3 bg-outline-variant/20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CatalogSearch({
  books,
  isLoading,
  isFetching = false,
  error,
  favoritesMap = {},
  userReservationsMap = {},
  onReservationSuccess,
  onToggleFavorite,
  onRequireAuth,
  // Props de filtros y paginación (server-side)
  filters,
  setFilters,
  setPage,
  totalCount,
  totalPages,
}) {
  const { genres: apiGenres } = useGenres();

  const adaptedBooks = useMemo(
    () => (Array.isArray(books) ? books.map(adaptBook) : []),
    [books]
  );

  // Géneros traídos desde la API para la sidebar
  const categories = useMemo(() => {
    return (Array.isArray(apiGenres) ? apiGenres : []).map((genre) => genre.name).sort();
  }, [apiGenres]);

  // Estado local del buscador con debounce
  const [searchQuery, setSearchQuery] = useState(filters?.search || "");

  useEffect(() => {
    setSearchQuery(filters?.search || "");
  }, [filters?.search]);

  // Debounce de 350ms al teclear
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchQuery });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, setFilters]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    document.getElementById("catalog-grid-header")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-sans pt-12 sm:pt-20 px-4 sm:px-6 md:px-12 transition-colors duration-300">
      {/* Barra de Búsqueda Superior */}
      <div className="max-w-[1400px] mx-auto mb-8 sm:mb-10">
        <div className="flex items-center bg-surface-container-lowest border border-outline/50 rounded-md px-4 py-3 shadow-sm focus-within:border-primary transition-colors">
          <span className="text-outline mr-3">
            {isFetching ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Search className="w-5 h-5" />}
          </span>
          <input
            type="text"
            className="bg-transparent flex-1 outline-none font-serif italic text-on-surface placeholder:text-outline text-base"
            placeholder="Buscar por título o autor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {filters?.search && (
            <button
              onClick={() => setFilters({ search: "" })}
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
            activeCategory={filters?.genre || null}
            setActiveCategory={(cat) => setFilters({ genre: cat || "" })}
            yearRange={{
              start: filters?.year || "",
              end: "",
            }}
            setYearRange={(range) => setFilters({ year: range.start || "" })}
          />
        </aside>

        {/* Panel Derecho (Resultados) */}
        <main className="flex-1">
          {/* Cabecera de Resultados */}
          <div
            id="catalog-grid-header"
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 pb-3 border-b border-outline-variant/50 scroll-mt-24"
          >
            <div className="inline-flex items-center gap-2">
              <span className="text-xs text-primary uppercase tracking-widest font-bold">
                {totalCount} Volúmenes Disponibles{" "}
                <span className="text-outline font-normal ml-2">
                  • Filtros Activos: {filters?.genre || "Todos los géneros"}
                </span>
              </span>
              {isFetching && (
                <span className="text-xs text-primary italic flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Actualizando…
                </span>
              )}
            </div>
            {totalPages > 1 && (
              <span className="text-xs text-on-surface-variant font-medium">
                Página {filters?.page} de {totalPages}
              </span>
            )}
          </div>

          {/* Grilla de Libros con Skeleton State o Error State */}
          {error && adaptedBooks.length === 0 ? (
            <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6 bg-error/5 border border-error/20 rounded-md">
              <p className="text-error font-medium text-sm mb-3">{error}</p>
              <button
                onClick={() => setFilters({})}
                className="text-xs uppercase tracking-widest font-bold text-primary underline cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          ) : isLoading && adaptedBooks.length === 0 ? (
            <CatalogSkeletonGrid />
          ) : adaptedBooks.length > 0 ? (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 transition-opacity duration-200 ${
                isFetching ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
            >
              {adaptedBooks.map((book) => (
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
          ) : (
            <div className="w-full py-24 flex flex-col items-center justify-center text-center opacity-70 animate-fade-in">
              <p className="text-sm uppercase tracking-widest font-bold text-outline">
                Ningún volumen coincide con los criterios estipulados.
              </p>
            </div>
          )}

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {/* Botón anterior */}
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                className="p-2 rounded-sm border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Botones de página numerados */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isNearCurrent =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - filters.page) <= 2;
                const isEllipsisBefore =
                  pageNum === 2 && filters.page > 4;
                const isEllipsisAfter =
                  pageNum === totalPages - 1 && filters.page < totalPages - 3;

                if (!isNearCurrent) return null;
                if (isEllipsisBefore || isEllipsisAfter) {
                  return (
                    <span key={`ellipsis-${pageNum}`} className="text-outline text-xs px-1">
                      …
                    </span>
                  );
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                      filters.page === pageNum
                        ? "bg-primary text-on-primary"
                        : "border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Botón siguiente */}
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages}
                className="p-2 rounded-sm border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
