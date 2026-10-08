import { useState } from "react";
import GoBackButton from "../BasicUIComponents/GoBackButton"

export default function BookForm() {
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    publication_year: "",
    cover_image: "",
    author_name: "",
    author_last_name: "",
    genres: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Transformación opcional para adaptarlo al formato JSON de tu backend
    const bookPayload = {
      title: formData.title,
      isbn: formData.isbn,
      publication_year: Number(formData.publication_year),
      cover_image: formData.cover_image,
      authors: [
        {
          name: formData.author_name,
          last_name: formData.author_last_name,
        },
      ],
      genres: formData.genres
        .split(",")
        .map((genre) => ({ name: genre.trim() }))
        .filter((genre) => genre.name !== ""),
    };

    console.log("Datos del libro a enviar:", bookPayload);
  };

  return (
    <div className="w-full max-w-[500px] flex flex-col items-center">
      <div className="flex mr-auto">
        <GoBackButton/>
        </div>
      {/* Textos de Cabecera */}
      <div className="w-full my-8">
        <h2 className="text-headline-md font-serif text-on-surface mb-2">
          Registrar Nuevo Libro
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Completa los datos para añadir un título al catálogo de Folium.
        </p>
      </div>

      {/* Formulario de Libro */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        {/* Fila 1: Título e ISBN */}
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
              placeholder="Ej. Cien años de soledad"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-on-surface-variant/50"
            />
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
              placeholder="Ej. 9780307474728"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Fila 2: Año de publicación y URL de portada */}
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
              placeholder="Ej. 1967"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-on-surface-variant/50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              URL DE PORTADA
            </label>
            <input
              type="url"
              name="cover_image"
              value={formData.cover_image}
              onChange={handleChange}
              placeholder="http://..."
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Fila 3: Autor (Nombre y Apellido) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              NOMBRE DEL AUTOR
            </label>
            <input
              type="text"
              name="author_name"
              value={formData.author_name}
              onChange={handleChange}
              placeholder="Ej. Gabriel"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-on-surface-variant/50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-on-surface font-bold">
              APELLIDO DEL AUTOR
            </label>
            <input
              type="text"
              name="author_last_name"
              value={formData.author_last_name}
              onChange={handleChange}
              placeholder="Ej. García Márquez"
              required
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Campo Géneros */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps text-on-surface font-bold">
            GÉNEROS (SEPARADOS POR COMA)
          </label>
          <input
            type="text"
            name="genres"
            value={formData.genres}
            onChange={handleChange}
            placeholder="Ej. Realismo mágico, Clásico"
            className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-outline transition-colors placeholder:text-on-surface-variant/50"
          />
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          className="w-full bg-on-tertiary-fixed-variant text-on-tertiary text-body-lg font-medium py-3 rounded-lg mt-4 hover:opacity-90 transition-opacity"
        >
          Guardar Libro
        </button>
      </form>
    </div>
  );
}