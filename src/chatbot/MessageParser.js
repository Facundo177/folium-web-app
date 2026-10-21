// MessageParser.js
class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state; // state.userRole y state.awaitingMode
  }

  parse(message) {
    const rawTrimmed = message.trim();
    if (!rawTrimmed) {
      this.actionProvider.handleDefault();
      return;
    }

    const normalizedMessage = rawTrimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const awaitingMode = this.state?.awaitingMode || null;

    // Si el usuario pide volver al menú o cancelar en cualquier momento
    if (
      ["menu", "opciones", "volver", "cancelar", "inicio", "salir"].includes(
        normalizedMessage
      )
    ) {
      this.actionProvider.handleShowMainMenu(
        "Volvimos al menú principal. Elegí la opción que quieras usar:"
      );
      return;
    }

    // 1. Si el bot está esperando que el usuario escriba un Título o Autor (tras elegir la opción en el menú)
    if (awaitingMode === "SEARCH_TITLE_AUTHOR") {
      const cleanedQuery = rawTrimmed.replace(/[?¿!¡."']/g, "").trim();
      if (cleanedQuery.length < 2) {
        this.actionProvider.promptSearchTitleAuthor();
        return;
      }
      this.actionProvider.handleBookSearch(cleanedQuery, "title_author");
      return;
    }

    // 2. Si el bot está esperando que el usuario escriba un Género Literario (tras elegir la opción en el menú)
    if (awaitingMode === "SEARCH_GENRE") {
      const cleanedGenre = rawTrimmed.replace(/[?¿!¡."']/g, "").trim();
      if (cleanedGenre.length < 2) {
        this.actionProvider.promptSearchGenre();
        return;
      }
      this.actionProvider.handleBookSearch(cleanedGenre, "genre");
      return;
    }

    // 3. Si el usuario escribió sin haber elegido antes una opción del menú:
    if (
      ["hola", "buenas", "ayuda", "help", "como funciona", "que haces"].some(
        (w) => normalizedMessage.includes(w)
      )
    ) {
      this.actionProvider.handleHelp();
      return;
    }

    // Cualquier otro texto escrito sin haber seleccionado una opción del menú
    // le explica claramente que primero debe elegir la acción en el menú de opciones.
    this.actionProvider.handleDefault();
  }
}

export default MessageParser;
