import { useMemo } from "react";
import DescriptionOfInventory from "../components/InventoryComponents/DescriptionOfInventory";
import InventoryTable from "../components/InventoryComponents/InventoryTable";
// import PageHeader from "../components/PageHeader";
// import StatsRow from "../components/StatsRow";
import TopNavigationBar from "../components/TopNavigationBar";
import { useInventory } from "../hooks/useInventory";
import { useBooks } from "../hooks/useBooks";
import { adaptBook, adaptItem } from "../api/adapters";

export const Inventory = () => {
  const { items, isLoading: loadingItems, error: errorItems } = useInventory();
  const { books, isLoading: loadingBooks, error: errorBooks } = useBooks();

  const booksById = useMemo(
    () => Object.fromEntries(books.map((b) => { const a = adaptBook(b); return [a.id, a]; })),
    [books]
  );

  const rows = useMemo(
    () => items.map((i) => adaptItem(i, booksById)),
    [items, booksById]
  );

  if (loadingItems || loadingBooks) return <p className="p-gutter">Cargando inventario…</p>;
  if (errorItems || errorBooks) return <p className="p-gutter">{errorItems || errorBooks}</p>;

  return (
    <>
      <main className="flex-1 flex flex-col min-h-screen">
        <TopNavigationBar />

        <div className="flex-1 p-margin-edge md:p-stack-lg max-w-[1280px] mx-auto w-full">
          {/* <PageHeader />
          <StatsRow /> */}
          <DescriptionOfInventory items={rows}/>
          <InventoryTable rows={rows}/>
        </div>
      </main>
    </>
  );
};

export default Inventory;
