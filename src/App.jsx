import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Inventory from "./pages/Inventory";
import Error404 from "./pages/Error404";
import { Login } from "./pages/Login";
import BookDetail from "./pages/BookDetail";
import UserLayout from "./components/Layouts/UserLayout";
import { useState } from "react";
import AdminLayout from "./components/Layouts/AdminLayout";
import FoliumLanding from "./pages/FoliumLanding";
import ProtectedRoute from "./components/Authentication/ProtectedRoute";
import BookCatalog from "./pages/BookCatalog";

function App() {
  // Replace this with your actual auth state (e.g., from Redux, Context, or a hook)
  // const { isAuthenticated } = useAuth(); 

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route index element={<FoliumLanding/>} />
          <Route path="register" element={<></>} />
          <Route path="login" element={<Login />} />
          <Route path="book/:ISBN" element={<BookDetail />} />
            {/* element={
              isLoggedIn ? (
                isAdmin ? (
                  <Navigate to="admin" replace />
                ) : (
                  <Navigate to="user" replace />
                )
              ) : (
                <Navigate to="login" replace />
              )
            } */}


          {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        
          <Route path="user" element={<UserLayout />}>
            <Route index element={<Navigate to="catalog" replace />} />
            <Route path="catalog" element={<BookCatalog/>} />
            <Route path="favourites" element={<></>} />
          </Route>

          <Route path="librarian" element={<UserLayout />}>
            <Route index element={<Navigate to="inventory" replace />} />
            <Route path="inventory">
              <Route index element={<Inventory />} />
            </Route>
          </Route>

          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard">
              <Route index element={<></>} />
              <Route path="settings" element={<></>} />
            </Route>
          </Route>

        </Route>
          
        <Route path="*" element={<Error404 />} />

        </Routes>
      </BrowserRouter>
  );
}

export default App;
