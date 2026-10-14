import { ChevronRight, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function FilterSection({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-outline-variant/50 py-4">
      <button
        className="w-full flex justify-between items-center text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-bold uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">
          {title}
        </span>
        <span className=" text-[16px] text-on-surface-variant group-hover:text-primary transition-colors">
          {isOpen ? <ChevronUp/> : <ChevronRight/>}
        </span>
      </button>
      {isOpen && <div className="mt-4 animate-fade-in">{children}</div>}
    </div>
  );
}