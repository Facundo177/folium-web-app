import api from '../axiosConfig';

/**
 * Servicio para gestionar editoriales.
 * Endpoints: GET/POST/PUT/PATCH/DELETE /api/v1/editorial/
 * Lectura pública; escritura requiere autenticación con rol LIBRARIAN o ADMIN.
 */
const BASE = '/editorial/';

export const editorialService = {
  getAll:  (params)   => api.get(BASE, { params }),
  getById: (id)       => api.get(`${BASE}${id}/`),
  create:  (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(`${BASE}${id}/`, data),
  patch:   (id, data) => api.patch(`${BASE}${id}/`, data),
  remove:  (id)       => api.delete(`${BASE}${id}/`),
};
