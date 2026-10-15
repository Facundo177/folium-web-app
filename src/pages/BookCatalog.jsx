import { useState } from "react";
import BookCoverFlowAlt from "../components/BookCatalogComponents/BookCoverFlow";
import CatalogSearch from "../components/BookCatalogComponents/CatalogSearch";
import Toast from "../components/BasicUIComponents/Toast";

export default function BookCatalog() {

  // Estado para el Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3500);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <BookCoverFlowAlt showToast={showToast} />
      <CatalogSearch />

      <div className="max-w-[var(--spacing-container-max)] mx-auto px-margin-edge py-stack-lg flex flex-col gap-stack-lg">
        <Toast message={toastMessage} />
      </div>
      
    </div>
  );
}
