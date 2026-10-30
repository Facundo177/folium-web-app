/**
 * Convierte URLs absolutas de medios (ej. http://54.160.130.29/media/...) en rutas relativas (/media/...)
 * para que sean servidas de forma segura por el proxy de Vercel bajo HTTPS, previniendo Mixed Content.
 */
export function sanitizeMediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  const mediaIdx = url.indexOf("/media/");
  if (mediaIdx === -1) return url;

  // En producción (Vercel HTTPS) o cuando apunta a la IP de AWS sobre HTTP inseguro
  if (url.startsWith("http://") || import.meta.env?.PROD) {
    return url.slice(mediaIdx);
  }
  return url;
}

export const adaptBook = (b) => {
  if (!b) return {};

  const editorial =
    typeof b.editorial === "object" && b.editorial !== null
      ? b.editorial.name || b.editorial.title || ""
      : typeof b.editorial === "string"
      ? b.editorial
      : "";

  const author = Array.isArray(b.authors)
    ? b.authors
        .map((a) =>
          typeof a === "object" && a !== null
            ? `${a.name || ""} ${a.last_name || ""}`.trim()
            : String(a || "")
        )
        .filter(Boolean)
        .join(", ")
    : typeof b.author === "string"
    ? b.author
    : editorial || "Autor no especificado";

  const genres = Array.isArray(b.genres)
    ? b.genres
        .map((g) => (typeof g === "object" && g !== null ? g.name : String(g || "")))
        .filter(Boolean)
    : [];

  const category = genres[0] ?? "Sin género";

  const availableItems =
    typeof b.available_items === "number"
      ? b.available_items
      : Array.isArray(b.available_items)
      ? b.available_items.length
      : typeof b.stock === "number"
      ? b.stock
      : null;

  const totalItems =
    typeof b.total_items === "number"
      ? b.total_items
      : Array.isArray(b.total_items)
      ? b.total_items.length
      : null;

  return {
    id: b.id,
    isbn: b.isbn ? String(b.isbn) : "",
    title: b.title || "",
    editorial,
    author: author || "Autor no especificado",
    genres,
    category,
    year: b.publication_year ?? b.year ?? "—",
    cover: sanitizeMediaUrl(b.cover_image ?? b.cover ?? null),
    availableItems,
    totalItems,
  };
};

export const adaptBookDetail = (b) => {
  if (!b) return {};
  const base = adaptBook(b);
  const items = Array.isArray(b.items) ? b.items : [];

  let totalItems = 0;
  if (typeof b.total_items === "number") {
    totalItems = b.total_items;
  } else if (Array.isArray(b.total_items)) {
    totalItems = b.total_items.length;
  } else {
    totalItems = items.length;
  }

  let availableItems = 0;
  if (typeof b.available_items === "number") {
    availableItems = b.available_items;
  } else if (Array.isArray(b.available_items)) {
    availableItems = b.available_items.length;
  } else if (
    typeof b.available_items === "object" &&
    b.available_items !== null &&
    typeof b.available_items.count === "number"
  ) {
    availableItems = b.available_items.count;
  } else {
    availableItems = items.filter((i) => i.status === "AVAILABLE").length;
  }

  return {
    ...base,
    description: b.description || "",
    items,
    totalItems,
    availableItems,
  };
};

export const adaptItem = (item, booksById = {}) => {
  if (!item) return {};
  const rawBookId = typeof item.book === "object" && item.book !== null ? item.book.id : item.book;
  const nestedBookAdapted =
    typeof item.book === "object" && item.book !== null ? adaptBook(item.book) : null;
  const book = booksById[rawBookId] || nestedBookAdapted || null;

  const author =
    typeof book?.author === "object" && book.author !== null
      ? book.author.name || "—"
      : book?.author || "—";

  return {
    id: item.id,
    bookId: rawBookId,
    code: item.inventory_code,
    status: item.status,
    statusLabel: item.status_display || item.status || "—",
    location: item.location || "Sin asignar",
    title: book?.title || "—",
    author: author || "—",
    isbn: book?.isbn ? String(book.isbn) : "—",
    genres: Array.isArray(book?.genres)
      ? book.genres.map((g) => (typeof g === "object" && g !== null ? g.name : String(g || "")))
      : [],
    cover: sanitizeMediaUrl(book?.cover ?? book?.cover_image ?? null),
  };
};

