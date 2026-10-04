import { Outlet } from "react-router-dom";
import SideNavigationBar from "../SideNavigationBar";
import Sidebar from "../SideBar";

export default function UserLayout() {
  return (
    <div className="antialiased min-h-screen flex font-body-md text-body-md selection:bg-tertiary-fixed selection:text-on-tertiary-fixed">
        <Sidebar/>
        <main style={{ width: "100%" }}>
            <Outlet/>
        </main>
      </div>
  );
}