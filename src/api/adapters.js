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
    : "";

  const genres = Array.isArray(b.genres)
    ? b.genres
        .map((g) => (typeof g === "object" && g !== null ? g.name : String(g || "")))
        .filter(Boolean)
    : [];

  const category = genres[0] ?? "Sin género";

  return {
    id: b.id,
    isbn: b.isbn ? String(b.isbn) : "",
    title: b.title || "",
    editorial,
    author: author || "Autor no especificado",
    genres,
    category,
    year: b.publication_year ?? "—",
    cover: b.cover_image ?? null,
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
  } else if (typeof b.available_items === "object" && b.available_items !== null && typeof b.available_items.count === "number") {
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
  const book = booksById[item.book];
  return {
    id: item.id,
    bookId: item.book,
    code: item.inventory_code,
    status: item.status,
    statusLabel: item.status_display || item.status || "—",
    location: item.location || "Sin asignar",
    title: book?.title ?? "—",
    author: book?.author ?? "—",
    isbn: book?.isbn ? String(book.isbn) : "—",
    genres: book?.genres ?? [],
    cover: book?.cover ?? null,
  };
};
