import MockAdapter from 'axios-mock-adapter';
import api from '../api/axiosConfig'; // Importa tu instancia configurada de Axios

// Configuramos el mock con un retraso de 800ms para simular latencia de red
const mock = new MockAdapter(api, { delayResponse: 800 });

// --- CONFIGURACIÓN DE PRUEBA ---
// Cambia este objeto para probar diferentes escenarios.
// Roles disponibles en tu app: 'USER', 'LIBRARIAN'
const fakeUser = { 
  id: 1, 
  name: "Facundo Gaitán", 
  role: "LIBRARIAN" 
};


// Usamos expresiones regulares (Regex) para atrapar la ruta sin importar el baseURL

// SIMULADOR: GET /auth/me (Verificar sesión al cargar la página)
// Para probar qué pasa si NO estás logueado, comenta la línea del 200 y descomenta la del 401.
mock.onGet(/\/auth\/me/).reply(200, fakeUser);
// mock.onGet('/auth/me').reply(401, { message: "No autorizado" });

// SIMULADOR: POST /auth/login
mock.onPost(/\/auth\/login/).reply(200, { user: fakeUser });

// SIMULADOR: POST /auth/logout
mock.onPost(/\/auth\/logout/).reply(200, { message: "Sesión cerrada" });

export default mock;