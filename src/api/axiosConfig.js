import axios from 'axios';
import { normalizeApiData } from './adapters';

/**
 * Obtiene la URL base de la API de forma flexible:
 * - Si no está definida VITE_API_BASE_URL:
 *   - En desarrollo local (DEV) apunta a http://localhost:8080/api/v1
 *   - En producción (Vercel) usa '/api/v1' para aprovechar el proxy de vercel.json y evitar Mixed Content y CORS.
 * - Si está definida VITE_API_BASE_URL:
 *   - Normaliza eliminando barras finales y garantizando el sufijo '/api/v1'.
 */
export const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) {
    return import.meta.env.DEV ? 'http://localhost:8080/api/v1' : '/api/v1';
  }

  // En producción (Vercel con HTTPS), una URL con http:// causaría 'Mixed Content' en el navegador.
  // En ese caso priorizamos el proxy relativo '/api/v1'.
  if (import.meta.env.PROD && envUrl.startsWith('http://')) {
    return '/api/v1';
  }



  const clean = envUrl.trim().replace(/\/+$/, '');
  if (!clean || clean === '/') {
    return '/api/v1';
  }
  return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: inyecta el token Bearer en cada petición ──────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: normaliza datos al formato clásico y renueva JWT ──────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      response.data = normalizeApiData(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        isRefreshing = false;
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      try {
        const baseURL = getBaseURL();
        const { data } = await axios.post(
          `${baseURL}/token/refresh/`,
          { refresh: refreshToken }
        );
        localStorage.setItem('accessToken', data.access);
        if (data.refresh) {
          localStorage.setItem('refreshToken', data.refresh);
        }
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
