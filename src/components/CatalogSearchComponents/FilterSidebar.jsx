import FilterSection from "./FilterSection";

export default function FilterSidebar({
  // Géneros
  categories,
  activeCategory,
  setActiveCategory,
  // Editoriales
  editorials,
  activeEditorial,
  setActiveEditorial,
  // Rango de Años
  yearRange,
  setYearRange,
}) {
  
  // Manejador del rango de años
  const handleYearChange = (field, value) => {
    setYearRange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-surface-container rounded-md p-5 border border-outline-variant/50 shadow-md">
      
      {/* SECCIÓN GÉNEROS */}
      <FilterSection title="Géneros" defaultOpen={true}>
        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-left text-xs uppercase tracking-widest transition-colors ${
              !activeCategory 
                ? "text-primary font-bold" 
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Todas
          </button>
          {categories?.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-left text-xs uppercase tracking-widest transition-colors ${
                activeCategory === cat 
                  ? "text-primary font-bold" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* SECCIÓN EDITORIALES */}
      {/* <FilterSection title="Editorial" defaultOpen={false}>
        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          <button
            onClick={() => setActiveEditorial(null)}
            className={`text-left text-xs uppercase tracking-widest transition-colors ${
              !activeEditorial 
                ? "text-primary font-bold" 
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Todas
          </button>
          {editorials?.map((ed) => (
            <button
              key={ed}
              onClick={() => setActiveEditorial(ed)}
              className={`text-left text-xs uppercase tracking-widest transition-colors ${
                activeEditorial === ed 
                  ? "text-primary font-bold" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {ed}
            </button>
          ))}
        </div>
      </FilterSection> */}

      {/* SECCIÓN AÑO DE PUBLICACIÓN */}
      <FilterSection title="Año de Edición" defaultOpen={false}>
        <div className="flex flex-col gap-4 mt-1">
          <input
            type="number"
            placeholder="Ej. 2020"
            value={yearRange?.start || ""}
            onChange={(e) => setYearRange({ start: e.target.value, end: "" })}
            className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-md text-sm text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
          />
          
          {/* Botón para limpiar los años si hay alguno escrito */}
          {(yearRange?.start || yearRange?.end) && (
            <button
              onClick={() => setYearRange({ start: "", end: "" })}
              className="text-xs text-on-surface-variant hover:text-primary transition-colors text-left uppercase tracking-widest font-bold"
            >
              Restablecer Fechas
            </button>
          )}
        </div>
      </FilterSection>

    </div>
  );
}