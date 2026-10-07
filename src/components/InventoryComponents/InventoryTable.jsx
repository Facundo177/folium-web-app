import { useState, useMemo } from "react";
import { ITEM_STATUS } from "../../api/constants";


export const InventoryTable= ({ rows = [] }) => {
  // Datos simulados basados en la imagen
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("");

const statuses = useMemo(() => [...new Set(rows.map((r) => r.statusLabel))], [rows]);

const filtered = useMemo(() => {
  const term = searchTerm.toLowerCase();
  return rows.filter((r) => {
    const matchText =
      r.title.toLowerCase().includes(term) ||
      r.author.toLowerCase().includes(term) ||
      r.isbn.includes(term) ||
      r.code.toLowerCase().includes(term);
    const matchStatus = statusFilter ? r.statusLabel === statusFilter : true;
    return matchText && matchStatus;
  });
}, [rows, searchTerm, statusFilter]);

  // Función para asignar los estilos del badge según el estado
  const getStatusBadgeStyle = (status) => {
  if (status === ITEM_STATUS.AVAILABLE) return "bg-surface-variant text-on-surface";
  return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
};

  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm font-sans">
      
      {/* Top Toolbar: Search & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-gutter gap-stack-md">
        
        {/* Search Input */}
        <div className="flex items-center gap-base border-b border-outline pb-1 w-full md:w-80">
          <SearchIcon />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text" 
            placeholder="Título, autor, ISBN o código" 
            className="bg-transparent border-none outline-none text-body-md w-full text-on-surface placeholder:text-on-surface-variant"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-base">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex items-center gap-1 border border-outline-variant rounded-DEFAULT px-4 py-2 text-label-caps text-on-surface hover:bg-surface-container"
          >
            <option value="">Todos los estados</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="flex items-center justify-center border border-outline-variant rounded-DEFAULT w-9 h-9 text-on-surface hover:bg-surface-container">
            <FilterIcon />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-y border-outline-variant bg-surface-container-lowest">
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">PORTADA</th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">TITULO & AUTOR</th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">ISBN</th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">GENERO</th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">CODIGO</th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">UBICACION</th>
              <th className="w-1/6 py-stack-sm px-gutter text-label-caps text-on-surface-variant">STATUS</th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-outline-variant hover:bg-surface">
                {/* Cover */}
                <td className="py-stack-sm px-gutter">
                  <div className="w-12 h-16 bg-surface-container border border-outline-variant overflow-hidden p-1 shadow-sm">
                    {row.cover ? (
                     <img src={row.cover} alt={`Portada de ${row.title}`} className="w-full h-full object-cover" />
                     ) : (
                      <span className="font-serif text-xl text-on-surface-variant">{row.title[0]}</span>
                    )}
                  </div>
                </td>
                {/* Title & Author */}
                <td className="py-stack-sm px-gutter">
                  <div className="flex flex-col">
                    <span className="text-title-lg text-on-surface font-medium">
                      {row.title}
                    </span>
                    <span className="text-body-md text-on-surface-variant">
                      {row.author}
                    </span>
                  </div>
                </td>
                {/* ISBN */}
                <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant">
                  {row.isbn}
                </td>
                {/* Genre */}
                <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant">
                  {row.genres.join(", ")}
                </td>
                {/* Code */}
                <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant">
                  {row.code}
                </td>
                {/* Location */}
                <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant">
                  {row.location || "—"}
                </td>
                {/* Status Badge */}
                <td className="py-stack-sm px-gutter">
                  <span className={`text-label-caps px-2 py-1 rounded-sm ${getStatusBadgeStyle(row.status)}`}>
                    {row.statusLabel}
                  </span>
                </td>
                {/* Actions (Empty in reference image) */}
                <td className="py-stack-sm px-gutter text-right">
                  {/* Espacio para botones de editar/eliminar */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center p-gutter gap-stack-md text-body-md text-on-surface-variant bg-surface-container-lowest rounded-b-DEFAULT">
        <span>Mostrando {filtered.length} de {rows.length} ejemplares</span>
        
        <div className="flex items-center gap-1">
          <button className="border border-outline-variant px-3 py-1 bg-surface-container-lowest text-on-surface-variant hover:bg-surface disabled:opacity-50" disabled>
            Anterior
          </button>
          
          <button className="border border-primary px-3 py-1 bg-primary text-on-primary font-medium">
            1
          </button>
          <button className="border border-outline-variant px-3 py-1 bg-surface-container-lowest text-on-surface hover:bg-surface">
            2
          </button>
          <button className="border border-outline-variant px-3 py-1 bg-surface-container-lowest text-on-surface hover:bg-surface">
            3
          </button>
          
          <span className="px-2 text-on-surface-variant">...</span>
          
          <button className="border border-outline-variant px-3 py-1 bg-surface-container-lowest text-on-surface hover:bg-surface">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Íconos SVG extraídos
// ==========================================

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);


export default InventoryTable;