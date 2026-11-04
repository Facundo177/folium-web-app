import api from '../axiosConfig';

export const userService = {
  // Registro público
  register: (data) => api.post('/register/', data),

  // === ENDPOINTS DEL USUARIO AUTENTICADO (/me/) ===
  getProfile: () => api.get('/me/'),
  updateProfile: (data) => api.patch('/me/', data), 

  // Endpoints de gestión de usuarios (Bibliotecarios / Admin)
  getAll: (params) => api.get('/user/', { params }),
  getById: (id) => api.get(`/user/${id}/`),
  getByDni: (dni) => api.get(`/user/by-dni/${dni}/`),
  createReader: (data) => api.post('/user/', data),
  search: (params) => api.get('/user/', { params }),
};