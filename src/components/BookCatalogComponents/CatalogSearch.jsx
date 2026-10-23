import { useMemo } from "react";
import FilterSidebar from "../CatalogSearchComponents/FilterSidebar";
import CatalogBookCard from "../CatalogSearchComponents/CatalogBookCard";
import { adaptBook } from "../../api/adapters";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useGenres } from "../../hooks/useGenres";

export default function CatalogSearch({
  books,
  isLoading,
  error,
  favoritesMap = {},
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

  const adaptedBooks = useMemo(() => books.map(adaptBook), [books]);

  // Géneros traídos desde la API para la sidebar
  const categories = useMemo(() => {
    return apiGenres.map((genre) => genre.name).sort();
  }, [apiGenres]);

  if (isLoading)
    return (
      <p className="pt-24 px-6 text-on-background font-sans">
        Cargando catálogo…
      </p>
    );
  if (error) return <p className="pt-24 px-6 text-error font-sans">{error}</p>;

  return (
    <div className="min-h-screen bg-background text-on-background font-sans pt-24 px-6 md:px-12 transition-colors duration-300">
      {/* Barra de Búsqueda Superior */}
      <div className="max-w-[1400px] mx-auto mb-10">
        <div className="flex items-center bg-surface-container-lowest border border-outline/50 rounded-md px-4 py-3 shadow-sm focus-within:border-primary transition-colors">
          <span className="text-outline mr-3">
            <Search />
          </span>
          <input
            type="text"
            className="bg-transparent flex-1 outline-none font-serif italic text-on-surface placeholder:text-outline"
            placeholder="Buscar por título o autor..."
            value={filters?.search || ""}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
          {filters?.search && (
            <button
              onClick={() => setFilters({ search: "" })}
              className="text-xs text-outline hover:text-primary uppercase tracking-widest font-bold transition-colors"
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
          <div className="flex justify-between items-end mb-6 pb-3 border-b border-outline-variant/50">
            <span className="text-xs text-primary uppercase tracking-widest font-bold">
              {totalCount} Volúmenes Disponibles{" "}
              <span className="text-outline font-normal ml-2">
                • Filtros Activos: {filters?.genre || "Todos"}
              </span>
            </span>
            {totalPages > 1 && (
              <span className="text-xs text-on-surface-variant">
                Página {filters?.page} de {totalPages}
              </span>
            )}
          </div>

          {/* Grilla de Libros */}
          {adaptedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {adaptedBooks.map((book) => (
                <CatalogBookCard
                  key={book.id}
                  book={book}
                  isFavorite={Boolean(favoritesMap?.[book.id])}
                  favoriteId={favoritesMap?.[book.id] ?? null}
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
                onClick={() => setPage(filters.page - 1)}
                disabled={filters.page <= 1}
                className="p-2 rounded-sm border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Botones de página numerados */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Mostrar solo páginas cercanas a la actual para no sobrecargar la UI
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
                    onClick={() => setPage(pageNum)}
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
                onClick={() => setPage(filters.page + 1)}
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
