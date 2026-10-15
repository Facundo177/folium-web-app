import { useEffect, useState } from "react";
import { bookService } from "../../api/services/bookService";
import { authorService } from "../../api/services/authorService";
import GoBackButton from "../BasicUIComponents/GoBackButton";
import { useNavigate } from "react-router-dom";
import { useGenres } from "../../hooks/useGenres";
import { ClosedCaption, Trash, X } from "lucide-react";
import FieldError from "../BasicUIComponents/FieldError";


export default function BookForm() {
  const navigate = useNavigate();
  const { genres: availableGenres, isLoading: isLoadingGenres } = useGenres();

  // Errores por campo con la forma { campo: ["mensaje"] }. Los del front y los
  // del back usan el mismo formato, así un solo <FieldError> sirve para ambos.
  const [errors, setErrors] = useState({});
  // Error aparte para el recuadro "Registrar nuevo" autor
  const [authorError, setAuthorError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ESTADOS DEL LIBRO ---
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    publication_year: "",
    cover_image: null, // Ahora guardará el objeto File
    description: "",
    genres: [],
  });

  // Estado para previsualizar la imagen cargada
  const [imagePreview, setImagePreview] = useState(null);

  // --- ESTADOS DE AUTORES ---
  const [availableAuthors, setAvailableAuthors] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [newAuthor, setNewAuthor] = useState({ name: "", last_name: "" });
  const [isCreatingAuthor, setIsCreatingAuthor] = useState(false);

  // Cargar autores
  useEffect(() => {
    authorService
      .getAll()
      .then((res) => setAvailableAuthors(res.data))
      .catch((err) => console.error("Error cargando autores:", err));
  }, []);

  // --- MANEJADORES GLOBALES ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  // Manejador específico para el archivo de imagen
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, cover_image: file });
      setImagePreview(URL.createObjectURL(file)); // Crea una URL temporal para previsualizar
    } else {
      setFormData({ ...formData, cover_image: null });
      setImagePreview(null);
    }
  };

  const handleGenreToggle = (genreId) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }));
    setErrors((prev) => ({ ...prev, genres: undefined }));
  };

  // --- LOGICA DE AUTORES ---

  // Agrega un autor a la selección (sin repetirlo) y borra el error de "autores".
  // Lo usan "Elegir existente" y "Registrar nuevo", así el código no se repite.
  const selectAuthor = (author) => {
    setSelectedAuthors((prev) =>
      prev.some((a) => a.id === author.id) ? prev : [...prev, author],
    );
    setErrors((prev) => ({ ...prev, authors: undefined }));
  };

  const handleAddExistingAuthor = (e) => {
    const authorId = Number(e.target.value);
    if (!authorId) return;

    const author = availableAuthors.find((a) => a.id === authorId);
    if (author) selectAuthor(author);
    e.target.value = "";
  };

  const handleRemoveAuthor = (authorId) => {
    setSelectedAuthors(selectedAuthors.filter((a) => a.id !== authorId));
  };

  const handleCreateNewAuthor = async (e) => {
    e.preventDefault();

    // Se recortan los espacios para no guardar "  Julio " distinto de "Julio"
    const name = newAuthor.name.trim();
    const last_name = newAuthor.last_name.trim();
    if (!name || !last_name) {
      setAuthorError("Complete el nombre y el apellido del autor.");
      return;
    }

    // Si el autor ya existe, se selecciona en lugar de crear un duplicado
    const existing = availableAuthors.find(
      (a) =>
        a.name.toLowerCase() === name.toLowerCase() &&
        a.last_name.toLowerCase() === last_name.toLowerCase(),
    );
    if (existing) {
      selectAuthor(existing);
      setNewAuthor({ name: "", last_name: "" });
      setAuthorError("");
      return;
    }
    setAuthorError("");

    setIsCreatingAuthor(true);
    try {
      const res = await authorService.create({ name, last_name });
      const createdAuthor = res.data;
      setAvailableAuthors((prev) => [...prev, createdAuthor]);
      selectAuthor(createdAuthor);
      setNewAuthor({ name: "", last_name: "" });
    } catch (error) {
      console.error("Error al crear autor:", error);
      setAuthorError("No se pudo registrar el autor. Intente nuevamente.");
    } finally {
      setIsCreatingAuthor(false);
    }
  };

  // --- ENVÍO FINAL DEL LIBRO (CON FORMDATA) ---
  const handleSubmit = (e) => {
    e.preventDefault();

    // Se limpian los datos antes de validar: "required" del navegador acepta
    // campos con solo espacios, y el ISBN suele escribirse con guiones.
    const title = formData.title.trim();
    const description = formData.description.trim();
    const isbn = formData.isbn.replace(/[\s-]/g, "");

    // Autores y géneros no pueden usar "required" (no son inputs simples),
    // por eso se validan a mano. Si falta algo, no se envía nada al back.
    const newErrors = {};
    if (!title) newErrors.title = ["Ingrese el título."];
    if (!isbn) newErrors.isbn = ["Ingrese el ISBN."];
    if (!description) newErrors.description = ["Ingrese una descripción."];
    if (selectedAuthors.length === 0)
      newErrors.authors = ["Seleccione o cree al menos un autor."];
    if (formData.genres.length === 0)
      newErrors.genres = ["Seleccione al menos un género."];
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    // Para enviar archivos, debemos instanciar FormData en lugar de un JSON normal
    const submitData = new FormData();
    submitData.append("title", title);
    submitData.append("isbn", isbn);
    submitData.append("publication_year", Number(formData.publication_year));
    submitData.append("description", description);

    // Adjuntar archivo solo si fue seleccionado
    if (formData.cover_image) {
      submitData.append("cover_image", formData.cover_image);
    }

    // Para arreglos (Many-to-Many) en FormData, se hace append múltiple
    selectedAuthors.forEach((author) =>
      submitData.append("authors", author.id),
    );

    // HACK: Si solo hay 1 autor, lo enviamos de nuevo para forzar el formato Array en DRF
    if (selectedAuthors.length === 1) {
      submitData.append("authors", selectedAuthors[0].id);
    }

    // Hacemos exactamente lo mismo con los géneros
    formData.genres.forEach((genreId) => submitData.append("genres", genreId));

    if (formData.genres.length === 1) {
      submitData.append("genres", formData.genres[0]);
    }

    // Enviar a la API
    // bookService.create(submitData)

    setIsSubmitting(true);
    // Obligamos a Axios a enviar esto como formulario de archivos
    bookService
      .create(submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        alert("Libro guardado exitosamente");
        navigate("/librarian/catalog");
      })
      .catch((error) => {
        console.error(
          "Error al guardar:",
          error.response?.data || error.message,
        );
        // El back responde 400 con { campo: ["mensaje"] }. Se guarda en "errors"
        // y cada <FieldError> muestra el mensaje de su campo.
        const data = error.response?.data;
        if (data && typeof data === "object") {
          setErrors(data);
        } else {
          setErrors({
            general: ["No se pudo guardar el libro. Intente nuevamente."],
          });
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  // true si hay algún error de un campo del formulario (no cuenta los generales,
  // como "no se pudo guardar", que tienen su propio mensaje)
  const hasFieldErrors = Object.entries(errors).some(
    ([key, value]) =>
      value && !["general", "detail", "non_field_errors"].includes(key),
  );

  console.log("errors:", errors, "resumen:", hasFieldErrors);

  return (
    <div className="w-full max-w-[600px] flex flex-col items-center pb-12 mx-auto">
      <div className="flex mr-auto">
        <GoBackButton />
      </div>

      <div className="w-full my-8">
        <h2 className="text-headline-md font-serif text-on-surface mb-2">
          Registrar Nuevo Libro
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Completa los datos para añadir un título al catálogo de Folium.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        {/* === DATOS BÁSICOS === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              TÍTULO
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
            <FieldError messages={errors.title} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              ISBN
            </label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
            <FieldError messages={errors.isbn} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              AÑO DE PUBLICACIÓN
            </label>
            <input
              type="number"
              name="publication_year"
              value={formData.publication_year}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
            <FieldError messages={errors.publication_year} />
          </div>

          {/* CAMBIO PRINCIPAL: Campo File en lugar de URL */}
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              PORTADA DEL LIBRO
            </label>
            <input
              type="file"
              name="cover_image"
              accept=".jpg, .jpeg, .png, .webp"
              onChange={handleFileChange}
              className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-secondary file:text-on-secondary hover:file:bg-secondary-container hover:file:text-on-secondary-container file:cursor-pointer file:transition-colors cursor-pointer"
            />
            <FieldError messages={errors.cover_image} />
          </div>
        </div>

        {/* Previsualización dinámica de la portada seleccionada */}
        {imagePreview && (
          <div className="w-32 aspect-[2/3] border-2 border-primary rounded-lg overflow-hidden shadow-lg mx-auto my-2 relative group">
            <img
              src={imagePreview}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, cover_image: null });
                setImagePreview(null);
              }}
              className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash/>
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">
            DESCRIPCIÓN
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors resize-y"
          />
          <FieldError messages={errors.description} />
        </div>

        {/* === SECCIÓN DE AUTORES === */}
        <div className="p-5 border border-outline-variant rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-4">
          <h3 className="text-label-caps text-on-surface font-bold">
            GESTIÓN DE AUTORES
          </h3>

          {selectedAuthors.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-surface-container rounded-md">
              {selectedAuthors.map((author) => (
                <div
                  key={author.id}
                  className="flex items-center gap-2 bg-secondary text-on-secondary px-3 py-1.5 rounded-md text-sm font-medium shadow-sm"
                >
                  {author.name} {author.last_name}
                  <button
                    type="button"
                    onClick={() => handleRemoveAuthor(author.id)}
                    className="hover:text-primary transition-colors flex items-center"
                  >
                    <X className="w-5"/>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-on-surface-variant font-bold">
                Elegir existente
              </label>
              <select
                onChange={handleAddExistingAuthor}
                defaultValue=""
                className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant rounded-md text-sm text-on-surface cursor-pointer focus:border-primary focus:outline-none transition-colors"
              >
                <option value="" disabled>
                  Buscar en el archivo...
                </option>
                {availableAuthors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 border-l border-outline-variant/50 pl-0 md:pl-6">
              <label className="text-xs text-on-surface-variant font-bold">
                Registrar nuevo
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newAuthor.name}
                  onChange={(e) => {
                    setNewAuthor({ ...newAuthor, name: e.target.value });
                    setAuthorError("");
                  }}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-md text-sm text-on-surface focus:border-primary transition-colors"
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={newAuthor.last_name}
                  onChange={(e) => {
                    setNewAuthor({ ...newAuthor, last_name: e.target.value });
                    setAuthorError("");
                  }}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-md text-sm text-on-surface focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={handleCreateNewAuthor}
                  disabled={isCreatingAuthor}
                  className="bg-tertiary text-on-tertiary text-xs font-bold uppercase tracking-widest py-2 rounded-md hover:opacity-90 disabled:opacity-50 transition-colors mt-1 shadow-sm"
                >
                  {isCreatingAuthor ? "Registrando..." : "Añadir Autor"}
                </button>
                <FieldError messages={authorError} />
              </div>
            </div>
          </div>
          <FieldError messages={errors.authors} />
        </div>

        {/* === GÉNEROS === */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">
            GÉNEROS LITERARIOS
          </label>
          {isLoadingGenres ? (
            <p className="text-sm text-on-surface-variant">
              Cargando géneros...
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-surface-container-lowest border border-outline-variant rounded-lg max-h-48 overflow-y-auto shadow-inner">
              {availableGenres.map((genre) => (
                <label
                  key={genre.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    value={genre.id}
                    checked={formData.genres.includes(genre.id)}
                    onChange={() => handleGenreToggle(genre.id)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-on-surface group-hover:text-primary transition-colors">
                    {genre.name}
                  </span>
                </label>
              ))}
            </div>
          )}
          <FieldError messages={errors.genres} />
        </div>

        <FieldError
          messages={errors.general || errors.detail || errors.non_field_errors}
        />
        {/* Resumen: el formulario es largo y un error de arriba puede quedar fuera de pantalla */}
        {hasFieldErrors && (
          <p className="text-error text-sm font-medium">
            Revise los campos marcados.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-on-primary text-body-lg font-bold tracking-widest uppercase py-3 rounded-lg mt-6 hover:opacity-90 shadow-md transition-opacity disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : "Guardar Libro"}
        </button>
      </form>
    </div>
  );
}
