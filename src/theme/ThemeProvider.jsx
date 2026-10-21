import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ThemeContext = createContext();

const STORAGE_KEY = "folium-theme";
const LEGACY_STORAGE_KEY = "theme";

/**
 * Lee el tema activo una sola vez: localStorage (clave nueva o legacy),
 * luego la clase `.dark` ya presente en el <html> y por último la preferencia del sistema.
 */
const getInitialDarkMode = () => {
  if (typeof window === "undefined") return true;

  const saved =
    localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (saved === "dark") return true;
  if (saved === "light") return false;

  if (document.documentElement.classList.contains("dark")) return true;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
};


export function ThemeProvider({ children }) {
  // Inicializador perezoso: aplica la clase al <html> antes del primer render.
  const [isDarkMode, setIsDarkModeState] = useState(() => {
    const initial = getInitialDarkMode();
    document.documentElement.classList.toggle("dark", initial);
    return initial;
  });

  // Cambia el tema usando View Transitions API si el navegador lo soporta,
  // permitiendo un cross-fade suave acelerado por hardware sin tirones.
  const applyTheme = useCallback((next) => {
    const updateDOM = () => {
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      setIsDarkModeState(next);
    };
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Si el navegador no soporta View Transitions o el usuario prefiere movimiento reducido:
    if (!document.startViewTransition || prefersReducedMotion) {
      updateDOM();
      return;
    }
    // Transición suave entre snapshots manejada directamente por la GPU
    document.startViewTransition(() => {
      updateDOM();
    });
  }, []);

  const setIsDarkMode = useCallback(
    (value) => {
      const next = typeof value === "function" ? value(isDarkMode) : value;
      if (next === isDarkMode) return;
      applyTheme(next);
    },
    [isDarkMode, applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode, setIsDarkMode]);

  
  const value = useMemo(
    () => ({ isDarkMode, setIsDarkMode, toggleTheme }),
    [isDarkMode, setIsDarkMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Hook personalizado para usar el tema en cualquier componente
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
