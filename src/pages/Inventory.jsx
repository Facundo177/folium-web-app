import InventorySection from "../components/InventorySection";
import PageHeader from "../components/PageHeader";
import StatsRow from "../components/StatsRow";
import TopNavigationBar from "../components/TopNavigationBar";

export const Inventory = () => {
  return (
    <>
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopNavigationBar />

        <div className="flex-1 p-margin-edge md:p-stack-lg max-w-[1280px] mx-auto w-full">
          <PageHeader />
          <StatsRow />
          <InventorySection />
        </div>
      </main>
    </>
  );
};

export default Inventory;
