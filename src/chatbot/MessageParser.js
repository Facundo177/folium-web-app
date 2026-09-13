// MessageParser.js
class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    // Convertimos a minúsculas y eliminamos acentos para facilitar la coincidencia
    const normalizedMessage = message
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Función auxiliar para buscar coincidencias en arrays de palabras clave
    const includesAny = (keywords) => keywords.some(word => normalizedMessage.includes(word));

    if (includesAny(['catalogo', 'catalog', 'explorar', 'explore', 'descubrir', 'discover', 'libros', 'books', 'leer', 'read'])) {
      this.actionProvider.handleCatalog();
      
    } else if (includesAny(['inventario', 'inventory', 'stock', 'estante', 'shelf', 'ubicacion', 'location', 'fisico', 'physical', 'gestionar'])) {
      this.actionProvider.handleInventory();
      
    } else if (includesAny(['favoritos', 'favorites', 'favourites', 'guardados', 'saved', 'me gusta'])) {
      this.actionProvider.handleFavourites();
      
    } else if (includesAny(['login', 'iniciar sesion', 'sign in', 'entrar', 'acceder', 'access', 'autenticar'])) {
      this.actionProvider.handleLogin();
      
    } else if (includesAny(['registro', 'registrar', 'register', 'crear cuenta', 'sign up', 'unirse', 'join'])) {
      this.actionProvider.handleRegister();
      
    } else if (includesAny(['admin', 'administrador', 'dashboard', 'panel', 'ajustes', 'settings', 'configuracion'])) {
      this.actionProvider.handleAdmin();
      
    } else {
      this.actionProvider.handleDefault();
    }
  }
}
export default MessageParser;