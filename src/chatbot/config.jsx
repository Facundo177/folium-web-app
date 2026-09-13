import { createChatBotMessage } from 'react-chatbot-kit';
import { NavWidget } from './NavWidget';

const config = {
  initialMessages: [
    createChatBotMessage(`Hola, soy el asistente de Folium. ¿En qué sección de la biblioteca te puedo ayudar hoy?`)
  ],
  botName: "FoliumBot",
  customStyles: {
    botMessageBox: { backgroundColor: "var(--color-tertiary-container)" },
    chatButton: { backgroundColor: "var(--color-tertiary-container)" },
  },
  widgets: [
    {
      widgetName: "catalogLink",
      widgetFunc: (props) => <NavWidget {...props} payload={{ route: '/user/catalog', text: 'Ir al Catálogo' }} />,
    },
    {
      widgetName: "inventoryLink",
      widgetFunc: (props) => <NavWidget {...props} payload={{ route: '/librarian/inventory', text: 'Ir al Inventario' }} />,
    },
    {
      widgetName: "favouritesLink",
      widgetFunc: (props) => <NavWidget {...props} payload={{ route: '/user/favourites', text: 'Ver mis Favoritos' }} />,
    },
    {
      widgetName: "loginLink",
      widgetFunc: (props) => <NavWidget {...props} payload={{ route: '/login', text: 'Iniciar Sesión' }} />,
    },
    {
      widgetName: "registerLink",
      widgetFunc: (props) => <NavWidget {...props} payload={{ route: '/register', text: 'Registrarse' }} />,
    },
    {
      widgetName: "adminLink",
      widgetFunc: (props) => <NavWidget {...props} payload={{ route: '/admin/dashboard', text: 'Panel de Administración' }} />,
    }
  ],
};

export default config;