import { useState, useEffect, useCallback } from 'react';
import { recommendationService } from '../api/services/recommendationService';

let recommendationsCache = null;
let recommendationsTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos de caché

/**
 * Hook para obtener los libros recomendados del carrusel con caché en memoria.
 * Retorna { recommendations, isLoading, error, refetch }.
 */
export function useRecommendations() {
  const isCacheValid = Boolean(
    recommendationsCache && Date.now() - recommendationsTimestamp < CACHE_TTL
  );
  const [recommendations, setRecommendations] = useState(
    isCacheValid ? recommendationsCache : []
  );
  const [isLoading, setIsLoading] = useState(!isCacheValid);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async (force = false) => {
    if (!force && recommendationsCache && Date.now() - recommendationsTimestamp < CACHE_TTL) {
      setRecommendations(recommendationsCache);
      setIsLoading(false);
      return;
    }

    if (!recommendationsCache) setIsLoading(true);
    setError(null);
    try {
      const { data } = await recommendationService.getAll();
      const list = Array.isArray(data) ? data : (data?.results || []);
      recommendationsCache = list;
      recommendationsTimestamp = Date.now();
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

  return { recommendations, isLoading, error, refetch: () => fetchRecommendations(true) };
}
