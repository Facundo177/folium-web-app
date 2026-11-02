import { Sun, Moon } from "lucide-react";

export default function MenuToX({ isDarkMode }) {
  return isDarkMode ? (
    <Sun className="w-5 h-5 transition-transform duration-300" />
  ) : (
    <Moon className="w-5 h-5 transition-transform duration-300" />
  );
}
