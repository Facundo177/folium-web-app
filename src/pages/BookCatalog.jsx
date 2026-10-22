import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, UserPlus, LogIn, BookOpen, Heart, LockKeyhole } from "lucide-react";
import BookCoverFlowAlt from "../components/BookCatalogComponents/BookCoverFlow";
import CatalogSearch from "../components/BookCatalogComponents/CatalogSearch";
import Toast from "../components/BasicUIComponents/Toast";
import FeedbackModal from "../components/BasicUIComponents/FeedbackModal";
import { useBooks } from "../hooks/useBooks";
import { useAuth } from "../auth/AuthProvider";
import { favoriteService } from "../api/services/favoriteService";

export default function BookCatalog() {
  const navigate = useNavigate();
  const { books, isLoading, error } = useBooks();
  const { user, isGuest } = useAuth();

  // Mapa { [bookId]: favoriteId } de los favoritos actuales del usuario
  const [favoritesMap, setFavoritesMap] = useState({});

  // Estado para el Toast
  const [toastMessage, setToastMessage] = useState("");

  // Estado para el modal personalizado
  const [modal, setModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    onConfirm: null,
  });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const openGuestPrompt = (actionDescription = "acceder a todas las funciones del catálogo") => {
    setModal({
      isOpen: true,
      type: "info",
      title: "Únete a la comunidad de Folium",
      message: `Estás explorando el catálogo como invitado.\n\nCrea una cuenta gratuita o inicia sesión para ${actionDescription}, gestionar préstamos y compartir tus reseñas.`,
      confirmText: "Crear cuenta gratis",
      cancelText: "Seguir explorando",
      onConfirm: () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
        navigate("/register");
      },
    });
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
      openGuestPrompt("guardar volúmenes en tu colección de favoritos");
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
      {/* Banner de invitación para usuarios GUEST */}
      {isGuest && (
        <div className="px-4 sm:px-8 pt-16 lg:pt-6">
          <div className="max-w-[1400px] mx-auto bg-surface-container border border-outline-variant/60 rounded-md p-5 sm:p-6 shadow-md relative overflow-hidden">
            <div className="pointer-events-none absolute inset-1 border border-outline-variant/20 rounded-sm" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-primary text-[11px] font-bold uppercase tracking-[0.2em]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Modo Invitado • Archivo Abierto</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl text-on-surface font-medium leading-snug">
                  Viví la experiencia completa de Folium
                </h2>
                <p className="text-body-sm sm:text-body-md text-on-surface-variant leading-relaxed">
                  Estás explorando nuestro catálogo público. Registrate gratis para reservar ejemplares físicos, armar tu estantería de favoritos y participar con reseñas en la comunidad.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-on-surface-variant">
                  <span className="inline-flex items-center gap-1.5">
                    <LockKeyhole className="w-3.5 h-3.5 text-primary" />
                    Reservas online
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-primary" />
                    Colección de favoritos
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    Fichas completas y reseñas
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Crear cuenta gratis
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BookCoverFlowAlt
        showToast={showToast}
        heroBooks={books.slice(0, 10)}
        favoritesMap={favoritesMap}
        onToggleFavorite={handleToggleFavorite}
        onRequireAuth={openGuestPrompt}
      />

      <CatalogSearch
        books={books}
        isLoading={isLoading}
        error={error}
        favoritesMap={favoritesMap}
        onToggleFavorite={handleToggleFavorite}
        onRequireAuth={openGuestPrompt}
      />

      <div className="max-w-[var(--spacing-container-max)] mx-auto px-margin-edge py-stack-lg flex flex-col gap-stack-lg">
        <Toast message={toastMessage} />
      </div>

      <FeedbackModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
