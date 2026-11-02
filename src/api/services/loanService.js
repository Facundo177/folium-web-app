import api from '../axiosConfig';

/**
 * Servicio para gestionar préstamos.
 * Endpoints: GET/POST/PUT/PATCH/DELETE /api/v1/loan/
 * Requiere autenticación con rol LIBRARIAN.
 * El listado usa paginación y acepta filtros de usuario, ejemplar, estado y orden.
 */
const BASE = '/loan/';

export const loanService = {
  getAll:  (params)   => api.get(BASE, { params }),
  getAllRecords: async (params = {}) => {
    const records = [];
    let page = 1;

    while (true) {
      const { data } = await api.get(BASE, {
        params: { ...params, page, page_size: 50 },
      });

      if (Array.isArray(data)) {
        records.push(...data);
        break;
      }

      records.push(...(data?.results || []));
      if (!data?.next) break;
      page += 1;
    }

    return records;
  },
  getById: (id)       => api.get(`${BASE}${id}/`),
  create:  (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(`${BASE}${id}/`, data),
  patch:   (id, data) => api.patch(`${BASE}${id}/`, data),
  remove:  (id)       => api.delete(`${BASE}${id}/`),
};
