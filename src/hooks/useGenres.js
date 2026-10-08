import { useState, useEffect, useCallback } from 'react';
import { genreService } from '../api/services/genreService'; // Ajusta la ruta según tu estructura

/**
 * Hook para gestionar la lista de géneros literarios.
 * Encapsula el estado (genres, isLoading, error) y las llamadas a genreService.
 * 
 * {
 *  genres,     // géneros que ya están en el estado del hook 
 *  isLoading,  // true mientras se está haciendo la petición
 *  error,      // mensaje si falló; null si no hay error
 *  refetch     // función para volver a pedirlo
 * }
 * 
 * Uso:
 *   const { genres, isLoading, error, refetch } = useGenres();
 */
export function useGenres(initialParams = {}) {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGenres = useCallback(async (params = initialParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await genreService.getAll(params);
      setGenres(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar los géneros.');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  return { genres, isLoading, error, refetch: fetchGenres };
}