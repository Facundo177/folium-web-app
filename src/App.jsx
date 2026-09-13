import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Inventory from "./pages/Inventory";
import Error404 from "./pages/Error404";
import BookDetail from "./pages/BookDetail";
import UserLayout from "./components/Layouts/UserLayout";
import { useState } from "react";
import AdminLayout from "./components/Layouts/AdminLayout";
import FoliumLanding from "./pages/FoliumLanding";
import ProtectedRoute from "./components/Authentication/ProtectedRoute";
import BookCatalog from "./pages/BookCatalog";
import AuthLayout from "./components/Layouts/AuthLayout";
import LoginForm from "./components/Login&RegisterComponents/LoginForm";
import RegisterForm from "./components/Login&RegisterComponents/RegisterForm";
import BotLayout from "./components/Layouts/BotLayout";

function App() {
  // Replace this with your actual auth state (e.g., from Redux, Context, or a hook)
  // const { isAuthenticated } = useAuth(); 

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  // const [isAdmin, setIsAdmin] = useState(false);

  return (
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<BotLayout/>}>

          <Route index element={<FoliumLanding/>} />
          <Route element={<AuthLayout/>}>
            <Route path="register" element={<RegisterForm />} />
            <Route path="login" element={<LoginForm />} />
          </Route>
          <Route path="book">
            <Route index element={<Navigate to="9780140449266" replace />} /> 
            {/* The Count of Monte Cristo */}
            <Route path=":ISBN" element={<BookDetail />} />
          </Route>


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

                  </Route>

        </Routes>
      </BrowserRouter>
  );
}

export default App;
