import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { favoriteService } from "../api/services/favoriteService";
import { useBooks } from "../hooks/useBooks";
import { adaptBook } from "../api/adapters";
import CatalogBookCard from "../components/CatalogSearchComponents/CatalogBookCard";
import FeedbackModal from "../components/BasicUIComponents/FeedbackModal";
import { Heart } from "lucide-react";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export default function Favourites() {
  const navigate = useNavigate();
  useDocumentMetadata({
    title: "Mis Libros Favoritos",
    description: "Tu colección personalizada de volúmenes y obras guardadas en Folium.",
    noIndex: true,
  });
  const { books, isLoading: loadingBooks } = useBooks();

  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    type: "error",
    title: "",
    message: "",
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        const { data } = await favoriteService.getAll();
        setFavorites(data);
      } catch (err) {
        setError("Error al cargar tus volúmenes favoritos.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Diccionario de libros adaptados por ID para enriquecer los datos del favorito
  const booksById = useMemo(() => {
    return Object.fromEntries(
      books.map((b) => {
        const adapted = adaptBook(b);
        return [adapted.id, adapted];
      })
    );
  }, [books]);

  // Lista de favoritos combinando la info completa del catálogo o el book_detail del endpoint
  const favoriteBooks = useMemo(() => {
    return favorites.map((fav) => {
      const fullBook = booksById[fav.book];
      if (fullBook) {
        return {
          favoriteId: fav.id,
          book: fullBook,
        };
      }

      const detail = fav.book_detail || {};
      return {
        favoriteId: fav.id,
        book: {
          id: detail.id || fav.book,
          title: detail.title || `Volumen #${fav.book}`,
          author: detail.editorial || "Archivo Folium",
          category: "Favorito",
          year: "",
          cover: detail.cover_image || null,
        },
      };
    });
  }, [favorites, booksById]);

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await favoriteService.remove(favoriteId);
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
    } catch (err) {
      console.error("Error al eliminar de favoritos:", err);
      setModal({
        isOpen: true,
        type: "error",
        title: "Error al quitar favorito",
        message: "No se pudo quitar el volumen de tus favoritos.",
      });
    }
  };

  if (isLoading || loadingBooks) {
    return (
      <div className="p-8 text-on-background font-sans">
        Cargando tus volúmenes favoritos...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-error font-bold font-sans">{error}</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 font-sans animate-fade-in">
      {/* Cabecera */}
      <div className="mb-8 pb-4 border-b border-outline-variant/50 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-serif text-on-background mb-2">
            Mis Volúmenes Favoritos
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Colección personal de ejemplares destacados guardados desde el catálogo.
          </p>
        </div>
        <span className="text-xs text-primary uppercase tracking-widest font-bold">
          {favoriteBooks.length}{" "}
          {favoriteBooks.length === 1 ? "Volumen Guardado" : "Volúmenes Guardados"}
        </span>
      </div>

      {/* Grilla de Favoritos */}
      {favoriteBooks.length === 0 ? (
        <div className="w-full py-24 bg-surface-container-lowest border border-outline-variant/50 rounded-lg flex flex-col items-center justify-center text-center p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-sm uppercase tracking-widest font-bold text-on-surface mb-2">
            Aún no tienes volúmenes en favoritos
          </p>
          <p className="text-body-md text-on-surface-variant max-w-md mb-6">
            Explora el catálogo general y pulsa el ícono del corazón en cualquier ejemplar para guardarlo aquí.
          </p>
          <button
            onClick={() => navigate("/catalog")}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteBooks.map(({ favoriteId, book }) => (
            <CatalogBookCard
              key={favoriteId}
              book={book}
              isFavorite={true}
              favoriteId={favoriteId}
              onToggleFavorite={() => handleRemoveFavorite(favoriteId)}
            />
          ))}
        </div>
      )}

      <FeedbackModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
