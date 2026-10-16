import { useEffect } from "react";
import SunToMoon from "../components/BasicUIComponents/SunToMoon";

export const ThemeToggle = ({ isDarkMode, setIsDarkMode }) => {
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, [setIsDarkMode]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";

    const updateDOM = () => {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", newTheme);
      setIsDarkMode(!isDarkMode);
    };


      updateDOM();
  };

  return (
    <button 
      onClick={toggleTheme}
      title="Alternar Tema"
      className="action-btn w-11 h-11 bg-surface-variant rounded-xl flex items-center justify-center text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm border border-outline-variant/30"
    >
      <SunToMoon isDarkMode={isDarkMode}/>
    </button>
  );
};