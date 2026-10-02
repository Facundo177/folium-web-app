import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Inicializamos leyendo el localStorage o las preferencias del sistema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('folium-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Si no hay nada guardado, lee la preferencia del sistema operativo
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Cada vez que cambia el estado, actualizamos el HTML y el localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('folium-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('folium-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar el tema en cualquier componente
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);