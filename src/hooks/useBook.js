import { useState, useEffect, useCallback } from 'react';
import { bookService } from '../api/services/bookService';

const bookCache = new Map(); // id -> { data, timestamp }
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos de caché individual por libro

/**
 * Hook para consultar el detalle de un libro con soporte de caché en memoria (SWR).
 * Permite que al abrir un libro ya visitado, este se muestre instantáneamente sin pantallas en blanco.
 */
export function useBook(id) {
  const cached = id ? bookCache.get(String(id)) : null;
  const isCacheValid = Boolean(cached && Date.now() - cached.timestamp < CACHE_TTL);

  const [book, setBook] = useState(isCacheValid ? cached.data : null);
  const [isLoading, setIsLoading] = useState(!isCacheValid && Boolean(id));
  const [error, setError] = useState(null);

  const fetchBook = useCallback(async (force = false) => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const currentCached = bookCache.get(String(id));
    if (!force && currentCached && Date.now() - currentCached.timestamp < CACHE_TTL) {
      setBook(currentCached.data);
      setIsLoading(false);
      return;
    }

    if (!currentCached) setIsLoading(true);
    setError(null);
    try {
      const { data } = await bookService.getById(id);
      bookCache.set(String(id), { data, timestamp: Date.now() });
      setBook(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar el libro.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchBook();
  }, [id, fetchBook]);

  return { book, isLoading, error, refetch: () => fetchBook(true) };
}
