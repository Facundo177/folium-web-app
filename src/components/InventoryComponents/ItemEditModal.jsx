import { useState, useEffect, useRef, useId, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown } from "lucide-react";
import { ITEM_STATUS } from "../../api/constants";

/**
 * Modal accesible para la edición de ejemplares de inventario (Item).
 * Implementado con el elemento nativo <dialog> conforme a Modern Web Guidance:
 * - Native <dialog> con showModal()
 * - Trampa de foco nativa y aislamiento de scroll
 * - Soporte de Escape y light dismiss por clic exterior
 * - Vinculación de labels con id semánticos y role="alert"
 */
export default function ItemEditModal({
  isOpen,
  item,
  books = [],
  isSaving = false,
  error = null,
  onSave,
  onClose,
}) {
  const dialogRef = useRef(null);
  const pressedOutsideRef = useRef(false);
  const headingId = useId();

  const [editForm, setEditForm] = useState({
    book: "",
    inventory_code: "",
    location: "",
    status: ITEM_STATUS.AVAILABLE,
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (item) {
      setEditForm({
        book: item.bookId ?? "",
        inventory_code: item.code || "",
        location: item.location || "",
        status: item.status || ITEM_STATUS.AVAILABLE,
      });
    }
  }, [item]);

  // Si el libro del ejemplar no está en los primeros 20 (por paginación), se asegura su presencia como opción
  const bookOptions = useMemo(() => {
    const list = Array.isArray(books) ? books : [];
    if (!item || !item.bookId) return list;
    const exists = list.some((b) => String(b.id) === String(item.bookId));
    if (!exists && item.title && item.title !== "—") {
      return [{ id: item.bookId, title: item.title, isbn: item.isbn }, ...list];
    }
    return list;
  }, [books, item]);

  const handleCancel = (e) => {
    e.preventDefault();
    if (!isSaving) {
      onClose?.();
    }
  };

  const handlePointerDown = (e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const r = dialog.getBoundingClientRect();
    pressedOutsideRef.current =
      e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  const handlePointerUp = (e) => {
    const dialog = dialogRef.current;
    if (!dialog || isSaving) return;
    const r = dialog.getBoundingClientRect();
    const releasedOutside =
      e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (pressedOutsideRef.current && releasedOutside) {
      onClose?.();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(editForm);
  };

  if (!isOpen || !item) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      aria-labelledby={headingId}
      className="p-0 bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-xs max-w-lg w-full m-auto overflow-visible focus:outline-none"
    >
      <div className="bg-surface border border-outline-variant rounded-sm shadow-2xl w-full overflow-hidden animate-fade-in font-sans text-on-surface">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
          <div>
            <span className="text-label-caps text-primary block">Gestión de Inventario</span>
            <h2 id={headingId} className="text-headline-sm font-serif text-on-surface">
              Editar Ejemplar ({item.code})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-sm cursor-pointer transition-colors"
            aria-label="Cerrar modal de edición"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3 bg-error-container border border-error text-on-error-container text-xs rounded-sm"
            >
              {error}
            </div>
          )}

          {/* Obra asociada */}
          <div>
            <label htmlFor="edit-item-book" className="block text-label-caps text-on-surface-variant mb-1.5">
              Obra de Referencia *
            </label>
            <div className="relative flex items-center">
              <select
                id="edit-item-book"
                required
                value={editForm.book}
                onChange={(e) => setEditForm({ ...editForm, book: e.target.value })}
                className="w-full pl-3 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Seleccione una obra...
                </option>
                {bookOptions.map((b) => (
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
              <label htmlFor="edit-item-code" className="block text-label-caps text-on-surface-variant mb-1.5">
                Código de Inventario *
              </label>
              <input
                id="edit-item-code"
                type="text"
                required
                value={editForm.inventory_code}
                onChange={(e) =>
                  setEditForm({ ...editForm, inventory_code: e.target.value })
                }
                placeholder="Ej. INV-00134"
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary font-mono uppercase"
              />
            </div>
            <div>
              <label htmlFor="edit-item-location" className="block text-label-caps text-on-surface-variant mb-1.5">
                Ubicación Física *
              </label>
              <input
                id="edit-item-location"
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
            <label htmlFor="edit-item-status" className="block text-label-caps text-on-surface-variant mb-1.5">
              Estado del Ejemplar *
            </label>
            <div className="relative flex items-center">
              <select
                id="edit-item-status"
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
              onClick={onClose}
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
    </dialog>,
    document.body
  );
}
