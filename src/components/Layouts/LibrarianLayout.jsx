import { Outlet } from "react-router-dom";
import Sidebar from "../SideBar";

export default function LibrarianLayout({isDarkMode, setIsDarkMode}) {
  return (
    <div className="antialiased min-h-screen flex font-body-md text-body-md selection:bg-tertiary-fixed selection:text-on-tertiary-fixed">
        <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}/>
        <div style={{ width: "100%" }}>
            <Outlet/>
        </div>
      </div>
  );
}