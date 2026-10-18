// MessageParser.js
class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state; // Aquí vive state.userRole
  }

  parse(message) {
    const rawTrimmed = message.trim();
    if (!rawTrimmed) {
      this.actionProvider.handleDefault();
      return;
    }

    // Convertimos a minúsculas y eliminamos acentos para facilitar la coincidencia
    const normalizedMessage = rawTrimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const role = this.state.userRole || "GUEST";
    const isStaff = ["LIBRARIAN", "ADMIN"].includes(role);

    const includesAny = (keywords) =>
      keywords.some((word) => normalizedMessage.includes(word));

    // 1. Intención de Búsqueda explícita ("buscar X", "tienen X", "libro de X", "autor X")
    const searchMatch = normalizedMessage.match(
      /^(?:buscar|busca|busco|tienen|tenes|hay|encontrar|autor|libro|libros de|obras de)\s+(.+)$/i
    );
    if (searchMatch && searchMatch[1]?.trim().length >= 2) {
      const cleanedQuery = searchMatch[1]
        .replace(/[?¿!¡."']/g, "")
        .trim();
      this.actionProvider.handleBookSearch(cleanedQuery);
      return;
    }

    // 2. Recomendador interactivo ("recomiéndame", "sugerime", "qué leer", "sorpréndeme")
    if (
      includesAny([
        "recomienda",
        "recomendame",
        "recomendacion",
        "recomendaciones",
        "sugerime",
        "sugerencia",
        "que leer",
        "que puedo leer",
        "sorprendeme",
      ])
    ) {
      const genreMatch = normalizedMessage.match(
        /(?:de|sobre|genero)\s+([a-z0-9\s]+)$/
      );
      const genreHint = genreMatch ? genreMatch[1].trim() : "";
      this.actionProvider.handleRecommendation(genreHint);
      return;
    }

    // 3. Estado en vivo de Reservas (/user/reservations o /librarian/reservations)
    if (
      includesAny([
        "reserva",
        "reservas",
        "reservado",
        "reservados",
        "mis reservas",
        "reservar",
      ])
    ) {
      this.actionProvider.handleReservations(role);
      return;
    }

    // 4. Estado en vivo de Préstamos (/user/loans o /librarian/loans)
    if (
      includesAny([
        "prestamo",
        "prestamos",
        "prestado",
        "prestados",
        "vencimiento",
        "vencimientos",
        "vencido",
        "vencidos",
        "vence",
        "devolucion",
        "devolver",
      ])
    ) {
      this.actionProvider.handleLoans(role);
      return;
    }

    // 5. Acciones exclusivas de Bibliotecario / Admin (Cargar libro, Nuevo ejemplar, Inventario)
    if (
      isStaff &&
      includesAny([
        "nuevo libro",
        "cargar libro",
        "agregar libro",
        "anadir libro",
        "alta de libro",
        "newbook",
      ])
    ) {
      this.actionProvider.handleNewBook();
      return;
    }

    if (
      isStaff &&
      includesAny([
        "nuevo ejemplar",
        "cargar ejemplar",
        "agregar ejemplar",
        "anadir ejemplar",
        "nueva copia",
        "nuevo item",
        "newitem",
      ])
    ) {
      this.actionProvider.handleNewItem();
      return;
    }

    if (
      isStaff &&
      includesAny([
        "inventario",
        "inventory",
        "stock",
        "estante",
        "shelf",
        "ubicacion",
        "location",
        "fisico",
        "gestionar",
      ])
    ) {
      this.actionProvider.handleInventory();
      return;
    }

    if (
      isStaff &&
      includesAny([
        "admin",
        "administrador",
        "dashboard",
        "panel",
        "ajustes",
        "settings",
        "configuracion",
      ])
    ) {
      this.actionProvider.handleAdmin();
      return;
    }

    // 6. Favoritos y Perfil
    if (
      includesAny([
        "favorito",
        "favoritos",
        "favorites",
        "favourites",
        "guardados",
        "saved",
        "me gusta",
        "corazon",
      ])
    ) {
      this.actionProvider.handleFavourites(role);
      return;
    }

    if (
      includesAny([
        "perfil",
        "profile",
        "mi cuenta",
        "mis datos",
        "membresia",
        "tier",
      ])
    ) {
      this.actionProvider.handleProfile(role);
      return;
    }

    // 7. Login y Registro
    if (
      includesAny([
        "login",
        "iniciar sesion",
        "sign in",
        "entrar",
        "acceder",
        "access",
        "autenticar",
      ])
    ) {
      this.actionProvider.handleLogin();
      return;
    }

    if (
      includesAny([
        "registro",
        "registrar",
        "registrarse",
        "register",
        "crear cuenta",
        "sign up",
        "unirse",
        "join",
      ])
    ) {
      this.actionProvider.handleRegister();
      return;
    }

    // 8. Explorar Catálogo
    if (
      includesAny([
        "catalogo",
        "catalog",
        "explorar",
        "explore",
        "descubrir",
        "discover",
        "coleccion",
      ])
    ) {
      this.actionProvider.handleCatalog();
      return;
    }

    // 9. Saludos y Ayuda
    if (
      includesAny([
        "hola",
        "buenas",
        "ayuda",
        "help",
        "menu",
        "opciones",
        "que haces",
        "que puedes hacer",
      ])
    ) {
      this.actionProvider.handleHelp(role);
      return;
    }

    // 10. Si el usuario escribe directamente el título de un libro o autor, lo buscamos en el catálogo
    if (rawTrimmed.length >= 3) {
      const cleaned = rawTrimmed.replace(/[?¿!¡."']/g, "").trim();
      this.actionProvider.handleBookSearch(cleaned);
      return;
    }

    this.actionProvider.handleDefault();
  }
}

export default MessageParser;