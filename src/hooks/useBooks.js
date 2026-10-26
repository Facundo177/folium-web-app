import { useState, useEffect, useCallback, useRef } from 'react';
import { bookService } from '../api/services/bookService';

/**
 * Hook para gestionar el catálogo de libros con filtros y paginación server-side.
 *
 * El backend acepta los siguientes query params en GET /api/v1/book/:
 *   - search    → busca en título y nombre de autor (string)
 *   - genre     → filtra por nombre de género, parcial, sin importar mayúsculas (string)
 *   - year      → filtra por año exacto de publicación (número)
 *   - page      → número de página (número, default 1)
 *   - page_size → libros por página, máx. 50 (número, default 20)
 *
 * Retorna:
 *   {
 *     books,       // Array de libros de la página actual
 *     totalCount,  // Total de libros que coinciden con los filtros en toda la DB
 *     totalPages,  // Total de páginas calculado
 *     isLoading,   // true mientras se carga
 *     error,       // mensaje de error o null
 *     filters,     // estado actual de los filtros
 *     setFilters,  // función para actualizar los filtros (resetea a página 1)
 *     setPage,     // función para cambiar solo la página (mantiene los filtros)
 *     refetch,     // función para volver a pedir con los filtros actuales
 *   }
 *
 * Uso:
 *   const { books, totalPages, filters, setFilters, setPage } = useBooks();
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

  const [books, setBooks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref para evitar actualizar estado si el componente ya se desmontó
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchBooks = useCallback(async (currentFilters) => {
    setIsLoading(true);
    setError(null);

    // Construir solo los params que tienen valor (evita enviar params vacíos al backend)
    const params = {};
    if (currentFilters.search)    params.search    = currentFilters.search;
    if (currentFilters.genre)     params.genre     = currentFilters.genre;
    if (currentFilters.year)      params.year      = currentFilters.year;
    params.page      = currentFilters.page;
    params.page_size = currentFilters.page_size;

    try {
      const { data } = await bookService.getAll(params);

      if (!isMountedRef.current) return;

      // Soporta respuesta paginada { count, results } y lista directa []
      if (Array.isArray(data)) {
        setBooks(data);
        setTotalCount(data.length);
      } else {
        setBooks(data?.results || []);
        setTotalCount(data?.count ?? 0);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err.response?.data?.detail || 'Error al cargar los libros.');
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  // Se ejecuta cada vez que cambian los filtros
  useEffect(() => {
    fetchBooks(filters);
  }, [filters, fetchBooks]);

  /**
   * Actualiza uno o más filtros y resetea la página a 1.
   * Ejemplo: setFilters({ genre: 'Terror' })
   */
  const setFilters = useCallback((newFilters) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // siempre resetear a página 1 al cambiar cualquier filtro
    }));
  }, []);

  /**
   * Cambia solo la página, manteniendo todos los filtros activos.
   */
  const setPage = useCallback((newPage) => {
    setFiltersState(prev => ({ ...prev, page: newPage }));
  }, []);

  const totalPages = Math.ceil(totalCount / filters.page_size);

  return {
    books,
    totalCount,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    setPage,
    refetch: () => fetchBooks(filters),
  };
}
