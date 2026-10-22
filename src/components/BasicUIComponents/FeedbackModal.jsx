import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

/**
 * Modal reutilizable de notificación (reemplazo de alert) y confirmación (reemplazo de window.confirm)
 * con la estética editorial de Folium.
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
}) {
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
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 animate-overlay-in font-sans"
      onClick={(e) => {
        e.stopPropagation();
        if (!isLoading) onClose?.();
      }}
    >
      <div
        className="bg-surface border border-outline-variant rounded-sm shadow-xl max-w-md w-full overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="px-6 py-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconComponent className={`w-6 h-6 shrink-0 ${current.iconColor}`} />
            <h3 className="text-headline-sm font-serif text-on-surface">
              {title || current.defaultTitle}
            </h3>
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

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/50">
            {isConfirmMode && (
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-outline-variant text-on-surface hover:bg-surface-container rounded-sm cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (isConfirmMode) {
                  onConfirm();
                } else {
                  onClose?.();
                }
              }}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm shadow-sm cursor-pointer disabled:opacity-50 ${current.confirmBtnClass}`}
            >
              {isLoading ? "Procesando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
