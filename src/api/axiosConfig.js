import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Django uses port 8000 by default
  withCredentials: true, // Cookies HttpOnly
  timeout: 5000, // Abort the request if it takes longer than 5 seconds
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if your API requires authentication
  },

  xsrfCookieName: 'csrftoken',   // Busca la cookie que envía Django
  xsrfHeaderName: 'X-CSRFToken', // Se la devuelve a Django en el header que espera
});

// Intercept responses to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // We will handle the redirect in the context or a global event, 
      // but you can clean up local state here if needed.
      console.warn("Session expired or unauthorized access.");
    }
    return Promise.reject(error);
  }
);

export default api;
