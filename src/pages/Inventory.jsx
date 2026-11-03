import { useMemo } from "react";
import DescriptionOfInventory from "../components/InventoryComponents/DescriptionOfInventory";
import InventoryTable from "../components/InventoryComponents/InventoryTable";
import GoBackButton from "../components/BasicUIComponents/GoBackButton";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { useInventory } from "../hooks/useInventory";
import { useBooks } from "../hooks/useBooks";
import { adaptBook, adaptItem } from "../api/adapters";
import { AlertTriangle, RotateCcw } from "lucide-react";

export const Inventory = () => {
  useDocumentMetadata({
    title: "Registro de Ejemplares y Depósito — Folium",
    description: "Gestión archivística de ejemplares físicos, códigos de signatura topográfica y estado de conservación.",
    noIndex: true,
  });

  const {
    items,
    count,
    page,
    totalPages,
    status,
    search,
    isLoading: loadingItems,
    error: errorItems,
    refetch: refetchItems,
    setPage,
    setStatus,
    setSearch,
  } = useInventory();
  const { books } = useBooks();

  const booksById = useMemo(
    () =>
      Object.fromEntries(
        (books || []).map((b) => {
          const a = adaptBook(b);
          return [a.id, a];
        })
      ),
    [books]
  );

  const rows = useMemo(
    () => items.map((i) => adaptItem(i, booksById)),
    [items, booksById]
  );

  if (loadingItems && items.length === 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-in font-sans">
        <div className="w-9 h-9 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant text-xs font-mono uppercase tracking-widest">
          Consultando fondos de depósito y acervo…
        </p>
      </div>
    );
  }

  if (errorItems && items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 md:p-12 animate-fade-in font-sans">
        <div className="border border-error/40 bg-error/5 p-8 rounded-xs flex flex-col items-center text-center gap-4">
          <AlertTriangle className="w-8 h-8 text-error" />
          <h2 className="font-serif text-2xl text-on-surface font-medium">
            Depósito temporalmente inaccesible
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md">
            {errorItems}
          </p>
          <button
            type="button"
            onClick={() => refetchItems()}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-primary text-on-primary rounded-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar lectura
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12 font-sans animate-fade-in">
      <div className="mb-6">
        <GoBackButton />
      </div>

      <DescriptionOfInventory items={rows} totalCount={count} />

      <InventoryTable
        rows={rows}
        books={books}
        isLoading={loadingItems}
        onRefetch={refetchItems}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count}
        onPageChange={setPage}
        statusFilter={status}
        onStatusFilterChange={setStatus}
        searchTerm={search}
        onSearchChange={setSearch}
      />
    </main>
  );
};

export default Inventory;
