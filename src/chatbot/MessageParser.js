// MessageParser.js
class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state; // Aquí vive state.userRole
  }

  parse(message) {
    // Convertimos a minúsculas y eliminamos acentos para facilitar la coincidencia
    const normalizedMessage = message
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const role = this.state.userRole;

    // Función auxiliar para buscar coincidencias en arrays de palabras clave
    const includesAny = (keywords) => keywords.some(word => normalizedMessage.includes(word));

    if (includesAny(['catalogo', 'catalog', 'explorar', 'explore', 'descubrir', 'discover', 'libros', 'books', 'leer', 'read', 'recomendaciones'])) {
      this.actionProvider.handleCatalog();
      
    } else if (includesAny(['login', 'iniciar sesion', 'sign in', 'entrar', 'acceder', 'access', 'autenticar'])) {
      this.actionProvider.handleLogin();
      
    } else if (includesAny(['registro', 'registrar', 'register', 'crear cuenta', 'sign up', 'unirse', 'join'])) {
      this.actionProvider.handleRegister();
      
    } else if (role === 'USER' && includesAny(['favoritos', 'favorites', 'favourites', 'guardados', 'saved', 'me gusta'])) {
      this.actionProvider.handleFavourites();
      
    } else if (role === 'LIBRARIAN' && includesAny(['inventario', 'inventory', 'stock', 'estante', 'shelf', 'ubicacion', 'location', 'fisico', 'physical', 'gestionar'])) {
      this.actionProvider.handleInventory();
      
    } else if (role === 'LIBRARIAN' && includesAny(['admin', 'administrador', 'dashboard', 'panel', 'ajustes', 'settings', 'configuracion'])) {
      this.actionProvider.handleAdmin();
      
    } else {
      this.actionProvider.handleDefault();
    }
  }
}
export default MessageParser;