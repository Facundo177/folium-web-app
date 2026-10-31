import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useDeferredValue,
  memo,
} from "react";
import { bookService } from "../../api/services/bookService";
import { authorService } from "../../api/services/authorService";
import { genreService } from "../../api/services/genreService";
import { editorialService } from "../../api/services/editorialService";
import GoBackButton from "../BasicUIComponents/GoBackButton";
import FeedbackModal from "../BasicUIComponents/FeedbackModal";
import { useNavigate } from "react-router-dom";
import { useGenres } from "../../hooks/useGenres";
import { useEditorials } from "../../hooks/useEditorials";
import { Trash2, X, Plus, BookPlus, Search } from "lucide-react";

// ============================================================================
// SUBCOMPONENTE MEMOIZADO: SECCIÓN DE EDITORIAL
// Evita re-renderizar cientos de <option> cuando se escribe en Título/Sinopsis
// ============================================================================
const EditorialSection = memo(function EditorialSection({
  availableEditorials,
  isLoadingEditorials,
  selectedEditorial,
  isCreatingEditorial,
  onSelectExisting,
  onRemove,
  onCreateNew,
}) {
  const [newEditorialName, setNewEditorialName] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const deferredFilter = useDeferredValue(searchFilter);

  const filteredEditorials = useMemo(() => {
    const term = deferredFilter.trim().toLowerCase();
    if (!term) return availableEditorials;
    return availableEditorials.filter((ed) =>
      String(ed.name || "").toLowerCase().includes(term)
    );
  }, [availableEditorials, deferredFilter]);

  const editorialOptions = useMemo(
    () =>
      filteredEditorials.map((ed) => (
        <option key={ed.id ?? ed.name} value={ed.id ?? ed.name}>
          {ed.name}
        </option>
      )),
    [filteredEditorials]
  );

  const handleAddClick = async (e) => {
    e.preventDefault();
    const ok = await onCreateNew(newEditorialName);
    if (ok) {
      setNewEditorialName("");
    }
  };

  return (
    <div className="p-5 border border-outline-variant rounded-md bg-surface-container-lowest shadow-xs flex flex-col gap-4">
      <h2 className="text-label-caps text-on-surface font-bold">EDITORIAL *</h2>

      {selectedEditorial && (
        <div className="flex flex-wrap gap-2 p-3 bg-surface-container rounded-sm">
          <div className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full text-xs font-medium shadow-xs">
            <span>{selectedEditorial.name}</span>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Quitar editorial ${selectedEditorial.name}`}
              className="hover:text-error transition-colors flex items-center font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="load-book-editorial-select"
            className="text-xs text-on-surface-variant font-bold"
          >
            Elegir editorial existente ({availableEditorials.length})
          </label>

          {availableEditorials.length > 15 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrar editoriales..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface-container border border-outline-variant/70 rounded-sm text-xs text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <select
            id="load-book-editorial-select"
            onChange={onSelectExisting}
            disabled={isLoadingEditorials}
            defaultValue=""
            className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant rounded-sm text-sm text-on-surface cursor-pointer focus:border-primary focus:outline-none transition-colors disabled:opacity-60"
          >
            <option value="" disabled>
              {isLoadingEditorials
                ? "Cargando editoriales..."
                : "Buscar en el archivo..."}
            </option>
            {editorialOptions}
          </select>
        </div>

        <div className="flex flex-col gap-2 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-4 md:pt-0 pl-0 md:pl-6">
          <label
            htmlFor="load-book-new-editorial"
            className="text-xs text-on-surface-variant font-bold"
          >
            Registrar nueva editorial
          </label>
          <div className="flex flex-col gap-2">
            <input
              id="load-book-new-editorial"
              type="text"
              placeholder="Ej. Editorial Sur"
              value={newEditorialName}
              onChange={(e) => setNewEditorialName(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-sm text-sm text-on-surface focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={handleAddClick}
              disabled={isCreatingEditorial}
              className="bg-primary text-on-primary text-xs font-bold uppercase tracking-widest py-2 rounded-sm hover:opacity-90 disabled:opacity-50 transition-colors mt-1 shadow-xs cursor-pointer inline-flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {isCreatingEditorial ? "Registrando..." : "Añadir Editorial"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// SUBCOMPONENTE MEMOIZADO: SECCIÓN DE AUTORES
// Evita re-renderizar cientos/miles de autores en cada pulsación de tecla
// ============================================================================
const AuthorSection = memo(function AuthorSection({
  availableAuthors,
  isLoadingAuthors,
  selectedAuthors,
  isCreatingAuthor,
  onAddExisting,
  onRemove,
  onCreateNew,
}) {
  const [newAuthor, setNewAuthor] = useState({ name: "", last_name: "" });
  const [searchFilter, setSearchFilter] = useState("");
  const deferredFilter = useDeferredValue(searchFilter);

  const filteredAuthors = useMemo(() => {
    const term = deferredFilter.trim().toLowerCase();
    if (!term) return availableAuthors;
    return availableAuthors.filter((a) =>
      `${a.name || ""} ${a.last_name || ""}`.toLowerCase().includes(term)
    );
  }, [availableAuthors, deferredFilter]);

  const authorOptions = useMemo(
    () =>
      filteredAuthors.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name} {a.last_name}
        </option>
      )),
    [filteredAuthors]
  );

  const handleAddClick = async (e) => {
    e.preventDefault();
    if (!newAuthor.name.trim() || !newAuthor.last_name.trim()) return;
    const ok = await onCreateNew(newAuthor.name, newAuthor.last_name);
    if (ok) {
      setNewAuthor({ name: "", last_name: "" });
    }
  };

  return (
    <div className="p-5 border border-outline-variant rounded-md bg-surface-container-lowest shadow-xs flex flex-col gap-4">
      <h2 className="text-label-caps text-on-surface font-bold">
        GESTIÓN DE AUTORES *
      </h2>

      {selectedAuthors.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-surface-container rounded-sm">
          {selectedAuthors.map((author) => (
            <div
              key={author.id}
              className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full text-xs font-medium shadow-xs"
            >
              <span>
                {author.name} {author.last_name}
              </span>
              <button
                type="button"
                onClick={() => onRemove(author.id)}
                aria-label={`Quitar autor ${author.name} ${author.last_name}`}
                className="hover:text-error transition-colors flex items-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="load-book-author-select"
            className="text-xs text-on-surface-variant font-bold"
          >
            Elegir autor existente ({availableAuthors.length})
          </label>

          {availableAuthors.length > 15 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrar autores por nombre o apellido..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface-container border border-outline-variant/70 rounded-sm text-xs text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <select
            id="load-book-author-select"
            onChange={onAddExisting}
            disabled={isLoadingAuthors}
            defaultValue=""
            className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant rounded-sm text-sm text-on-surface cursor-pointer focus:border-primary focus:outline-none transition-colors disabled:opacity-60"
          >
            <option value="" disabled>
              {isLoadingAuthors
                ? "Cargando autores..."
                : "Buscar en el archivo..."}
            </option>
            {authorOptions}
          </select>
        </div>

        <div className="flex flex-col gap-2 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-4 md:pt-0 pl-0 md:pl-6">
          <span className="text-xs text-on-surface-variant font-bold">
            Registrar nuevo autor
          </span>
          <div className="flex flex-col gap-2">
            <label htmlFor="load-book-author-name" className="sr-only">
              Nombre del autor
            </label>
            <input
              id="load-book-author-name"
              type="text"
              placeholder="Nombre"
              value={newAuthor.name}
              onChange={(e) =>
                setNewAuthor((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-sm text-sm text-on-surface focus:border-primary transition-colors"
            />
            <label htmlFor="load-book-author-lastname" className="sr-only">
              Apellido del autor
            </label>
            <input
              id="load-book-author-lastname"
              type="text"
              placeholder="Apellido"
              value={newAuthor.last_name}
              onChange={(e) =>
                setNewAuthor((prev) => ({ ...prev, last_name: e.target.value }))
              }
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-sm text-sm text-on-surface focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={handleAddClick}
              disabled={isCreatingAuthor}
              className="bg-primary text-on-primary text-xs font-bold uppercase tracking-widest py-2 rounded-sm hover:opacity-90 disabled:opacity-50 transition-colors mt-1 shadow-xs cursor-pointer inline-flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {isCreatingAuthor ? "Registrando..." : "Añadir Autor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// SUBCOMPONENTE MEMOIZADO: SECCIÓN DE GÉNEROS
// Usa Set O(1) para seleccionados y aísla el estado del buscador/nuevo género
// ============================================================================
const GenreSection = memo(function GenreSection({
  availableGenres,
  isLoadingGenres,
  selectedGenreIds,
  isCreatingGenre,
  onToggleGenre,
  onCreateNewGenre,
}) {
  const [newGenreName, setNewGenreName] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const deferredFilter = useDeferredValue(searchFilter);

  const selectedGenresSet = useMemo(
    () => new Set(selectedGenreIds),
    [selectedGenreIds]
  );

  const filteredGenres = useMemo(() => {
    const term = deferredFilter.trim().toLowerCase();
    if (!term) return availableGenres;
    return availableGenres.filter((g) =>
      String(g.name || "").toLowerCase().includes(term)
    );
  }, [availableGenres, deferredFilter]);

  const handleAddClick = async (e) => {
    e.preventDefault();
    const clean = newGenreName.trim();
    if (!clean) return;
    const ok = await onCreateNewGenre(clean);
    if (ok) {
      setNewGenreName("");
    }
  };

  return (
    <div className="p-5 border border-outline-variant rounded-md bg-surface-container-lowest shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-label-caps text-on-surface font-bold">
          GÉNEROS LITERARIOS *
        </h2>
        {selectedGenreIds.length > 0 && (
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {selectedGenreIds.length} seleccionado(s)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkboxes de Géneros Existentes */}
        <div className="lg:col-span-2 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-on-surface-variant font-bold">
              Seleccionar categorías ({availableGenres.length})
            </span>
          </div>

          {availableGenres.length > 12 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrar géneros..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface-container border border-outline-variant/70 rounded-sm text-xs text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {isLoadingGenres ? (
            <p className="text-sm text-on-surface-variant italic p-3 bg-surface-container rounded-sm">
              Cargando géneros...
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-4 bg-surface-container border border-outline-variant rounded-sm max-h-48 overflow-y-auto shadow-inner">
              {filteredGenres.map((genre) => {
                const isChecked = selectedGenresSet.has(genre.id);
                return (
                  <label
                    key={genre.id}
                    className="flex items-center gap-2 cursor-pointer group select-none"
                  >
                    <input
                      type="checkbox"
                      value={genre.id}
                      checked={isChecked}
                      onChange={() => onToggleGenre(genre.id)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary transition-colors">
                      {genre.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Crear Nuevo Género */}
        <div className="flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-outline-variant/50 pt-4 lg:pt-0 pl-0 lg:pl-6">
          <label
            htmlFor="load-book-new-genre"
            className="text-xs text-on-surface-variant font-bold"
          >
            Crear nueva categoría
          </label>
          <div className="flex flex-col gap-2">
            <input
              id="load-book-new-genre"
              type="text"
              placeholder="Ej. Ciberpunk"
              value={newGenreName}
              onChange={(e) => setNewGenreName(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-sm text-sm text-on-surface focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={handleAddClick}
              disabled={isCreatingGenre}
              className="bg-primary text-on-primary text-xs font-bold uppercase tracking-widest py-2 rounded-sm hover:opacity-90 disabled:opacity-50 transition-colors mt-1 shadow-xs cursor-pointer inline-flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {isCreatingGenre ? "Registrando..." : "Añadir Género"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function LoadBookForm() {
  const navigate = useNavigate();

  // Géneros desde el hook
  const {
    genres: availableGenres,
    isLoading: isLoadingGenres,
    refetch: refetchGenres,
  } = useGenres();

  // Editoriales desde el endpoint dedicado /api/v1/editorial/
  const {
    editorials: availableEditorials,
    setEditorials: setAvailableEditorials,
    isLoading: isLoadingEditorials,
    refetch: refetchEditorials,
  } = useEditorials();

  // --- ESTADOS DEL LIBRO ---
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    publication_year: "",
    cover_image: null,
    description: "",
    genres: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ESTADOS DE AUTORES ---
  const [availableAuthors, setAvailableAuthors] = useState([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [isCreatingAuthor, setIsCreatingAuthor] = useState(false);

  // --- ESTADOS DE GÉNEROS Y EDITORIALES NUEVOS ---
  const [isCreatingGenre, setIsCreatingGenre] = useState(false);
  const [selectedEditorial, setSelectedEditorial] = useState(null);
  const [isCreatingEditorial, setIsCreatingEditorial] = useState(false);

  // --- MODAL DE FEEDBACK ACCESIBLE ---
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "Aceptar",
    cancelText: null,
    onConfirm: null,
  });

  // Cargar autores existentes
  useEffect(() => {
    let isMounted = true;
    authorService
      .getAll()
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.results || res.data || [];
        setAvailableAuthors(list);
      })
      .catch((err) => console.error("Error cargando autores:", err))
      .finally(() => {
        if (isMounted) setIsLoadingAuthors(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Limpiar ObjectURL de previsualización de imagen al cambiar o desmontar
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // --- MANEJADORES GLOBALES ---
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, cover_image: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, cover_image: null }));
      setImagePreview(null);
    }
  }, []);

  // --- LÓGICA DE GÉNEROS (ESTABLE CON USECALLBACK) ---
  const handleGenreToggle = useCallback((genreId) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }));
  }, []);

  const handleCreateNewGenre = useCallback(
    async (rawName) => {
      const cleanName = String(rawName || "").trim();
      if (!cleanName) return false;

      setIsCreatingGenre(true);
      try {
        const res = await genreService.create({ name: cleanName });
        const createdGenre = res.data;

        await refetchGenres();

        setFormData((prev) => ({
          ...prev,
          genres: prev.genres.includes(createdGenre.id)
            ? prev.genres
            : [...prev.genres, createdGenre.id],
        }));
        return true;
      } catch (error) {
        console.error("Error al crear género:", error);
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Error al crear género",
          message: error.response?.data
            ? Object.values(error.response.data).flat().join(" ")
            : "No se pudo registrar el nuevo género. Verifique si ya existe.",
        });
        return false;
      } finally {
        setIsCreatingGenre(false);
      }
    },
    [refetchGenres]
  );

  // --- LÓGICA DE AUTORES (ESTABLE CON USECALLBACK) ---
  const handleAddExistingAuthor = useCallback(
    (e) => {
      const authorId = Number(e.target.value);
      if (!authorId) return;

      const author = availableAuthors.find((a) => a.id === authorId);
      if (author) {
        setSelectedAuthors((prev) =>
          prev.some((a) => a.id === authorId) ? prev : [...prev, author]
        );
      }
      e.target.value = "";
    },
    [availableAuthors]
  );

  const handleRemoveAuthor = useCallback((authorId) => {
    setSelectedAuthors((prev) => prev.filter((a) => a.id !== authorId));
  }, []);

  const handleCreateNewAuthor = useCallback(async (firstName, lastName) => {
    const cleanFirst = String(firstName || "").trim();
    const cleanLast = String(lastName || "").trim();
    if (!cleanFirst || !cleanLast) return false;

    setIsCreatingAuthor(true);
    try {
      const res = await authorService.create({
        name: cleanFirst,
        last_name: cleanLast,
      });
      const createdAuthor = res.data;
      setAvailableAuthors((prev) => [...prev, createdAuthor]);
      setSelectedAuthors((prev) => [...prev, createdAuthor]);
      return true;
    } catch (error) {
      console.error("Error al crear autor:", error);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al crear autor",
        message: error.response?.data
          ? Object.values(error.response.data).flat().join(" ")
          : "No se pudo registrar el autor. Intente nuevamente.",
      });
      return false;
    } finally {
      setIsCreatingAuthor(false);
    }
  }, []);

  // --- LÓGICA DE EDITORIALES (ESTABLE CON USECALLBACK + ENDPOINT /editorial/) ---
  const handleSelectExistingEditorial = useCallback(
    (e) => {
      const val = e.target.value;
      const editorial = availableEditorials.find(
        (ed) => String(ed.id) === String(val) || ed.name === val
      );
      if (editorial) setSelectedEditorial(editorial);
      e.target.value = "";
    },
    [availableEditorials]
  );

  const handleRemoveEditorial = useCallback(() => {
    setSelectedEditorial(null);
  }, []);

  const handleCreateNewEditorial = useCallback(
    async (rawName) => {
      const cleanName = String(rawName || "")
        .trim()
        .replace(/\s+/g, " ");

      if (!cleanName) {
        setFeedbackModal({
          isOpen: true,
          type: "warning",
          title: "Editorial requerida",
          message: "Escribe el nombre de la nueva editorial.",
        });
        return false;
      }

      if (cleanName.length > 150) {
        setFeedbackModal({
          isOpen: true,
          type: "warning",
          title: "Nombre demasiado largo",
          message: "El nombre de la editorial admite hasta 150 caracteres.",
        });
        return false;
      }

      // Si ya existe en la lista local (case-insensitive), seleccionarla directamente
      const existing = availableEditorials.find(
        (ed) => ed.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (existing) {
        setSelectedEditorial(existing);
        return true;
      }

      setIsCreatingEditorial(true);
      try {
        const res = await editorialService.create({ name: cleanName });
        const createdEditorial = res.data;
        setAvailableEditorials((prev) =>
          [...prev, createdEditorial].sort((a, b) =>
            String(a.name || "").localeCompare(String(b.name || ""), "es")
          )
        );
        setSelectedEditorial(createdEditorial);
        return true;
      } catch (error) {
        console.error("Error al crear editorial:", error);
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Error al crear editorial",
          message: error.response?.data
            ? Object.values(error.response.data).flat().join(" ")
            : "No se pudo registrar la editorial. Verifique si ya existe.",
        });
        return false;
      } finally {
        setIsCreatingEditorial(false);
      }
    },
    [availableEditorials, setAvailableEditorials]
  );

  // --- ENVÍO FINAL DEL LIBRO ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedAuthors.length === 0) {
      setFeedbackModal({
        isOpen: true,
        type: "warning",
        title: "Autor requerido",
        message:
          "Debes seleccionar o crear al menos un autor para registrar el libro en el catálogo.",
      });
      return;
    }

    if (formData.genres.length === 0) {
      setFeedbackModal({
        isOpen: true,
        type: "warning",
        title: "Género requerido",
        message:
          "Selecciona al menos un género temático para clasificar la obra.",
      });
      return;
    }

    if (!selectedEditorial) {
      setFeedbackModal({
        isOpen: true,
        type: "warning",
        title: "Editorial requerida",
        message:
          "Selecciona o registra una editorial para clasificar la obra.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title.trim());
      if (formData.isbn && formData.isbn.trim()) {
        submitData.append("isbn", formData.isbn.trim());
      }
      submitData.append(
        "editorial",
        selectedEditorial.id ?? selectedEditorial.name
      );
      submitData.append("publication_year", Number(formData.publication_year));
      submitData.append("description", formData.description.trim());

      if (formData.cover_image instanceof File) {
        submitData.append("cover_image", formData.cover_image);
      }

      selectedAuthors.forEach((author) =>
        submitData.append("authors", author.id)
      );
      if (selectedAuthors.length === 1) {
        submitData.append("authors", selectedAuthors[0].id);
      }

      formData.genres.forEach((genreId) =>
        submitData.append("genres", genreId)
      );
      if (formData.genres.length === 1) {
        submitData.append("genres", formData.genres[0]);
      }

      await bookService.create(submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const bookTitle = formData.title;

      // Reseteo del formulario
      setFormData({
        title: "",
        isbn: "",
        publication_year: "",
        cover_image: null,
        description: "",
        genres: [],
      });
      setSelectedAuthors([]);
      setSelectedEditorial(null);
      refetchEditorials();
      setImagePreview(null);

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "¡Libro registrado exitosamente!",
        message: `"${bookTitle}" fue añadido al acervo de Folium. ¿Deseas ir al inventario o registrar otro libro?`,
        confirmText: "Ir al Inventario",
        cancelText: "Añadir Otro",
        onConfirm: () => navigate("/librarian/inventory"),
      });
    } catch (error) {
      console.error("Error al guardar libro:", error);
      let errorMsg = "Ocurrió un error inesperado al registrar el libro.";
      if (error.response?.data && typeof error.response.data === "object") {
        errorMsg = Object.entries(error.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
          .join("\n");
      }
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Error al registrar el libro",
        message: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[660px] flex flex-col items-center pb-12 mx-auto animate-fade-in font-sans">
      <div className="flex mr-auto mb-4">
        <GoBackButton />
      </div>

      <div className="w-full mb-8">
        <h1 className="text-headline-md font-serif text-on-surface mb-2">
          Registrar Nuevo Libro
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Completa los datos para catalogar una nueva obra en el archivo de
          Folium.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        {/* === FILA 1: Título e ISBN === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="load-book-title"
              className="text-label-caps text-on-surface font-bold"
            >
              TÍTULO *
            </label>
            <input
              id="load-book-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ej. Ficciones"
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="load-book-isbn"
              className="text-label-caps text-on-surface font-bold"
            >
              ISBN{" "}
              <span className="text-on-surface-variant font-normal text-xs normal-case">
                (opcional)
              </span>
            </label>
            <input
              id="load-book-isbn"
              type="text"
              inputMode="numeric"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="Ej. 9789500419574"
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>
        </div>

        {/* === FILA 2: Año === */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="load-book-year"
            className="text-label-caps text-on-surface font-bold"
          >
            AÑO DE PUBLICACIÓN *
          </label>
          <input
            id="load-book-year"
            type="number"
            inputMode="numeric"
            name="publication_year"
            min={868}
            max={new Date().getFullYear()}
            value={formData.publication_year}
            onChange={handleChange}
            required
            placeholder="Ej. 1944"
            className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors font-mono"
          />
        </div>

        {/* === FILA 3: Portada === */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="load-book-cover"
            className="text-label-caps text-on-surface font-bold"
          >
            IMAGEN DE PORTADA{" "}
            <span className="text-on-surface-variant font-normal text-xs normal-case">
              (opcional)
            </span>
          </label>
          <input
            id="load-book-cover"
            type="file"
            name="cover_image"
            accept=".jpg, .jpeg, .png, .webp"
            onChange={handleFileChange}
            className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors file:mr-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-primary file:text-on-primary hover:file:opacity-90 file:cursor-pointer cursor-pointer"
          />
        </div>

        {imagePreview && (
          <div className="w-32 aspect-[2/3] border border-outline-variant rounded-md overflow-hidden shadow-md mx-auto my-2 relative group">
            <img
              src={imagePreview}
              alt="Vista previa de portada seleccionada"
              width={128}
              height={192}
              decoding="async"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, cover_image: null }));
                setImagePreview(null);
              }}
              aria-label="Eliminar vista previa de portada"
              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity cursor-pointer"
            >
              <Trash2 className="w-6 h-6 text-error" />
            </button>
          </div>
        )}

        {/* === FILA 4: Descripción === */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="load-book-description"
            className="text-label-caps text-on-surface font-bold"
          >
            DESCRIPCIÓN / SINOPSIS *
          </label>
          <textarea
            id="load-book-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Reseña o sinopsis de la obra..."
            className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors resize-y"
          />
        </div>

        {/* === SECCIÓN MEMOIZADA DE EDITORIAL === */}
        <EditorialSection
          availableEditorials={availableEditorials}
          isLoadingEditorials={isLoadingEditorials}
          selectedEditorial={selectedEditorial}
          isCreatingEditorial={isCreatingEditorial}
          onSelectExisting={handleSelectExistingEditorial}
          onRemove={handleRemoveEditorial}
          onCreateNew={handleCreateNewEditorial}
        />

        {/* === SECCIÓN MEMOIZADA DE AUTORES === */}
        <AuthorSection
          availableAuthors={availableAuthors}
          isLoadingAuthors={isLoadingAuthors}
          selectedAuthors={selectedAuthors}
          isCreatingAuthor={isCreatingAuthor}
          onAddExisting={handleAddExistingAuthor}
          onRemove={handleRemoveAuthor}
          onCreateNew={handleCreateNewAuthor}
        />

        {/* === SECCIÓN MEMOIZADA DE GÉNEROS === */}
        <GenreSection
          availableGenres={availableGenres}
          isLoadingGenres={isLoadingGenres}
          selectedGenreIds={formData.genres}
          isCreatingGenre={isCreatingGenre}
          onToggleGenre={handleGenreToggle}
          onCreateNewGenre={handleCreateNewGenre}
        />

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-on-primary text-body-md font-bold tracking-widest uppercase py-3.5 rounded-md mt-4 hover:opacity-90 shadow-sm transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <BookPlus className="w-5 h-5" />
          {isSubmitting ? "Catalogando libro..." : "Guardar Libro en el Archivo"}
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
