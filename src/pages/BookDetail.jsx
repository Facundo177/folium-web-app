import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, CheckCircle2, X, AlertTriangle } from "lucide-react";
import BookCover from "../components/BookDetailComponents/BookCover";
import BookDetailHeader from "../components/BookDetailComponents/BookDetailHeader";
import BookInfo from "../components/BookDetailComponents/BookInfo";
import CurrentStock from "../components/BookDetailComponents/CurrentStock";
import BookReviews from "../components/BookDetailComponents/BookReviews";
import { useBook } from "../hooks/useBook";
import { adaptBookDetail } from "../api/adapters";

import { bookService } from "../api/services/bookService";
import { authorService } from "../api/services/authorService";
import { genreService } from "../api/services/genreService";
import { useAuth } from "../auth/AuthProvider";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { book, isLoading, error, refetch } = useBook(id);

  const canManageBook = ["LIBRARIAN", "ADMIN"].includes(user?.role);

  // Estados para modales de Edición y Eliminación
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Estados del formulario de edición
  const [formDataValues, setFormDataValues] = useState({
    title: "",
    editorial: "",
    isbn: "",
    publication_year: "",
    description: "",
  });
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Catálogos de autores y géneros para edición
  const [allAuthors, setAllAuthors] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [authorSearch, setAuthorSearch] = useState("");
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const authorWrapperRef = useRef(null);

  // Sub-formularios rápidos para nuevo autor / género durante edición
  const [showNewAuthorModal, setShowNewAuthorModal] = useState(false);
  const [newAuthorData, setNewAuthorData] = useState({ name: "", last_name: "", biography: "" });
  const [isCreatingAuthor, setIsCreatingAuthor] = useState(false);

  const [showNewGenreModal, setShowNewGenreModal] = useState(false);
  const [newGenreData, setNewGenreData] = useState({ name: "", description: "" });
  const [isCreatingGenre, setIsCreatingGenre] = useState(false);

  // Cerrar dropdown de autores al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authorWrapperRef.current && !authorWrapperRef.current.contains(event.target)) {
        setShowAuthorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cargar autores y géneros cuando se abre el modo edición
  useEffect(() => {
    if (!isEditing) return;
    const fetchCatalogs = async () => {
      try {
        const [authorsRes, genresRes] = await Promise.all([
          authorService.getAll(),
          genreService.getAll(),
        ]);
        setAllAuthors(authorsRes.data.results || authorsRes.data);
        setAllGenres(genresRes.data.results || genresRes.data);
      } catch (err) {
        console.error("Error cargando catálogos para edición:", err);
      }
    };
    fetchCatalogs();
  }, [isEditing]);

  // Inicializar formulario con los datos actuales del libro al abrir edición
  const handleOpenEdit = () => {
    if (!book) return;
    setFormDataValues({
      title: book.title || "",
      editorial: book.editorial || "",
      isbn: book.isbn || "",
      publication_year: book.publication_year ?? "",
      description: book.description || "",
    });
    setSelectedAuthors(book.authors || []);
    setSelectedGenres((book.genres || []).map((g) => g.id));
    setCoverFile(null);
    setCoverPreview(book.cover_image || null);
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSelectAuthor = (author) => {
    if (!selectedAuthors.some((a) => a.id === author.id)) {
      setSelectedAuthors([...selectedAuthors, author]);
    }
    setAuthorSearch("");
    setShowAuthorDropdown(false);
  };

  const handleRemoveAuthor = (idToRemove) => {
    setSelectedAuthors(selectedAuthors.filter((a) => a.id !== idToRemove));
  };

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((gId) => gId !== genreId) : [...prev, genreId]
    );
  };

  const handleCreateAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthorData.name.trim() || !newAuthorData.last_name.trim()) return;
    setIsCreatingAuthor(true);
    try {
      const response = await authorService.create(newAuthorData);
      const created = response.data;
      setAllAuthors((prev) => [...prev, created]);
      setSelectedAuthors((prev) => [...prev, created]);
      setShowNewAuthorModal(false);
      setNewAuthorData({ name: "", last_name: "", biography: "" });
      setAuthorSearch("");
    } catch (err) {
      alert(
        err.response?.data
          ? Object.values(err.response.data).flat().join("\n")
          : "Error al crear el autor."
      );
    } finally {
      setIsCreatingAuthor(false);
    }
  };

  const handleCreateGenre = async (e) => {
    e.preventDefault();
    if (!newGenreData.name.trim()) return;
    setIsCreatingGenre(true);
    try {
      const response = await genreService.create(newGenreData);
      const created = response.data;
      setAllGenres((prev) => [...prev, created]);
      setSelectedGenres((prev) => [...prev, created.id]);
      setShowNewGenreModal(false);
      setNewGenreData({ name: "", description: "" });
    } catch (err) {
      alert(
        err.response?.data
          ? Object.values(err.response.data).flat().join("\n")
          : "Error al crear el género."
      );
    } finally {
      setIsCreatingGenre(false);
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (selectedAuthors.length === 0) {
      setSaveError("El libro debe tener al menos un autor asignado.");
      return;
    }
    if (selectedGenres.length === 0) {
      setSaveError("El libro debe tener al menos un género asignado.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", formDataValues.title.trim());
      formData.append("editorial", formDataValues.editorial.trim());
      formData.append("isbn", formDataValues.isbn.trim());
      formData.append("publication_year", parseInt(formDataValues.publication_year, 10));
      formData.append("description", formDataValues.description);

      selectedAuthors.forEach((a) => formData.append("authors", a.id));
      if (selectedAuthors.length === 1) {
        formData.append("authors", selectedAuthors[0].id);
      }

      selectedGenres.forEach((gId) => formData.append("genres", gId));
      if (selectedGenres.length === 1) {
        formData.append("genres", selectedGenres[0]);
      }

      if (coverFile instanceof File) {
        formData.append("cover_image", coverFile);
      }

      await bookService.patch(id, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refetch();
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Error actualizando el libro:", err);
      if (err.response?.data && typeof err.response.data === "object") {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
          .join(" | ");
        setSaveError(messages || "No se pudieron guardar los cambios del libro.");
      } else {
        setSaveError("Error de conexión al intentar actualizar el libro.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBook = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await bookService.remove(id);
      navigate("/librarian/inventory", { replace: true });
    } catch (err) {
      console.error("Error eliminando el libro:", err);
      setDeleteError(
        err.response?.data?.detail ||
          "No se pudo eliminar el libro. Verificá que no tenga préstamos o reservas activas."
      );
      setIsDeleting(false);
    }
  };

  if (isLoading) return <p className="p-gutter">Cargando libro…</p>;
  if (error) return <p className="p-gutter">{error}</p>;

  const data = adaptBookDetail(book);

  const filteredAuthors = allAuthors.filter((a) =>
    `${a.name} ${a.last_name}`.toLowerCase().includes(authorSearch.toLowerCase())
  );

  return (
    <div className="max-w-(--spacing-container-max) mx-auto p-gutter bg-background min-h-screen">
      {/* Encabezado + Barra de Herramientas del Bibliotecario */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <div className="flex-1">
          <BookDetailHeader genres={data.genres} />
        </div>

        {canManageBook && (
          <div className="flex items-center gap-3 self-end sm:self-center pb-4 border-b sm:border-b-0 border-outline-variant">
            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-surface-container-lowest border border-outline text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary transition-colors rounded-sm shadow-xs cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              Editar Libro
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setShowDeleteConfirm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-surface-container-lowest border border-error/40 text-error hover:bg-error hover:text-on-error transition-colors rounded-sm shadow-xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Libro
            </button>
          </div>
        )}
      </div>

      {/* Notificación de éxito tras editar */}
      {saveSuccess && (
        <div className="mb-stack-md p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-sm flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>Los datos del libro se actualizaron correctamente.</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-emerald-700 hover:text-emerald-950 font-bold px-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg">
        {/* Columna Izquierda (1/3) */}
        <div className="md:col-span-1 flex flex-col gap-stack-lg">
          <BookCover imageSrc={data.cover} title={data.title} />
          <CurrentStock stock={data.availableItems} items={data.items} />
        </div>

        {/* Columna Derecha (2/3) */}
        <div className="md:col-span-2 flex flex-col gap-stack-lg">
          <BookInfo
            ISBN={data.isbn}
            title={data.title}
            author={data.author}
            editorial={data.editorial}
            publicationDate={data.year}
            description={data.description}
            tags={data.genres}
          />
          <BookReviews bookId={data.id} />

        </div>
      </div>

      {/* MODAL DE EDICIÓN DE LIBRO (Bibliotecario / Admin) */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-surface border border-outline-variant rounded-sm shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Cabecera del Modal */}
            <div className="px-6 py-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
              <div>
                <span className="text-label-caps text-primary block">
                  Gestión de Catálogo
                </span>
                <h2 className="text-headline-sm font-serif text-on-surface">
                  Modificar Datos del Libro
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario de Edición */}
            <form onSubmit={handleUpdateBook} className="p-6 overflow-y-auto space-y-5 flex-1">
              {saveError && (
                <div className="p-3 bg-error-container border border-error text-on-error-container text-sm rounded-sm">
                  {saveError}
                </div>
              )}

              {/* Título y Editorial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1.5">
                    Título del Libro *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDataValues.title}
                    onChange={(e) =>
                      setFormDataValues({ ...formDataValues, title: e.target.value })
                    }
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1.5">
                    Editorial *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDataValues.editorial}
                    onChange={(e) =>
                      setFormDataValues({ ...formDataValues, editorial: e.target.value })
                    }
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* ISBN y Año de Publicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1.5">
                    ISBN (10 o 13 dígitos) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    value={formDataValues.isbn}
                    onChange={(e) =>
                      setFormDataValues({
                        ...formDataValues,
                        isbn: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1.5">
                    Año de Publicación *
                  </label>
                  <input
                    type="number"
                    required
                    min={868}
                    max={new Date().getFullYear()}
                    value={formDataValues.publication_year}
                    onChange={(e) =>
                      setFormDataValues({
                        ...formDataValues,
                        publication_year: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Autores */}
              <div ref={authorWrapperRef} className="relative">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-label-caps text-on-surface-variant">
                    Autores *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewAuthorModal(true)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    + Crear nuevo autor
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedAuthors.map((author) => (
                    <span
                      key={author.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-medium rounded-full"
                    >
                      {author.name} {author.last_name}
                      <button
                        type="button"
                        onClick={() => handleRemoveAuthor(author.id)}
                        className="hover:text-error font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <input
                  type="text"
                  value={authorSearch}
                  onFocus={() => setShowAuthorDropdown(true)}
                  onChange={(e) => {
                    setAuthorSearch(e.target.value);
                    setShowAuthorDropdown(true);
                  }}
                  placeholder="Buscar autor para agregar..."
                  className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                />

                {showAuthorDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-surface-container-lowest border border-outline-variant shadow-lg max-h-44 overflow-y-auto rounded-sm">
                    {filteredAuthors.length > 0 ? (
                      filteredAuthors.map((author) => {
                        const isSelected = selectedAuthors.some((a) => a.id === author.id);
                        return (
                          <div
                            key={author.id}
                            onClick={() => !isSelected && handleSelectAuthor(author)}
                            className={`p-2.5 text-sm border-b border-surface-container last:border-0 flex justify-between items-center ${
                              isSelected
                                ? "bg-surface-container text-outline cursor-not-allowed"
                                : "hover:bg-primary/5 cursor-pointer text-on-surface"
                            }`}
                          >
                            <span>
                              {author.name} {author.last_name}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] uppercase tracking-wider">
                                Seleccionado
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-xs text-outline text-center">
                        No se encontraron autores con ese nombre.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Géneros */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-label-caps text-on-surface-variant">
                    Géneros Literarios *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewGenreModal(true)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    + Crear nuevo género
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 p-3 bg-surface-container-lowest border border-outline-variant rounded-sm max-h-36 overflow-y-auto">
                  {allGenres.map((genre) => {
                    const isSelected = selectedGenres.includes(genre.id);
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => toggleGenre(genre.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border cursor-pointer ${
                          isSelected
                            ? "bg-primary text-on-primary border-primary shadow-xs"
                            : "bg-surface text-on-surface border-outline-variant hover:border-primary"
                        }`}
                      >
                        {genre.name} {isSelected ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Portada */}
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-1.5">
                  Imagen de Portada (opcional)
                </label>
                <div className="flex items-center gap-4">
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Vista previa de portada"
                      className="w-16 h-24 object-cover rounded-sm border border-outline-variant shrink-0"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="w-full p-2 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface file:mr-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-container cursor-pointer"
                  />
                </div>
              </div>

              {/* Sinopsis / Descripción */}
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-1.5">
                  Sinopsis / Descripción
                </label>
                <textarea
                  rows={4}
                  value={formDataValues.description}
                  onChange={(e) =>
                    setFormDataValues({ ...formDataValues, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Escribí una breve reseña o sinopsis del libro..."
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-outline-variant text-on-surface hover:bg-surface-container rounded-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-primary text-on-primary hover:opacity-90 rounded-sm shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Guardando cambios..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: CREAR NUEVO AUTOR */}
      {showNewAuthorModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface p-6 rounded-sm shadow-xl max-w-md w-full border border-outline-variant">
            <h4 className="font-serif text-lg font-bold text-on-surface mb-4">
              Añadir Nuevo Autor
            </h4>
            <form onSubmit={handleCreateAuthor} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-outline mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={newAuthorData.name}
                  onChange={(e) => setNewAuthorData({ ...newAuthorData, name: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-outline mb-1">Apellido *</label>
                <input
                  type="text"
                  required
                  value={newAuthorData.last_name}
                  onChange={(e) =>
                    setNewAuthorData({ ...newAuthorData, last_name: e.target.value })
                  }
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-outline mb-1">Biografía</label>
                <textarea
                  rows={3}
                  value={newAuthorData.biography}
                  onChange={(e) =>
                    setNewAuthorData({ ...newAuthorData, biography: e.target.value })
                  }
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAuthorModal(false)}
                  className="px-4 py-2 text-xs text-outline hover:text-on-surface cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAuthor}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-sm cursor-pointer"
                >
                  {isCreatingAuthor ? "Guardando..." : "Guardar Autor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: CREAR NUEVO GÉNERO */}
      {showNewGenreModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface p-6 rounded-sm shadow-xl max-w-md w-full border border-outline-variant">
            <h4 className="font-serif text-lg font-bold text-on-surface mb-4">
              Crear Nuevo Género
            </h4>
            <form onSubmit={handleCreateGenre} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-outline mb-1">
                  Nombre del Género *
                </label>
                <input
                  type="text"
                  required
                  value={newGenreData.name}
                  onChange={(e) => setNewGenreData({ ...newGenreData, name: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-outline mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={newGenreData.description}
                  onChange={(e) =>
                    setNewGenreData({ ...newGenreData, description: e.target.value })
                  }
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewGenreModal(false)}
                  className="px-4 py-2 text-xs text-outline hover:text-on-surface cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGenre}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-sm cursor-pointer"
                >
                  {isCreatingGenre ? "Guardando..." : "Guardar Género"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface border border-outline-variant rounded-sm shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-3">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="text-headline-sm font-serif text-on-surface">
                ¿Eliminar este libro?
              </h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-4">
              Estás por eliminar permanentemente{" "}
              <strong className="text-on-surface">&ldquo;{data.title}&rdquo;</strong> y sus
              ejemplares asociados del catálogo. Esta acción no se puede deshacer.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-error-container border border-error text-on-error-container text-xs rounded-sm">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-outline-variant text-on-surface hover:bg-surface-container rounded-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteBook}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-error text-on-error hover:opacity-90 rounded-sm shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Eliminando..." : "Sí, Eliminar Libro"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

