import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Inventory from "./pages/Inventory";
import Error404 from "./pages/Error404";
import BookDetail from "./pages/BookDetail";
import UserLayout from "./components/Layouts/UserLayout";
import LibrarianLayout from "./components/Layouts/LibrarianLayout";
import FoliumLanding from "./pages/FoliumLanding";
import BookCatalog from "./pages/BookCatalog";
import Test from "./pages/Test";
import AuthLayout from "./components/Layouts/AuthLayout";
import LoginForm from "./components/Login&RegisterComponents/LoginForm";
import RegisterForm from "./components/Login&RegisterComponents/RegisterForm";
import BotLayout from "./components/Layouts/BotLayout";
import ProtectedRoute from "./auth/ProtectedRoute";

import { useEffect, useState } from "react";


function App() {
  const [isDarkMode] = useState(false);
  // Alternar tema oscuro en el tag HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);


  // Replace this with your actual auth state (e.g., from Redux, Context, or a hook)
  // const { isAuthenticated } = useAuth(); 

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
          {import.meta.env.DEV && <Route path="test" element={<Test />} />}
          <Route path="book">
            <Route index element={<Navigate to="9780140449266" replace />} /> 
            {/* The Count of Monte Cristo */}
            <Route path=":ISBN" element={<BookDetail />} />
          </Route>


          {/* Shared Protected Routes (Any logged in user) */}
          <Route element={<ProtectedRoute allowedRoles={['USER', 'LIBRARIAN', 'ADMIN']} />}>
            <Route path="user" element={<UserLayout />}>
              <Route index element={<Navigate to="catalog" replace />} />
              <Route path="catalog" element={<BookCatalog/>} />
              <Route path="favourites" element={<></>} />
            </Route>
          </Route>

          {/* Librarian & Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']} />}>
            <Route path="librarian" element={<UserLayout />}>
              <Route index element={<Navigate to="inventory" replace />} />
              <Route path="inventory">
                <Route index element={<Inventory />} />
              </Route>
            </Route>

            <Route path="admin" element={<LibrarianLayout />}>
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