/**
 * Normaliza recursivamente las respuestas del backend para garantizar
 * compatibilidad total con el formato clásico esperado por los componentes React.
 * Convierte objetos anidados como `editorial: { id, name }` a strings `editorial: name`,
 * asegura que `author` sea siempre string y que `genres` sea un array de strings.
 */
export function normalizeApiData(data) {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => normalizeEntity(item));
  }

  if (typeof data === "object") {
    // Si es respuesta paginada con results
    if (Array.isArray(data.results)) {
      return {
        ...data,
        results: data.results.map((item) => normalizeEntity(item)),
      };
    }
    return normalizeEntity(data);
  }

  return data;
}

function normalizeEntity(item) {
  if (!item || typeof item !== "object") return item;

  // Si es un libro directamente
  if (
    "title" in item ||
    "isbn" in item ||
    "authors" in item ||
    ("editorial" in item && typeof item.editorial === "object")
  ) {
    normalizeBookInPlace(item);
  }

  // Si contiene un libro anidado (préstamos: loan.book)
  if (item.book && typeof item.book === "object") {
    normalizeBookInPlace(item.book);
  }

  // Si contiene book_detail (reservas, favoritos, reseñas)
  if (item.book_detail && typeof item.book_detail === "object") {
    normalizeBookInPlace(item.book_detail);
  }

  return item;
}

function normalizeBookInPlace(book) {
  if (!book || typeof book !== "object") return book;

  // 1. Normalizar editorial de objeto { id, name } a string 'editorial'
  if (typeof book.editorial === "object" && book.editorial !== null) {
    const editorialName = book.editorial.name || book.editorial.title || "";
    if (!book.editorial_detail) {
      book.editorial_detail = book.editorial;
    }
    book.editorial_id = book.editorial.id ?? book.editorial_id;
    book.editorial = editorialName;
  }

  // 2. Normalizar autores a string 'author'
  if (Array.isArray(book.authors)) {
    const authorStr = book.authors
      .map((a) =>
        typeof a === "object" && a !== null
          ? `${a.name || ""} ${a.last_name || ""}`.trim()
          : String(a || "")
      )
      .filter(Boolean)
      .join(", ");
    if (!book.author || typeof book.author === "object") {
      book.author =
        authorStr ||
        (typeof book.editorial === "string" ? book.editorial : "") ||
        "Archivo Folium";
    }
  } else if (!book.author || typeof book.author === "object") {
    book.author =
      (typeof book.editorial === "string" ? book.editorial : "") ||
      "Archivo Folium";
  }

  // 3. Normalizar géneros y categoría clásica
  if (Array.isArray(book.genres)) {
    if (!book.genres_detail) {
      book.genres_detail = book.genres;
    }
  }

  // 4. Propiedades clásicas de conveniencia
  if (!book.category && Array.isArray(book.genres) && book.genres.length > 0) {
    const firstGenre = book.genres[0];
    book.category =
      typeof firstGenre === "object" && firstGenre !== null
        ? firstGenre.name || ""
        : String(firstGenre || "");
  }
  if (book.year === undefined && book.publication_year !== undefined) {
    book.year = book.publication_year;
  }
  if (book.cover_image) {
    book.cover_image = sanitizeMediaUrl(book.cover_image);
  }
  if (book.cover) {
    book.cover = sanitizeMediaUrl(book.cover);
  }
  if (book.cover === undefined && book.cover_image !== undefined) {
    book.cover = book.cover_image;
  }
  if (book.availableItems === undefined && book.available_items !== undefined) {
    book.availableItems = book.available_items;
  }
  if (book.totalItems === undefined && book.total_items !== undefined) {
    book.totalItems = book.total_items;
  }

  return book;
}
