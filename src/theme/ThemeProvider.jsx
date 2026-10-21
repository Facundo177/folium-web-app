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

/**
 * Aplica el tema directamente sobre el DOM.
 * Desactiva temporalmente las transiciones CSS para que cientos de elementos con
 * `transition-colors` / `transition-all` no animen su color al mismo tiempo (causa de los tirones).
 */
const applyThemeToDOM = (isDark) => {
  const root = document.documentElement;

  root.classList.add("theme-switching");
  root.classList.toggle("dark", isDark);

  localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  localStorage.removeItem(LEGACY_STORAGE_KEY);

  // Esperamos a que el navegador pinte el nuevo tema antes de reactivar las transiciones
  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.remove("theme-switching"));
  });
};

export function ThemeProvider({ children }) {
  // El inicializador perezoso aplica la clase al DOM antes del primer render,
  // así el estado y el <html> arrancan sincronizados (sin efectos ni setState en cascada).
  const [isDarkMode, setIsDarkModeState] = useState(() => {
    const initial = getInitialDarkMode();
    document.documentElement.classList.toggle("dark", initial);
    return initial;
  });

  // El DOM se actualiza en el mismo manejador del evento (no en un useEffect),
  // por lo que el cambio de clase y el re-render de React ocurren en el mismo frame.
  const setIsDarkMode = useCallback(
    (value) => {
      const next = typeof value === "function" ? value(isDarkMode) : value;
      if (next === isDarkMode) return;
      applyThemeToDOM(next);
      setIsDarkModeState(next);
    },
    [isDarkMode]
  );

  const toggleTheme = useCallback(() => setIsDarkMode(!isDarkMode), [isDarkMode, setIsDarkMode]);

  const value = useMemo(
    () => ({ isDarkMode, setIsDarkMode, toggleTheme }),
    [isDarkMode, setIsDarkMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Hook personalizado para usar el tema en cualquier componente
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
