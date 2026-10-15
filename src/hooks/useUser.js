import { useState, useEffect, useCallback } from 'react';
import { userService } from '../api/services/userService';

/**
 * Hook para obtener los datos guardados de un usuario específico.
 * 
 * Uso:
 *   const { user, isLoading, error, refetch } = useUser(userId);
 */
export function useUser(userId) {
  const [user, setUser] = useState(null);
  // Si no hay userId, no cargamos nada inicialmente
  const [isLoading, setIsLoading] = useState(!!userId); 
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await userService.getById(userId);
      setUser(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar los datos del usuario.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isLoading, error, refetch: fetchUser };
}