import { useState, useMemo } from "react";
import { ITEM_STATUS } from "../../api/constants";
import { itemService } from "../../api/services/itemService";
import {
  ChevronDown,
  Search,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  MapPin,
} from "lucide-react";

export const InventoryTable = ({ rows = [], books = [], onRefetch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Estados para edición de ejemplar (Item)
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    book: "",
    inventory_code: "",
    location: "",
    status: ITEM_STATUS.AVAILABLE,
  });
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
    if (status === ITEM_STATUS.AVAILABLE)
      return "bg-surface-variant text-on-surface";
    return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
  };

  const handleOpenEdit = (row) => {
    setEditingItem(row);
    setEditForm({
      book: row.bookId ?? "",
      inventory_code: row.code || "",
      location: row.location || "",
      status: row.status || ITEM_STATUS.AVAILABLE,
    });
    setEditError(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
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
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm font-sans">
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
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Toolbar: Search & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-gutter gap-stack-md">
        {/* Search Input */}
        <div className="flex items-center gap-base border-b border-outline pb-1 w-full md:w-80">
          <Search className="w-[18px] h-[18px] text-on-surface-variant shrink-0" />
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
          <div className="relative flex items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-outline-variant rounded-DEFAULT pl-6 pr-10 py-2 text-label-caps text-on-surface hover:bg-surface-container appearance-none bg-transparent outline-none focus:border-primary cursor-pointer transition-colors"
            >
              <option value="">Todos los estados</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
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

              {/* Cuerpo: Portada en miniatura + Título y Autor */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-16 bg-surface-container border border-outline-variant overflow-hidden p-0.5 shrink-0 rounded-xs shadow-xs flex items-center justify-center">
                  {row.cover ? (
                    <img
                      src={row.cover}
                      alt={`Portada de ${row.title}`}
                      className="w-full h-full object-cover"
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

      {/* Desktop Table Section (Visible en md en adelante) con orden jerárquico optimizado */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-y border-outline-variant bg-surface-container-lowest">
              <th className="w-1/8 py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                CODIGO
              </th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                PORTADA
              </th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                TITULO & AUTOR
              </th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                ESTADO
              </th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                UBICACION
              </th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                ISBN
              </th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">
                GENERO
              </th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant text-right">
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
                  className="border-b border-outline-variant hover:bg-surface"
                >
                  {/* Code */}
                  <td className="py-stack-sm px-gutter font-mono font-bold text-xs text-on-surface">
                    <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant/60">
                      {row.code}
                    </span>
                  </td>
                  {/* Cover */}
                  <td className="py-stack-sm px-gutter">
                    <div className="w-12 h-16 bg-surface-container border border-outline-variant overflow-hidden p-1 shadow-sm">
                      {row.cover ? (
                        <img
                          src={row.cover}
                          alt={`Portada de ${row.title}`}
                          className="w-full h-full object-cover"
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
                  <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant">
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
          Mostrando {filtered.length} de {rows.length} ejemplares
        </span>

        <div className="flex items-center gap-1">
          <button
            className="border border-outline-variant px-3 py-1 bg-surface-container-lowest text-on-surface-variant hover:bg-surface disabled:opacity-50"
            disabled
          >
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

      {/* MODAL DE EDICIÓN DE ITEM */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface border border-outline-variant rounded-sm shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
              <div>
                <span className="text-label-caps text-primary block">
                  Gestión de Inventario
                </span>
                <h2 className="text-headline-sm font-serif text-on-surface">
                  Editar Ejemplar ({editingItem.code})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-error-container border border-error text-on-error-container text-xs rounded-sm">
                  {editError}
                </div>
              )}

              {/* Obra asociada */}
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-1.5">
                  Obra de Referencia *
                </label>
                <div className="relative flex items-center">
                  <select
                    required
                    value={editForm.book}
                    onChange={(e) =>
                      setEditForm({ ...editForm, book: e.target.value })
                    }
                    className="w-full pl-3 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Seleccione una obra...
                    </option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        #{b.id} — {b.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 pointer-events-none text-on-surface-variant flex items-center justify-center">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Código y Ubicación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1.5">
                    Código de Inventario *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.inventory_code}
                    onChange={(e) =>
                      setEditForm({ ...editForm, inventory_code: e.target.value })
                    }
                    placeholder="Ej. INV-00134"
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1.5">
                    Ubicación Física *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    placeholder="Ej. Estante A3"
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-1.5">
                  Estado del Ejemplar *
                </label>
                <div className="relative flex items-center">
                  <select
                    required
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full pl-3 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value={ITEM_STATUS.AVAILABLE}>Disponible</option>
                    <option value={ITEM_STATUS.LOANED}>Prestado</option>
                    <option value={ITEM_STATUS.RESERVED}>Reservado</option>
                    <option value={ITEM_STATUS.DAMAGED}>Dañado</option>
                    <option value={ITEM_STATUS.LOST}>Perdido</option>
                  </select>
                  <div className="absolute right-3 pointer-events-none text-on-surface-variant flex items-center justify-center">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-outline-variant text-on-surface hover:bg-surface-container rounded-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary text-on-primary hover:opacity-90 rounded-sm shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE ITEM */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface border border-outline-variant rounded-sm shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-error mb-3">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="text-headline-sm font-serif text-on-surface">
                ¿Eliminar ejemplar?
              </h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-4">
              Estás por eliminar del inventario el ejemplar{" "}
              <strong className="text-on-surface">{deletingItem.code}</strong> correspondiente a{" "}
              <strong className="text-on-surface">&ldquo;{deletingItem.title}&rdquo;</strong>.
              Esta acción no se puede deshacer.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-error-container border border-error text-on-error-container text-xs rounded-sm">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-outline-variant text-on-surface hover:bg-surface-container rounded-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-error text-on-error hover:opacity-90 rounded-sm shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Eliminando..." : "Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
