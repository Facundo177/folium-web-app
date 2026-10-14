import FilterSection from "./FilterSection";

export default function FilterSidebar({
  categories,
  activeCategory,
  setActiveCategory,
}) {
  

  return (
    <div className="bg-surface-container rounded-md p-5 border border-outline-variant/50 shadow-md">
      <FilterSection title="Generos" defaultOpen={true}>
        <div className="flex flex-col gap-3">
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
          {categories.map((cat) => (
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

      <FilterSection title="Editorial" />
    {/*   <FilterSection title="Encuadernación" />
      <FilterSection title="Formato" /> */}
    </div>
  );
}