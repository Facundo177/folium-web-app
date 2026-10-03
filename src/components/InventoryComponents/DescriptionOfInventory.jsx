import {ITEM_STATUS} from "../../api/constants";

export default function DescriptionOfInventory({ items = [] }) {

  const total = items.length;
   const available = items.filter((i) => i.status === ITEM_STATUS.AVAILABLE).length;
   const loaned = items.filter((i) => i.status === ITEM_STATUS.LOANED).length;

  return (
    <div className="w-full font-sans pb-4">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-stack-md mb-stack-lg">
        <div className="flex flex-col">
          <h1 className="text-display-lg-mobile text-on-surface mb-1">
            Gestión de Inventario
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Manage and curate the bookstore's active catalogue.
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-DEFAULT text-label-caps hover:bg-inverse-surface transition-colors shadow-sm">
          <PlusIcon />
          AÑADIR NUEVO LIBRO
        </button>
      </div>

      {/* Metrics Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
        
        {/* Card 1: Total Libros */}{/* TODO(lunes): rótulos no coinciden con el dato */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-gutter flex justify-between items-center shadow-sm">
          <div className="flex flex-col">
            <span className="text-label-caps text-on-surface-variant mb-2">TOTAL LIBROS</span>
            <span className="text-headline-md text-on-surface">{total}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
            <PagesIcon />
          </div>
        </div>

        {/* Card 2: Stock Bajo (Estado de Alerta) */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-gutter flex justify-between items-center shadow-sm">
          <div className="flex flex-col">
            <span className="text-label-caps text-on-surface-variant mb-2">STOCK BAJO</span>
            {/* Usa el color rojo oscuro de tu tema para el número */}
            <span className="text-headline-md text-on-tertiary-fixed-variant">{available}</span>
          </div>
          {/* Usa el fondo rosado/rojo claro para el contenedor del ícono */}
          <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-on-tertiary-fixed-variant">
            <WarningIcon />
          </div>
        </div>

        {/* Card 3: Pedidos Pendientes */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-gutter flex justify-between items-center shadow-sm">
          <div className="flex flex-col">
            <span className="text-label-caps text-on-surface-variant mb-2">PEDIDOS PENDIENTES</span>
            <span className="text-headline-md text-on-surface">{loaned}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
            <TruckIcon />
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// Íconos SVG extraídos y adaptados
// ==========================================

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PagesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="11" height="11" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    <line x1="12" y1="13" x2="16" y2="13" />
    <line x1="12" y1="16" x2="16" y2="16" />
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);