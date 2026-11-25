import { AlertCircle, Info } from "lucide-react";
import CheckCircleIcon from "./CheckCircleIcon";

const VARIANT_CLASSES = {
  success: "border-primary/40 text-primary bg-on-primary",
  error: "border-error/40 text-on-error bg-error",
  info: "border-outline-variant text-on-surface bg-surface-container-lowest",
};

export default function Toast({ message, type = "success" }) {
  if (!message) return null;

  const variantClass = VARIANT_CLASSES[type] || VARIANT_CLASSES.success;
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`fixed top-3 left-[50%] translate-x-[-50%] z-[300] border px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in ${variantClass}`}
    >
      {type === "error" ? (
        <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
      ) : type === "info" ? (
        <Info className="w-5 h-5 shrink-0 text-primary" aria-hidden="true" />
      ) : (
        <CheckCircleIcon />
      )}
      <span className="font-body-md text-sm italic">{message}</span>
    </div>
  );
}
