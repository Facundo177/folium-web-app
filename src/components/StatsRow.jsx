export const StatsRow = () => {
  return (
    <>
      {/* Stats Row (Bento-style summary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
        {/* Stat Card 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-shadow">
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
              Total Libros
            </p>
            <p className="font-display-lg text-display-lg md:text-display-lg-mobile text-primary">
              12,450
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              library_books
            </span>
          </div>
        </div>
        {/* Stat Card 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-shadow">
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
              Stock Bajo
            </p>
            <p className="font-display-lg text-display-lg md:text-display-lg-mobile text-on-tertiary-fixed-variant">
              42
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-[24px]">
              warning_amber
            </span>
          </div>
        </div>
        {/* Stat Card 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-shadow">
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
              Pedidos Pendientes
            </p>
            <p className="font-display-lg text-display-lg md:text-display-lg-mobile text-primary">
              18
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              local_shipping
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatsRow;
