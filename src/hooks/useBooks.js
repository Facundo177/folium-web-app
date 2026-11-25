import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookService } from '../api/services/bookService';

// Caché en memoria para páginas y combinaciones de filtros del catálogo
const catalogCache = new Map(); // cacheKey -> { books, totalCount, timestamp }
const CACHE_TTL = 3 * 60 * 1000; // 3 minutos de retención

const buildKey = (f) =>
  `${f.search || ''}|${f.genre || ''}|${f.year || ''}|${f.page || 1}|${f.page_size || 20}`;

export const MIN_PUBLICATION_YEAR = 868;

export const sanitizeYearParam = (value) => {
  const trimmed = String(value ?? '').trim();
  if (!/^\d{4}$/.test(trimmed)) return '';
  const parsed = Number(trimmed);
  const maxYear = new Date().getFullYear();
  return Number.isInteger(parsed) && parsed >= MIN_PUBLICATION_YEAR && parsed <= maxYear
    ? String(parsed)
    : '';
};

const readFiltersFromSearchParams = (searchParams, defaults) => {
  const parsedPage = parseInt(searchParams.get('page'), 10);
  return {
    genre: searchParams.get('genre') ?? defaults.genre,
    year: sanitizeYearParam(searchParams.get('year')) || defaults.year,
    search: searchParams.get('search') ?? defaults.search,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : defaults.page,
    page_size: defaults.page_size,
  };
};

/**
 * Hook para gestionar el catálogo de libros con filtros, paginación server-side
 * y soporte de caché en memoria Stale-While-Revalidate (SWR).
 *
 * Elimina las recargas innecesarias al navegar entre el catálogo y el detalle de un libro.
 */
export function useBooks(initialFilters = {}, { syncUrl = false } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultFiltersRef = useRef({
    genre: '',
    year: '',
    search: '',
    page: 1,
    page_size: 20,
    ...initialFilters,
  });

  const [filters, setFiltersState] = useState(() =>
    syncUrl
      ? readFiltersFromSearchParams(searchParams, defaultFiltersRef.current)
      : defaultFiltersRef.current
  );

  const currentKey = buildKey(filters);
  const cached = catalogCache.get(currentKey);
  const isCacheValid = Boolean(cached && Date.now() - cached.timestamp < CACHE_TTL);

  const [books, setBooks] = useState(isCacheValid ? cached.books : []);
  const [totalCount, setTotalCount] = useState(isCacheValid ? cached.totalCount : 0);
  const [isLoading, setIsLoading] = useState(!isCacheValid);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchBooks = useCallback(async (currentFilters, force = false) => {
    const requestId = ++requestIdRef.current;
    const key = buildKey(currentFilters);
    const existingCache = catalogCache.get(key);
    const hasValidCache = !force && existingCache && Date.now() - existingCache.timestamp < CACHE_TTL;

    if (hasValidCache) {
      setBooks(existingCache.books);
      setTotalCount(existingCache.totalCount);
      setIsLoading(false);
      setIsFetching(false);
      setError(null);
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
    const validYear = sanitizeYearParam(currentFilters.year);
    if (currentFilters.search)    params.search    = currentFilters.search;
    if (currentFilters.genre)     params.genre     = currentFilters.genre;
    if (validYear)                params.year      = Number(validYear);
    params.page      = currentFilters.page;
    params.page_size = currentFilters.page_size;

    try {

      
      const { data } = await bookService.getAll(params);

      if (!isMountedRef.current || requestId !== requestIdRef.current) return;

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
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;
      if (!isMountedRef.current) return;
      setError(err.response?.data?.detail || 'Error al cargar los libros.');
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, []);

  const syncFiltersToUrl = useCallback(
    (nextFilters) => {
      if (!syncUrl) return;
      const nextParams = new URLSearchParams();
      if (nextFilters.search) nextParams.set('search', nextFilters.search);
      if (nextFilters.genre) nextParams.set('genre', nextFilters.genre);
      if (nextFilters.year) nextParams.set('year', String(nextFilters.year));
      if (nextFilters.page && nextFilters.page > 1) {
        nextParams.set('page', String(nextFilters.page));
      }
      setSearchParams(nextParams, { replace: true });
    },
    [syncUrl, setSearchParams]
  );

  // Sincronizar si la URL cambia externamente (ej. botón Atrás/Adelante del navegador)
  useEffect(() => {
    if (!syncUrl) return;
    const fromUrl = readFiltersFromSearchParams(searchParams, defaultFiltersRef.current);
    setFiltersState((prev) => {
      if (
        prev.search === fromUrl.search &&
        prev.genre === fromUrl.genre &&
        prev.year === fromUrl.year &&
        prev.page === fromUrl.page
      ) {
        return prev;
      }
      return fromUrl;
    });
  }, [syncUrl, searchParams]);

  useEffect(() => {
    fetchBooks(filters);
  }, [filters, fetchBooks]);

  const setFilters = useCallback(
    (newFilters) => {
      setFiltersState((prev) => {
        const sanitizedUpdates = { ...newFilters };
        if ('year' in sanitizedUpdates) {
          sanitizedUpdates.year = sanitizeYearParam(sanitizedUpdates.year);
        }
        const next = {
          ...prev,
          ...sanitizedUpdates,
          page: 1,
        };
        syncFiltersToUrl(next);
        return next;
      });
    },
    [syncFiltersToUrl]
  );

  const setPage = useCallback(
    (newPage) => {
      setFiltersState((prev) => {
        const next = { ...prev, page: newPage };
        syncFiltersToUrl(next);
        return next;
      });
    },
    [syncFiltersToUrl]
  );

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
