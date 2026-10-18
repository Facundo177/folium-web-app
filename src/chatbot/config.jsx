import { createChatBotMessage } from "react-chatbot-kit";
import { NavWidget } from "./NavWidget";
import {
  BookRecommendationWidget,
  BookSearchWidget,
  LiveLoansStatusWidget,
  LiveReservationsStatusWidget,
} from "./BotWidgets";
import { BookOpen, User } from "lucide-react";

const FoliumBotHeader = () => (
  <div className="bg-surface-container-lowest border-b border-outline-variant px-4 py-3 flex items-center justify-between shadow-xs">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-primary text-on-primary border border-outline/60 flex items-center justify-center shadow-xs shrink-0">
        <BookOpen className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="font-serif text-base font-bold text-on-surface leading-tight tracking-wide">
          Curador de Folium
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Asistente de Archivo
        </span>
      </div>
    </div>
  </div>
);

const FoliumBotAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-primary text-on-primary border border-outline/60 flex items-center justify-center shadow-xs shrink-0 mt-0.5">
    <span className="font-serif font-bold text-sm leading-none">F</span>
  </div>
);

const FoliumUserAvatar = () => (
  <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface border border-outline-variant flex items-center justify-center shrink-0 mt-0.5">
    <User className="w-3.5 h-3.5" />
  </div>
);

const config = {
  initialMessages: [
    createChatBotMessage(
      `Hola, soy el Curador de Folium. Puedes pedirme recomendaciones ("recomiéndame un libro"), buscar obras ("buscar Borges"), o consultar tus préstamos y reservas.`
    ),
  ],
  botName: "FoliumBot",
  state: {
    userRole: "GUEST",
  },
  customComponents: {
    header: () => <FoliumBotHeader />,
    botAvatar: (props) => <FoliumBotAvatar {...props} />,
    userAvatar: (props) => <FoliumUserAvatar {...props} />,
  },
  widgets: [
    {
      widgetName: "catalogLink",
      widgetFunc: (props) => (
        <NavWidget
          {...props}
          payload={{ route: "/catalog", text: "Ir al Catálogo" }}
        />
      ),
    },
    {
      widgetName: "inventoryLink",
      widgetFunc: (props) => (
        <NavWidget
          {...props}
          payload={{ route: "/librarian/inventory", text: "Ir al Inventario" }}
        />
      ),
    },
    {
      widgetName: "newBookLink",
      widgetFunc: (props) => (
        <NavWidget
          {...props}
          payload={{
            route: "/librarian/inventory/newBook",
            text: "Cargar Nuevo Libro",
          }}
        />
      ),
    },
    {
      widgetName: "newItemLink",
      widgetFunc: (props) => (
        <NavWidget
          {...props}
          payload={{
            route: "/librarian/inventory/newItem",
            text: "Añadir Ejemplar Físico",
          }}
        />
      ),
    },
    {
      widgetName: "favouritesLink",
      widgetFunc: (props) => (
        <NavWidget
          {...props}
          payload={{ route: "/user/favourites", text: "Ver mis Favoritos" }}
        />
      ),
    },
    {
      widgetName: "profileLink",
      widgetFunc: (props) => (
        <NavWidget
          {...props}
          payload={{ route: "/user/profile", text: "Ir a mi Perfil" }}
        />
      ),
    },
    {
      widgetName: "loginLink",
      widgetFunc: (props) => (
        <NavWidget
          {...props}
          payload={{ route: "/login", text: "Iniciar Sesión" }}
        />
      ),
    },
    {
      widgetName: "registerLink",
      widgetFunc: (props) => (
        <NavWidget
          {...props}
          payload={{ route: "/register", text: "Registrarse" }}
        />
      ),
    },
    {
      widgetName: "adminLink",
      widgetFunc: (props) => (
        <NavWidget
          {...props}
          payload={{
            route: "/admin/dashboard",
            text: "Panel de Administración",
          }}
        />
      ),
    },
    {
      widgetName: "bookRecommendation",
      widgetFunc: (props) => <BookRecommendationWidget {...props} />,
    },
    {
      widgetName: "bookSearch",
      widgetFunc: (props) => <BookSearchWidget {...props} />,
    },
    {
      widgetName: "liveLoansStatus",
      widgetFunc: (props) => <LiveLoansStatusWidget {...props} />,
    },
    {
      widgetName: "liveReservationsStatus",
      widgetFunc: (props) => <LiveReservationsStatusWidget {...props} />,
    },
  ],
};

export default config;