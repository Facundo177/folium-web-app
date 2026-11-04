import api from '../axiosConfig';

/**
 * Servicio para gestionar libros.
 * Endpoints: GET/POST/PUT/PATCH/DELETE /api/v1/book/
 * Requiere autenticación con rol LIBRARIAN.
 */
const BASE = '/book/';

export const bookService = {
  getAll: (params) => api.get(BASE, { params }),
  getOptions: (params) => api.get(`${BASE}options/`, { params }),
  getAvailable: (params) => api.get(`${BASE}available/`, { params }),
  getById: (id) => api.get(`${BASE}${id}/`),
  getRandom: (params) => api.get('/random/', { params }),
  getRecommendations: () => api.get('/recommendations/'),
  create: (data, config) => api.post(BASE, data, config), 
  update: (id, data, config) => api.put(`${BASE}${id}/`, data, config),
  patch: (id, data, config) => api.patch(`${BASE}${id}/`, data, config),
  remove: (id) => api.delete(`${BASE}${id}/`),
};

