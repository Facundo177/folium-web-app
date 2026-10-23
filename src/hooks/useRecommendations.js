import { useState, useEffect, useCallback } from 'react';
import { recommendationService } from '../api/services/recommendationService';

/**
 * Hook para obtener los libros recomendados del carrusel (/recommendations).
 * Retorna { recommendations, isLoading, error, refetch }.
 */
export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await recommendationService.getAll();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setRecommendations(list);
    } catch (err) {
      console.warn('Error al cargar recomendaciones:', err);
      setError(err.response?.data?.detail || 'Error al cargar libros recomendados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, isLoading, error, refetch: fetchRecommendations };
}
