import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loanService } from "../api/services/loanService";
import { useBooks } from "../hooks/useBooks";
import { adaptBook } from "../api/adapters";
import {
  BookMarked,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hash,
} from "lucide-react";

export default function UserLoans() {
  const navigate = useNavigate();
  const { books, isLoading: loadingBooks } = useBooks();

  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  useEffect(() => {
    const fetchLoans = async () => {
      setIsLoading(true);
      try {
        const { data } = await loanService.getAll();
        setLoans(data);
      } catch (err) {
        setError("Error al cargar tus préstamos.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoans();
  }, []);

  // Diccionario de libros adaptados por ID para obtener portada, autor, categoría y año
  const booksById = useMemo(() => {
    return Object.fromEntries(
      books.map((b) => {
        const adapted = adaptBook(b);
        return [adapted.id, adapted];
      })
    );
  }, [books]);

  // Combinamos cada préstamo con los datos visuales completos del libro
  const enrichedLoans = useMemo(() => {
    return loans.map((loan) => {
      const bookObj = typeof loan.book === "object" && loan.book !== null ? loan.book : {};
      const bookId = bookObj.id ?? loan.book;
      const fullBook = booksById[bookId];

      return {
        ...loan,
        bookData: fullBook || {
          id: bookId,
          title: bookObj.title || `Volumen #${bookId}`,
          author: bookObj.editorial || "Archivo Folium",
          category: "Archivo",
          year: "",
          cover: bookObj.cover_image || null,
        },
      };
    });
  }, [loans, booksById]);

  const filteredLoans = useMemo(() => {
    if (statusFilter === "ALL") return enrichedLoans;
    if (statusFilter === "ACTIVE") {
      return enrichedLoans.filter((l) => !l.returned_at);
    }
    return enrichedLoans.filter((l) => Boolean(l.returned_at));
  }, [enrichedLoans, statusFilter]);

  const getStatusBadge = (dueAt, returnedAt) => {
    if (returnedAt) {
      return {
        label: "Devuelto",
        subtext: `Devuelto el ${new Date(returnedAt).toLocaleDateString("es-AR")}`,
        badgeClass: "bg-secondary text-on-secondary",
        icon: CheckCircle2,
      };
    }

    const now = new Date();
    const dueDate = new Date(dueAt);
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: "Vencido",
        subtext: `${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? "día de atraso" : "días de atraso"}`,
        badgeClass: "bg-error text-on-error",
        icon: AlertCircle,
      };
    }

    if (diffDays === 0) {
      return {
        label: "Vence Hoy",
        subtext: "Entrega programada hoy",
        badgeClass: "bg-tertiary text-on-tertiary",
        icon: Clock,
      };
    }

    return {
      label: "En Préstamo",
      subtext: `${diffDays} ${diffDays === 1 ? "día restante" : "días restantes"}`,
      badgeClass: "bg-primary text-on-primary",
      icon: Clock,
    };
  };

  if (isLoading || loadingBooks) {
    return (
      <div className="p-8 text-on-background font-sans">
        Cargando tus préstamos...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-error font-bold font-sans">{error}</div>;
  }

  const activeCount = enrichedLoans.filter((l) => !l.returned_at).length;
  const returnedCount = enrichedLoans.length - activeCount;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 font-sans animate-fade-in">
      {/* Cabecera */}
      <div className="mb-8 pb-4 border-b border-outline-variant/50 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-serif text-on-background mb-2">
            Mis Préstamos Activos
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Visualiza los ejemplares que tienes actualmente en tu poder y verifica sus fechas de devolución.
          </p>
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-2">
          {[
            { key: "ACTIVE", label: `Activos (${activeCount})` },
            { key: "RETURNED", label: `Devueltos (${returnedCount})` },
            { key: "ALL", label: `Todos (${enrichedLoans.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer border ${
                statusFilter === tab.key
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/50 hover:border-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido Visual */}
      {filteredLoans.length === 0 ? (
        <div className="w-full py-24 bg-surface-container-lowest border border-outline-variant/50 rounded-lg flex flex-col items-center justify-center text-center p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mb-4">
            <BookMarked className="w-6 h-6" />
          </div>
          <p className="text-sm uppercase tracking-widest font-bold text-on-surface mb-2">
            {statusFilter === "ACTIVE"
              ? "No tienes préstamos activos en este momento"
              : "No hay préstamos registrados en esta sección"}
          </p>
          <p className="text-body-md text-on-surface-variant max-w-md mb-6">
            Puedes reservar volúmenes desde el catálogo general para retirarlos en biblioteca.
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
          {filteredLoans.map((loan) => {
            const { bookData } = loan;
            const statusInfo = getStatusBadge(loan.due_at, loan.returned_at);
            const StatusIcon = statusInfo.icon;
            const isReturned = Boolean(loan.returned_at);

            return (
              <div
                key={loan.id}
                onClick={() => navigate(`/book/${bookData.id}`)}
                className={`bg-surface-container border border-outline-variant/50 rounded-md p-4 flex flex-col hover:border-primary transition-all group cursor-pointer shadow-md hover:shadow-lg animate-fade-in ${
                  isReturned ? "opacity-80" : ""
                }`}
              >
                {/* Portada del Libro */}
                <div className="relative w-full aspect-[2/3] bg-surface-container-highest border border-outline-variant/30 mb-4 flex flex-col justify-between p-3 overflow-hidden shadow-inner rounded-sm">
                  {bookData.cover && (
                    <img
                      src={bookData.cover}
                      alt={bookData.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {bookData.cover && (
                    <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />
                  )}

                  {/* Fila superior: Categoría y Estado del Préstamo */}
                  <div className="flex items-start justify-between gap-2 z-10">
                    <span className="bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm truncate">
                      ★ {bookData.category}
                    </span>
                    <span
                      className={`${statusInfo.badgeClass} px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm flex items-center gap-1 shrink-0`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Portada tipográfica cuando no hay imagen */}
                  {!bookData.cover && (
                    <>
                      <div className="my-auto text-center z-10">
                        <span className="font-serif text-3xl text-on-surface italic font-normal px-2 block leading-none">
                          {bookData.title}
                        </span>
                      </div>

                      <span className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] text-center font-bold z-10">
                        {bookData.year}
                      </span>
                    </>
                  )}

                  {/* Cinta inferior de estado y código de ejemplar */}
                  <div className="z-10 mt-auto pt-2">
                    <div className="bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/40 rounded-sm px-2.5 py-1.5 flex items-center justify-between text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-on-surface">
                        {statusInfo.subtext}
                      </span>
                      <span className="text-on-surface-variant">
                        {loan.item_code || `Item #${loan.item}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información del Libro y del Préstamo */}
                <div className="flex flex-col flex-1">
                  <h4 className="text-sm text-on-surface font-bold uppercase tracking-widest mb-1 line-clamp-1">
                    {bookData.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant mb-3 font-serif italic line-clamp-1">
                    {bookData.author}
                  </p>

                  {/* Fechas y Código de Ejemplar */}
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-sm p-2.5 mb-4 text-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-secondary" />
                        Ejemplar:
                      </span>
                      <span className="font-medium text-on-surface">
                        {loan.item_code || `#${loan.item}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Retirado:
                      </span>
                      <span className="font-medium text-on-surface">
                        {new Date(loan.loaned_at).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-tertiary" />
                        {isReturned ? "Devuelto:" : "Vencimiento:"}
                      </span>
                      <span className="font-medium text-on-surface">
                        {new Date(
                          isReturned ? loan.returned_at : loan.due_at
                        ).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                  </div>

                  {/* Botón Ver Ficha */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/book/${bookData.id}`);
                    }}
                    className="mt-auto w-full bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container border border-outline-variant/30 py-2.5 rounded-sm flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer"
                  >
                    Ver Ficha del Libro
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
