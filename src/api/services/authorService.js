import api from '../axiosConfig';

/**
 * Servicio para gestionar autores.
 * Endpoints: GET/POST/PUT/PATCH/DELETE /api/v1/author/
 * Requiere autenticación con rol LIBRARIAN.
 */
const BASE = '/author/';

export const authorService = {
  getAll:  (params)   => api.get(BASE, { params }),
  getById: (id)       => api.get(`${BASE}${id}/`),
  create:  (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(`${BASE}${id}/`, data),
  patch:   (id, data) => api.patch(`${BASE}${id}/`, data),
  remove:  (id)       => api.delete(`${BASE}${id}/`),
};

