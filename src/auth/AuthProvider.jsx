import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosConfig';
import * as authService from '../api/services/authService';

const AuthContext = createContext(null);

// Fallbacks directos por si el archivo del servicio es sobrescrito por un editor
const apiLogin = authService.login || (async (username, password) => {
  const { data } = await api.post('/token/', { username, password });
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);
  return data;
});

const apiLogout = authService.logout || (() => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
});

/**
 * Lee el token JWT guardado en localStorage y extrae el objeto usuario.
 * Valida la vigencia de los tokens (access y refresh) para evitar estados zombi con 401.
 * Devuelve null si no hay token o si ambos tokens están vencidos o malformados.
 */
const getUserFromStorage = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    const now = Date.now();
    const isAccessExpired = decoded.exp && decoded.exp * 1000 < now;

    if (isAccessExpired) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const decodedRefresh = jwtDecode(refreshToken);
          if (decodedRefresh.exp && decodedRefresh.exp * 1000 < now) {
            // Ambos tokens vencieron: limpiar sesión caducada
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return null;
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return null;
        }
      } else {
        localStorage.removeItem('accessToken');
        return null;
      }
    }

    return {
      id: decoded.user_id,
      username: decoded.username || `Usuario-${decoded.user_id}`,
      role: decoded.rol || 'USER', // campo custom agregado por CustomTokenObtainPairSerializer
    };
  } catch {
    // Token malformado — limpiar
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUserFromStorage());
  const isLoading = false;

  // Escucha el evento global que dispara el interceptor de Axios cuando el refresh falla
  useEffect(() => {
    const handleForceLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    await apiLogin(username, password); // POST /token/ → guarda tokens en localStorage
    const loggedUser = getUserFromStorage();
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const logout = useCallback(() => {
    apiLogout(); // limpia localStorage
    setUser(null);
  }, []);

  const role = user?.role ?? 'GUEST';
  const isGuest = !user;

  return (
    <AuthContext.Provider value={{ user, role, isGuest, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
