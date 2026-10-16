import { useState, useEffect } from "react";
import { bookService } from "../../api/services/bookService";
import { authorService } from "../../api/services/authorService";
import { genreService } from "../../api/services/genreService"; // Añadido el servicio de géneros
import GoBackButton from "../BasicUIComponents/GoBackButton";
import { useNavigate } from "react-router-dom";
import { useGenres } from "../../hooks/useGenres";
import { Delete, X } from "lucide-react";

export default function BookForm() {
  const navigate = useNavigate();
  
  // Extraemos también 'refetch' del hook para recargar los géneros tras crear uno nuevo
  const { genres: availableGenres, isLoading: isLoadingGenres, refetch: refetchGenres } = useGenres();

  // --- ESTADOS DEL LIBRO ---
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    publication_year: "",
    editorial: "", // NUEVO: Campo Editorial
    cover_image: null,
    description: "",
    genres: [],
  });
  
  const [imagePreview, setImagePreview] = useState(null); 

  // --- ESTADOS DE AUTORES ---
  const [availableAuthors, setAvailableAuthors] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [newAuthor, setNewAuthor] = useState({ name: "", last_name: "" });
  const [isCreatingAuthor, setIsCreatingAuthor] = useState(false);

  // --- ESTADOS DE GÉNEROS NUEVOS ---
  const [newGenreName, setNewGenreName] = useState("");
  const [isCreatingGenre, setIsCreatingGenre] = useState(false);

  // Cargar autores
  useEffect(() => {
    authorService.getAll()
      .then((res) => setAvailableAuthors(res.data))
      .catch((err) => console.error("Error cargando autores:", err));
  }, []);

  // --- MANEJADORES GLOBALES ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, cover_image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, cover_image: null });
      setImagePreview(null);
    }
  };

  // --- LÓGICA DE GÉNEROS ---
  const handleGenreToggle = (genreId) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }));
  };

  const handleCreateNewGenre = async (e) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;

    setIsCreatingGenre(true);
    try {
      // 1. Creamos el género en el backend
      const res = await genreService.create({ name: newGenreName.trim() });
      const createdGenre = res.data;

      // 2. Recargamos la lista global de géneros del hook
      await refetchGenres();

      // 3. Lo añadimos automáticamente a los géneros seleccionados del libro actual
      setFormData((prev) => ({
        ...prev,
        genres: [...prev.genres, createdGenre.id]
      }));
      
      setNewGenreName(""); // Limpiamos el input
    } catch (error) {
      console.error("Error al crear género:", error);
      alert("Hubo un error al registrar el nuevo género.");
    } finally {
      setIsCreatingGenre(false);
    }
  };

  // --- LÓGICA DE AUTORES ---
  const handleAddExistingAuthor = (e) => {
    const authorId = Number(e.target.value);
    if (!authorId) return;
    
    const author = availableAuthors.find((a) => a.id === authorId);
    if (author && !selectedAuthors.find((a) => a.id === authorId)) {
      setSelectedAuthors([...selectedAuthors, author]);
    }
    e.target.value = "";
  };

  const handleRemoveAuthor = (authorId) => {
    setSelectedAuthors(selectedAuthors.filter((a) => a.id !== authorId));
  };

  const handleCreateNewAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthor.name || !newAuthor.last_name) return;

    setIsCreatingAuthor(true);
    try {
      const res = await authorService.create(newAuthor);
      const createdAuthor = res.data;
      setAvailableAuthors([...availableAuthors, createdAuthor]);
      setSelectedAuthors([...selectedAuthors, createdAuthor]);
      setNewAuthor({ name: "", last_name: "" });
    } catch (error) {
      console.error("Error al crear autor:", error);
      alert("Hubo un error al registrar el autor.");
    } finally {
      setIsCreatingAuthor(false);
    }
  };

  // --- ENVÍO FINAL DEL LIBRO ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedAuthors.length === 0) {
      alert("Debes seleccionar o crear al menos un autor para el libro.");
      return;
    }
    
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("isbn", formData.isbn);
    submitData.append("editorial", formData.editorial); // NUEVO
    submitData.append("publication_year", Number(formData.publication_year));
    submitData.append("description", formData.description);

    if (formData.cover_image) {
      submitData.append("cover_image", formData.cover_image);
    }

    selectedAuthors.forEach(author => submitData.append("authors", author.id));
    if (selectedAuthors.length === 1) {
      submitData.append("authors", selectedAuthors[0].id);
    }

    formData.genres.forEach(genreId => submitData.append("genres", genreId));
    if (formData.genres.length === 1) {
      submitData.append("genres", formData.genres[0]);
    }

    bookService.create(submitData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        alert("Libro guardado exitosamente en el archivo.");
        // navigate('/librarian/inventory');
      })
      .catch((error) => {
        console.error("Error al guardar:", error.response?.data || error.message);
        alert("Hubo un error al registrar el libro. Revisa la consola.");
      });
  };

  return (
    <div className="w-full max-w-[600px] flex flex-col items-center pb-12 mx-auto animate-fade-in">
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
        
        {/* === FILA 1: Título e ISBN === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">TÍTULO</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">ISBN</label>
            <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} required className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" />
          </div>
        </div>

        {/* === FILA 2: Editorial y Año === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">EDITORIAL</label>
            <input type="text" name="editorial" value={formData.editorial} onChange={handleChange} required placeholder="Ej. Penguin Classics" className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">AÑO DE PUBLICACIÓN</label>
            <input type="number" name="publication_year" value={formData.publication_year} onChange={handleChange} required placeholder="Ej. 1967" className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" />
          </div>
        </div>

        {/* === FILA 3: Portada === */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">PORTADA DEL LIBRO</label>
          <input 
            type="file" 
            name="cover_image" 
            accept=".jpg, .jpeg, .png, .webp" 
            onChange={handleFileChange} 
            className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-secondary file:text-on-secondary hover:file:bg-secondary-container hover:file:text-on-secondary-container file:cursor-pointer file:transition-colors cursor-pointer" 
          />
        </div>

        {imagePreview && (
          <div className="w-32 aspect-[2/3] border-2 border-primary rounded-lg overflow-hidden shadow-lg mx-auto my-2 relative group">
            <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
            <button type="button" onClick={() => { setFormData({...formData, cover_image: null}); setImagePreview(null); }} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="w-5 h-5">
                <Delete/>
              </span>
            </button>
          </div>
        )}

        {/* === FILA 4: Descripción === */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">DESCRIPCIÓN / SINOPSIS</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors resize-y" />
        </div>

        {/* === SECCIÓN DE AUTORES === */}
        <div className="p-5 border border-outline-variant rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-4">
          <h3 className="text-label-caps text-on-surface font-bold">GESTIÓN DE AUTORES</h3>
          
          {selectedAuthors.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-surface-container rounded-md">
              {selectedAuthors.map((author) => (
                <div key={author.id} className="flex items-center gap-2 bg-secondary text-on-secondary px-3 py-1.5 rounded-md text-sm font-medium shadow-sm">
                  {author.name} {author.last_name}
                  <button type="button" onClick={() => handleRemoveAuthor(author.id)} className="hover:text-primary transition-colors flex items-center">
                    <span className="w-5 h-5 text-[16px]">
                      <X/>
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-on-surface-variant font-bold">Elegir existente</label>
              <select onChange={handleAddExistingAuthor} defaultValue="" className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant rounded-md text-sm text-on-surface cursor-pointer focus:border-primary focus:outline-none transition-colors">
                <option value="" disabled>Buscar en el archivo...</option>
                {availableAuthors.map(a => (
                  <option key={a.id} value={a.id}>{a.name} {a.last_name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 border-l border-outline-variant/50 pl-0 md:pl-6">
              <label className="text-xs text-on-surface-variant font-bold">Registrar nuevo</label>
              <div className="flex flex-col gap-2">
                <input type="text" placeholder="Nombre" value={newAuthor.name} onChange={(e) => setNewAuthor({...newAuthor, name: e.target.value})} className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-md text-sm text-on-surface focus:border-primary transition-colors" />
                <input type="text" placeholder="Apellido" value={newAuthor.last_name} onChange={(e) => setNewAuthor({...newAuthor, last_name: e.target.value})} className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-md text-sm text-on-surface focus:border-primary transition-colors" />
                <button type="button" onClick={handleCreateNewAuthor} disabled={isCreatingAuthor} className="bg-tertiary text-on-tertiary text-xs font-bold uppercase tracking-widest py-2 rounded-md hover:opacity-90 disabled:opacity-50 transition-colors mt-1 shadow-sm">
                  {isCreatingAuthor ? "Registrando..." : "Añadir Autor"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* === SECCIÓN DE GÉNEROS === */}
        <div className="p-5 border border-outline-variant rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-4">
          <h3 className="text-label-caps text-on-surface font-bold">GÉNEROS LITERARIOS</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Checkboxes de Géneros Existentes */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              <label className="text-xs text-on-surface-variant font-bold">Seleccionar existentes</label>
              {isLoadingGenres ? (
                <p className="text-sm text-on-surface-variant italic p-3 bg-surface-container rounded-md">Cargando géneros...</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-4 bg-surface-container border border-outline-variant rounded-md max-h-48 overflow-y-auto shadow-inner">
                  {availableGenres.map((genre) => (
                    <label key={genre.id} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" value={genre.id} checked={formData.genres.includes(genre.id)} onChange={() => handleGenreToggle(genre.id)} className="w-4 h-4 accent-primary cursor-pointer" />
                      <span className="text-sm text-on-surface group-hover:text-primary transition-colors">{genre.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Crear Nuevo Género */}
            <div className="flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-outline-variant/50 pt-4 lg:pt-0 pl-0 lg:pl-6">
              <label className="text-xs text-on-surface-variant font-bold">Crear nueva categoría</label>
              <div className="flex flex-col gap-2">
                <input type="text" placeholder="Ej. Ciberpunk" value={newGenreName} onChange={(e) => setNewGenreName(e.target.value)} className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-md text-sm text-on-surface focus:border-primary transition-colors" />
                <button type="button" onClick={handleCreateNewGenre} disabled={isCreatingGenre} className="bg-tertiary text-on-tertiary text-xs font-bold uppercase tracking-widest py-2 rounded-md hover:opacity-90 disabled:opacity-50 transition-colors mt-1 shadow-sm">
                  {isCreatingGenre ? "Registrando..." : "Añadir Género"}
                </button>
              </div>
            </div>
            
          </div>
        </div>

        <button type="submit" className="w-full bg-primary text-on-primary text-body-lg font-bold tracking-widest uppercase py-3 rounded-lg mt-6 hover:opacity-90 shadow-md transition-opacity">
          Guardar Libro
        </button>
      </form>
    </div>
  );
}