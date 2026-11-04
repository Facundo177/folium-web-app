import { Link, useNavigate } from 'react-router-dom';
import ArrowLeftIcon from '../components/BasicUIComponents/ArrowLeftIcon';
import BookOpenIcon from '../components/BasicUIComponents/BookOpenIcon';

export default function Error404() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-gutter relative overflow-hidden font-sans">
      {/* Tarjeta / Marco de Archivo */}
      <div className="relative z-10 w-full max-w-2xl bg-surface-container-lowest border border-outline-variant p-8 md:p-14 rounded-sm shadow-xs text-center flex flex-col items-center">
        {/* Encabezado Superior */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-[1px] bg-outline-variant"></span>
          <span className="text-label-caps text-primary tracking-wider uppercase font-semibold">
            ESTATUS DE ARCHIVO 404
          </span>
          <span className="w-6 h-[1px] bg-outline-variant"></span>
        </div>

        {/* Ilustración / Decoración Central */}
        <div className="my-6 relative flex items-center justify-center">
          <span className="font-serif text-[100px] md:text-[130px] font-bold text-on-surface/10 leading-none select-none tabular-nums">
            404
          </span>
        </div>

        {/* Título Principal */}
        <h1 className="font-serif text-display-md text-on-surface mb-3 leading-tight">
          Folio extraviado en la penumbra
        </h1>

        {/* Mensaje Descriptivo */}
        <p className="text-body-lg text-on-surface-variant max-w-lg mb-8 leading-relaxed">
          La obra o estante que intentas consultar no se encuentra en nuestro inventario actual. Es posible que el volumen haya sido reubicado o que la signatura sea errónea.
        </p>

        {/* Línea Separadora Sobria */}
        <div className="w-full max-w-xs border-t border-outline-variant/60 mb-8" />

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-outline-variant text-on-surface rounded-sm font-medium text-body-md hover:bg-surface-container transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeftIcon />
            Regresar a la página anterior
          </button>

          <Link
            to="/catalog"
            className="px-6 py-3 bg-primary text-on-primary rounded-sm font-medium text-body-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            Explorar el catálogo
            <BookOpenIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
