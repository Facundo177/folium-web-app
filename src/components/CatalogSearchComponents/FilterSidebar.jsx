import FilterSection from "./FilterSection";

export default function FilterSidebar({
  activeCategory,
  setActiveCategory,
}) {


  const categories = [
    "Gótico",
    "Terror Romántico",
    "Fantasía Oscura",
    "Filosofía",
    "Novela Psicológica",
  ];

  return (
    <div className="bg-inverse-surface rounded-md p-5 border border-outline-variant/30 shadow-lg">
      <FilterSection title="Categorías" defaultOpen={true}>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-left text-xs uppercase tracking-widest transition-colors ${!activeCategory ? "text-on-tertiary-container font-bold" : "text-outline hover:text-on-primary"}`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-left text-xs uppercase tracking-widest transition-colors ${activeCategory === cat ? "text-on-tertiary-container font-bold" : "text-outline hover:text-on-primary"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Editorial" />
      <FilterSection title="Encuadernación" />
      <FilterSection title="Formato" />
    </div>
  );
}
