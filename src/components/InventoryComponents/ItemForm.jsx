import { useState, useEffect } from "react";
import { itemService } from "../../api/services/itemService";
import { bookService } from "../../api/services/bookService";
import GoBackButton from "../BasicUIComponents/GoBackButton";
import { useNavigate } from "react-router-dom";
import { ITEM_STATUS } from "../../api/constants";

export default function ItemForm() {
  const navigate = useNavigate();

  // Estados de datos
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  // Estados del formulario
  const [formData, setFormData] = useState({
    book: "", // Guardará el ID numérico del libro
    inventory_code: "",
    location: "",
    status: "AVAILABLE",
  });

  // Estados exclusivos para el buscador de libros
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Cargar el catálogo de libros
  useEffect(() => {
    bookService.getAll()
      .then((res) => {
        const booksData = res.data.results || res.data;
        setBooks(booksData);
      })
      .catch((err) => {
        console.error("Error al cargar el catálogo de libros:", err);
      })
      .finally(() => {
        setIsLoadingBooks(false);
      });
  }, []);

  // Lógica de filtrado en tiempo real
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.id.toString().includes(searchTerm)
  );

  // Manejadores del Buscador
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
    // Si el usuario vuelve a escribir, borramos la selección anterior para obligarlo a elegir de la lista
    if (formData.book) {
      setFormData({ ...formData, book: "" });
    }
  };

  const handleSelectBook = (book) => {
    setFormData({ ...formData, book: book.id });
    setSearchTerm(`${book.title} (#${book.id})`); // Mostramos el título bonito en el input
    setIsDropdownOpen(false); // Cerramos el menú
  };

  // Manejadores estándar
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.book) {
      alert("Debes seleccionar una obra de la lista desplegable.");
      return;
    }

    const payload = {
      book: Number(formData.book),
      inventory_code: formData.inventory_code,
      location: formData.location,
      status: formData.status, 
    };

    console.log("Registrando ejemplar:", payload);

    itemService.create(payload)
      .then(() => {
        alert("Ejemplar físico registrado exitosamente.");
        
        // Limpiamos los datos físicos pero mantenemos el libro seleccionado
        // por si quiere registrar 5 ejemplares seguidos del mismo libro.
        setFormData({
          ...formData,
          inventory_code: "",
          location: "",
        });
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const errorMessages = Object.values(error.response.data).flat().join("\n");
          alert(`Error al registrar el ejemplar:\n${errorMessages}`);
        } else {
          console.error("Error al guardar:", error);
          alert("Hubo un error inesperado al registrar el ejemplar.");
        }
      });
  };

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
          Añade una copia física específica a un libro existente en el catálogo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        
        {/* === SECCIÓN: BUSCADOR INTERACTIVO DE LIBROS === */}
        <div className="p-5 border border-outline-variant rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-4 overflow-visible">
          <h3 className="text-label-caps text-on-surface font-bold">OBRA DE REFERENCIA</h3>
          
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
                    placeholder="Escribe el nombre del libro..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setIsDropdownOpen(true)}
                    // Usamos un pequeño timeout en el onBlur para permitir que el click en la opción se registre antes de cerrar
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    className="w-full px-4 py-3 bg-transparent text-body-md text-on-surface focus:outline-none placeholder:text-on-surface-variant/50"
                  />
                  <span className="material-symbols-outlined text-outline">search</span>
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
                          <span className="text-xs font-bold text-on-surface-variant">#{book.id}</span>
                          <span className="font-serif text-sm">{book.title}</span>
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
            
            {/* Mensaje de validación sutil */}
            {!formData.book && searchTerm.length > 0 && !isDropdownOpen && (
              <span className="text-xs text-error font-bold mt-1">
                Debes hacer clic en un libro de la lista para seleccionarlo.
              </span>
            )}
          </div>
        </div>

        {/* === SECCIÓN: DATOS DEL EJEMPLAR FÍSICO === */}
        <div className="p-5 border border-outline-variant rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-5">
          <h3 className="text-label-caps text-on-surface font-bold">DATOS DEL EJEMPLAR FÍSICO</h3>
          
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
                placeholder="Ej. LIB-001"
                required
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50"
              />
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
                placeholder="Ej. Estante A-3"
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50"
              />
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
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          className="w-full bg-primary text-on-primary text-body-lg font-bold tracking-widest uppercase py-3 rounded-lg mt-2 hover:opacity-90 shadow-md transition-opacity flex justify-center items-center gap-2"
        >
          Guardar Ejemplar
          <span className="material-symbols-outlined text-[20px]">library_add</span>
        </button>
      </form>
    </div>
  );
}