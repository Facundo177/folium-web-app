import BookCatalogGrid from "../components/BookCatalogComponents/BookCatalogGrid";
import BookCatalogHero from "../components/BookCatalogComponents/BookCatalogHero";
import BorrowingInstructions from "../components/BookCatalogComponents/BorrowingInstructions";


export default function BookCatalog() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <BookCatalogHero />
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-margin-edge py-stack-lg flex flex-col gap-stack-lg">
        <BookCatalogGrid />
        <BorrowingInstructions />
      </div>
    </div>
  );
}