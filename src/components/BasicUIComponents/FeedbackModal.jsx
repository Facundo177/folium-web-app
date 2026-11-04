import { useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

/**
 * Modal accesible de notificación y confirmación basado en el elemento nativo <dialog>.
 *
 * Implementa las directrices de Modern Web Guidance:
 * - Promoción al top-layer nativo mediante dialog.showModal()
 * - Trampa de foco y página de fondo 'inert' proporcionada por el motor del navegador
 * - Soporte nativo para cierre con tecla Escape y gestos de retroceso
 * - Cierre por clic exterior (Light Dismiss) controlado por puntero
 * - Bloqueo de scroll de fondo con overscroll-behavior: contain
 *
 * Props:
 * - isOpen: boolean
 * - type: "success" | "error" | "warning" | "info"
 * - title: string
 * - message: string
 * - confirmText: string (default "Aceptar")
 * - cancelText: string (si se provee onConfirm, muestra botón de cancelar; default "Cancelar")
 * - onClose: () => void
 * - onConfirm: () => void (opcional; si está presente actúa como modal de confirmación)
 * - isLoading: boolean (opcional)
 */
export default function FeedbackModal({
  isOpen,
  type = "info",
  title,
  message,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onClose,
  onConfirm,
  isLoading = false,
  children,
}) {
  const dialogRef = useRef(null);
  const pressedOutsideRef = useRef(false);
  const headingId = useId();

  // Sincronización del estado isOpen con el elemento nativo <dialog>
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

  // Manejo de la tecla Escape nativa (evento cancel)
  const handleCancel = (e) => {
    e.preventDefault();
    if (!isLoading) {
      onClose?.();
    }
  };

  // Manejo de Light Dismiss (clic afuera sobre el ::backdrop)
  const handlePointerDown = (e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const r = dialog.getBoundingClientRect();
    pressedOutsideRef.current =
      e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  const handlePointerUp = (e) => {
    const dialog = dialogRef.current;
    if (!dialog || isLoading) return;
    const r = dialog.getBoundingClientRect();
    const releasedOutside =
      e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (pressedOutsideRef.current && releasedOutside) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const isConfirmMode = typeof onConfirm === "function";

  const configByType = {
    success: {
      icon: CheckCircle2,
      iconColor: "text-primary",
      defaultTitle: "Operación exitosa",
      confirmBtnClass: "bg-primary text-on-primary hover:opacity-90",
    },
    error: {
      icon: AlertTriangle,
      iconColor: "text-error",
      defaultTitle: "Atención",
      confirmBtnClass: "bg-error text-on-error hover:opacity-90",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-primary",
      defaultTitle: "Confirmar acción",
      confirmBtnClass: "bg-primary text-on-primary hover:opacity-90",
    },
    info: {
      icon: Info,
      iconColor: "text-primary",
      defaultTitle: "Aviso del Archivo",
      confirmBtnClass: "bg-primary text-on-primary hover:opacity-90",
    },
  };

  const current = configByType[type] || configByType.info;
  const IconComponent = current.icon;

  return createPortal(
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      aria-labelledby={headingId}
      className="p-0 border-0 bg-transparent rounded-sm shadow-2xl max-w-md w-[calc(100%-2rem)] mx-auto my-auto overflow-hidden animate-fade-in backdrop:bg-black/65 backdrop:backdrop-blur-xs focus:outline-none"
    >
      <div className="bg-surface border border-outline-variant rounded-sm overflow-hidden font-sans">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconComponent className={`w-6 h-6 shrink-0 ${current.iconColor}`} />
            <h2 id={headingId} className="text-headline-sm font-serif text-on-surface">
              {title || current.defaultTitle}
            </h2>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6">
          <p className="text-body-md text-on-surface-variant whitespace-pre-line leading-relaxed mb-6">
            {message}
          </p>

                    {/* Contenido opcional (por ejemplo, opciones a elegir) debajo del mensaje */}
          {children && <div className="mb-6">{children}</div>}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/50">
            {isConfirmMode && (
              <button
                type="button"
                autoFocus
                disabled={isLoading}
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-outline-variant text-on-surface hover:bg-surface-container rounded-sm cursor-pointer disabled:opacity-50 transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              autoFocus={!isConfirmMode}
              disabled={isLoading}
              onClick={() => {
                if (isConfirmMode) {
                  onConfirm();
                } else {
                  onClose?.();
                }
              }}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm shadow-sm cursor-pointer disabled:opacity-50 transition-opacity ${current.confirmBtnClass}`}
            >
              {isLoading ? "Procesando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </dialog>,
    document.body
  );
}
