import api from '../axiosConfig';

/**
 * Servicio para gestionar usuarios y registro.
 */
export const userService = {
  // Endpoint público para crear una cuenta (Lector)
  register: (data)    => api.post('/register/', data),

  // Endpoints estándar CRUD (Asumiendo que tu backend los tiene en /user/)
  getAll:   (params)  => api.get('/user/', { params }),
  getById:  (id)      => api.get(`/user/${id}/`),
  create:   (data)    => api.post('/user/', data),
  update:   (id, data)=> api.put(`/user/${id}/`, data),
  patch:    (id, data)=> api.patch(`/user/${id}/`, data),
  remove:   (id)      => api.delete(`/user/${id}/`),
};