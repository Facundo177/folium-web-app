import { useState } from "react";
import BookCatalogGrid from "../components/BookCatalogComponents/BookCatalogGrid";
import BookCatalogHero from "../components/BookCatalogComponents/BookCatalogHero";
import BookCuratedCollection from "../components/BookCatalogComponents/BookCuratedCollection";
import BorrowingInstructions from "../components/BookCatalogComponents/BorrowingInstructions";
import BookCoverFlow from "../components/CatalogViewComponents/BookCoverFlow";
import CatalogSearchPage from "./CatalogSearchPage";
import CuratedCollection from "../components/CatalogViewComponents/CuratedCollection";
import FilterDrawer from "../components/CatalogViewComponents/FilterDrawer";
import FavoritesDrawer from "../components/CatalogViewComponents/FavouritesDrawer";
import BookModal from "../components/CatalogViewComponents/BookModal";
import Toast from "../components/BasicUIComponents/Toast";

export default function BookCatalog() {

  // Estado para el Modal de Vista Rápida
  const [selectedBook, setSelectedBook] = useState(null);

  // Estado para el Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleOpenModal = (book) => {
    setSelectedBook(book);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <BookCoverFlow onOpenModal={handleOpenModal} showToast={showToast} />
      <CatalogSearchPage />

      <div className="max-w-[var(--spacing-container-max)] mx-auto px-margin-edge py-stack-lg flex flex-col gap-stack-lg">

        {/* AQUÍ VAN TUS COMPONENTES DE GRILLA */}
        <CuratedCollection
          onOpenModal={handleOpenModal}
          showToast={showToast}
        />



        <BookCuratedCollection />
        <BookCatalogGrid />
        <BorrowingInstructions />
        <BookCatalogHero />



        <Toast message={toastMessage} />
      </div>
    </div>
  );
}
