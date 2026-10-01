import api from '../axiosConfig';

/**
 * Servicio de autenticación JWT.
 * Maneja login y logout, guardando/limpiando los tokens en localStorage.
 */

// POST /api/v1/token/ → { access, refresh }
export const login = async (username, password) => {
  const { data } = await api.post('/token/', { username, password });
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);
  return data;
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

