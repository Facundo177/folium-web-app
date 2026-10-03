import { useParams } from "react-router-dom";
import BookCover from "../components/BookDetailComponents/BookCover";
import BookDetailHeader from "../components/BookDetailComponents/BookDetailHeader";
import BookInfo from "../components/BookDetailComponents/BookInfo";
import CurrentStock from "../components/BookDetailComponents/CurrentStock";
import BookReviews from "../components/BookDetailComponents/BookReviews";
import { useBook } from "../hooks/useBook";
import { adaptBookDetail } from "../api/adapters";

export default function BookDetail() {
  
  const { id } = useParams();
  const { book, isLoading, error } = useBook(id);

  if (isLoading) return <p className="p-gutter">Cargando libro…</p>;
  if (error) return <p className="p-gutter">{error}</p>;

  const data = adaptBookDetail(book);

  // consultar todos los datos del libro a la API 
  // usando el ISBN pasado por parámetro

  return (
    <div className="max-w-(--spacing-container-max) mx-auto p-gutter bg-background min-h-screen">
      <BookDetailHeader genres={data.genres}/>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg">
        {/* Columna Izquierda (1/3) */}
        <div className="md:col-span-1 flex flex-col gap-stack-lg">
          <BookCover imageSrc={data.cover} title={data.title}/>
          <CurrentStock stock={data.availableItems} items={data.items}/>
        </div>

        {/* Columna Derecha (2/3) */}
        <div className="md:col-span-2 flex flex-col gap-stack-lg">
          <BookInfo 
            ISBN={data.isbn}
            title={data.title}
            author={data.author}
            publicationDate={data.year}
            description={data.description}
            tags={data.genres} />
          {/* <RecentActivity /> */}
          <BookReviews/>
        </div>
      </div>
    </div>
  );
}
