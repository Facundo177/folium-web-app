import { useState, useEffect, useCallback } from 'react';
import { itemService } from '../api/services/itemService';

/**
 * Hook para gestionar el inventario de ejemplares físicos.
 * Soporta respuestas paginadas estándar de DRF ({ count, next, previous, results })
 * así como arrays planos de versiones anteriores.
 * 
 * Al cambiar status o search, reinicia automáticamente page a 1
 * para evitar estados huérfanos fuera de rango.
 */
export function useInventory(initialParams = {}) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(initialParams.page || 1);
  const [pageSize, setPageSize] = useState(initialParams.page_size || 50);
  const [search, setSearchState] = useState(initialParams.search || '');
  const [status, setStatusState] = useState(initialParams.status || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Al cambiar estado o búsqueda, resetea a página 1 SOLO si el valor es diferente
  const setStatus = useCallback((newStatus) => {
    const clean = newStatus || '';
    setStatusState((prev) => {
      if (prev === clean) return prev;
      setPage(1);
      return clean;
    });
  }, []);

  const setSearch = useCallback((newSearch) => {
    const clean = newSearch || '';
    setSearchState((prev) => {
      if (prev === clean) return prev;
      setPage(1);
      return clean;
    });
  }, []);

  const fetchItems = useCallback(
    async (overrides = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const activePage = overrides.page !== undefined ? overrides.page : page;
        const activePageSize =
          overrides.page_size !== undefined ? overrides.page_size : pageSize;
        const activeSearch =
          overrides.search !== undefined ? overrides.search : search;
        const activeStatus =
          overrides.status !== undefined ? overrides.status : status;

        const params = {
          page: activePage,
          page_size: activePageSize,
          ...(activeSearch ? { search: activeSearch } : {}),
          ...(activeStatus ? { status: activeStatus } : {}),
          ...overrides,
        };

        const { data } = await itemService.getAll(params);

        if (Array.isArray(data)) {
          // Formato array plano (sin paginar)
          setItems(data);
          setCount(data.length);
        } else if (data && typeof data === 'object') {
          // Formato paginado DRF: { count, next, previous, results }
          const results = Array.isArray(data.results) ? data.results : [];
          setItems(results);
          setCount(typeof data.count === 'number' ? data.count : results.length);
        } else {
          setItems([]);
          setCount(0);
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Error al cargar el inventario.');
      } finally {
        setIsLoading(false);
      }
    },
    [page, pageSize, search, status]
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return {
    items,
    count,
    page,
    pageSize,
    totalPages,
    search,
    status,
    isLoading,
    error,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    refetch: fetchItems,
  };
}
