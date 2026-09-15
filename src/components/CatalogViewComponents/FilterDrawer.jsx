export default function FilterDrawer({ isOpen, onClose, showToast }) {
  if (!isOpen) return null;

  const handleApply = () => {
    showToast('Criterios de búsqueda aplicados a la reserva');
    onClose();
  };

  const handleReset = () => {
    // Lógica para limpiar estado de filtros aquí
    showToast('Filtros restablecidos');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
      <div 
        className="absolute top-0 right-0 h-full w-full max-w-md bg-parchment-card dark:bg-[#181310] border-l border-butcher/40 dark:border-rooster shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Evita que el clic cierre el drawer
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between pb-4 border-b border-butcher/30 dark:border-rooster">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-vampire dark:text-butcher text-[22px]">tune</span>
              <div>
                <h3 className="font-cinzel text-sm uppercase tracking-widest text-sheep dark:text-[#f4ecd8] font-bold">Filtros de Catálogo</h3>
                <p className="font-body-md text-xs text-antique dark:text-butcher/70 italic">Refinar la consulta de la reserva curatorial</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-antique dark:text-butcher hover:text-vampire dark:hover:text-[#f4ecd8] transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-cinzel text-[11px] uppercase tracking-wider text-vampire dark:text-butcher font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">category</span>Categoría / Género
              </label>
              <select className="bg-parchment-soft dark:bg-[#251b16] border border-butcher/40 dark:border-rooster rounded-lg px-3 py-2 text-xs text-sheep dark:text-[#f4ecd8] focus:outline-none focus:border-vampire cursor-pointer">
                <option value="all">Todas las categorías</option>
                <option value="gotico">Terror Gótico & Clásicos Oscuros</option>
                <option value="filosofia">Humanidades & Canon Filosófico</option>
                <option value="historia">Crónicas & Memoria Histórica</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="font-cinzel text-[11px] uppercase tracking-wider text-vampire dark:text-butcher font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">verified</span>Disponibilidad y Custodia
              </label>
              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-antique dark:text-butcher cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-butcher/40 text-vampire focus:ring-vampire" />
                  <span className="font-body-md">Disponible en Sala (Acceso Inmediato)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-antique dark:text-butcher cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-butcher/40 text-vampire focus:ring-vampire" />
                  <span className="font-body-md">En Custodia Especial / Bóveda Acorazada</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-butcher/30 dark:border-rooster flex items-center justify-between gap-3">
          <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-parchment-card hover:bg-parchment-soft dark:bg-transparent dark:hover:bg-[#251b16] text-antique dark:text-butcher font-cinzel text-xs tracking-wider border border-butcher/40 dark:border-rooster transition-colors cursor-pointer">
            Limpiar filtros
          </button>
          <button onClick={handleApply} className="px-5 py-2 rounded-lg bg-vampire hover:bg-rooster text-[#f4ecd8] font-cinzel text-xs tracking-wider transition-colors shadow-md font-semibold cursor-pointer">
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}