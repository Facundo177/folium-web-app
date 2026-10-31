import { useState, useEffect, useCallback, useRef } from 'react';
import { bookService } from '../api/services/bookService';

// Caché en memoria para páginas y combinaciones de filtros del catálogo
const catalogCache = new Map(); // cacheKey -> { books, totalCount, timestamp }
const CACHE_TTL = 3 * 60 * 1000; // 3 minutos de retención

const buildKey = (f) =>
  `${f.search || ''}|${f.genre || ''}|${f.year || ''}|${f.page || 1}|${f.page_size || 20}`;

/**
 * Hook para gestionar el catálogo de libros con filtros, paginación server-side
 * y soporte de caché en memoria Stale-While-Revalidate (SWR).
 *
 * Elimina las recargas innecesarias al navegar entre el catálogo y el detalle de un libro.
 */
export function useBooks(initialFilters = {}) {
  const [filters, setFiltersState] = useState({
    genre: '',
    year: '',
    search: '',
    page: 1,
    page_size: 20,
    ...initialFilters,
  });

  const currentKey = buildKey(filters);
  const cached = catalogCache.get(currentKey);
  const isCacheValid = Boolean(cached && Date.now() - cached.timestamp < CACHE_TTL);

  const [books, setBooks] = useState(isCacheValid ? cached.books : []);
  const [totalCount, setTotalCount] = useState(isCacheValid ? cached.totalCount : 0);
  const [isLoading, setIsLoading] = useState(!isCacheValid);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchBooks = useCallback(async (currentFilters, force = false) => {
    const key = buildKey(currentFilters);
    const existingCache = catalogCache.get(key);
    const hasValidCache = !force && existingCache && Date.now() - existingCache.timestamp < CACHE_TTL;

    if (hasValidCache) {
      setBooks(existingCache.books);
      setTotalCount(existingCache.totalCount);
      setIsLoading(false);
      return;
    }

    if (existingCache) {
      // Stale-While-Revalidate: servir inmediatamente datos en caché y actualizar de fondo
      setBooks(existingCache.books);
      setTotalCount(existingCache.totalCount);
      setIsLoading(false);
      setIsFetching(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    const params = {};
    if (currentFilters.search)    params.search    = currentFilters.search;
    if (currentFilters.genre)     params.genre     = currentFilters.genre;
    if (currentFilters.year)      params.year      = currentFilters.year;
    params.page      = currentFilters.page;
    params.page_size = currentFilters.page_size;

    try {
      const { data } = await bookService.getAll(params);

      if (!isMountedRef.current) return;

      const newBooks = Array.isArray(data) ? data : data?.results || [];
      const newTotal = Array.isArray(data) ? data.length : data?.count ?? 0;

      catalogCache.set(key, {
        books: newBooks,
        totalCount: newTotal,
        timestamp: Date.now(),
      });

      setBooks(newBooks);
      setTotalCount(newTotal);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err.response?.data?.detail || 'Error al cargar los libros.');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchBooks(filters);
  }, [filters, fetchBooks]);

  const setFilters = useCallback((newFilters) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  }, []);

  const setPage = useCallback((newPage) => {
    setFiltersState(prev => ({ ...prev, page: newPage }));
  }, []);

  const totalPages = Math.ceil(totalCount / filters.page_size) || 1;

  return {
    books,
    totalCount,
    totalPages,
    isLoading,
    isFetching,
    error,
    filters,
    setFilters,
    setPage,
    refetch: () => fetchBooks(filters, true),
  };
}
