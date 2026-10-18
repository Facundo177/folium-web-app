// ActionProvider.js
class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleCatalog = () => {
    const message = this.createChatBotMessage(
      "El catálogo es el lugar ideal para explorar nuestra colección completa y filtrar por autor, género o editorial.",
      {
        widget: "catalogLink",
      }
    );
    this.updateChatbotState(message);
  };

  handleRecommendation = (genreHint = "") => {
    const text = genreHint
      ? `He buscado en nuestro archivo una recomendación vinculada a "${genreHint}":`
      : "Aquí tienes una obra seleccionada especialmente de nuestro archivo:";

    const message = this.createChatBotMessage(text, {
      widget: "bookRecommendation",
      payload: { genreHint },
    });
    this.updateChatbotState(message);
  };

  handleBookSearch = (query = "") => {
    const message = this.createChatBotMessage(
      `Consultando el catálogo de Folium por "${query}"...`,
      {
        widget: "bookSearch",
        payload: { query },
      }
    );
    this.updateChatbotState(message);
  };

  handleLoans = (role = "USER") => {
    if (role === "GUEST") {
      this.handleLogin();
      return;
    }

    const isStaff = ["LIBRARIAN", "ADMIN"].includes(role);
    const text = isStaff
      ? "Aquí tienes el resumen en vivo de los préstamos registrados en biblioteca:"
      : "Consultando el estado actual de tus préstamos y vencimientos:";

    const message = this.createChatBotMessage(text, {
      widget: "liveLoansStatus",
      payload: { role },
    });
    this.updateChatbotState(message);
  };

  handleReservations = (role = "USER") => {
    if (role === "GUEST") {
      this.handleLogin();
      return;
    }

    const isStaff = ["LIBRARIAN", "ADMIN"].includes(role);
    const text = isStaff
      ? "Aquí tienes el estado en tiempo real de las solicitudes de reserva de los lectores:"
      : "Aquí tienes el resumen de tus reservas de libros:";

    const message = this.createChatBotMessage(text, {
      widget: "liveReservationsStatus",
      payload: { role },
    });
    this.updateChatbotState(message);
  };

  handleInventory = () => {
    const message = this.createChatBotMessage(
      "El módulo de inventario permite gestionar el stock y la ubicación física de cada ejemplar.",
      {
        widget: "inventoryLink",
      }
    );
    this.updateChatbotState(message);
  };

  handleNewBook = () => {
    const message = this.createChatBotMessage(
      "Desde el formulario de alta puedes catalogar un nuevo volumen con su ISBN, portada, autores y géneros.",
      {
        widget: "newBookLink",
      }
    );
    this.updateChatbotState(message);
  };

  handleNewItem = () => {
    const message = this.createChatBotMessage(
      "Puedes registrar una nueva copia física en el inventario asignándole su código y ubicación en estantería.",
      {
        widget: "newItemLink",
      }
    );
    this.updateChatbotState(message);
  };

  handleFavourites = (role = "USER") => {
    if (role === "GUEST") {
      this.handleLogin();
      return;
    }

    const message = this.createChatBotMessage(
      "Puedes consultar y gestionar tus obras destacadas en tu colección personal de favoritos.",
      {
        widget: "favouritesLink",
      }
    );
    this.updateChatbotState(message);
  };

  handleProfile = (role = "USER") => {
    if (role === "GUEST") {
      this.handleLogin();
      return;
    }

    const message = this.createChatBotMessage(
      "En tu perfil puedes revisar tus datos personales y el nivel de tu membresía en Folium.",
      {
        widget: "profileLink",
      }
    );
    this.updateChatbotState(message);
  };

  handleLogin = () => {
    const message = this.createChatBotMessage(
      "Para acceder a préstamos, reservas y favoritos, por favor inicia sesión con tu cuenta.",
      {
        widget: "loginLink",
      }
    );
    this.updateChatbotState(message);
  };

  handleRegister = () => {
    const message = this.createChatBotMessage(
      "¿Eres nuevo en Folium? Crea tu cuenta de Lector para reservar volúmenes y guardar favoritos.",
      {
        widget: "registerLink",
      }
    );
    this.updateChatbotState(message);
  };

  handleAdmin = () => {
    const message = this.createChatBotMessage(
      "El panel de control es de acceso exclusivo para personal administrativo.",
      {
        widget: "adminLink",
      }
    );
    this.updateChatbotState(message);
  };

  handleHelp = (role = "GUEST") => {
    const isStaff = ["LIBRARIAN", "ADMIN"].includes(role);
    const helpText = isStaff
      ? 'Puedo ayudarte a: 1) Ver el resumen de "reservas" o "préstamos", 2) Ir a "inventario", "cargar libro" o "nuevo ejemplar", 3) "Buscar <título/autor>" o "recomendar" un libro.'
      : 'Puedo ayudarte a: 1) "Recomiéndame un libro" (o por género), 2) "Buscar <título o autor>", 3) Consultar tus "préstamos", "reservas", "favoritos" o "perfil".';

    const message = this.createChatBotMessage(helpText);
    this.updateChatbotState(message);
  };

  handleDefault = () => {
    const message = this.createChatBotMessage(
      'Soy el asistente de Folium. Prueba escribir "recomiéndame un libro", "buscar <título o autor>", "mis préstamos" o "mis reservas".'
    );
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