import Book3DCarousel from "../components/BookCatalogComponents/Book3DCarousel";
import BookCatalogGrid from "../components/BookCatalogComponents/BookCatalogGrid";
import BookCatalogHero from "../components/BookCatalogComponents/BookCatalogHero";
import BookCuratedCollection from "../components/BookCatalogComponents/BookCuratedCollection";
import BorrowingInstructions from "../components/BookCatalogComponents/BorrowingInstructions";


export default function BookCatalog() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Book3DCarousel/>
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-margin-edge py-stack-lg flex flex-col gap-stack-lg">
        <BookCuratedCollection/>
        <BookCatalogGrid />
        <BorrowingInstructions />
      <BookCatalogHero />
      </div>
    </div>
  );
}