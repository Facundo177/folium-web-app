import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on initial load
  useEffect(() => {
    const verifySession = async () => {
      try {
        // The HttpOnly cookie is sent automatically here
        const response = await api.get('/auth/me'); 
        setUser(response.data); // Expecting { id, name, role: 'LIBRARIAN' } etc.
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = async (credentials) => {
    // The backend verifies credentials and sets the HttpOnly cookie in the response header
    const response = await api.post('/auth/login', credentials);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      // The backend invalidates the session and clears the HttpOnly cookie
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);