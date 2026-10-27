import { useState, useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, Plus } from "lucide-react";
import { authorService } from "../../api/services/authorService";
import { genreService } from "../../api/services/genreService";
import { bookService } from "../../api/services/bookService";
import FeedbackModal from "../BasicUIComponents/FeedbackModal";

/**
 * Modal accesible de edición de libro basado en el elemento nativo <dialog>.
 * Sigue los lineamientos de Modern Web Guidance:
 * - Native <dialog> con showModal() y top-layer nativo
 * - Cierre accesible por Escape y light-dismiss
 * - Campos con id y etiquetas semánticas
 * - Anuncio accesible de errores mediante role="alert"
 */
export default function BookEditModal({ isOpen, book, onClose, onSaved }) {
  const dialogRef = useRef(null);
  const pressedOutsideRef = useRef(false);
  const authorWrapperRef = useRef(null);
  const titleId = useId();

  // Estados del formulario
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

  // Catálogos
  const [allAuthors, setAllAuthors] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [authorSearch, setAuthorSearch] = useState("");
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  // Sub-formularios
  const [showNewAuthorModal, setShowNewAuthorModal] = useState(false);
  const [newAuthorData, setNewAuthorData] = useState({ name: "", last_name: "", biography: "" });
  const [isCreatingAuthor, setIsCreatingAuthor] = useState(false);

  const [showNewGenreModal, setShowNewGenreModal] = useState(false);
  const [newGenreData, setNewGenreData] = useState({ name: "", description: "" });
  const [isCreatingGenre, setIsCreatingGenre] = useState(false);

  // Feedback local para errores en sub-modales
  const [subFeedback, setSubFeedback] = useState({
    isOpen: false,
    type: "error",
    title: "",
    message: "",
  });

  // Sincronizar isOpen con native <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Cargar datos actuales del libro al abrir
  useEffect(() => {
    if (!isOpen || !book) return;
    setFormDataValues({
      title: book.title || "",
      editorial: book.editorial || "",
      isbn: book.isbn || "",
      publication_year: book.publication_year ?? "",
      description: book.description || "",
    });
    setSelectedAuthors(book.authors || []);
    setSelectedGenres(
      (book.genres || [])
        .map((g) => (typeof g === "object" && g !== null ? g.id : g))
        .filter(Boolean)
    );
    setCoverFile(null);
    setCoverPreview(book.cover_image || null);
    setSaveError(null);
    setAuthorSearch("");
    setShowAuthorDropdown(false);
    setShowNewAuthorModal(false);
    setShowNewGenreModal(false);
  }, [isOpen, book]);

  // Cargar catálogos de autores y géneros
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchCatalogs = async () => {
      try {
        const [authorsRes, genresRes] = await Promise.all([
          authorService.getAll(),
          genreService.getAll(),
        ]);
        if (!isMounted) return;
        setAllAuthors(authorsRes.data?.results || authorsRes.data || []);
        setAllGenres(genresRes.data?.results || genresRes.data || []);
      } catch (err) {
        console.error("Error cargando catálogos para edición:", err);
      }
    };
    fetchCatalogs();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Clic fuera del dropdown de autores
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authorWrapperRef.current && !authorWrapperRef.current.contains(event.target)) {
        setShowAuthorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manejo de tecla Escape para <dialog>
  const handleCancel = (e) => {
    e.preventDefault();
    if (showNewAuthorModal) {
      setShowNewAuthorModal(false);
      return;
    }
    if (showNewGenreModal) {
      setShowNewGenreModal(false);
      return;
    }
    if (!isSaving) {
      onClose?.();
    }
  };

  // Light dismiss sobre el ::backdrop
  const handlePointerDown = (e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const r = dialog.getBoundingClientRect();
    pressedOutsideRef.current =
      e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  const handlePointerUp = (e) => {
    const dialog = dialogRef.current;
    if (!dialog || isSaving) return;
    const r = dialog.getBoundingClientRect();
    const releasedOutside =
      e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (pressedOutsideRef.current && releasedOutside && !showNewAuthorModal && !showNewGenreModal) {
      onClose?.();
    }
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
    setSelectedAuthors((prev) => prev.filter((a) => a.id !== idToRemove));
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
      setSubFeedback({
        isOpen: true,
        type: "error",
        title: "Error al crear autor",
        message: err.response?.data
          ? Object.values(err.response.data).flat().join("\n")
          : "No se pudo registrar el nuevo autor.",
      });
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
      setSubFeedback({
        isOpen: true,
        type: "error",
        title: "Error al crear género",
        message: err.response?.data
          ? Object.values(err.response.data).flat().join("\n")
          : "No se pudo registrar el nuevo género.",
      });
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

      await bookService.patch(book.id, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSaved?.();
      onClose?.();
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

  const filteredAuthors = allAuthors.filter((a) =>
    `${a.name} ${a.last_name}`.toLowerCase().includes(authorSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      aria-labelledby={titleId}
      className="p-0 bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-xs max-w-3xl w-full m-auto overflow-visible focus:outline-none"
    >
      <div className="bg-surface border border-outline-variant rounded-sm shadow-2xl w-full max-h-[90dvh] flex flex-col overflow-hidden animate-fade-in text-on-surface">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-surface-container border-b border-outline-variant flex items-center justify-between shrink-0">
          <div>
            <span className="text-label-caps text-primary block">Gestión de Catálogo</span>
            <h2 id={titleId} className="text-headline-sm font-serif text-on-surface">
              Modificar Datos del Libro
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-sm transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario principal */}
        <form onSubmit={handleUpdateBook} className="p-6 overflow-y-auto space-y-5 flex-1 font-sans">
          {saveError && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3 bg-error-container border border-error text-on-error-container text-sm rounded-sm"
            >
              {saveError}
            </div>
          )}

          {/* Título y Editorial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-book-title" className="block text-label-caps text-on-surface-variant mb-1.5">
                Título del Libro *
              </label>
              <input
                id="edit-book-title"
                type="text"
                required
                value={formDataValues.title}
                onChange={(e) => setFormDataValues({ ...formDataValues, title: e.target.value })}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="edit-book-editorial" className="block text-label-caps text-on-surface-variant mb-1.5">
                Editorial *
              </label>
              <input
                id="edit-book-editorial"
                type="text"
                required
                value={formDataValues.editorial}
                onChange={(e) => setFormDataValues({ ...formDataValues, editorial: e.target.value })}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* ISBN y Año */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-book-isbn" className="block text-label-caps text-on-surface-variant mb-1.5">
                ISBN (10 o 13 dígitos) *
              </label>
              <input
                id="edit-book-isbn"
                type="text"
                inputMode="numeric"
                required
                maxLength={13}
                value={formDataValues.isbn}
                onChange={(e) =>
                  setFormDataValues({
                    ...formDataValues,
                    isbn: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
              />
            </div>
            <div>
              <label htmlFor="edit-book-year" className="block text-label-caps text-on-surface-variant mb-1.5">
                Año de Publicación *
              </label>
              <input
                id="edit-book-year"
                type="number"
                inputMode="numeric"
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
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          {/* Autores */}
          <div ref={authorWrapperRef} className="relative">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="edit-book-author-search" className="block text-label-caps text-on-surface-variant">
                Autores *
              </label>
              <button
                type="button"
                onClick={() => setShowNewAuthorModal(true)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Crear nuevo autor
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
                    aria-label={`Eliminar autor ${author.name} ${author.last_name}`}
                    className="hover:text-error font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              id="edit-book-author-search"
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
                          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
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
              <span className="block text-label-caps text-on-surface-variant">
                Géneros Literarios *
              </span>
              <button
                type="button"
                onClick={() => setShowNewGenreModal(true)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Crear nuevo género
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
            <label htmlFor="edit-book-cover" className="block text-label-caps text-on-surface-variant mb-1.5">
              Imagen de Portada (opcional)
            </label>
            <div className="flex items-center gap-4">
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Vista previa de portada"
                  width={64}
                  height={96}
                  decoding="async"
                  className="w-16 h-24 object-cover rounded-sm border border-outline-variant shrink-0 aspect-[2/3]"
                />
              )}
              <input
                id="edit-book-cover"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="w-full p-2 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface file:mr-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-container cursor-pointer"
              />
            </div>
          </div>

          {/* Sinopsis */}
          <div>
            <label htmlFor="edit-book-description" className="block text-label-caps text-on-surface-variant mb-1.5">
              Sinopsis / Descripción
            </label>
            <textarea
              id="edit-book-description"
              rows={4}
              value={formDataValues.description}
              onChange={(e) =>
                setFormDataValues({ ...formDataValues, description: e.target.value })
              }
              className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
              placeholder="Escribí una breve reseña o sinopsis del libro..."
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
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

      {/* SUB-MODAL: CREAR NUEVO AUTOR */}
      {showNewAuthorModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface p-6 rounded-sm shadow-2xl max-w-md w-full border border-outline-variant animate-fade-in text-on-surface">
            <h3 className="font-serif text-lg font-bold text-on-surface mb-4">
              Añadir Nuevo Autor
            </h3>
            <form onSubmit={handleCreateAuthor} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs uppercase text-outline mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={newAuthorData.name}
                  onChange={(e) => setNewAuthorData({ ...newAuthorData, name: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary"
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
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary"
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
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAuthorModal(false)}
                  className="px-4 py-2 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAuthor}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-sm cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface p-6 rounded-sm shadow-2xl max-w-md w-full border border-outline-variant animate-fade-in text-on-surface">
            <h3 className="font-serif text-lg font-bold text-on-surface mb-4">
              Crear Nuevo Género
            </h3>
            <form onSubmit={handleCreateGenre} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs uppercase text-outline mb-1">
                  Nombre del Género *
                </label>
                <input
                  type="text"
                  required
                  value={newGenreData.name}
                  onChange={(e) => setNewGenreData({ ...newGenreData, name: e.target.value })}
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary"
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
                  className="w-full p-2 border border-outline-variant rounded-sm text-sm bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewGenreModal(false)}
                  className="px-4 py-2 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGenre}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-sm cursor-pointer shadow-xs"
                >
                  {isCreatingGenre ? "Guardando..." : "Guardar Género"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-feedback modal para errores */}
      <FeedbackModal
        isOpen={subFeedback.isOpen}
        type={subFeedback.type}
        title={subFeedback.title}
        message={subFeedback.message}
        onClose={() => setSubFeedback((prev) => ({ ...prev, isOpen: false }))}
      />
    </dialog>,
    document.body
  );
}
