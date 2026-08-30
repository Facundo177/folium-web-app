import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Inventory from "./pages/Inventory";
import Error404 from "./pages/Error404";
import Ejemplo from "./pages/Ejemplo";
// import SideNavigationBar from "./components/SideNavigationBar";
// import { useState } from "react";
import { Login } from "./pages/Login";

function App() {

  // const [isLogged, setIsLogged] = useState(false);



  return (
    <>
      <div className="antialiased min-h-screen flex font-body-md text-body-md selection:bg-tertiary-fixed selection:text-on-tertiary-fixed">
        {/* <header>
          <SideNavigationBar />
        </header> */}

        <main style={{ width: "100%" }}>
          <BrowserRouter>
            <Routes>
              <Route index element={<Ejemplo />} />
              <Route path="/login" element={<Login />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="*" element={<Error404 />} />
            </Routes>
          </BrowserRouter>
        </main>

        <footer></footer>
      </div>
    </>
  );
}

export default App;
