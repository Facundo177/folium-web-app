import { useState, useEffect } from "react";
import FilterSection from "./FilterSection";

const MIN_YEAR = 868;

export default function FilterSidebar({
  // Géneros
  categories,
  activeCategory,
  setActiveCategory,
  // Rango de Años
  yearRange,
  setYearRange,
}) {
  const currentYear = new Date().getFullYear();
  const externalYear = yearRange?.start ? String(yearRange.start) : "";
  const [yearInput, setYearInput] = useState(externalYear);
  const [prevExternalYear, setPrevExternalYear] = useState(externalYear);

  if (externalYear !== prevExternalYear) {
    setPrevExternalYear(externalYear);
    setYearInput(externalYear);
  }

  const isYearInputValid =
    yearInput === "" ||
    (/^\d{4}$/.test(yearInput) &&
      Number(yearInput) >= MIN_YEAR &&
      Number(yearInput) <= currentYear);

  useEffect(() => {
    if (yearInput === externalYear) return;
    if (!isYearInputValid) return;

    const timer = setTimeout(() => {
      setYearRange({ start: yearInput, end: "" });
    }, 350);
    return () => clearTimeout(timer);
  }, [yearInput, externalYear, isYearInputValid, setYearRange]);

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
        <div className="flex flex-col gap-3 mt-1">
          <input
            type="number"
            inputMode="numeric"
            min={MIN_YEAR}
            max={currentYear}
            placeholder="Ej. 2020"
            value={yearInput}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
              setYearInput(digitsOnly);
            }}
            className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-md text-sm text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 shadow-sm"
          />

          {!isYearInputValid && (
            <p className="text-[11px] text-on-surface-variant">
              Ingresa un año de 4 dígitos entre {MIN_YEAR} y {currentYear}.
            </p>
          )}
          
          {/* Botón para limpiar los años si hay alguno escrito */}
          {(yearInput || yearRange?.start || yearRange?.end) && (
            <button
              onClick={() => {
                setYearInput("");
                setYearRange({ start: "", end: "" });
              }}
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