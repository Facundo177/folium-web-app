import { Outlet } from "react-router-dom";
import Sidebar from "../SideBar";

export default function UserLayout() {
  return (
    <div className="antialiased min-h-screen flex flex-col lg:flex-row bg-background font-body-md text-body-md selection:bg-tertiary-container selection:text-on-tertiary-container">
      <Sidebar />
      <div className="flex-1 w-full min-w-0 pt-14 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
}
