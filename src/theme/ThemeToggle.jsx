import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDarkMode ? "Activar Modo Claro" : "Activar Modo Oscuro"}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-inverse-surface border border-outline-variant/30 text-outline hover:text-on-tertiary-container hover:border-on-tertiary-container transition-all shadow-md active:scale-95"
    >
      <span className="material-symbols-outlined text-[20px]">
        {isDarkMode ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
