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
} from "lucide-react";

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
        const adapted = data.map(adaptBook);
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
        {/* Mini Portada */}
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

        {/* Datos */}
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
    </div>
  );
}

// =========================================================
// 2. WIDGET DE BÚSQUEDA EN VIVO EN EL CATÁLOGO
// =========================================================
export function BookSearchWidget(props) {
  const navigate = useNavigate();
  const query = props.payload?.query || "";

  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const { data } = await bookService.getAll();
        if (mounted) {
          setBooks(data.map(adaptBook));
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

        return (
          title.includes(cleanQuery) ||
          author.includes(cleanQuery) ||
          genres.includes(cleanQuery)
        );
      })
      .slice(0, 4);
  }, [books, query]);

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

      <button
        type="button"
        onClick={() => navigate("/catalog")}
        className="w-full bg-secondary text-on-secondary py-1.5 px-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
      >
        Explorar Catálogo Completo
      </button>
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

      <button
        type="button"
        onClick={() => navigate(isStaff ? "/librarian/loans" : "/user/loans")}
        className="w-full bg-primary text-on-primary py-1.5 px-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
      >
        {isStaff ? "Ir al Panel de Préstamos" : "Ver Mis Préstamos"}
      </button>
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

      <button
        type="button"
        onClick={() =>
          navigate(isStaff ? "/librarian/reservations" : "/user/reservations")
        }
        className="w-full bg-primary text-on-primary py-1.5 px-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
      >
        {isStaff ? "Gestionar Reservas" : "Ver Mis Reservas"}
      </button>
    </div>
  );
}
