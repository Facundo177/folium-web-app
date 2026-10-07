export default function FavoritesDrawer({ isOpen, onClose, favorites = [], removeFavorite, clearAll, requestLoan }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
      <div 
        className="absolute top-0 right-0 h-full w-full max-w-md bg-parchment-card dark:bg-[#181310] border-l border-butcher/40 dark:border-rooster shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-4 border-b border-butcher/30 dark:border-rooster">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-vampire dark:text-butcher text-[22px]">bookmark_heart</span>
              <div>
                <h3 className="font-cinzel text-sm uppercase tracking-widest text-sheep dark:text-[#f4ecd8] font-bold">Colección de Favoritos</h3>
                <p className="font-body-md text-xs text-antique dark:text-butcher/70 italic">Guardados en su lista personal</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-antique dark:text-butcher hover:text-vampire dark:hover:text-[#f4ecd8] transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {favorites.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <span className="material-symbols-outlined text-antique/40 dark:text-butcher/30 text-[42px]">collections_bookmark</span>
              <p className="font-cinzel text-xs uppercase tracking-wider text-antique dark:text-butcher/80">No tiene volúmenes guardados aún</p>
              <p className="font-body-md text-xs text-antique/70 dark:text-butcher/60 max-w-xs italic">Haga clic en el ícono de corazón de cualquier libro para guardarlo en sus favoritos.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {favorites.map((book, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-parchment-soft dark:bg-[#1f1712] border border-butcher/30 dark:border-rooster shadow-sm gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-12 flex-shrink-0 bg-sheep rounded border border-butcher/30 overflow-hidden flex items-center justify-center text-butcher">
                      <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-headline-sm text-sm text-sheep dark:text-[#f4ecd8] truncate font-medium">{book.title}</span>
                      <span className="font-cinzel text-[10px] text-vampire dark:text-butcher uppercase tracking-wider">Favorito</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => requestLoan(book)} className="px-2 py-1 rounded bg-vampire hover:bg-rooster text-[#f4ecd8] font-cinzel text-[10px] tracking-wider transition-colors">Reservar</button>
                    <button onClick={() => removeFavorite(book)} className="w-7 h-7 rounded flex items-center justify-center text-antique/70 dark:text-butcher/70 hover:text-vampire dark:hover:text-[#f4ecd8] transition-colors">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-butcher/30 dark:border-rooster flex items-center justify-between">
          <span className="font-cinzel text-[11px] uppercase tracking-wider text-antique dark:text-butcher/70">
            {favorites.length} {favorites.length === 1 ? 'volumen guardado' : 'volúmenes guardados'}
          </span>
          {favorites.length > 0 && (
            <button onClick={clearAll} className="font-cinzel text-xs text-vampire dark:text-butcher hover:underline tracking-wider">
              Limpiar todo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}