import { useState } from 'react';
import FilterDrawer from '../components/CatalogViewComponents/FilterDrawer';
import Toast from '../components/BasicUIComponents/Toast';
import BookCoverFlow from '../components/CatalogViewComponents/BookCoverFlow';
import CuratedCollection from '../components/CatalogViewComponents/CuratedCollection';
import FavoritesDrawer from '../components/CatalogViewComponents/FavouritesDrawer';
import BookModal from '../components/CatalogViewComponents/BookModal';


export default function CatalogView() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  
  // Estado para el Modal de Vista Rápida
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Estado para el Toast
  const [toastMessage, setToastMessage] = useState('');
  

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleOpenModal = (book) => {
    setSelectedBook(book);
  };

  return (
    <div className="min-h-screen bg-parchment dark:bg-sheep font-body-md text-antique dark:text-butcher antialiased transition-colors duration-300">
      
      <BookCoverFlow onOpenModal={handleOpenModal} showToast={showToast}/>



      <div className="w-full bg-parchment-soft/80 dark:bg-sheep/80 transition-colors duration-300 py-4 z-40 relative">
        <div className="max-w-container-max mx-auto px-margin-edge">
          <div className="w-full flex items-center justify-between gap-3 sm:gap-4 px-4 py-2 rounded-xl bg-parchment-card/90 dark:bg-[#1b1513] border border-butcher/30 dark:border-rooster shadow-sm transition-all focus-within:border-butcher dark:focus-within:border-butcher/70 focus-within:ring-1 focus-within:ring-butcher/30">
            
            <div className="flex items-center pl-1 text-antique/80 dark:text-butcher/80">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </div>
            
            <input 
              className="bg-transparent text-sheep dark:text-[#f4ecd8] placeholder:text-antique/60 dark:placeholder:text-butcher/50 focus:outline-none flex-grow font-headline-sm italic text-base sm:text-[18px] py-1.5 px-2" 
              placeholder="Buscar por título, autor, año, categoría o signatura..." 
              type="text" 
            />
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-parchment hover:bg-[#e4ddcf] dark:bg-[#241a15] dark:hover:bg-rooster/80 text-antique dark:text-[#f4ecd8] border border-butcher/30 dark:border-rooster font-cinzel text-xs tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 group"
              >
                <span className="material-symbols-outlined text-[18px] text-antique/80 dark:text-butcher group-hover:text-vampire dark:group-hover:text-[#f4ecd8] transition-colors">tune</span>
                <span className="text-xs font-semibold">Filtros</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AQUÍ VAN TUS COMPONENTES DE GRILLA */}
      <CuratedCollection onOpenModal={handleOpenModal} showToast={showToast}/>

      {/* COMPONENTES FLOTANTES */}
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} showToast={showToast} />
      <FavoritesDrawer isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} showToast={showToast} />
      
      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} showToast={showToast} />
      )}
      
      <Toast message={toastMessage} />
    </div>
  );
}