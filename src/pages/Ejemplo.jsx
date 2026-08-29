import { useState } from "react";

export const Ejemplo = () => {
  const [books, setBooks] = useState([
    { id: 1, title: "El Hobbit", author: "J.R.R. Tolkien", status: "Leído" },
    { id: 2, title: "1984", author: "George Orwell", status: "Leyendo" },
  ]);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("Pendiente");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const newBook = {
      id: Date.now(),
      title,
      author,
      status,
    };

    setBooks([...books, newBook]);
    setTitle("");
    setAuthor("");
    setStatus("Pendiente");
  };

  const handleDelete = (id) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case "Leído":
        return { backgroundColor: "#d1fae5", color: "#065f46" };
      case "Leyendo":
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      default:
        return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>📚 Mi Biblioteca</h1>
      </header>

      <main style={styles.container}>
        {/* Formulario para agregar libros */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Agregar Libro</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="title" style={styles.label}>
                Título
              </label>
              <input
                id="title"
                type="text"
                placeholder="Ej. Cien años de soledad"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="author" style={styles.label}>
                Autor
              </label>
              <input
                id="author"
                type="text"
                placeholder="Ej. Gabriel García Márquez"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="status" style={styles.label}>
                Estado de lectura
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={styles.input}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Leyendo">Leyendo</option>
                <option value="Leído">Leído</option>
              </select>
            </div>

            <button type="submit" style={styles.btnPrimary}>
              Guardar Libro
            </button>
          </form>
        </section>

        {/* Lista de libros guardados */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Colección ({books.length})</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Título</th>
                  <th style={styles.th}>Autor</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        color: "#6b7280",
                      }}
                    >
                      No hay libros guardados.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.id}>
                      <td style={styles.td}>{book.title}</td>
                      <td style={styles.td}>{book.author}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...getBadgeStyle(book.status),
                          }}
                        >
                          {book.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleDelete(book.id)}
                          style={styles.btnDanger}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

// Estilos encapsulados en objeto JavaScript
const styles = {
  page: {
    backgroundColor: "#f3f4f6",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
    color: "#1f2937",
    paddingBottom: "2rem",
  },
  header: {
    backgroundColor: "#4f46e5",
    color: "white",
    textAlign: "center",
    padding: "1.5rem",
    marginBottom: "2rem",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "0 1rem",
    display: "grid",
    gap: "2rem",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "1rem",
    fontSize: "1.25rem",
  },
  form: {
    display: "grid",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontWeight: "500",
    fontSize: "0.875rem",
  },
  input: {
    padding: "0.6rem",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    fontSize: "1rem",
    outline: "none",
  },
  btnPrimary: {
    padding: "0.6rem 1rem",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
  },
  btnDanger: {
    padding: "0.3rem 0.6rem",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "0.75rem",
    borderBottom: "2px solid #e5e7eb",
    fontSize: "0.875rem",
  },
  td: {
    padding: "0.75rem",
    borderBottom: "1px solid #e5e7eb",
  },
  badge: {
    padding: "0.25rem 0.5rem",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
};

export default Ejemplo;
