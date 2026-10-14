import { useState, useEffect } from "react";
import { itemService } from "../../api/services/itemService";
import { bookService } from "../../api/services/bookService";
import GoBackButton from "../BasicUIComponents/GoBackButton";
import { ITEM_STATUS } from "../../api/constants";
import { ChevronDown, PlusCircle, Search } from "lucide-react";
import FieldError from "../BasicUIComponents/FieldError";

export default function ItemForm() {

  // Estados de datos
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  // Estados del formulario
  const [formData, setFormData] = useState({
    book: "", // Guardará el ID numérico del libro
    inventory_code: "",
    location: "",
    status: ITEM_STATUS.AVAILABLE,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados exclusivos para el buscador de libros
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Cargar el catálogo de libros
  useEffect(() => {
    bookService
      .getAll()
      .then((res) => {
        const booksData = res.data.results || res.data;
        setBooks(booksData);
      })
      .catch((err) => {
        console.error("Error al cargar el catálogo de libros:", err);
        setErrors({
          general: ["No se pudo cargar el catálogo de libros. Intente nuevamente."],
        });
      })
      .finally(() => {
        setIsLoadingBooks(false);
      });
  }, []);

  // Lógica de filtrado en tiempo real
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.id.toString().includes(searchTerm),
  );

  // Manejadores del Buscador
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);

      // Al modificar la búsqueda, deja de considerarse válida la selección anterior.
    setFormData((prev) => ({ ...prev, book: "" }));
    setErrors((prev) => ({ ...prev, book: undefined }));
  };

  const handleSelectBook = (book) => {
    setFormData({ ...formData, book: book.id });
    setSearchTerm(`${book.title} (#${book.id})`); // Mostramos el título bonito en el input
    setIsDropdownOpen(false); // Cerramos el menú
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

    // --- Limpieza de datos antes de validar ---
    // Ubicación: sin espacios en los extremos y con los grupos de espacios
    // internos reducidos a uno solo ("Estante    A3" -> "Estante A3").
    // Se normaliza en vez de rechazar: el usuario no tiene nada que decidir.
    const itemLocation = formData.location.trim().replace(/\s+/g, " ");

    // Código: sin espacios en los extremos y en mayúsculas, así "inv-00001"
    // no cuenta como un código distinto de "INV-00001".
    const inventoryCode = formData.inventory_code.trim().toUpperCase();
    const bookId = Number(formData.book);
    const validBook = Number.isInteger(bookId) &&
      books.some((book) => Number(book.id) === bookId);
    const validStatuses = Object.values(ITEM_STATUS);

    const newErrors = {};
    
    if (!formData.book || !validBook) {
      newErrors.book = ["Seleccione una obra de la lista desplegable."];
    }
    if (!inventoryCode) {
      newErrors.inventory_code = ["Ingrese el código de inventario."];
    } else if (/\s/.test(inventoryCode)) {
      // Un espacio cambia el significado de un código ("INV 0203"), por eso
      // acá se rechaza en lugar de corregirlo solo.
      newErrors.inventory_code = ["El código no puede contener espacios."];
    }
    // La ubicación es obligatoria (requerimiento: cada ejemplar tiene una ubicación
    // física). Con solo espacios queda vacía después de limpiarla.
    if (!itemLocation) {
      newErrors.location = ["Ingrese la ubicación física."];
    }

    if (!validStatuses.includes(formData.status)) {
      newErrors.status = ["Seleccione un estado válido."];
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

    console.log("Registrando ejemplar:", payload);

    try {
      await itemService.create(payload);
      alert("Ejemplar físico registrado exitosamente.");

      // Mantener el libro y el estado para facilitar la carga de varias copias.
      setFormData((prev) => ({
        ...prev,
        inventory_code: "",
        location: "",
      }));
      setErrors({});
    } catch (error) {
      console.error("Error al registrar ejemplar:", error.response?.data || error.message);

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
    <div className="w-full max-w-[600px] flex flex-col items-center pb-12 mx-auto animate-fade-in">
      <div className="flex mr-auto">
        <GoBackButton />
      </div>

      <div className="w-full my-8">
        <h2 className="text-headline-md font-serif text-on-surface mb-2">
          Registrar Nuevo Ejemplar
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Añada una copia física específica a un libro existente en el catálogo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        {/* === SECCIÓN: BUSCADOR INTERACTIVO DE LIBROS === */}
        <div className="p-5 border border-outline-variant rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-4 overflow-visible">
          <h3 className="text-label-caps text-on-surface font-bold">
            OBRA DE REFERENCIA
          </h3>

          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              BUSCAR POR TÍTULO O ID
            </label>

            {isLoadingBooks ? (
              <p className="text-sm text-on-surface-variant italic px-4 py-3 bg-surface-container rounded-lg">
                Cargando el archivo del catálogo...
              </p>
            ) : (
              <div className="relative">
                {/* Input Buscador */}
                <div className="flex items-center bg-surface-container border border-outline-variant rounded-lg focus-within:border-primary transition-colors pr-3">
                  <input
                    type="text"
                    placeholder="Escriba el nombre del libro..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setIsDropdownOpen(true)}
                    // Usamos un pequeño timeout en el onBlur para permitir que el click en la opción se registre antes de cerrar
                    onBlur={() =>
                      setTimeout(() => setIsDropdownOpen(false), 200)
                    }
                    className="w-full px-4 py-3 bg-transparent text-body-md text-on-surface focus:outline-none placeholder:text-on-surface-variant/50"
                  />
                  <span className="text-outline">
                    <Search className="w-5"/>
                  </span>
                </div>

                {/* Menú Desplegable de Resultados */}
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-surface-container-highest border border-outline-variant rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => (
                        <div
                          key={book.id}
                          onClick={() => handleSelectBook(book)}
                          className="px-4 py-3 cursor-pointer hover:bg-primary/20 hover:text-primary text-on-surface border-b border-outline-variant/30 last:border-0 transition-colors flex items-center gap-3"
                        >
                          <span className="text-xs font-bold text-on-surface-variant">
                            #{book.id}
                          </span>
                          <span className="font-serif text-sm">
                            {book.title}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-on-surface-variant italic text-sm text-center">
                        No se encontraron obras que coincidan.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Error al enviar sin haber elegido un libro de la lista */}
            <FieldError messages={errors.book} />
            {/* Aviso suave: escribió algo pero no eligió. No se repite si ya hay error al enviar */}
            {!formData.book && !errors.book && searchTerm.length > 0 && !isDropdownOpen && (
              <span className="text-xs text-error font-bold mt-1">
                Debe hacer clic en un libro de la lista para seleccionarlo.
              </span>
            )}
          </div>
        </div>

        {/* === SECCIÓN: DATOS DEL EJEMPLAR FÍSICO === */}
        <div className="p-5 border border-outline-variant rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-5">
          <h3 className="text-label-caps text-on-surface font-bold">
            DATOS DEL EJEMPLAR FÍSICO
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-label-caps text-on-surface font-bold">
                CÓDIGO DE INVENTARIO
              </label>
              <input
                type="text"
                name="inventory_code"
                value={formData.inventory_code}
                onChange={handleChange}
                placeholder="Ej. INV-00134"
                required
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50"
              />
              <FieldError messages={errors.inventory_code} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-caps text-on-surface font-bold">
                UBICACIÓN FÍSICA
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ej. Estante A3"
                required
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50"
              />
              <FieldError messages={errors.location} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              ESTADO INICIAL
            </label>
            <div className="relative flex items-center">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full pl-4 pr-10 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer transition-colors"
              >
                <option value={ITEM_STATUS.AVAILABLE}>Disponible</option>
                <option value={ITEM_STATUS.LOST}>Perdido</option>
                <option value={ITEM_STATUS.DAMAGED}>Dañado</option>
                <option value={ITEM_STATUS.LOANED}>Prestado</option>
                <option value={ITEM_STATUS.RESERVED}>Reservado</option>
              </select>
              <div className="absolute right-4 pointer-events-none text-on-surface-variant flex items-center justify-center">
                <span className="text-[20px]">
                  <ChevronDown className="w-5"/>
                </span>
              </div>
            </div>
            <FieldError messages={errors.status} />
          </div>
        </div>

        <FieldError messages={errors.general || errors.detail || errors.non_field_errors} />

        {/* Resumen: el formulario puede quedar largo y un error de arriba fuera de pantalla */}
        {hasFieldErrors && (
          <p className="text-error text-sm font-medium">Revise los campos marcados.</p>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-on-primary text-body-lg font-bold tracking-widest uppercase py-3 rounded-lg mt-2 hover:opacity-90 shadow-md transition-opacity flex justify-center items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : "Guardar Ejemplar"}
          <span className="text-[20px]"><PlusCircle/></span>
        </button>
      </form>
    </div>
  );
}
