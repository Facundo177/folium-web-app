import { Eye, EyeOff } from "lucide-react";

export default function PasswordEye({ open }) {
  return open ? (
    <Eye className="w-5 h-5 text-on-surface-variant hover:text-on-surface transition-colors" />
  ) : (
    <EyeOff className="w-5 h-5 text-on-surface-variant hover:text-on-surface transition-colors" />
  );
}
