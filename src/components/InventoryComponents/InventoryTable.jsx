import { useState, useMemo, useEffect, useRef } from "react";
import { ITEM_STATUS } from "../../api/constants";
import { itemService } from "../../api/services/itemService";
import {
  ChevronDown,
  Search,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  MapPin,
  RefreshCw,
} from "lucide-react";
import FeedbackModal from "../BasicUIComponents/FeedbackModal";
import ItemEditModal from "./ItemEditModal";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: ITEM_STATUS.AVAILABLE, label: "Disponible" },
  { value: ITEM_STATUS.LOANED, label: "Prestado" },
  { value: ITEM_STATUS.RESERVED, label: "Reservado" },
  { value: ITEM_STATUS.DAMAGED, label: "Dañado / Mantenimiento" },
  { value: ITEM_STATUS.LOST, label: "Extraviado" },
];

export const InventoryTable = ({
  rows = [],
  books = [],
  isLoading = false,
  onRefetch,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
  statusFilter = "",
  onStatusFilterChange,
  searchTerm: externalSearch = "",
  onSearchChange,
}) => {
  const [searchInput, setSearchInput] = useState(externalSearch);
  const isFirstMount = useRef(true);

  // Sincronizar input si externalSearch cambia externamente
  useEffect(() => {
    setSearchInput(externalSearch);
  }, [externalSearch]);

  // Debounce de 400ms al escribir: evita saturación y previene reseteo accidental de página en mount
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onSearchChange?.(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  // Estados para edición de ejemplar (Item)
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Estados para eliminación de ejemplar (Item)
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const statuses = useMemo(
    () => [...new Set(rows.map((r) => r.statusLabel))],
    [rows]
  );

  const filtered = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    return rows.filter((r) => {
      const matchText =
        !term ||
        r.title.toLowerCase().includes(term) ||
        r.author.toLowerCase().includes(term) ||
        r.isbn.includes(term) ||
        r.code.toLowerCase().includes(term);
      const matchStatus = statusFilter
        ? r.status === statusFilter ||
          r.statusLabel?.toLowerCase() === statusFilter.toLowerCase()
        : true;
      return matchText && matchStatus;
    });
  }, [rows, searchInput, statusFilter]);

  // Función para asignar los estilos del badge según el estado
  const getStatusBadgeStyle = (status) => {
    if (status === ITEM_STATUS.AVAILABLE)
      return "bg-surface-variant text-on-surface";
    return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
  };

  const handleOpenEdit = (row) => {
    setEditingItem(row);
    setEditError(null);
  };

  const handleSaveEdit = async (editForm) => {
    if (!editingItem) return;

    const cleanCode = editForm.inventory_code.trim().toUpperCase();
    const cleanLocation = (editForm.location || "").trim().replace(/\s+/g, " ");

    if (!cleanCode) {
      setEditError("Ingrese el código de inventario.");
      return;
    }
    if (/\s/.test(cleanCode)) {
      setEditError("El código de inventario no puede contener espacios.");
      return;
    }
    if (!cleanLocation) {
      setEditError("Ingrese la ubicación física del ejemplar.");
      return;
    }

    setIsSaving(true);
    setEditError(null);

    try {
      const payload = {
        book: Number(editForm.book),
        inventory_code: cleanCode,
        location: cleanLocation,
        status: editForm.status,
      };

      await itemService.patch(editingItem.id, payload);
      await onRefetch?.();
      setEditingItem(null);
      setSuccessMessage(`Ejemplar ${cleanCode} actualizado correctamente.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      console.error("Error al actualizar ejemplar:", err);
      if (err.response?.data && typeof err.response.data === "object") {
        const messages = Object.entries(err.response.data)
          .map(
            ([field, msgs]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`
          )
          .join(" | ");
        setEditError(messages || "No se pudo actualizar el ejemplar.");
      } else {
        setEditError("Error al intentar guardar los cambios del ejemplar.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await itemService.remove(deletingItem.id);
      const removedCode = deletingItem.code;
      setDeletingItem(null);
      await onRefetch?.();
      setSuccessMessage(`Ejemplar ${removedCode} eliminado del inventario.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      console.error("Error al eliminar ejemplar:", err);
      setDeleteError(
        err.response?.data?.detail ||
          "No se pudo eliminar el ejemplar. Verifique que no tenga préstamos activos asociados."
      );
      setDeletingItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm font-sans transition-opacity duration-200 ${
        isLoading ? "opacity-75" : "opacity-100"
      }`}
    >
      {/* Banner de confirmación */}
      {successMessage && (
        <div className="m-gutter mb-0 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-sm flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Toolbar: Search & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-gutter gap-stack-md">
        {/* Search Input con accesibilidad */}
        <div className="flex items-center gap-base border-b border-outline pb-1 w-full md:w-80">
          <label htmlFor="inventory-search-input" className="sr-only">
            Buscar en inventario
          </label>
          <Search className="w-[18px] h-[18px] text-on-surface-variant shrink-0" />
          <input
            id="inventory-search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearchChange?.(searchInput.trim());
              }
            }}
            type="search"
            placeholder="Título, autor, ISBN o código"
            className="bg-transparent border-none outline-none text-body-md w-full text-on-surface placeholder:text-on-surface-variant"
          />
          {isLoading && (
            <RefreshCw className="w-4 h-4 text-primary animate-spin shrink-0 ml-1" />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-base w-full md:w-fit">
          <div className="relative flex items-center w-full">
            <label htmlFor="inventory-status-filter" className="sr-only">
              Filtrar por estado
            </label>
            <select
              id="inventory-status-filter"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange?.(e.target.value)}
              className="border border-outline-variant rounded-DEFAULT pl-6 pr-10 py-2 text-label-caps text-on-surface hover:bg-surface-container appearance-none bg-transparent outline-none focus:border-primary cursor-pointer transition-colors justify-center w-full"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="absolute right-3 pointer-events-none text-on-surface-variant flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-on-surface-variant" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card List (Visible únicamente en mobile < md) */}
      <div className="block md:hidden divide-y divide-outline-variant/60">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant italic text-sm">
            No se encontraron ejemplares que coincidan con la búsqueda.
          </div>
        ) : (
          filtered.map((row) => (
            <div
              key={row.id}
              className="p-4 flex flex-col gap-3 bg-surface-container-lowest hover:bg-surface/40 transition-colors"
            >
              {/* Header de la tarjeta: Código de inventario + Badge de Estado */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs bg-surface-container px-2 py-0.5 rounded border border-outline-variant text-on-surface tracking-wider">
                  {row.code}
                </span>
                <span
                  className={`text-label-caps px-2 py-0.5 rounded-sm font-semibold text-[11px] ${getStatusBadgeStyle(row.status)}`}
                >
                  {row.statusLabel}
                </span>
              </div>

              {/* Cuerpo: Portada en miniatura con prevención de CLS + Título y Autor */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-16 bg-surface-container border border-outline-variant overflow-hidden p-0.5 shrink-0 rounded-xs shadow-xs flex items-center justify-center aspect-[3/4]">
                  {row.cover ? (
                    <img
                      src={row.cover}
                      alt={`Portada de ${row.title}`}
                      width={48}
                      height={64}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover aspect-[3/4]"
                    />
                  ) : (
                    <span className="font-serif text-lg text-on-surface-variant">
                      {row.title?.[0] || "—"}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base font-medium text-on-surface leading-snug line-clamp-2">
                    {row.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                    {row.author}
                  </p>
                </div>
              </div>

              {/* Pie de tarjeta: Ubicación física + Acciones táctiles */}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-xs">
                <div className="flex items-center gap-1.5 text-on-surface-variant font-medium truncate pr-2">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{row.location || "Sin asignar"}</span>
                </div>

                <div className="inline-flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(row)}
                    title="Editar ejemplar"
                    aria-label={`Editar ejemplar ${row.code}`}
                    className="p-2 border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary rounded-sm transition-colors shadow-xs cursor-pointer active:scale-95"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setDeletingItem(row);
                    }}
                    title="Eliminar ejemplar"
                    aria-label={`Eliminar ejemplar ${row.code}`}
                    className="p-2 border border-error/40 bg-surface-container-lowest text-error hover:bg-error hover:text-on-error rounded-sm transition-colors shadow-xs cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table Section conforme a responsive-table guidance */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Inventario de ejemplares"
        className="hidden md:block overflow-x-auto w-full focus:outline-none focus:ring-1 focus:ring-primary/40"
      >
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-1 bg-surface-container-lowest">
            <tr className="border-y border-outline-variant">
              <th scope="col" className="w-1/8 py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                CODIGO
              </th>
              <th scope="col" className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                PORTADA
              </th>
              <th scope="col" className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                TITULO & AUTOR
              </th>
              <th scope="col" className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                ESTADO
              </th>
              <th scope="col" className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                UBICACION
              </th>
              <th scope="col" className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                ISBN
              </th>
              <th scope="col" className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                GENERO
              </th>
              <th scope="col" className="py-stack-sm px-gutter text-label-caps text-on-surface-variant text-right">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="p-8 text-center text-on-surface-variant italic text-sm"
                >
                  No se encontraron ejemplares que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-outline-variant hover:bg-surface/50 transition-colors"
                >
                  {/* Code */}
                  <td className="py-stack-sm px-gutter font-mono font-bold text-xs text-on-surface">
                    <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant/60">
                      {row.code}
                    </span>
                  </td>
                  {/* Cover con prevención de CLS */}
                  <td className="py-stack-sm px-gutter">
                    <div className="w-12 h-16 bg-surface-container border border-outline-variant overflow-hidden p-1 shadow-xs aspect-[3/4] flex items-center justify-center">
                      {row.cover ? (
                        <img
                          src={row.cover}
                          alt={`Portada de ${row.title}`}
                          width={48}
                          height={64}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover aspect-[3/4]"
                        />
                      ) : (
                        <span className="font-serif text-xl text-on-surface-variant">
                          {row.title[0]}
                        </span>
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
                  {/* Status Badge */}
                  <td className="py-stack-sm px-gutter">
                    <span
                      className={`text-label-caps px-2 py-1 rounded-sm ${getStatusBadgeStyle(row.status)}`}
                    >
                      {row.statusLabel}
                    </span>
                  </td>
                  {/* Location */}
                  <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant">
                    {row.location || "—"}
                  </td>
                  {/* ISBN */}
                  <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant font-mono text-xs">
                    {row.isbn}
                  </td>
                  {/* Genre */}
                  <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant">
                    {row.genres.join(", ")}
                  </td>
                  {/* Actions */}
                  <td className="py-stack-sm px-gutter text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        title="Editar ejemplar"
                        aria-label={`Editar ejemplar ${row.code}`}
                        className="p-2 border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary rounded-sm transition-colors shadow-xs cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setDeletingItem(row);
                        }}
                        title="Eliminar ejemplar"
                        aria-label={`Eliminar ejemplar ${row.code}`}
                        className="p-2 border border-error/40 bg-surface-container-lowest text-error hover:bg-error hover:text-on-error rounded-sm transition-colors shadow-xs cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center p-gutter gap-stack-md text-body-md text-on-surface-variant bg-surface-container-lowest rounded-b-DEFAULT">
        <span>
          Mostrando {filtered.length} de {totalCount || rows.length} ejemplares
          {totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="border border-outline-variant px-3 py-1 bg-surface-container-lowest text-on-surface-variant hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm rounded-xs cursor-pointer"
            >
              Anterior
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  acc.push('ellipsis-' + p);
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item) => {
                if (typeof item === 'string' && item.startsWith('ellipsis')) {
                  return (
                    <span key={item} className="px-2 text-on-surface-variant select-none">
                      ...
                    </span>
                  );
                }
                const isCurrent = item === currentPage;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onPageChange?.(item)}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`border px-3 py-1 text-sm rounded-xs transition-colors cursor-pointer ${
                      isCurrent
                        ? "border-primary bg-primary text-on-primary font-medium"
                        : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}

            <button
              type="button"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="border border-outline-variant px-3 py-1 bg-surface-container-lowest text-on-surface hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm rounded-xs cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal accesible de edición de ejemplar */}
      <ItemEditModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        books={books}
        isSaving={isSaving}
        error={editError}
        onSave={handleSaveEdit}
        onClose={() => {
          setEditingItem(null);
          setEditError(null);
        }}
      />

      {/* Modal accesible de confirmación de eliminación de ejemplar */}
      <FeedbackModal
        isOpen={Boolean(deletingItem)}
        type="warning"
        title="¿Eliminar ejemplar?"
        message={
          deletingItem
            ? `Estás por eliminar del inventario el ejemplar ${deletingItem.code} correspondiente a "${deletingItem.title}". Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) {
            setDeletingItem(null);
          }
        }}
      />

      {/* Modal accesible de error si falla la eliminación */}
      <FeedbackModal
        isOpen={Boolean(deleteError)}
        type="error"
        title="Error al eliminar ejemplar"
        message={deleteError || ""}
        confirmText="Entendido"
        onClose={() => setDeleteError(null)}
      />
    </div>
  );
};

export default InventoryTable;
