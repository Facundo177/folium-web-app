import api from '../axiosConfig';

export const userService = {
  // Registro público
  register: (data) => api.post('/register/', data),

  // === ENDPOINTS DEL USUARIO AUTENTICADO (/me/) ===
  getProfile: () => api.get('/me/'),
  updateProfile: (data) => api.patch('/me/', data), 

  // (Opcional) Endpoints estándar si el ADMIN necesita gestionar otros usuarios
  getAll: (params) => api.get('/user/', { params }),
  getById: (id) => api.get(`/user/${id}/`),
};