import { useLocation } from "react-router-dom";
import LoadBookForm from "../components/InventoryComponents/LoadBookForm";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export const LoadBook = () => {
  const { pathname } = useLocation();

  useDocumentMetadata({
    title: "Registrar Nuevo Libro — Folium",
    description: "Añade un nuevo libro con autores, géneros e ISBN al catálogo de archivo de Folium.",
  });

  return (
    <div className="flex-1 flex items-center justify-center p-gutter py-12 overflow-y-auto">
      {/* La clave React 'pathname' garantiza reiniciar la animación cuando cambia la URL */}
      <div key={pathname} className="animate-fade-in w-full flex justify-center">
        <LoadBookForm />
      </div>
    </div>
  );
};

export default LoadBook;
