import api from '../axiosConfig';

/**
 * Servicio para gestionar préstamos.
 * Endpoints: GET/POST/PUT/PATCH/DELETE /api/v1/loan/
 * Requiere autenticación con rol LIBRARIAN.
 */
const BASE = '/loan/';

export const loanService = {
  getAll:  (params)   => api.get(BASE, { params }),
  getById: (id)       => api.get(`${BASE}${id}/`),
  create:  (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(`${BASE}${id}/`, data),
  patch:   (id, data) => api.patch(`${BASE}${id}/`, data),
  remove:  (id)       => api.delete(`${BASE}${id}/`),
};

