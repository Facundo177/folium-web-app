import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { bookService } from "../api/services/bookService";
import { loanService } from "../api/services/loanService";
import { reservationService } from "../api/services/reservationService";
import { adaptBook } from "../api/adapters";
import {
  Sparkles,
  RefreshCw,
  BookOpen,
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Tag,
  Compass,
  BookMarked,
  BookmarkCheck,
  LayoutGrid,
  CornerDownLeft,
  XCircle,
  Heart,
  User,
  Package,
  PlusCircle,
  LogIn,
  UserPlus,
} from "lucide-react";

// =========================================================
// 0. MENÚ PRINCIPAL GUIADO (PUNTO DE ENTRADA DE OPCIONES)
// =========================================================
export function MainMenuWidget(props) {
  const role = props.state?.userRole || props.payload?.role || "GUEST";
  const isStaff = ["LIBRARIAN", "ADMIN"].includes(role);
  const isGuest = role === "GUEST";

  const options = [
    {
      id: "search_title",
      icon: Search,
      label: "Buscar por Título o Autor",
      hint: "Activá el buscador y escribí el nombre",
      onClick: () => props.actionProvider.promptSearchTitleAuthor(),
    },
    {
      id: "search_genre",
      icon: Tag,
      label: "Buscar por Género",
      hint: "Elegí o escribí una categoría literaria",
      onClick: () => props.actionProvider.promptSearchGenre(),
    },
    {
      id: "recommend",
      icon: Sparkles,
      label: "Recomendarme un Libro",
      hint: "Sugerencia al azar de nuestro archivo",
      onClick: () => props.actionProvider.handleRecommendation(),
    },
    ...(!isGuest
      ? [
          {
            id: "loans",
            icon: BookMarked,
            label: isStaff ? "Resumen de Préstamos" : "Mis Préstamos Activos",
            hint: isStaff
              ? "Ver activos y vencidos en biblioteca"
              : "Consultar tus ejemplares y vencimientos",
            onClick: () => props.actionProvider.handleLoans(role),
          },
          {
            id: "reservations",
            icon: BookmarkCheck,
            label: isStaff ? "Solicitudes de Reserva" : "Mis Reservas",
            hint: isStaff
              ? "Ver reservas pendientes de lectores"
              : "Consultar estado de tus reservas",
            onClick: () => props.actionProvider.handleReservations(role),
          },
        ]
      : []),
    {
      id: "navigation",
      icon: Compass,
      label: "Ir a una Sección",
      hint: "Accesos directos a páginas de Folium",
      onClick: () => props.actionProvider.handleNavigationMenu(role),
    },
  ];

  return (
    <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm text-on-surface">
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-outline-variant/50">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5" />
          Menú de Opciones
        </span>
        <span className="text-[10px] text-on-surface-variant italic">
          Elegí una acción
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {options.map((opt) => {
          const IconComponent = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={opt.onClick}
              className="w-full p-2 rounded-sm bg-surface-container hover:bg-primary hover:text-on-primary border border-outline-variant/50 hover:border-primary transition-all flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-sm bg-surface-container-lowest group-hover:bg-on-primary/15 text-primary group-hover:text-on-primary flex items-center justify-center shrink-0 transition-colors">
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight truncate">
                  {opt.label}
                </p>
                <p className="text-[10px] text-on-surface-variant group-hover:text-on-primary/80 leading-tight truncate mt-0.5">
                  {opt.hint}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================
// 0.1 WIDGET DE ESPERA DE ENTRADA DE TEXTO (MODO GUIADO)
// =========================================================
export function AwaitingInputWidget(props) {
  const mode = props.payload?.mode || "SEARCH_TITLE_AUTHOR";
  const isGenreMode = mode === "SEARCH_GENRE";

  const [genres, setGenres] = useState([]);

  useEffect(() => {
    if (!isGenreMode) return;
    let mounted = true;
    bookService
      .getAll()
      .then(({ data }) => {
        if (!mounted) return;
        const adapted = data.map(adaptBook);
        const allGenres = [
          ...new Set(adapted.flatMap((b) => b.genres || [])),
        ].slice(0, 8);
        setGenres(allGenres);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [isGenreMode]);

  return (
    <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border-l-4 border-l-primary border border-outline-variant rounded-r-lg shadow-xs text-on-surface">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">
        <CornerDownLeft className="w-3.5 h-3.5" />
        <span>
          {isGenreMode
            ? "Modo Activo: Búsqueda por Género"
            : "Modo Activo: Búsqueda por Título o Autor"}
        </span>
      </div>

      <p className="text-xs text-on-surface-variant leading-relaxed mb-2.5">
        {isGenreMode
          ? "Escribí el género en la barra inferior y presioná Enter, o tocá uno de los géneros disponibles:"
          : "Escribí el título del libro o el nombre del autor en la barra inferior y presioná Enter."}
      </p>

      {isGenreMode && genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => props.actionProvider.handleBookSearch(g, "genre")}
              className="px-2.5 py-1 text-[11px] font-semibold bg-surface-container hover:bg-primary hover:text-on-primary border border-outline-variant/60 rounded-full transition-colors cursor-pointer"
            >
              {g}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          props.actionProvider.handleShowMainMenu(
            "Búsqueda cancelada. Elegí otra opción del menú cuando quieras:"
          )
        }
        className="w-full py-1.5 px-2.5 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 border border-outline-variant/50 transition-colors cursor-pointer"
      >
        <XCircle className="w-3.5 h-3.5" />
        Cancelar y volver al menú
      </button>
    </div>
  );
}

// =========================================================
// 0.2 SUBMENÚ DE NAVEGACIÓN POR SECCIONES
// =========================================================
export function NavigationMenuWidget(props) {
  const navigate = useNavigate();
  const role = props.state?.userRole || props.payload?.role || "GUEST";
  const isStaff = ["LIBRARIAN", "ADMIN"].includes(role);
  const isGuest = role === "GUEST";

  const links = isStaff
    ? [
        { label: "Inventario General", route: "/librarian/inventory", icon: Package },
        { label: "Cargar Nuevo Libro", route: "/librarian/inventory/newBook", icon: PlusCircle },
        { label: "Añadir Ejemplar Físico", route: "/librarian/inventory/newItem", icon: PlusCircle },
        { label: "Panel de Préstamos", route: "/librarian/loans", icon: BookMarked },
        { label: "Panel de Reservas", route: "/librarian/reservations", icon: BookmarkCheck },
        { label: "Catálogo de Libros", route: "/librarian/catalog", icon: BookOpen },
      ]
    : isGuest
    ? [
        { label: "Explorar Catálogo", route: "/catalog", icon: BookOpen },
        { label: "Iniciar Sesión", route: "/login", icon: LogIn },
        { label: "Crear Cuenta", route: "/register", icon: UserPlus },
      ]
    : [
        { label: "Explorar Catálogo", route: "/catalog", icon: BookOpen },
        { label: "Mis Favoritos", route: "/user/favourites", icon: Heart },
        { label: "Mis Préstamos", route: "/user/loans", icon: BookMarked },
        { label: "Mis Reservas", route: "/user/reservations", icon: BookmarkCheck },
        { label: "Mi Perfil", route: "/user/profile", icon: User },
      ];

  return (
    <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm text-on-surface">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
        <Compass className="w-3.5 h-3.5" />
        <span>Accesos Directos de Folium</span>
      </div>

      <div className="grid grid-cols-1 gap-1.5 mb-2.5">
        {links.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => navigate(item.route)}
              className="w-full px-3 py-2 rounded-sm bg-surface-container hover:bg-primary hover:text-on-primary border border-outline-variant/50 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <IconComponent className="w-3.5 h-3.5 text-primary group-hover:text-on-primary" />
                {item.label}
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => props.actionProvider.handleShowMainMenu()}
        className="w-full py-1.5 px-2.5 rounded-sm bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-on-surface text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <LayoutGrid className="w-3 h-3" />
        Volver al Menú Principal
      </button>
    </div>
  );
}

// =========================================================
// 1. WIDGET DE RECOMENDACIÓN INTERACTIVA DE LIBROS
// =========================================================
export function BookRecommendationWidget(props) {
  const navigate = useNavigate();
  const genreHint = props.payload?.genreHint || "";

  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const { data } = await bookService.getAll();
        if (!mounted) return;
        const list = Array.isArray(data) ? data : (data?.results || []);
        const adapted = list.map(adaptBook);
        setBooks(adapted);

        if (adapted.length > 0) {
          const pool = filterByHint(adapted, genreHint);
          const randomBook = pool[Math.floor(Math.random() * pool.length)];
          setCurrentBook(randomBook);
        }
      } catch (err) {
        console.error("Error en recomendación del bot:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      mounted = false;
    };
  }, [genreHint]);

  const filterByHint = (list, hint) => {
    if (!hint) return list;
    const clean = hint
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const matched = list.filter((b) =>
      b.genres?.some((g) =>
        g
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(clean)
      )
    );
    return matched.length > 0 ? matched : list;
  };

  const handleAnother = () => {
    if (books.length <= 1) return;
    const pool = filterByHint(books, genreHint).filter(
      (b) => b.id !== currentBook?.id
    );
    const source = pool.length > 0 ? pool : books;
    const next = source[Math.floor(Math.random() * source.length)];
    setCurrentBook(next);
  };

  if (isLoading) {
    return (
      <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-xs text-on-surface-variant italic">
        Buscando una joya literaria en el archivo...
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-xs text-on-surface-variant">
        No hay volúmenes cargados en el catálogo todavía.
      </div>
    );
  }

  return (
    <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm text-on-surface">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Sugerencia del Archivo • {currentBook.category}</span>
      </div>

      <div className="flex gap-3 items-start">
        <div
          onClick={() => navigate(`/book/${currentBook.id}`)}
          className="w-14 h-20 shrink-0 bg-surface-container-highest border border-outline-variant/40 rounded-sm overflow-hidden flex items-center justify-center cursor-pointer"
        >
          {currentBook.cover ? (
            <img
              src={currentBook.cover}
              alt={currentBook.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-serif italic text-xs text-center px-1 text-on-surface line-clamp-3">
              {currentBook.title}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            onClick={() => navigate(`/book/${currentBook.id}`)}
            className="font-serif font-bold text-sm text-on-surface leading-snug line-clamp-2 hover:text-primary cursor-pointer"
          >
            {currentBook.title}
          </h4>
          <p className="text-xs text-on-surface-variant italic line-clamp-1 mt-0.5">
            {currentBook.author}
          </p>
          {currentBook.year && (
            <span className="inline-block text-[10px] text-outline uppercase tracking-widest mt-1">
              Año {currentBook.year}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-3 pt-2 border-t border-outline-variant/40">
        <button
          type="button"
          onClick={() => navigate(`/book/${currentBook.id}`)}
          className="flex-1 bg-primary text-on-primary py-1.5 px-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <BookOpen className="w-3 h-3" />
          Ver Ficha
        </button>
        {books.length > 1 && (
          <button
            type="button"
            onClick={handleAnother}
            className="bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/50 py-1.5 px-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Probar otra recomendación"
          >
            <RefreshCw className="w-3 h-3" />
            Otro
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => props.actionProvider.handleShowMainMenu()}
        className="w-full mt-2 py-1.5 px-2.5 rounded-sm bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface-variant text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <LayoutGrid className="w-3 h-3" />
        Volver al Menú de Opciones
      </button>
    </div>
  );
}

// =========================================================
// 2. WIDGET DE BÚSQUEDA EN VIVO EN EL CATÁLOGO
// =========================================================
export function BookSearchWidget(props) {
  const navigate = useNavigate();
  const query = props.payload?.query || "";
  const searchMode = props.payload?.searchMode || "title_author";

  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const { data } = await bookService.getAll();
        if (mounted) {
          const list = Array.isArray(data) ? data : (data?.results || []);
          setBooks(list.map(adaptBook));
        }
      } catch (err) {
        console.error("Error al buscar libros desde el bot:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchBooks();
    return () => {
      mounted = false;
    };
  }, []);

  const matches = useMemo(() => {
    const cleanQuery = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    if (!cleanQuery) return [];

    return books
      .filter((b) => {
        const title = (b.title || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const author = (b.author || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const genres = (b.genres || [])
          .join(" ")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        if (searchMode === "genre") {
          return genres.includes(cleanQuery);
        }
        return title.includes(cleanQuery) || author.includes(cleanQuery);
      })
      .slice(0, 4);
  }, [books, query, searchMode]);

  if (isLoading) {
    return (
      <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-xs text-on-surface-variant italic">
        Buscando &ldquo;{query}&rdquo; en el catálogo...
      </div>
    );
  }

  return (
    <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm text-on-surface">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
        <Search className="w-3.5 h-3.5" />
        <span>
          Resultados para &ldquo;{query}&rdquo; ({matches.length})
        </span>
      </div>

      {matches.length === 0 ? (
        <p className="text-xs text-on-surface-variant mb-2">
          No encontré ejemplares que coincidan con &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-outline-variant/40 mb-2">
          {matches.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => navigate(`/book/${book.id}`)}
              className="py-2 flex items-center justify-between gap-2 text-left hover:text-primary transition-colors cursor-pointer group"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-on-surface group-hover:text-primary truncate">
                  {book.title}
                </p>
                <p className="text-[11px] text-on-surface-variant italic truncate">
                  {book.author}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-outline group-hover:text-primary" />
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-1.5 mt-2">
        <button
          type="button"
          onClick={() =>
            searchMode === "genre"
              ? props.actionProvider.promptSearchGenre()
              : props.actionProvider.promptSearchTitleAuthor()
          }
          className="flex-1 bg-primary text-on-primary py-1.5 px-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-1 cursor-pointer"
        >
          <Search className="w-3 h-3" />
          Otra Búsqueda
        </button>
        <button
          type="button"
          onClick={() => props.actionProvider.handleShowMainMenu()}
          className="flex-1 bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface py-1.5 px-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <LayoutGrid className="w-3 h-3" />
          Menú
        </button>
      </div>
    </div>
  );
}

// =========================================================
// 3. WIDGET DE ESTADO EN VIVO DE PRÉSTAMOS
// =========================================================
export function LiveLoansStatusWidget(props) {
  const navigate = useNavigate();
  const role = props.state?.userRole || props.payload?.role || "USER";
  const isStaff = ["LIBRARIAN", "ADMIN"].includes(role);

  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchLoans = async () => {
      setIsLoading(true);
      try {
        const { data } = await loanService.getAll();
        if (mounted) setLoans(data);
      } catch (err) {
        console.error("Error al consultar préstamos desde el bot:", err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchLoans();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-xs text-on-surface-variant italic">
        Consultando estado de préstamos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-error/40 rounded-lg text-xs text-error">
        Debes iniciar sesión para consultar el registro de préstamos.
      </div>
    );
  }

  const now = new Date();
  const activeLoans = loans.filter((l) => !l.returned_at);
  const overdueLoans = activeLoans.filter((l) => new Date(l.due_at) < now);

  return (
    <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm text-on-surface">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
          {isStaff ? "Resumen Global de Préstamos" : "Estado de tus Préstamos"}
        </span>
        {overdueLoans.length > 0 ? (
          <AlertCircle className="w-4 h-4 text-error" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-primary" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-center">
        <div className="bg-surface-container p-2 rounded-sm">
          <span className="block text-base font-serif font-bold text-on-surface">
            {activeLoans.length}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
            Activos
          </span>
        </div>
        <div className="bg-surface-container p-2 rounded-sm">
          <span
            className={`block text-base font-serif font-bold ${
              overdueLoans.length > 0 ? "text-error" : "text-on-surface"
            }`}
          >
            {overdueLoans.length}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
            Vencidos
          </span>
        </div>
      </div>

      {!isStaff && activeLoans.length > 0 && (
        <div className="mb-3 text-xs flex flex-col gap-1">
          {activeLoans.slice(0, 2).map((loan) => {
            const title = loan.book?.title || `Ejemplar #${loan.item}`;
            const due = new Date(loan.due_at).toLocaleDateString("es-AR");
            return (
              <div
                key={loan.id}
                className="flex items-center justify-between gap-2 text-[11px] bg-surface-container-low px-2 py-1 rounded-sm"
              >
                <span className="truncate font-medium">{title}</span>
                <span className="shrink-0 text-on-surface-variant flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {due}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => navigate(isStaff ? "/librarian/loans" : "/user/loans")}
          className="w-full bg-primary text-on-primary py-1.5 px-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
        >
          {isStaff ? "Ir al Panel de Préstamos" : "Ver Mis Préstamos"}
        </button>
        <button
          type="button"
          onClick={() => props.actionProvider.handleShowMainMenu()}
          className="w-full py-1.5 px-2.5 rounded-sm bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface-variant text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <LayoutGrid className="w-3 h-3" />
          Volver al Menú de Opciones
        </button>
      </div>
    </div>
  );
}

// =========================================================
// 4. WIDGET DE ESTADO EN VIVO DE RESERVAS
// =========================================================
export function LiveReservationsStatusWidget(props) {
  const navigate = useNavigate();
  const role = props.state?.userRole || props.payload?.role || "USER";
  const isStaff = ["LIBRARIAN", "ADMIN"].includes(role);

  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const { data } = await reservationService.getAll();
        if (mounted) setReservations(data);
      } catch (err) {
        console.error("Error al consultar reservas desde el bot:", err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchReservations();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-xs text-on-surface-variant italic">
        Consultando archivo de reservas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-error/40 rounded-lg text-xs text-error">
        Debes iniciar sesión para consultar las reservas.
      </div>
    );
  }

  const pendingReservations = reservations.filter(
    (r) => r.status === "PENDING"
  );
  const completedReservations = reservations.filter(
    (r) => r.status === "COMPLETED"
  );

  return (
    <div className="ml-11 mb-3 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm text-on-surface">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
          {isStaff ? "Solicitudes de Reserva" : "Tus Reservas"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-center">
        <div className="bg-surface-container p-2 rounded-sm truncate">
          <span className="block text-base font-serif font-bold text-primary">
            {pendingReservations.length}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
            Pendientes
          </span>
        </div>
        <div className="bg-surface-container p-2 rounded-sm truncate">
          <span className="block text-base font-serif font-bold text-on-surface">
            {completedReservations.length}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
            Completadas
          </span>
        </div>
      </div>

      {pendingReservations.length > 0 && (
        <div className="mb-3 text-xs flex flex-col gap-1">
          {pendingReservations.slice(0, 2).map((res) => {
            const title = res.book_detail?.title || `Libro #${res.book}`;
            const exp = new Date(res.expires_at).toLocaleDateString("es-AR");
            return (
              <div
                key={res.id}
                className="flex items-center justify-between gap-2 text-[11px] bg-surface-container-low px-2 py-1 rounded-sm"
              >
                <span className="truncate font-medium">{title}</span>
                <span className="shrink-0 text-on-surface-variant">
                  Vence {exp}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() =>
            navigate(
              isStaff ? "/librarian/reservations" : "/user/reservations"
            )
          }
          className="w-full bg-primary text-on-primary py-1.5 px-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
        >
          {isStaff ? "Gestionar Reservas" : "Ver Mis Reservas"}
        </button>
        <button
          type="button"
          onClick={() => props.actionProvider.handleShowMainMenu()}
          className="w-full py-1.5 px-2.5 rounded-sm bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface-variant text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <LayoutGrid className="w-3 h-3" />
          Volver al Menú de Opciones
        </button>
      </div>
    </div>
  );
}
