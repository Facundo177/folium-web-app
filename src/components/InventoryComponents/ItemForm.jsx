import { useState, useEffect, useMemo, useDeferredValue } from "react";
import { itemService } from "../../api/services/itemService";
import { bookService } from "../../api/services/bookService";
import GoBackButton from "../BasicUIComponents/GoBackButton";
import FeedbackModal from "../BasicUIComponents/FeedbackModal";
import { ITEM_STATUS } from "../../api/constants";
import { ChevronDown, PlusCircle, Search } from "lucide-react";
import FieldError from "../BasicUIComponents/FieldError";
import { useNavigate } from "react-router-dom";

export default function ItemForm() {
  const navigate = useNavigate();

  // Estados de datos
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  // Estados del formulario
  const [formData, setFormData] = useState({
    book: "",
    inventory_code: "",
    location: "",
    status: ITEM_STATUS.AVAILABLE,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el buscador de libros con React 18+ deferred value
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Feedback Modal
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "Aceptar",
    cancelText: null,
    onConfirm: null,
  });

  // Cargar el catálogo de libros
  useEffect(() => {
    let isMounted = true;
    bookService
      .getAll()
      .then((res) => {
        if (!isMounted) return;
        const booksData = res.data?.results || res.data || [];
        setBooks(booksData);
      })
      .catch((err) => {
        console.error("Error al cargar el catálogo de libros:", err);
        if (isMounted) {
          setErrors({
            general: ["No se pudo cargar el catálogo de libros. Intente recargar."],
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingBooks(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtrado optimizado en segundo plano mediante deferredSearchTerm
  const filteredBooks = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    if (!term) return books.slice(0, 15);
    return books
      .filter(
        (book) =>
          book.title.toLowerCase().includes(term) ||
          String(book.id).includes(term) ||
          (book.isbn && book.isbn.includes(term))
      )
      .slice(0, 15);
  }, [books, deferredSearchTerm]);

  // Manejadores del Buscador
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
    setFormData((prev) => ({ ...prev, book: "" }));
    setErrors((prev) => ({ ...prev, book: undefined }));
  };

  const handleSelectBook = (book) => {
    setFormData((prev) => ({ ...prev, book: book.id }));
    setSearchTerm(`${book.title} (#${book.id})`);
    setIsDropdownOpen(false);
    setErrors((prev) => ({ ...prev, book: undefined }));
  };

  // Manejadores estándar
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const itemLocation = formData.location.trim().replace(/\s+/g, " ");
    const inventoryCode = formData.inventory_code.trim().toUpperCase();
    const bookId = Number(formData.book);
    const validBook =
      Number.isInteger(bookId) &&
      books.some((book) => Number(book.id) === bookId);
    const validStatuses = Object.values(ITEM_STATUS);

    const newErrors = {};

    if (!formData.book || !validBook) {
      newErrors.book = ["Seleccione una obra existente de la lista."];
    }
    if (!inventoryCode) {
      newErrors.inventory_code = ["Ingrese el código de inventario."];
    } else if (/\s/.test(inventoryCode)) {
      newErrors.inventory_code = ["El código no puede contener espacios."];
    }
    if (!itemLocation) {
      newErrors.location = ["Ingrese la ubicación física del ejemplar."];
    }
    if (!validStatuses.includes(formData.status)) {
      newErrors.status = ["Seleccione un estado de conservación válido."];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const payload = {
      book: bookId,
      inventory_code: inventoryCode,
      location: itemLocation,
      status: formData.status,
    };

    try {
      await itemService.create(payload);

      // Mantener el libro y estado para facilitar el alta sucesiva de copias
      setFormData((prev) => ({
        ...prev,
        inventory_code: "",
        location: "",
      }));
      setErrors({});

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "¡Ejemplar registrado exitosamente!",
        message: `El ejemplar físico ${inventoryCode} fue registrado en la base de datos de Folium. ¿Deseas ir al inventario o registrar otra copia?`,
        confirmText: "Ir al Inventario",
        cancelText: "Añadir Otra Copia",
        onConfirm: () => navigate("/librarian/inventory"),
      });
    } catch (error) {
      console.error("Error al registrar ejemplar:", error);
      const data = error.response?.data;
      if (data && typeof data === "object") {
        setErrors(data);
      } else {
        setErrors({
          general: ["No se pudo registrar el ejemplar. Intente nuevamente."],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasFieldErrors = Object.entries(errors).some(
    ([key, value]) =>
      value && !["general", "detail", "non_field_errors"].includes(key)
  );

  return (
    <div className="w-full max-w-[660px] flex flex-col items-center pb-12 mx-auto animate-fade-in font-sans">
      <div className="flex mr-auto mb-4">
        <GoBackButton />
      </div>

      <div className="w-full mb-8">
        <h1 className="text-headline-md font-serif text-on-surface mb-2">
          Registrar Nuevo Ejemplar
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Añade una copia física específica con signatura y ubicación a una obra del catálogo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        {/* === SECCIÓN: BUSCADOR INTERACTIVO DE LIBROS === */}
        <div className="p-5 border border-outline-variant rounded-md bg-surface-container-lowest shadow-xs flex flex-col gap-4 overflow-visible">
          <h2 className="text-label-caps text-on-surface font-bold">
            OBRA DE REFERENCIA *
          </h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="item-form-book-search" className="text-label-caps text-on-surface-variant text-xs font-bold">
              BUSCAR POR TÍTULO, ISBN O ID
            </label>

            {isLoadingBooks ? (
              <p className="text-sm text-on-surface-variant italic px-4 py-3 bg-surface-container rounded-sm">
                Cargando el acervo de libros...
              </p>
            ) : (
              <div className="relative">
                {/* Input Buscador */}
                <div className="flex items-center bg-surface-container border border-outline-variant rounded-sm focus-within:border-primary transition-colors pr-3">
                  <input
                    id="item-form-book-search"
                    type="text"
                    role="combobox"
                    aria-expanded={isDropdownOpen}
                    aria-autocomplete="list"
                    aria-controls="item-form-books-listbox"
                    aria-describedby={errors.book ? "item-book-error" : undefined}
                    placeholder="Escriba el título o ISBN..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    className="w-full px-4 py-3 bg-transparent text-body-md text-on-surface focus:outline-none placeholder:text-on-surface-variant/50"
                  />
                  <Search className="w-5 h-5 text-outline shrink-0" />
                </div>

                {/* Menú Desplegable de Resultados */}
                {isDropdownOpen && (
                  <div
                    id="item-form-books-listbox"
                    role="listbox"
                    className="absolute z-50 w-full mt-1 bg-surface-container-highest border border-outline-variant rounded-sm shadow-xl max-h-60 overflow-y-auto"
                  >
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => (
                        <div
                          key={book.id}
                          role="option"
                          aria-selected={formData.book === book.id}
                          onClick={() => handleSelectBook(book)}
                          className="px-4 py-3 cursor-pointer hover:bg-primary/20 hover:text-primary text-on-surface border-b border-outline-variant/30 last:border-0 transition-colors flex items-center gap-3"
                        >
                          <span className="text-xs font-mono font-bold text-on-surface-variant">
                            #{book.id}
                          </span>
                          <span className="font-serif text-sm">
                            {book.title}
                          </span>
                          {book.isbn && (
                            <span className="text-xs font-mono text-outline ml-auto">
                              {book.isbn}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-on-surface-variant italic text-sm text-center">
                        No se encontraron obras coincidentes en el archivo.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error al enviar sin haber elegido un libro */}
            <FieldError id="item-book-error" messages={errors.book} />

            {!formData.book && !errors.book && searchTerm.length > 0 && !isDropdownOpen && (
              <span className="text-xs text-error font-medium mt-1">
                Debe hacer clic en una obra de la lista para seleccionarla.
              </span>
            )}
          </div>
        </div>

        {/* === SECCIÓN: DATOS DEL EJEMPLAR FÍSICO === */}
        <div className="p-5 border border-outline-variant rounded-md bg-surface-container-lowest shadow-xs flex flex-col gap-5">
          <h2 className="text-label-caps text-on-surface font-bold">
            DATOS DEL EJEMPLAR FÍSICO *
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="item-form-code" className="text-label-caps text-on-surface font-bold">
                CÓDIGO DE INVENTARIO *
              </label>
              <input
                id="item-form-code"
                type="text"
                name="inventory_code"
                value={formData.inventory_code}
                onChange={handleChange}
                placeholder="Ej. INV-00134"
                required
                aria-invalid={Boolean(errors.inventory_code)}
                aria-describedby={errors.inventory_code ? "item-code-error" : undefined}
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-sm text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50 font-mono uppercase"
              />
              <FieldError id="item-code-error" messages={errors.inventory_code} />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="item-form-location" className="text-label-caps text-on-surface font-bold">
                UBICACIÓN FÍSICA *
              </label>
              <input
                id="item-form-location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ej. Estante A3"
                required
                aria-invalid={Boolean(errors.location)}
                aria-describedby={errors.location ? "item-location-error" : undefined}
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-sm text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50"
              />
              <FieldError id="item-location-error" messages={errors.location} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="item-form-status" className="text-label-caps text-on-surface font-bold">
              ESTADO INICIAL *
            </label>
            <div className="relative flex items-center">
              <select
                id="item-form-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                aria-invalid={Boolean(errors.status)}
                aria-describedby={errors.status ? "item-status-error" : undefined}
                className="w-full pl-4 pr-10 py-3 bg-surface-container border border-outline-variant rounded-sm text-body-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer transition-colors"
              >
                <option value={ITEM_STATUS.AVAILABLE}>Disponible</option>
                <option value={ITEM_STATUS.LOANED}>Prestado</option>
                <option value={ITEM_STATUS.RESERVED}>Reservado</option>
                <option value={ITEM_STATUS.DAMAGED}>Dañado</option>
                <option value={ITEM_STATUS.LOST}>Perdido</option>
              </select>
              <div className="absolute right-4 pointer-events-none text-on-surface-variant flex items-center justify-center">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
            <FieldError id="item-status-error" messages={errors.status} />
          </div>
        </div>

        <FieldError messages={errors.general || errors.detail || errors.non_field_errors} />

        {hasFieldErrors && (
          <p role="alert" aria-live="polite" className="text-error text-xs font-semibold">
            Revise los campos marcados antes de guardar.
          </p>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-on-primary text-body-md font-bold tracking-widest uppercase py-3.5 rounded-md mt-2 hover:opacity-90 shadow-sm transition-opacity flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <PlusCircle className="w-5 h-5" />
          {isSubmitting ? "Registrando ejemplar..." : "Guardar Ejemplar en Inventario"}
        </button>
      </form>

      {/* Modal accesible de Feedback */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        confirmText={feedbackModal.confirmText}
        cancelText={feedbackModal.cancelText}
        onConfirm={feedbackModal.onConfirm}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
