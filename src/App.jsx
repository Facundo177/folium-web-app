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

import Profile from "./pages/Profile";
import LoadBook from "./pages/LoadBook";
import Favourites from "./pages/Favourites";
import LoansDashboard from "./pages/LoansDashboard";
import ReservationDashboard from "./pages/ReservationDashboard";
import UserReservations from "./pages/UserReservations";
import UserLoans from "./pages/UserLoans";
import AddAnItem from "./pages/AddAnItem";

// El tema (claro/oscuro) vive en ThemeProvider (ver main.jsx).
// No se guarda estado acá para evitar re-renderizar todo el árbol de rutas al cambiar de tema.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<BotLayout />}>
          <Route index element={<FoliumLanding />} />
          <Route element={<AuthLayout />}>
            <Route path="register" element={<RegisterForm />} />
            <Route path="login" element={<LoginForm />} />
          </Route>
          {import.meta.env.DEV && <Route path="test" element={<Test />} />}

          {/* Shared Protected Routes (Any logged in user) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["USER", "LIBRARIAN", "ADMIN"]} />
            }
          >
            <Route path="book">
              <Route index element={<Navigate to="/user/catalog" replace />} />
              <Route path=":id" element={<BookDetail />} />
            </Route>

            <Route path="catalog" element={<UserLayout />}>
              <Route index element={<BookCatalog />} />
            </Route>

            <Route path="user" element={<UserLayout />}>
              <Route index element={<Navigate to="/catalog" replace />} />
              <Route path="favourites" element={<Favourites />} />
              <Route path="loans" element={<UserLoans />} />
              <Route path="profile" element={<Profile />} />
              <Route path="reservations" element={<UserReservations />} />
            </Route>
          </Route>

          {/* Librarian & Admin Routes */}
          <Route
            element={<ProtectedRoute allowedRoles={["LIBRARIAN", "ADMIN"]} />}
          >
            <Route path="librarian" element={<LibrarianLayout />}>
              <Route index element={<Navigate to="inventory" replace />} />
              <Route path="catalog" element={<BookCatalog />} />
              <Route path="inventory">
                <Route index element={<Inventory />} />
                <Route path="newBook" element={<LoadBook />} />
                <Route path="newItem" element={<AddAnItem />} />
              </Route>
              <Route path="loans" element={<LoansDashboard />} />
              <Route path="reservations" element={<ReservationDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
