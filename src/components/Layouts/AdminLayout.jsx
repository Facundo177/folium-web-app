import { Outlet } from "react-router-dom";
import SideNavigationBar from "../SideNavigationBar";

export default function AdminLayout() {
  return (
    <div className="antialiased min-h-screen flex font-body-md text-body-md selection:bg-tertiary-fixed selection:text-on-tertiary-fixed">
        <SideNavigationBar/>
        <main style={{ width: "100%" }}>
            <Outlet/>
        </main>
      </div>
  );
}