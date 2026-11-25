import { createChatBotMessage } from "react-chatbot-kit";
import { NavWidget } from "./NavWidget";
import {
  MainMenuWidget,
  AwaitingInputWidget,
  NavigationMenuWidget,
  BookRecommendationWidget,
  BookSearchWidget,
  LiveLoansStatusWidget,
  LiveReservationsStatusWidget,
} from "./BotWidgets";
import {
  FoliumBotHeader,
  FoliumBotAvatar,
  FoliumUserAvatar,
} from "./BotCustomComponents";

const config = {
  initialMessages: [
    createChatBotMessage(
      "¡Hola! Soy Tomito. Para comenzar, seleccioná primero una opción del menú de abajo (por ejemplo, elegí «Buscar por Título o Autor» y luego escribí tu consulta):",
      {
        widget: "mainMenu",
      }
    ),
  ],
  botName: "Tomito",
  state: {
    userRole: "GUEST",
    awaitingMode: null,
  },
  customComponents: {
    header: () => <FoliumBotHeader />,
    botAvatar: (props) => <FoliumBotAvatar {...props} />,
    userAvatar: (props) => <FoliumUserAvatar {...props} />,
  },
  widgets: [
    {
      widgetName: "mainMenu",
      widgetFunc: (props) => <MainMenuWidget {...props} />,
    },
    {
      widgetName: "awaitingInput",
      widgetFunc: (props) => <AwaitingInputWidget {...props} />,
    },
    {
      widgetName: "navigationMenu",
      widgetFunc: (props) => <NavigationMenuWidget {...props} />,
    },
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
            route: "/librarian/newBook",
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
            route: "/librarian/addItem",
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
            route: "/librarian/inventory",
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
