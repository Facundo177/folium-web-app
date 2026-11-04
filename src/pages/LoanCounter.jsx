import { useState, useEffect, useDeferredValue, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { userService } from "../api/services/userService";
import { bookService } from "../api/services/bookService";
import { itemService } from "../api/services/itemService";
import { loanService } from "../api/services/loanService";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import FeedbackModal from "../components/BasicUIComponents/FeedbackModal";
import CreateReaderModal from "../components/LoanComponents/CreateReaderModal";
import {
  BookOpenCheck,
  Search,
  User as UserIcon,
  UserCheck,
  UserPlus,
  BookOpen,
  Barcode,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function LoanCounter() {
  useDocumentMetadata({
    title: "Mostrador de Préstamos — Folium",
    description: "Mostrador físico de la biblioteca: asignación de préstamos por DNI y selección de ejemplar.",
    noIndex: true,
  });

  const navigate = useNavigate();

  // ==========================================
  // ESTADOS DEL LECTOR
  // ==========================================
  const [dniSearch, setDniSearch] = useState("");
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchError, setUserSearchError] = useState("");
  const [searchedDniNotFound, setSearchedDniNotFound] = useState(null);
  const [isCreateReaderModalOpen, setIsCreateReaderModalOpen] = useState(false);

  // ==========================================
  // ESTADOS DEL CATÁLOGO DE EJEMPLARES
  // ==========================================
  const [availableBooks, setAvailableBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const deferredBookSearch = useDeferredValue(bookSearchTerm);
  const [expandedBookId, setExpandedBookId] = useState(null);

  // Selección directa por código de inventario (código de barras)
  const [directItemCode, setDirectItemCode] = useState("");
  const [isSearchingDirectItem, setIsSearchingDirectItem] = useState(false);
  const [directItemError, setDirectItemError] = useState("");

  // Ejemplar físico seleccionado para el préstamo
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedBookForSelectedItem, setSelectedBookForSelectedItem] = useState(null);

  // ==========================================
  // ESTADOS DE LA CONFIGURACIÓN DEL PRÉSTAMO
  // ==========================================
  const [loanDays, setLoanDays] = useState(14);
  const [customDueDate, setCustomDueDate] = useState("");
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [loanSubmitError, setLoanSubmitError] = useState("");

  // Modal de confirmación / Éxito
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    loanData: null,
  });

  // ==========================================
  // CARGA INICIAL DE LIBROS CON EJEMPLARES DISPONIBLES
  // ==========================================
  const fetchAvailableBooks = async (query = "") => {
    setIsLoadingBooks(true);
    try {
      const { data } = await bookService.getAvailable(query ? { search: query } : {});
      setAvailableBooks(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Error al cargar libros con ejemplares disponibles:", err);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
    fetchAvailableBooks(deferredBookSearch);
  }, [deferredBookSearch]);

  // ==========================================
  // BÚSQUEDA DE LECTOR POR DNI
  // ==========================================
  const handleSearchUserByDni = async (e) => {
    if (e) e.preventDefault();
    const cleanDni = dniSearch.trim();
    if (!cleanDni) {
      setUserSearchError("Por favor, ingrese un número de DNI.");
      return;
    }

    setIsSearchingUser(true);
    setUserSearchError("");
    setSearchedDniNotFound(null);

    try {
      const { data } = await userService.getByDni(cleanDni);
      setSelectedUser(data);
      setSearchedDniNotFound(null);
    } catch (err) {
      console.error("Error al buscar lector por DNI:", err);
      if (err.response?.status === 404) {
        setSearchedDniNotFound(cleanDni);
        setSelectedUser(null);
      } else {
        const errorMsg =
          err.response?.data?.detail || "Error al consultar el usuario en el servidor.";
        setUserSearchError(errorMsg);
      }
    } finally {
      setIsSearchingUser(false);
    }
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setDniSearch("");
    setUserSearchError("");
    setSearchedDniNotFound(null);
  };

  const handleReaderCreated = (newReader) => {
    setSelectedUser(newReader);
    setSearchedDniNotFound(null);
    setDniSearch(String(newReader.dni || ""));
    setUserSearchError("");
  };

  // ==========================================
  // SELECCIÓN DE EJEMPLAR FÍSICO
  // ==========================================
  const handleSelectItem = (item, book) => {
    setSelectedItem(item);
    setSelectedBookForSelectedItem(book);
    setDirectItemError("");
  };

  const handleClearItem = () => {
    setSelectedItem(null);
    setSelectedBookForSelectedItem(null);
    setDirectItemCode("");
    setDirectItemError("");
  };

  // Búsqueda directa por código de barras o código de inventario (ej: LIB-001)
  const handleDirectItemSearch = async (e) => {
    e.preventDefault();
    const cleanCode = directItemCode.trim();
    if (!cleanCode) return;

    setIsSearchingDirectItem(true);
    setDirectItemError("");

    try {
      const { data } = await itemService.getAll({
        search: cleanCode,
        status: "AVAILABLE",
      });

      const itemsFound = Array.isArray(data) ? data : data?.results || [];
      const exactItem = itemsFound.find(
        (it) => it.inventory_code?.toLowerCase() === cleanCode.toLowerCase()
      ) || itemsFound[0];

      if (exactItem) {
        if (exactItem.status !== "AVAILABLE") {
          setDirectItemError(`El ejemplar "${exactItem.inventory_code}" no está disponible (Estado: ${exactItem.status_display || exactItem.status}).`);
        } else {
          setSelectedItem(exactItem);
          setSelectedBookForSelectedItem(exactItem.book);
          setDirectItemCode("");
        }
      } else {
        setDirectItemError(`No se encontró ningún ejemplar disponible con el código "${cleanCode}".`);
      }
    } catch (err) {
      console.error("Error al buscar ejemplar por código:", err);
      setDirectItemError("Error al consultar el inventario.");
    } finally {
      setIsSearchingDirectItem(false);
    }
  };

  // ==========================================
  // CÁLCULO DE FECHA DE VENCIMIENTO
  // ==========================================
  const computedDueDate = useMemo(() => {
    if (customDueDate) {
      return new Date(customDueDate);
    }
    const date = new Date();
    date.setDate(date.getDate() + loanDays);
    return date;
  }, [loanDays, customDueDate]);

  // ==========================================
  // CONFIRMACIÓN Y REGISTRO DEL PRÉSTAMO
  // ==========================================
  const handleConfirmLoan = async () => {
    if (!selectedUser || !selectedItem) return;

    setIsSubmittingLoan(true);
    setLoanSubmitError("");

    const now = new Date();
    const payload = {
      user: selectedUser.id,
      item: selectedItem.id,
      loaned_at: now.toISOString(),
      due_at: computedDueDate.toISOString(),
    };

    try {
      const { data } = await loanService.create(payload);
      setSuccessModal({
        isOpen: true,
        loanData: {
          ...data,
          userObj: selectedUser,
          bookObj: selectedBookForSelectedItem,
          itemObj: selectedItem,
        },
      });

      // Refrescar catálogo de ejemplares disponibles
      fetchAvailableBooks(bookSearchTerm);
    } catch (err) {
      console.error("Error al registrar préstamo:", err);
      const data = err.response?.data;
      const errorMsg =
        data && typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : "Error al registrar el préstamo en el sistema.";
      setLoanSubmitError(errorMsg);
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  const resetAll = () => {
    setSelectedUser(null);
    setDniSearch("");
    setUserSearchError("");
    setSearchedDniNotFound(null);
    setSelectedItem(null);
    setSelectedBookForSelectedItem(null);
    setDirectItemCode("");
    setDirectItemError("");
    setLoanDays(14);
    setCustomDueDate("");
    setLoanSubmitError("");
    setSuccessModal({ isOpen: false, loanData: null });
  };

  const isFormReady = Boolean(selectedUser && selectedItem && !isSubmittingLoan);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-10 font-sans animate-fade-in text-on-surface">
      <div className="mb-4">
        <GoBackButton />
      </div>

      {/* =========================================================
          CABECERA DEL MOSTRADOR
      ========================================================= */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-outline-variant/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1.5">
            <BookOpenCheck className="w-4 h-4" />
            <span>Circulación & Despacho</span>
          </div>
          <h1 className="text-headline-md font-serif text-on-surface mb-2">
            Mostrador de Préstamos
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Asigna ejemplares físicos directamente a los lectores por DNI. Si el usuario no existe, puedes crearlo en el momento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/librarian/loans"
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface bg-surface-container border border-outline-variant/60 rounded-lg hover:bg-surface-variant transition-colors"
          >
            Ver Control de Préstamos
          </Link>
        </div>
      </div>

      {/* =========================================================
          CONTENIDO PRINCIPAL EN DOS COLUMNAS
      ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================
            COLUMNA IZQUIERDA: PASO 1 (LECTOR) Y PASO 3 (CONFIRMACIÓN)
        ========================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* PASO 1: ASIGNAR LECTOR POR DNI */}
          <section
            aria-labelledby="step-reader-title"
            className="p-5 sm:p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h2
                  id="step-reader-title"
                  className="font-serif text-lg font-bold text-on-surface"
                >
                  Identificación del Lector
                </h2>
              </div>
              {selectedUser && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant">
                  <UserCheck className="w-3.5 h-3.5 text-secondary" />
                  Asignado
                </span>
              )}
            </div>

            {/* FORMULARIO DE BÚSQUEDA DE DNI (Si no hay usuario seleccionado) */}
            {!selectedUser ? (
              <div className="flex flex-col gap-3">
                <form onSubmit={handleSearchUserByDni} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="input-dni-search"
                      type="number"
                      value={dniSearch}
                      onChange={(e) => {
                        setDniSearch(e.target.value);
                        if (userSearchError) setUserSearchError("");
                        if (searchedDniNotFound) setSearchedDniNotFound(null);
                      }}
                      placeholder="Ingrese DNI del lector..."
                      className="w-full pl-3.5 pr-9 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-mono"
                    />
                    {dniSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setDniSearch("");
                          setSearchedDniNotFound(null);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                        aria-label="Limpiar DNI"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    id="btn-search-dni"
                    type="submit"
                    disabled={isSearchingUser || !dniSearch.trim()}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {isSearchingUser ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Buscar</span>
                      </>
                    )}
                  </button>
                </form>

                {userSearchError && (
                  <p className="text-xs text-error font-medium flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{userSearchError}</span>
                  </p>
                )}

                {/* BANNER CUANDO NO SE ENCUENTRA EL DNI */}
                {searchedDniNotFound && (
                  <div className="p-4 bg-tertiary/10 border border-tertiary/30 rounded-lg flex flex-col gap-3 mt-2 animate-fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-on-surface">
                          No se encontró lector con el DNI: {searchedDniNotFound}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Para prestar un libro a este usuario, créalo ahora mismo.
                        </p>
                      </div>
                    </div>
                    <button
                      id="btn-open-create-reader"
                      type="button"
                      onClick={() => setIsCreateReaderModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 w-full py-2 bg-tertiary text-on-tertiary font-bold text-xs uppercase tracking-wider rounded-md shadow-xs hover:opacity-90 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Crear Usuario para el Lector</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* TARJETA DEL LECTOR ASIGNADO */
              <div className="p-4 bg-surface-container/60 border border-outline-variant rounded-lg flex flex-col gap-3 animate-fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-on-surface leading-snug">
                        {selectedUser.full_name || selectedUser.username}
                      </h3>
                      <p className="text-xs font-mono text-on-surface-variant">
                        DNI: {selectedUser.dni}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearUser}
                    className="text-xs font-bold text-on-surface-variant hover:text-error transition-colors p-1"
                    title="Cambiar lector"
                  >
                    Cambiar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/50 text-xs text-on-surface-variant">
                  <div className="truncate">
                    <span className="font-semibold block text-[10px] uppercase tracking-wider">
                      Correo
                    </span>
                    <span className="truncate">{selectedUser.email || "—"}</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-[10px] uppercase tracking-wider">
                      Préstamos Activos
                    </span>
                    <span
                      className={`font-bold ${
                        selectedUser.active_loans_count > 0
                          ? "text-tertiary"
                          : "text-secondary"
                      }`}
                    >
                      {selectedUser.active_loans_count ?? 0} préstamo(s)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* PASO 3: DETALLE DEL PRÉSTAMO Y CONFIRMACIÓN */}
          <section
            aria-labelledby="step-confirm-title"
            className="p-5 sm:p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2
                id="step-confirm-title"
                className="font-serif text-lg font-bold text-on-surface"
              >
                Condiciones & Despacho
              </h2>
            </div>

            {/* Selector de Plazo de Préstamo */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                Plazo de Devolución
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[7, 14, 21, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      setLoanDays(days);
                      setCustomDueDate("");
                    }}
                    className={`py-1.5 px-2 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                      loanDays === days && !customDueDate
                        ? "bg-primary text-on-primary border-primary shadow-xs"
                        : "bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container"
                    }`}
                  >
                    {days} días
                  </button>
                ))}
              </div>

              {/* Fecha calculada */}
              <div className="p-3 bg-surface-container/50 border border-outline-variant/60 rounded-lg flex items-center justify-between text-xs text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Fecha de Vencimiento:
                </span>
                <span className="font-mono font-bold text-on-surface text-sm">
                  {computedDueDate.toLocaleDateString("es-AR", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Resumen Final del Préstamo */}
            <div className="p-4 bg-surface-container-low/70 border border-outline-variant/70 rounded-lg flex flex-col gap-2.5 text-xs text-on-surface mb-5">
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/40 pb-1.5">
                Resumen del Despacho
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Lector:</span>
                <span className="font-bold text-right truncate max-w-[200px]">
                  {selectedUser ? selectedUser.full_name || selectedUser.username : "Sin asignar"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Libro:</span>
                <span className="font-bold text-right truncate max-w-[200px]">
                  {selectedBookForSelectedItem ? selectedBookForSelectedItem.title : "Sin seleccionar"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Ejemplar (Ítem):</span>
                <span className="font-mono font-bold text-right">
                  {selectedItem ? `#${selectedItem.inventory_code}` : "Sin seleccionar"}
                </span>
              </div>
            </div>

            {loanSubmitError && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-lg flex items-start gap-2 text-error text-xs mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loanSubmitError}</span>
              </div>
            )}

            {/* Botón de Confirmación Principal */}
            <button
              id="btn-confirm-loan"
              type="button"
              onClick={handleConfirmLoan}
              disabled={!isFormReady}
              className={`w-full py-3.5 px-4 font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all ${
                isFormReady
                  ? "bg-primary text-on-primary hover:opacity-90 cursor-pointer"
                  : "bg-surface-variant text-on-surface-variant/60 cursor-not-allowed border border-outline-variant/40"
              }`}
            >
              {isSubmittingLoan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando préstamo...</span>
                </>
              ) : (
                <>
                  <BookOpenCheck className="w-4 h-4" />
                  <span>Registrar Préstamo en Mostrador</span>
                </>
              )}
            </button>
          </section>
        </div>

        {/* =========================================================
            COLUMNA DERECHA: PASO 2 (SELECCIÓN DEL LIBRO Y DEL ÍTEM)
        ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <section
            aria-labelledby="step-book-title"
            className="p-5 sm:p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <h2
                    id="step-book-title"
                    className="font-serif text-lg font-bold text-on-surface leading-tight"
                  >
                    Selección del Ejemplar (Ítem)
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Elige el libro por su ejemplar físico disponible.
                  </p>
                </div>
              </div>
              {selectedItem && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                  Ejemplar Elegido
                </span>
              )}
            </div>

            {/* EJEMPLAR SELECCIONADO (Si ya se eligió uno) */}
            {selectedItem && (
              <div className="p-4 mb-6 bg-primary/5 border-2 border-primary/40 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-16 bg-surface-container rounded border border-outline-variant/60 shrink-0 overflow-hidden flex items-center justify-center">
                    {selectedBookForSelectedItem?.cover_image ? (
                      <img
                        src={selectedBookForSelectedItem.cover_image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-6 h-6 text-outline" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Ejemplar Físico Seleccionado
                    </span>
                    <h3 className="font-serif text-base font-bold text-on-surface truncate">
                      {selectedBookForSelectedItem?.title || "Libro"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono mt-0.5">
                      <span className="font-bold bg-surface-container px-2 py-0.5 rounded border border-outline-variant text-on-surface">
                        Código: {selectedItem.inventory_code}
                      </span>
                      {selectedItem.location && (
                        <span>Ubicación: {selectedItem.location}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearItem}
                  className="px-3 py-1.5 text-xs font-bold text-error hover:bg-error/10 rounded-md border border-error/30 transition-colors cursor-pointer shrink-0"
                >
                  Cambiar
                </button>
              </div>
            )}

            {/* BÚSQUEDA RÁPIDA DIRECTA POR CÓDIGO DE BARRAS / INVENTARIO */}
            <div className="mb-5 p-3.5 bg-surface-container/40 border border-outline-variant/60 rounded-lg">
              <label
                htmlFor="input-direct-item-code"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1 flex items-center gap-1.5"
              >
                <Barcode className="w-4 h-4 text-primary" />
                <span>Escáner o Código Directo de Ejemplar</span>
              </label>
              <form onSubmit={handleDirectItemSearch} className="flex gap-2">
                <input
                  id="input-direct-item-code"
                  type="text"
                  value={directItemCode}
                  onChange={(e) => {
                    setDirectItemCode(e.target.value);
                    if (directItemError) setDirectItemError("");
                  }}
                  placeholder="Escanee o escriba código (ej: LIB-001)..."
                  className="flex-1 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={isSearchingDirectItem || !directItemCode.trim()}
                  className="px-3 py-2 bg-secondary text-on-secondary font-bold text-xs uppercase tracking-wider rounded-md shadow-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isSearchingDirectItem ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Elegir"
                  )}
                </button>
              </form>
              {directItemError && (
                <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{directItemError}</span>
                </p>
              )}
            </div>

            {/* BUSCADOR DE LIBROS CON EJEMPLARES DISPONIBLES */}
            <div className="mb-4">
              <label
                htmlFor="input-book-search"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5 flex items-center justify-between"
              >
                <span>Catálogo con Ejemplares Disponibles</span>
                <span className="text-[11px] font-normal text-on-surface-variant">
                  {availableBooks.length} libro(s) con stock
                </span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-book-search"
                  type="text"
                  value={bookSearchTerm}
                  onChange={(e) => setBookSearchTerm(e.target.value)}
                  placeholder="Filtrar por título, autor, ISBN o código..."
                  className="w-full pl-9 pr-9 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                {bookSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setBookSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    aria-label="Limpiar filtro"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* LISTADO DE LIBROS Y SUS EJEMPLARES */}
            <div className="flex-1 max-h-[500px] overflow-y-auto divide-y divide-outline-variant/40 border border-outline-variant rounded-lg bg-surface-container-low/30 focus:outline-none">
              {isLoadingBooks ? (
                <div className="p-8 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">
                    Buscando ejemplares disponibles...
                  </span>
                </div>
              ) : availableBooks.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant text-xs italic">
                  {bookSearchTerm
                    ? `No se encontraron libros con ejemplares disponibles para "${bookSearchTerm}".`
                    : "No hay libros con ejemplares disponibles en este momento."}
                </div>
              ) : (
                availableBooks.map((book) => {
                  const isExpanded = expandedBookId === book.id;
                  const authorsText =
                    book.authors?.map((a) => `${a.name} ${a.last_name}`).join(", ") ||
                    "Autor desconocido";
                  const items = book.available_items || [];

                  return (
                    <div
                      key={book.id}
                      className="transition-colors hover:bg-surface-container/50"
                    >
                      {/* Cabecera del libro */}
                      <div
                        onClick={() =>
                          setExpandedBookId(isExpanded ? null : book.id)
                        }
                        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-12 bg-surface-container rounded border border-outline-variant/60 shrink-0 overflow-hidden flex items-center justify-center">
                            {book.cover_image ? (
                              <img
                                src={book.cover_image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-5 h-5 text-outline" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-serif text-sm font-bold text-on-surface truncate leading-tight">
                              {book.title}
                            </h4>
                            <p className="text-xs text-on-surface-variant truncate">
                              {authorsText}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-on-surface-variant/80 font-mono mt-0.5">
                              {book.isbn && <span>ISBN: {book.isbn}</span>}
                              {book.editorial?.name && (
                                <span>• {book.editorial.name}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/30 rounded-full">
                            {book.available_count || items.length} disp.
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                          )}
                        </div>
                      </div>

                      {/* Lista de ejemplares del libro (Expandible) */}
                      {isExpanded && (
                        <div className="px-4 pb-3.5 pt-1 bg-surface-container/30 border-t border-outline-variant/30 flex flex-col gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            Ejemplares disponibles de este libro:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {items.map((item) => {
                              const isSelected = selectedItem?.id === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleSelectItem(item, book)}
                                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-primary text-on-primary border-primary shadow-xs"
                                      : "bg-surface-container-lowest border-outline-variant hover:border-primary/50 text-on-surface"
                                  }`}
                                >
                                  <div>
                                    <div className="font-mono text-xs font-bold">
                                      #{item.inventory_code}
                                    </div>
                                    <div
                                      className={`text-[10px] ${
                                        isSelected
                                          ? "text-on-primary/80"
                                          : "text-on-surface-variant"
                                      }`}
                                    >
                                      {item.location || "Mostrador general"}
                                    </div>
                                  </div>
                                  <span
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                      isSelected
                                        ? "bg-on-primary text-primary"
                                        : "bg-surface-container text-primary"
                                    }`}
                                  >
                                    {isSelected ? "Seleccionado" : "Elegir"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {/* =========================================================
          MODAL DE ALTA RÁPIDA DE LECTOR
      ========================================================= */}
      <CreateReaderModal
        isOpen={isCreateReaderModalOpen}
        initialDni={searchedDniNotFound || ""}
        onClose={() => setIsCreateReaderModalOpen(false)}
        onReaderCreated={handleReaderCreated}
      />

      {/* =========================================================
          MODAL DE CONFIRMACIÓN DE ÉXITO DEL PRÉSTAMO
      ========================================================= */}
      {successModal.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl overflow-hidden font-sans">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-xl font-bold text-on-surface mb-1">
                ¡Préstamo Registrado con Éxito!
              </h2>
              <p className="text-xs text-on-surface-variant mb-5">
                El ejemplar ha sido asignado físicamente y registrado en el sistema.
              </p>

              {/* Ficha Resumen */}
              <div className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-lg text-left text-xs flex flex-col gap-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Préstamo ID:</span>
                  <span className="font-mono font-bold">#{successModal.loanData?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Lector:</span>
                  <span className="font-bold">
                    {successModal.loanData?.userObj?.full_name || successModal.loanData?.userObj?.username} (DNI: {successModal.loanData?.userObj?.dni})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Libro:</span>
                  <span className="font-bold">
                    {successModal.loanData?.bookObj?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Ejemplar:</span>
                  <span className="font-mono font-bold">
                    #{successModal.loanData?.itemObj?.inventory_code}
                  </span>
                </div>
                <div className="flex justify-between border-t border-outline-variant/50 pt-1.5 text-primary font-bold">
                  <span>Devolución antes de:</span>
                  <span>
                    {new Date(successModal.loanData?.due_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex-1 py-2.5 px-4 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer"
                >
                  Realizar Otro Préstamo
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/librarian/loans")}
                  className="flex-1 py-2.5 px-4 bg-surface-container text-on-surface border border-outline-variant font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-surface-variant transition-colors cursor-pointer"
                >
                  Ver Control
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
