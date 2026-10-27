// 1. Importamos el módulo completo en lugar de solo la exportación por defecto
import ChatbotModule from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";

import config from "./config";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";

// 2. Solución Vite/ESM: Extraemos el componente '.default' si Vite lo envolvió en un objeto,
// de lo contrario, usamos el módulo normalmente.
const Chatbot = ChatbotModule.default ? ChatbotModule.default : ChatbotModule;

export default function FoliumBot() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth(); // Obtenemos al usuario actual

  // El bot solo se muestra a usuarios registrados
  if (!user) return null;

  const toggleBot = () => setIsOpen(!isOpen);

  // Sobrescribimos el estado inicial de la configuración para inyectar el rol
  const dynamicConfig = {
    ...config,
    state: {
      ...config.state,
      // Si hay usuario guardamos su rol, si no, es 'GUEST'
      userRole: user ? user.role : "GUEST",
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/*
        Contenedor del Chat con efecto de expansión desde el botón (origin-bottom-right)
        Conservamos el historial al no desmontar el componente.
      */}
      <div
        className={`absolute bottom-16 right-0 rounded-xl transition-all duration-300 ease-out transform origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
            : "opacity-0 scale-0 pointer-events-none translate-y-12"
        }`}
      >
        <Chatbot
          key={user?.id ? `${user.id}-${user.role}` : "guest"}
          config={dynamicConfig}
          messageParser={MessageParser}
          actionProvider={ActionProvider}
          placeholderText="Escribe tu consulta al archivo..."
        />
      </div>

      {/* Botón Flotante (Toggle) con estética editorial Folium */}
      <button
        onClick={toggleBot}
        className="w-14 h-14 bg-primary text-on-primary border-2 border-outline/70 rounded-full shadow-[0_12px_28px_-6px_rgba(20,13,14,0.55)] flex items-center justify-center hover:opacity-95 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente"}
        title={isOpen ? "Cerrar Tomito" : "Abrir Tomito"}
      >
        {isOpen ? <CloseIcon /> : <LibrarianBotIcon />}
      </button>
    </div>
  );
}

// ==========================================
// Íconos SVG para el botón flotante
// ==========================================

const CloseIcon = () => (
  <svg
    className="text-on-primary"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LibrarianBotIcon = () => (
  <svg
    className="text-on-primary"
    width="25"
    height="25"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    <path d="M8 2v20" />
    <circle cx="10" cy="11" r="2" />
    <circle cx="16" cy="11" r="2" />
    <path d="M12 11h2" />
    <path d="M8 11h-2" />
    <path d="M18 11h2" />
  </svg>
);