import { useState, useEffect, useCallback } from 'react';
import { bookService } from '../api/services/bookService';

const bookCache = new Map(); // id -> { data, timestamp }
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos de caché individual por libro

/**
 * Hook para consultar el detalle de un libro con soporte de caché en memoria (SWR).
 * Permite que al abrir un libro ya visitado, este se muestre instantáneamente sin pantallas en blanco.
 */
export function useBook(id) {
  const initialCached = id ? bookCache.get(String(id)) : null;

  const [book, setBook] = useState(initialCached ? initialCached.data : null);
  const [isLoading, setIsLoading] = useState(!initialCached && Boolean(id));
  const [error, setError] = useState(null);
  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);
    const nextCached = id ? bookCache.get(String(id)) : null;
    setBook(nextCached ? nextCached.data : null);
    setIsLoading(!nextCached && Boolean(id));
    setError(null);
  }

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
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchBook();
      }
    });
    return () => {
      active = false;
    };
  }, [id, fetchBook]);

  return { book, isLoading, error, refetch: () => fetchBook(true) };
}
