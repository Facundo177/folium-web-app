import { useState, useEffect, useCallback } from 'react';
import { bookService } from '../api/services/bookService';

export function useBook(id) {
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);

  const fetchBook = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await bookService.getById(id);
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

  return { book, isLoading, error, refetch: fetchBook };
}
