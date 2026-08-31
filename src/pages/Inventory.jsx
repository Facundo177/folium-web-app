
import DescriptionOfInventory from "../components/DescriptionOfInventory";
import InventoryTable from "../components/InventoryTable";
// import PageHeader from "../components/PageHeader";
// import StatsRow from "../components/StatsRow";
import TopNavigationBar from "../components/TopNavigationBar";

export const Inventory = () => {
  return (
    <>
      <main className="flex-1 flex flex-col min-h-screen">
        <TopNavigationBar />

        <div className="flex-1 p-margin-edge md:p-stack-lg max-w-[1280px] mx-auto w-full">
          {/* <PageHeader />
          <StatsRow /> */}
          <DescriptionOfInventory/>
          <InventoryTable />
        </div>
      </main>
    </>
  );
};

export default Inventory;
