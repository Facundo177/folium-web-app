import SunToMoon from "../components/BasicUIComponents/SunToMoon";
import { useTheme } from "./ThemeProvider";

export const ThemeToggle = () => {
  // Única fuente de verdad: el ThemeProvider. Sin efectos ni estado local duplicado.
  const { isDarkMode, toggleTheme } = useTheme();
  const label = isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  return (
    <button
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className="action-btn w-11 h-11 bg-surface-variant rounded-xl flex items-center justify-center text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm border border-outline-variant/30 cursor-pointer"
    >
      <SunToMoon isDarkMode={isDarkMode} />
    </button>
  );
};
