export const InventoryTable= () => {
  // Datos simulados basados en la imagen
  const books = [
    {
      id: 1,
      cover: 'https://via.placeholder.com/40x60?text=Viento',
      title: 'El nombre del viento',
      author: 'Patrick Rothfuss',
      isbn: '978-8401352836',
      genre: 'Fantasy',
      price: '€24.90',
      status: 'IN STOCK',
    },
    {
      id: 2,
      cover: 'https://via.placeholder.com/40x60?text=Cien',
      title: 'Cien años de soledad',
      author: 'Gabriel García Márquez',
      isbn: '978-0307474728',
      genre: 'Magical Realism',
      price: '€18.50',
      status: 'LOW STOCK',
    },
    {
      id: 3,
      cover: 'https://via.placeholder.com/40x60?text=1984',
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0451524935',
      genre: 'Dystopian',
      price: '€14.99',
      status: 'IN STOCK',
    },
  ];

  // Función para asignar los estilos del badge según el estado
  const getStatusBadgeStyle = (status) => {
    if (status === 'LOW STOCK') {
      return 'bg-error-container text-on-error-container';
    }
    return 'bg-surface-variant text-on-surface';
  };

  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm font-sans">
      
      {/* Top Toolbar: Search & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-gutter gap-stack-md">
        
        {/* Search Input */}
        <div className="flex items-center gap-base border-b border-outline pb-1 w-full md:w-80">
          <SearchIcon />
          <input 
            type="text" 
            placeholder="Title, Author, or ISBN" 
            className="bg-transparent border-none outline-none text-body-md w-full text-on-surface placeholder:text-on-surface-variant"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-base">
          <button className="flex items-center gap-1 border border-outline-variant rounded-DEFAULT px-4 py-2 text-label-caps text-on-surface hover:bg-surface-container">
            ALL GENRES
            <ChevronDownIcon />
          </button>
          <button className="flex items-center gap-1 border border-outline-variant rounded-DEFAULT px-4 py-2 text-label-caps text-on-surface hover:bg-surface-container">
            STOCK STATUS
            <ChevronDownIcon />
          </button>
          <button className="flex items-center justify-center border border-outline-variant rounded-DEFAULT w-9 h-9 text-on-surface hover:bg-surface-container">
            <FilterIcon />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-y border-outline-variant bg-surface-container-lowest">
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">COVER</th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">TITLE & AUTHOR</th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">ISBN</th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">GENRE</th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant">PRICE</th>
              <th className="w-1/6 py-stack-sm px-gutter text-label-caps text-on-surface-variant">STATUS</th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-b border-outline-variant hover:bg-surface">
                {/* Cover */}
                <td className="py-stack-sm px-gutter">
                  <div className="w-12 h-16 bg-surface-container border border-outline-variant overflow-hidden p-1 shadow-sm">
                     <img src={book.cover} alt={`Cover of ${book.title}`} className="w-full h-full object-cover" />
                  </div>
                </td>
                {/* Title & Author */}
                <td className="py-stack-sm px-gutter">
                  <div className="flex flex-col">
                    <span className="text-title-lg text-on-surface font-medium">
                      {book.title}
                    </span>
                    <span className="text-body-md text-on-surface-variant">
                      {book.author}
                    </span>
                  </div>
                </td>
                {/* ISBN */}
                <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant">
                  {book.isbn}
                </td>
                {/* Genre */}
                <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant">
                  {book.genre}
                </td>
                {/* Price */}
                <td className="py-stack-sm px-gutter text-body-md text-on-surface font-medium">
                  {book.price}
                </td>
                {/* Status Badge */}
                <td className="py-stack-sm px-gutter">
                  <span className={`text-label-caps px-2 py-1 rounded-sm ${getStatusBadgeStyle(book.status)}`}>
                    {book.status}
                  </span>
                </td>
                {/* Actions (Empty in reference image) */}
                <td className="py-stack-sm px-gutter text-right">
                  {/* Espacio para botones de editar/eliminar */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center p-gutter gap-stack-md text-body-md text-on-surface-variant bg-surface-container-lowest rounded-b-DEFAULT">
        <span>Showing 1 to 3 of 12,450 entries</span>
        
        <div className="flex items-center gap-1">
          <button className="border border-outline-variant px-3 py-1 bg-surface-container-lowest text-on-surface-variant hover:bg-surface disabled:opacity-50" disabled>
            Prev
          </button>
          
          <button className="border border-primary px-3 py-1 bg-primary text-on-primary font-medium">
            1
          </button>
          <button className="border border-outline-variant px-3 py-1 bg-surface-container-lowest text-on-surface hover:bg-surface">
            2
          </button>
          <button className="border border-outline-variant px-3 py-1 bg-surface-container-lowest text-on-surface hover:bg-surface">
            3
          </button>
          
          <span className="px-2 text-on-surface-variant">...</span>
          
          <button className="border border-outline-variant px-3 py-1 bg-surface-container-lowest text-on-surface hover:bg-surface">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Íconos SVG extraídos
// ==========================================

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);


export default InventoryTable;