import { useState } from "react";

export default function FilterSection({ title, defaultOpen = false, children }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className="border-b border-outline-variant/30 py-4">
        <button
          className="w-full flex justify-between items-center text-left focus:outline-none group"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm font-bold uppercase tracking-widest text-on-primary group-hover:text-on-tertiary-container transition-colors">
            {title}
          </span>
          <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-on-tertiary-container">
            {isOpen ? "expand_less" : "chevron_right"}
          </span>
        </button>
        {isOpen && <div className="mt-4 animate-fade-in">{children}</div>}
      </div>
    );
  };