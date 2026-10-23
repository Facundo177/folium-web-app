import { useState, useEffect, useCallback } from 'react';
import { bookService } from '../api/services/bookService';

/**
 * Hook para gestionar el catálogo de libros.
 * Encapsula el estado (books, isLoading, error) y las llamadas a bookService.
 * 
 * {
 *  books,      // libros que ya están en el estado del hook 
 *  isLoading,  // true mientras se está haciendo la petición
 *  error,      // mensaje si falló; null si no hay error
 *  refetch     // función para volver a pedirlo
 * }
 * 
 * Uso:
 *   const { books, isLoading, error, refetch } = useBooks({ search: 'Borges' });
 */
export function useBooks(initialParams = {}) {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async (params = initialParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await bookService.getAll(params);
      const bookList = Array.isArray(data) ? data : (data?.results || []);
      setBooks(bookList);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar los libros.');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { books, isLoading, error, refetch: fetchBooks };
}
