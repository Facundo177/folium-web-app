import axios from "axios";

const api = axios.create({
  baseURL: 'https://api.tu-servidor.com/v1', 
  timeout: 5000, // Abort the request if it takes longer than 5 seconds
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if your API requires authentication
  }
});

// Optional: Add response interceptors for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;