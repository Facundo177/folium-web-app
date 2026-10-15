export const adaptBook = (b) => ({
  id: b.id,
  isbn: b.isbn,
  title: b.title,
  author: b.authors.map((a) => `${a.name} ${a.last_name}`).join(", "),
  genres: b.genres.map((g) => g.name),
  category: b.genres[0]?.name ?? "Sin género",
  year: b.publication_year,
  cover: b.cover_image, // ojo: es null en la mayoría
});

export const adaptBookDetail = (b) => ({
  ...adaptBook(b),
  description: b.description,
  items: b.items,
  totalItems: b.total_items,
  availableItems: b.available_items,
});

export const adaptItem = (item, booksById) => {
  const book = booksById[item.book];
  return {
    id: item.id,
    code: item.inventory_code,
    status: item.status,
    statusLabel: item.status_display,
    location: item.location,
    title: book?.title ?? "—",
    author: book?.author ?? "—",
    isbn: book?.isbn ?? "—",
    genres: book?.genres ?? [],
    cover: book?.cover ?? null,
  };
};