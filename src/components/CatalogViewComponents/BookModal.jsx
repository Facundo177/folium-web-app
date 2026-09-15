export default function BookModal({ book, onClose, showToast }) {
  if (!book) return null;

  const handleConfirm = () => {
    showToast(`Reserva confirmada para "${book.title}". El equipo de recuperación está activo.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-parchment-card dark:bg-[#1f1712] max-w-lg w-full rounded-xl p-6 sm:p-8 border border-butcher/50 dark:border-rooster antique-box-border shadow-2xl relative flex flex-col gap-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-antique dark:text-[#f4ecd8] hover:text-vampire dark:hover:text-[#f4ecd8] transition-colors"
          onClick={onClose}
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
        
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-vampire dark:bg-butcher shadow-[0_0_8px_#640606] dark:shadow-[0_0_8px_#B59785]"></span>
          <span className="font-cinzel text-xs uppercase tracking-widest text-vampire dark:text-[#f4ecd8] font-semibold">
            Physical Holding Dossier
          </span>
        </div>
        
        <div>
          <h3 className="font-headline-md text-2xl text-sheep dark:text-[#f4ecd8] font-normal">{book.title}</h3>
          <p className="font-body-md text-sm text-antique dark:text-[#f4ecd8] italic">{book.author}</p>
        </div>
        
        <div className="p-4 bg-parchment-soft dark:bg-sheep border border-butcher/30 dark:border-rooster rounded-lg flex flex-col gap-2 shadow-inner">
          <span className="font-cinzel text-[11px] text-vampire dark:text-[#f4ecd8] uppercase tracking-wider font-semibold">
            Shelfmark & Location
          </span>
          <p className="font-body-md text-sm text-sheep dark:text-[#f4ecd8] font-medium">{book.location}</p>
          <p className="font-body-md text-xs text-antique dark:text-[#f4ecd8] italic">{book.notes}</p>
        </div>
        
        <div className="flex items-center justify-end gap-3 pt-2">
          <button 
            className="px-4 py-2 rounded bg-parchment-card hover:bg-parchment-soft dark:bg-sheep dark:hover:bg-rooster text-antique dark:text-[#f4ecd8] font-cinzel text-xs border border-butcher/40 dark:border-rooster transition-colors tracking-wider"
            onClick={onClose}
          >
            Close
          </button>
          <button 
            className="px-4 py-2 rounded bg-vampire hover:bg-rooster text-[#f4ecd8] border border-vampire font-cinzel text-xs tracking-wider transition-colors shadow-sm"
            onClick={handleConfirm}
          >
            Confirm Loan Reservation
          </button>
        </div>
      </div>
    </div>
  );
}