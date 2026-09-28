import { useState, useEffect, useCallback } from 'react';
import { itemService } from '../api/services/itemService';

/**
 * Hook para gestionar el inventario de ejemplares físicos.
 * Encapsula el estado (items, isLoading, error) y las llamadas a itemService.
 *
 * Uso:
 *   const { items, isLoading, error, refetch } = useInventory();
 */
export function useInventory(initialParams = {}) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async (params = initialParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await itemService.getAll(params);
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar el inventario.');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}
