import { useState, useEffect, useCallback } from "react";
import { editorialService } from "../api/services/editorialService";
import { bookService } from "../api/services/bookService";

/**
 * Fallback resiliente: si el backend no tiene disponible /api/v1/editorial/ (404),
 * extrae las editoriales existentes recorriendo los libros del catálogo.
 */
async function fetchEditorialsFromBooks() {
  const found = new Map();
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= 25) {
    try {
      const { data } = await bookService.getAll({ page, page_size: 50 });
      const books = Array.isArray(data) ? data : data?.results || [];

      books.forEach((book) => {
        const raw =
          book.editorial_detail ??
          (typeof book.editorial === "object" && book.editorial !== null
            ? book.editorial
            : null);
        const id =
          raw?.id ??
          book.editorial_id ??
          (typeof book.editorial === "number" ? book.editorial : null);
        const name =
          raw?.name ??
          (typeof book.editorial === "string" ? book.editorial : "");

        const cleanName = String(name || "").trim();
        if (cleanName) {
          const key = id !== null && id !== undefined ? String(id) : cleanName.toLowerCase();
          if (!found.has(key)) {
            found.set(key, {
              id: id ?? cleanName,
              name: cleanName,
            });
          }
        }
      });

      hasNext = Boolean(data?.next);
      page += 1;
    } catch (err) {
      console.warn(`Fallback de editoriales: error al leer página ${page} de libros:`, err);
      break;
    }
  }

  return [...found.values()].sort((a, b) =>
    String(a?.name || "").localeCompare(String(b?.name || ""), "es")
  );
}

async function loadAllEditorials(params) {
  try {
    const { data } = await editorialService.getAll(params);
    const list = Array.isArray(data) ? data : data?.results || [];
    return [...list].sort((a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || ""), "es")
    );
  } catch (err) {
    // Si el endpoint dedicado no está disponible en este entorno (404),
    // activar fallback automático para que el dropdown nunca quede vacío.
    if (err.response?.status === 404) {
      console.warn(
        "Endpoint /api/v1/editorial/ no encontrado (404). Activando extracción fallback desde libros..."
      );
      return await fetchEditorialsFromBooks();
    }
    throw err;
  }
}

/**
 * Hook para gestionar la lista de editoriales.
 * Utiliza el endpoint dedicado GET /api/v1/editorial/ y cuenta con fallback
 * automático a extracción desde libros si el backend activo aún no lo tiene desplegado.
 */
export function useEditorials(initialParams = {}) {
  const [editorials, setEditorials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async (params = initialParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await loadAllEditorials(params);
      setEditorials(list);
      return list;
    } catch (err) {
      console.error("Error cargando editoriales:", err);
      try {
        const fallbackList = await fetchEditorialsFromBooks();
        if (fallbackList.length > 0) {
          setEditorials(fallbackList);
          return fallbackList;
        }
      } catch {
        // Ignorar fallo de fallback
      }
      setError(err.response?.data?.detail || "Error al cargar las editoriales.");
      return [];
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
      .catch(async (err) => {
        console.warn("Fallo carga inicial de editoriales:", err);
        try {
          const fallbackList = await fetchEditorialsFromBooks();
          if (isMounted && fallbackList.length > 0) {
            setEditorials(fallbackList);
            return;
          }
        } catch {
          // Ignorar
        }
        if (isMounted) {
          setError(
            err.response?.data?.detail || "Error al cargar las editoriales."
          );
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
