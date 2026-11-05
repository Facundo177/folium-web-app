import { useNavigate } from "react-router-dom";
import { ITEM_STATUS } from "../../api/constants";
import {
  Plus,
  BookMarked,
  BookOpenCheck,
  BookOpen,
  Archive,
} from "lucide-react";

export default function DescriptionOfInventory({ items = [], totalCount }) {
  const navigate = useNavigate();

  const total =
    typeof totalCount === "number" && totalCount > 0 ? totalCount : items.length;
  const available = items.filter((i) => i.status === ITEM_STATUS.AVAILABLE).length;
  const loaned = items.filter((i) => i.status === ITEM_STATUS.LOANED).length;
  const maintenance = items.filter(
    (i) =>
      i.status === ITEM_STATUS.DAMAGED ||
      i.status === ITEM_STATUS.LOST ||
      i.status === ITEM_STATUS.RESERVED
  ).length;

  return (
    <div className="w-full font-sans mb-8">
      {/* Encabezado Notarial del Acervo */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/60 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-sans text-primary/80 font-bold bg-primary/10 px-2 py-0.5 rounded-xs">
              Custodia Notarial de Fondos
            </span>
            <span className="text-xs font-sans tabular-nums text-on-surface-variant">
              Folio #{new Date().getFullYear()} · Depósito General
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-on-surface tracking-tight">
            Registro del Acervo y Fondos de Depósito
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant mt-1.5 max-w-3xl leading-relaxed">
            Control archivístico de copias físicas, signatura topográfica, estado de conservación y disponibilidad en sala.
          </p>
        </div>

        {/* Botón de Acción Principal (reubicado desde la cuadrícula de métricas) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate("/librarian/addItem")}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider bg-primary text-on-primary rounded-xs hover:opacity-90 transition-opacity shadow-2xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Registrar Ejemplar Físico
          </button>
        </div>
      </header>

      {/* Cinta Contable de Existencias (4 columnas continuas con separadores de 1px) */}
      <section
        aria-label="Cinta de existencias de inventario"
        className="grid grid-cols-2 lg:grid-cols-4 border border-outline-variant/60 bg-surface-container-lowest divide-y lg:divide-y-0 lg:divide-x divide-outline-variant/40 shadow-xs"
      >
        {/* Columna 1: Fondo Total */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">
              Fondo Total Acervo
            </span>
            <BookMarked className="w-4 h-4 text-on-surface-variant/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-on-surface tabular-nums">
              {total}
            </span>
            <span className="text-xs text-on-surface-variant">ejemplares</span>
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-2">
            Copias físicas catalogadas
          </p>
        </div>

        {/* Columna 2: Disponibles en Sala */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">
              Disponibles en Sala
            </span>
            <BookOpenCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-on-surface tabular-nums">
              {available}
            </span>
            <span className="text-xs text-on-surface-variant">en estantería</span>
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-2">
            Listos para préstamo o consulta
          </p>
        </div>

        {/* Columna 3: En Manos de Lectores (Sin camiones de flete) */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">
              En Circulación Activa
            </span>
            <BookOpen className="w-4 h-4 text-primary/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-on-surface tabular-nums">
              {loaned}
            </span>
            <span className="text-xs text-on-surface-variant">en préstamo</span>
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-2">
            Bajo comodato de lectores
          </p>
        </div>

        {/* Columna 4: Reserva o Taller de Restauración */}
        <div className="p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">
              Taller o Reserva
            </span>
            <Archive className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-amber-700 dark:text-amber-400 tabular-nums">
              {maintenance}
            </span>
            <span className="text-xs text-on-surface-variant">excepciones</span>
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-2">
            En restauración, apartados o extravío
          </p>
        </div>
      </section>
    </div>
  );
}
