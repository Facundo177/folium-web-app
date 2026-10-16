import { useEffect, useState } from "react";
import BookCoverFlowAlt from "../components/BookCatalogComponents/BookCoverFlow";
import CatalogSearch from "../components/BookCatalogComponents/CatalogSearch";
import Toast from "../components/BasicUIComponents/Toast";
import { useBooks } from "../hooks/useBooks";

export default function BookCatalog() {
  // 1. Desestructuramos los libros
  const { books, isLoading: isLoading, error: error } = useBooks();

  // Estado para el Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {console.log(books);
  }, [books])


  return (
    <div className="min-h-screen bg-background font-sans">
      <BookCoverFlowAlt showToast={showToast} heroBooks={books.slice(0,10)}/>

      <CatalogSearch books={books} isLoading={isLoading} error={error}/>

      <div className="max-w-[var(--spacing-container-max)] mx-auto px-margin-edge py-stack-lg flex flex-col gap-stack-lg">
        <Toast message={toastMessage} />
      </div>
      
    </div>
  );
}
