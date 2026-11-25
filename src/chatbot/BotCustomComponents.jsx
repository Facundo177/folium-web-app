import { BookOpen, User } from "lucide-react";

export function FoliumBotHeader() {
  return (
    <div className="bg-surface-container-lowest border-b border-outline-variant px-4 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary text-on-primary border border-outline/60 flex items-center justify-center shadow-xs shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-base font-bold text-on-surface leading-tight tracking-wide">
            Tomito
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Elegí una opción del menú para interactuar
          </span>
        </div>
      </div>
    </div>
  );
}

export function FoliumBotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-primary text-on-primary border border-outline/60 flex items-center justify-center shadow-xs shrink-0 mt-0.5">
      <span className="font-serif font-bold text-sm leading-none">T</span>
    </div>
  );
}

export function FoliumUserAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface border border-outline-variant flex items-center justify-center shrink-0 mt-0.5">
      <User className="w-3.5 h-3.5" />
    </div>
  );
}
