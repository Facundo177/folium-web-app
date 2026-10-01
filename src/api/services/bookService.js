import api from '../axiosConfig';

/**
 * Servicio para gestionar libros.
 * Endpoints: GET/POST/PUT/PATCH/DELETE /api/v1/book/
 * Requiere autenticación con rol LIBRARIAN.
 */
const BASE = '/book/';

export const bookService = {
  getAll:  (params)   => api.get(BASE, { params }),
  getById: (id)       => api.get(`${BASE}${id}/`),
  create:  (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(`${BASE}${id}/`, data),
  patch:   (id, data) => api.patch(`${BASE}${id}/`, data),
  remove:  (id)       => api.delete(`${BASE}${id}/`),
};

