import { useState } from "react";
import FilterSection from "./FilterSection";

export default function FilterSidebar({
  priceRange,
  setPriceRange,
  activeCategory,
  setActiveCategory,
}) {
  const [localMin, setLocalMin] = useState(priceRange.min);
  const [localMax, setLocalMax] = useState(priceRange.max);

  const handleApplyPrice = () => {
    setPriceRange({ min: Number(localMin), max: Number(localMax) });
  };

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

      <FilterSection title="Precio" defaultOpen={true}>
        <div className="flex items-end gap-2">
          <div className="flex flex-col flex-1 gap-1.5">
            <span className="text-[10px] text-outline uppercase tracking-widest font-bold">
              Desde
            </span>
            <input
              type="number"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="w-full bg-primary-container border border-outline-variant/50 rounded px-2 py-1.5 text-xs text-on-primary outline-none focus:border-on-tertiary-container"
            />
          </div>
          <div className="flex flex-col flex-1 gap-1.5">
            <span className="text-[10px] text-outline uppercase tracking-widest font-bold">
              Hasta
            </span>
            <input
              type="number"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="w-full bg-primary-container border border-outline-variant/50 rounded px-2 py-1.5 text-xs text-on-primary outline-none focus:border-on-tertiary-container"
            />
          </div>
          <button
            onClick={handleApplyPrice}
            className="bg-transparent border border-outline-variant text-on-primary hover:border-on-tertiary-container hover:text-on-tertiary-container px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            Aplicar
          </button>
        </div>
      </FilterSection>

      <FilterSection title="Editorial" />
      <FilterSection title="Encuadernación" />
      <FilterSection title="Formato" />
    </div>
  );
}
