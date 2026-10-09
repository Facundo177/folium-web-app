import { useState } from "react";
import { bookService } from '../../api/services/bookService';
import { authorService } from '../../api/services/authorService';
import GoBackButton from "../BasicUIComponents/GoBackButton";
import { useNavigate } from "react-router-dom";
import { useGenres } from "../../hooks/useGenres";

export default function BookForm() {
  const navigate = useNavigate();
  const { genres: availableGenres, isLoading: isLoadingGenres } = useGenres();

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
  useState(() => {
    authorService.getAll()
      .then((res) => setAvailableAuthors(res.data))
      .catch((err) => console.error("Error cargando autores:", err));
  }, []);

  // --- MANEJADORES GLOBALES ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
  };

  // --- LOGICA DE AUTORES ---
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

  // --- ENVÍO FINAL DEL LIBRO (CON FORMDATA) ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedAuthors.length === 0) {
      alert("Debes seleccionar o crear al menos un autor para el libro.");
      return;
    }
    
    // Para enviar archivos, debemos instanciar FormData en lugar de un JSON normal
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("isbn", formData.isbn);
    submitData.append("publication_year", Number(formData.publication_year));
    submitData.append("description", formData.description);

    // Adjuntar archivo solo si fue seleccionado
    if (formData.cover_image) {
      submitData.append("cover_image", formData.cover_image);
    }

    // Para arreglos (Many-to-Many) en FormData, se hace append múltiple
    selectedAuthors.forEach(author => submitData.append("authors", author.id));
    
    // HACK: Si solo hay 1 autor, lo enviamos de nuevo para forzar el formato Array en DRF
    if (selectedAuthors.length === 1) {
      submitData.append("authors", selectedAuthors[0].id);
    }

    // Hacemos exactamente lo mismo con los géneros
    formData.genres.forEach(genreId => submitData.append("genres", genreId));
    
    if (formData.genres.length === 1) {
      submitData.append("genres", formData.genres[0]);
    }

    // Enviar a la API
    // bookService.create(submitData)

    // Obligamos a Axios a enviar esto como formulario de archivos
    bookService.create(submitData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        alert("Libro guardado exitosamente");
        navigate('/librarian/inventory');
      })
      .catch((error) => {
        console.error("Error al guardar:", error.response?.data || error.message);
      });
  };

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
            <label className="text-label-caps text-on-surface font-bold">TÍTULO</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">ISBN</label>
            <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} required className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">AÑO DE PUBLICACIÓN</label>
            <input type="number" name="publication_year" value={formData.publication_year} onChange={handleChange} required className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" />
          </div>

          {/* CAMBIO PRINCIPAL: Campo File en lugar de URL */}
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
        </div>

        {/* Previsualización dinámica de la portada seleccionada */}
        {imagePreview && (
          <div className="w-32 aspect-[2/3] border-2 border-primary rounded-lg overflow-hidden shadow-lg mx-auto my-2 relative group">
            <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={() => { setFormData({...formData, cover_image: null}); setImagePreview(null); }}
              className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">DESCRIPCIÓN</label>
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
                    <span className="material-symbols-outlined text-[16px]">close</span>
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

        {/* === GÉNEROS === */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">GÉNEROS LITERARIOS</label>
          {isLoadingGenres ? (
            <p className="text-sm text-on-surface-variant">Cargando géneros...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-surface-container-lowest border border-outline-variant rounded-lg max-h-48 overflow-y-auto shadow-inner">
              {availableGenres.map((genre) => (
                <label key={genre.id} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" value={genre.id} checked={formData.genres.includes(genre.id)} onChange={() => handleGenreToggle(genre.id)} className="w-4 h-4 accent-primary cursor-pointer" />
                  <span className="text-sm text-on-surface group-hover:text-primary transition-colors">{genre.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-primary text-on-primary text-body-lg font-bold tracking-widest uppercase py-3 rounded-lg mt-6 hover:opacity-90 shadow-md transition-opacity">
          Guardar Libro
        </button>
      </form>
    </div>
  );
}