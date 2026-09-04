import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Inventory from "./pages/Inventory";
import Error404 from "./pages/Error404";
import { Login } from "./pages/Login";
import BookDetail from "./pages/BookDetail";
import UserLayout from "./components/Layouts/UserLayout";
import { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            index
            element={
              isLoggedIn ? (
                isAdmin ? (
                  <Navigate to="admin" replace />
                ) : (
                  <Navigate to="user" replace />
                )
              ) : (
                <Navigate to="login" replace />
              )
            }
          />

          <Route path="user" element={<UserLayout />}>
            <Route index element={<Navigate to="inventory" replace />} />
            <Route path="inventory">
              <Route index element={<Inventory />} />
              <Route path="book/:ISBN" element={<BookDetail />} />
            </Route>
          </Route>

          <Route path="admin">
            <Route path="dashboard">
              <Route index element={<></>} />
              <Route path="settings" element={<></>} />
            </Route>
          </Route>

          <Route path="login" element={<Login />} />
          <Route path="*" element={<Error404 />} />
          <Route />
        </Routes>
      </BrowserRouter>

      <footer></footer>
    </>
  );
}

export default App;
