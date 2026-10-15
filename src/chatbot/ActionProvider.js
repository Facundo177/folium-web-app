// ActionProvider.js
class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleCatalog = () => {
    const message = this.createChatBotMessage("El catálogo es el lugar ideal para explorar nuestra colección y descubrir nuevas lecturas.", {
      widget: "catalogLink",
    });
    this.updateChatbotState(message);
  };

  handleInventory = () => {
    const message = this.createChatBotMessage("El módulo de inventario permite al staff gestionar el stock y la ubicación física de los folios.", {
      widget: "inventoryLink",
    });
    this.updateChatbotState(message);
  };

  handleFavourites = () => {
    const message = this.createChatBotMessage("Puedes ver tus obras guardadas en tu colección personal de favoritos.", {
      widget: "favouritesLink",
    });
    this.updateChatbotState(message);
  };

  handleLogin = () => {
    const message = this.createChatBotMessage("Para acceder a todas las funciones, por favor inicia sesión con tu credencial.", {
      widget: "loginLink",
    });
    this.updateChatbotState(message);
  };

  handleRegister = () => {
    const message = this.createChatBotMessage("¿Eres nuevo? Crea tu cuenta de Lector para comenzar a solicitar préstamos.", {
      widget: "registerLink",
    });
    this.updateChatbotState(message);
  };

  handleAdmin = () => {
    const message = this.createChatBotMessage("El panel de control es de acceso exclusivo para administradores.", {
      widget: "adminLink",
    });
    this.updateChatbotState(message);
  };

  handleDefault = () => {
    const message = this.createChatBotMessage("Soy el asistente de Folium. Puedo llevarte al catálogo de libros o ayudarte con tu cuenta. ¿Qué necesitas?");
    this.updateChatbotState(message);
  };

  updateChatbotState(message) {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}
export default ActionProvider;