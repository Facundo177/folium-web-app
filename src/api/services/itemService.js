import api from '../axiosConfig';

/**
 * Servicio para gestionar ejemplares físicos (items de inventario).
 * Endpoints: GET/POST/PUT/PATCH/DELETE /api/v1/items/
 * Requiere autenticación con rol LIBRARIAN.
 */
const BASE = '/items/';

export const itemService = {
  getAll:  (params)   => api.get(BASE, { params }),
  getById: (id)       => api.get(`${BASE}${id}/`),
  create:  (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(`${BASE}${id}/`, data),
  patch:   (id, data) => api.patch(`${BASE}${id}/`, data),
  remove:  (id)       => api.delete(`${BASE}${id}/`),
};

