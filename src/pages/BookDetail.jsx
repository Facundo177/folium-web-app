import { useParams } from "react-router-dom";
import BookCover from "../components/BookDetailComponents/BookCover";
import BookDetailHeader from "../components/BookDetailComponents/BookDetailHeader";
import BookInfo from "../components/BookDetailComponents/BookInfo";
import CurrentStock from "../components/BookDetailComponents/CurrentStock";
import RecentActivity from "../components/BookDetailComponents/RecentActivity";

export default function BookDetail() {
  let params = useParams();

  // consultar todos los datos del libro a la API 
  // usando el ISBN pasado por parámetro

  return (
    <div className="max-w-(--spacing-container-max) mx-auto p-gutter bg-background min-h-screen">
      <BookDetailHeader />

      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg">
        {/* Columna Izquierda (1/3) */}
        <div className="md:col-span-1 flex flex-col gap-stack-lg">
          <BookCover />
          <CurrentStock />
        </div>

        {/* Columna Derecha (2/3) */}
        <div className="md:col-span-2 flex flex-col gap-stack-lg">
          <BookInfo ISBN={params.ISBN} />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
