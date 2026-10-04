import { useState } from "react";
import BookCoverFlow from "../components/CatalogViewComponents/BookCoverFlow";
import CatalogSearchPage from "./CatalogSearchPage";
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


        <Toast message={toastMessage} />
      </div>
    </div>
  );
}
