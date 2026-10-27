import { useLocation } from "react-router-dom";
import ItemForm from "../components/InventoryComponents/ItemForm";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export const AddAnItem = () => {
  const { pathname } = useLocation();

  useDocumentMetadata({
    title: "Registrar Nuevo Ejemplar — Folium",
    description: "Añade una copia física específica con signatura y ubicación al inventario de Folium.",
  });

  return (
    <div className="flex-1 flex items-center justify-center p-gutter py-12 overflow-y-auto">
      {/* La clave React 'pathname' garantiza reiniciar la animación cuando cambia la URL */}
      <div key={pathname} className="animate-fade-in w-full flex justify-center">
        <ItemForm />
      </div>
    </div>
  );
};

export default AddAnItem;
