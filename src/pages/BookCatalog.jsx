import { useEffect, useState } from "react";
import BookCoverFlowAlt from "../components/BookCatalogComponents/BookCoverFlow";
import CatalogSearch from "../components/BookCatalogComponents/CatalogSearch";
import Toast from "../components/BasicUIComponents/Toast";
import { useBooks } from "../hooks/useBooks";
import { useAuth } from "../auth/AuthProvider";
import { favoriteService } from "../api/services/favoriteService";

export default function BookCatalog() {
  // 1. Desestructuramos los libros
  const { books, isLoading: isLoading, error: error } = useBooks();
  const { user } = useAuth();

  // Mapa { [bookId]: favoriteId } de los favoritos actuales del usuario
  const [favoritesMap, setFavoritesMap] = useState({});

  // Estado para el Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    if (!user) {
      setFavoritesMap({});
      return;
    }

    const fetchFavorites = async () => {
      try {
        const { data } = await favoriteService.getAll();
        const map = {};
        data.forEach((fav) => {
          map[fav.book] = fav.id;
        });
        setFavoritesMap(map);
      } catch (err) {
        console.error("Error al cargar favoritos:", err);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleToggleFavorite = async (book) => {
    if (!user || !user.id) {
      alert("Debes iniciar sesión para guardar un volumen en favoritos.");
      return;
    }

    const existingFavId = favoritesMap[book.id];

    try {
      if (existingFavId) {
        await favoriteService.remove(existingFavId);
        setFavoritesMap((prev) => {
          const next = { ...prev };
          delete next[book.id];
          return next;
        });
        showToast(`"${book.title}" eliminado de favoritos`);
      } else {
        const { data } = await favoriteService.create({ book: book.id });
        setFavoritesMap((prev) => ({
          ...prev,
          [book.id]: data?.id ?? true,
        }));
        showToast(`"${book.title}" guardado en favoritos`);
      }
    } catch (err) {
      console.error("Error al actualizar favoritos:", err);
      showToast("No se pudo actualizar favoritos");
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <BookCoverFlowAlt
        showToast={showToast}
        heroBooks={books.slice(0, 10)}
        favoritesMap={favoritesMap}
        onToggleFavorite={handleToggleFavorite}
      />

      <CatalogSearch
        books={books}
        isLoading={isLoading}
        error={error}
        favoritesMap={favoritesMap}
        onToggleFavorite={handleToggleFavorite}
      />

      <div className="max-w-[var(--spacing-container-max)] mx-auto px-margin-edge py-stack-lg flex flex-col gap-stack-lg">
        <Toast message={toastMessage} />
      </div>
    </div>
  );
}
