import { useState, useMemo } from "react";
import FilterSidebar from "../CatalogSearchComponents/FilterSidebar";
import CatalogBookCard from "../CatalogSearchComponents/CatalogBookCard";
import { useBooks } from "../../hooks/useBooks";
import { adaptBook } from "../../api/adapters";
import { Search } from "lucide-react";
import {useGenres} from "../../hooks/useGenres"

export default function CatalogSearch() {
  // 1. Desestructuramos los libros
  const { 
    books, 
    isLoading: isLoading, 
    error: error,
  } = useBooks();

  // 2. Desestructuramos los géneros directamente desde la API
  const { 
    genres: apiGenres, 
    isLoading: isLoadingGenres 
  } = useGenres();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const adaptedBooks = useMemo(() => books.map(adaptBook), [books]);

  // 3. Mapeamos los nombres de los géneros traídos de la base de datos
  const categories = useMemo(() => {
    return apiGenres.map((genre) => genre.name).sort();
  }, [apiGenres]);

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

  if (isLoading) return <p className="pt-24 px-6 text-on-background font-sans">Cargando catálogo…</p>;
  if (error) return <p className="pt-24 px-6 text-error font-sans">{error}</p>;

  return (
    <div className="min-h-screen bg-background text-on-background font-sans pt-24 px-6 md:px-12 transition-colors duration-300">
      
      {/* Barra de Búsqueda Superior */}
      <div className="max-w-[1400px] mx-auto mb-10">
        <div className="flex items-center bg-surface-container-lowest border border-outline/50 rounded-md px-4 py-3 shadow-sm focus-within:border-primary transition-colors">
          <span className="text-outline mr-3">
            <Search/>
          </span>
          <input
            type="text"
            className="bg-transparent flex-1 outline-none font-serif italic text-on-surface placeholder:text-outline"
            placeholder="Buscar por título, autor, año, categoría o signatura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
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
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </aside>

        {/* Panel Derecho (Resultados) */}
        <main className="flex-1">
          
          {/* Cabecera de Resultados */}
          <div className="flex justify-between items-end mb-6 pb-3 border-b border-outline-variant/50">
            <span className="text-xs text-primary uppercase tracking-widest font-bold">
              {filteredBooks.length} Volúmenes Disponibles{" "}
              <span className="text-outline font-normal ml-2">
                • Filtros Activos: {activeCategory || "Todos"}
              </span>
            </span>
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