import { useState, useEffect, useCallback } from "react";
import { bookService } from "../api/services/bookService";

// Editoriales existentes con la forma { id, name }.
// Como /editorial/ todavía no existe, se sacan de los libros recorriendo todas las páginas.
async function fetchEditorials() {
  const found = new Map(); // id -> { id, name }; el Map evita repetidas
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= 50) {
    const { data } = await bookService.getAll({ page });
    const books = data?.results || data || [];

    books.forEach((book) => {
      const raw =
        book.editorial_detail ?? (typeof book.editorial === "object" ? book.editorial : null);
      const id = raw?.id ?? book.editorial_id;
      const name = raw?.name ?? (typeof book.editorial === "string" ? book.editorial : "");
      if (id && name) found.set(id, { id, name });
    });

    hasNext = Boolean(data?.next);
    page += 1;
  }

  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function useEditorials() {
  const [editorials, setEditorials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setEditorials(await fetchEditorials());
    } catch (err) {
      console.error("Error cargando editoriales:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { editorials, setEditorials, isLoading, refetch: load };
}