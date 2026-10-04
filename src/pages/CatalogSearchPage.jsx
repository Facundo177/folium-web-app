import { useState, useMemo } from "react";
import FilterSidebar from "../components/CatalogSearchComponents/FilterSidebar";
import CatalogBookCard from "../components/CatalogSearchComponents/CatalogBookCard";
import { useBooks } from "../hooks/useBooks";
import { adaptBook } from "../api/adapters";




export default function CatalogSearchPage() {
  const { books, isLoading, error } = useBooks();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

    const adaptedBooks = useMemo(() => books.map(adaptBook), [books]);

    const categories = useMemo(
    () => [...new Set(adaptedBooks.flatMap((b) => b.genres))].sort(),
    [adaptedBooks]
  );

  // Filtrado en tiempo real
  const filteredBooks = useMemo(() => {
  const term = searchTerm.toLowerCase();
  return adaptedBooks.filter((book) => {
    const matchText =
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term);
    const matchCategory = activeCategory
      ? book.genres.includes(activeCategory)
      : true;
    return matchText && matchCategory;
    });
  }, [adaptedBooks, searchTerm, activeCategory]);

  

  if (isLoading) return <p className="pt-24 px-6 text-on-primary">Cargando catálogo…</p>;
  if (error) return <p className="pt-24 px-6 text-on-primary">{error}</p>;

  

  return (
    <div className="min-h-screen bg-background dark:bg-primary-container text-on-primary font-sans pt-24 px-6 md:px-12 ">
      {/* Barra de Búsqueda Superior */}
      <div className="max-w-[1400px] mx-auto mb-10">
        <div className="flex items-center bg-inverse-surface border border-outline-variant rounded-md px-4 py-3 shadow-inner focus-within:border-on-tertiary-container transition-colors">
          <span className="material-symbols-outlined text-outline mr-3">
            search
          </span>
          <input
            type="text"
            className="bg-transparent flex-1 outline-none font-serif italic text-on-primary placeholder:text-outline"
            placeholder="Buscar por título, autor, año, categoría o signatura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs text-outline hover:text-on-primary uppercase tracking-widest font-bold"
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
          />
        </aside>

        {/* Panel Derecho (Resultados) */}
        <main className="flex-1">
          {/* Cabecera de Resultados */}
          <div className="flex justify-between items-end mb-6 pb-3 border-b border-outline-variant">
            <span className="text-xs text-on-tertiary-container uppercase tracking-widest font-bold">
              {filteredBooks.length} Volúmenes Disponibles{" "}
              <span className="text-outline font-normal ml-2">
                • Filtros Activos: {activeCategory || "Todos"}
              </span>
            </span>
            <div className="flex items-center gap-2 text-xs text-outline uppercase tracking-wider">
              <span>Ordenar por:</span>
              <select className="bg-transparent border-none outline-none cursor-pointer font-bold text-on-tertiary-container">
                <option className="bg-inverse-surface">
                  Relevancia Archival
                </option>
                <option className="bg-inverse-surface">
                  Precio: Menor a Mayor
                </option>
                <option className="bg-inverse-surface">
                  Precio: Mayor a Menor
                </option>
              </select>
            </div>
          </div>

          {/* Grilla de Libros */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <CatalogBookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="w-full py-24 flex flex-col items-center justify-center text-center opacity-70 animate-fade-in">
              <span className="material-symbols-outlined text-5xl mb-4 text-outline">
                menu_book
              </span>
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
