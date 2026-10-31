import { useState, useEffect, useCallback } from 'react';
import { genreService } from '../api/services/genreService';

let genresCache = null;
let genresCacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos de caché en memoria

/**
 * Hook para gestionar la lista de géneros literarios con caché en memoria (SWR).
 */
export function useGenres(initialParams = {}) {
  const isCacheValid = Boolean(genresCache && Date.now() - genresCacheTimestamp < CACHE_TTL);
  const [genres, setGenres] = useState(isCacheValid ? genresCache : []);
  const [isLoading, setIsLoading] = useState(!isCacheValid);
  const [error, setError] = useState(null);

  const fetchGenres = useCallback(async (params = initialParams, force = false) => {
    if (!force && genresCache && Date.now() - genresCacheTimestamp < CACHE_TTL) {
      setGenres(genresCache);
      setIsLoading(false);
      return;
    }

    if (!genresCache) setIsLoading(true);
    setError(null);
    try {
      const { data } = await genreService.getAll(params);
      const list = Array.isArray(data) ? data : (data?.results || []);
      genresCache = list;
      genresCacheTimestamp = Date.now();
      setGenres(list);
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

  return { genres, isLoading, error, refetch: (p) => fetchGenres(p, true) };
}
