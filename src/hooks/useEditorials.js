import { useState, useEffect, useCallback } from "react";
import { editorialService } from "../api/services/editorialService";

async function loadAllEditorials(params) {
  const { data } = await editorialService.getAll(params);
  const list = Array.isArray(data) ? data : data?.results || [];
  return [...list].sort((a, b) =>
    String(a?.name || "").localeCompare(String(b?.name || ""), "es")
  );
}

/**
 * Hook para gestionar la lista de editoriales registradas en la base de datos.
 * Consulta directamente el endpoint dedicado GET /api/v1/editorial/ en una única petición.
 */
export function useEditorials(initialParams = {}) {
  const [editorials, setEditorials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async (params = initialParams) => {
    setIsLoading(true);
    setError(null);
    try {
      setEditorials(await loadAllEditorials(params));
    } catch (err) {
      console.error("Error cargando editoriales:", err);
      setError(err.response?.data?.detail || "Error al cargar las editoriales.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;
    loadAllEditorials(initialParams)
      .then((list) => {
        if (isMounted) setEditorials(list);
      })
      .catch((err) => {
        console.error("Error cargando editoriales:", err);
        if (isMounted) {
          setError(err.response?.data?.detail || "Error al cargar las editoriales.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    editorials,
    setEditorials,
    isLoading,
    error,
    refetch,
  };
}
