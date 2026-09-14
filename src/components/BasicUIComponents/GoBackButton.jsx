import { useLocation, useNavigate } from "react-router-dom";
import ArrowLeftIcon from "./ArrowLeftIcon";

export default function GoBackButton(){
  const navigate = useNavigate();
  const location = useLocation();

    const handleBack = () => {
    // Si la llave del historial es 'default', significa que es la primera página que abre
    if (location.key === 'default') {
      navigate('/'); // Ruta segura por defecto
    } else {
      navigate(-1);
    }
  };

  return (
  <button 
  onClick={handleBack} 
  className="flex items-center gap-2 hover:text-on-surface transition-colors cursor-pointer">
    <ArrowLeftIcon/> Return
    </button>);
}
