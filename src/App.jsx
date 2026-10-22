import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

// Layouts principales (mantenidos estáticos para transiciones inmediatas)
import UserLayout from "./components/Layouts/UserLayout";
import LibrarianLayout from "./components/Layouts/LibrarianLayout";
import AuthLayout from "./components/Layouts/AuthLayout";
import BotLayout from "./components/Layouts/BotLayout";
import ProtectedRoute from "./auth/ProtectedRoute";

// Páginas con carga perezosa (Code-Splitting con React.lazy)
const FoliumLanding = lazy(() => import("./pages/FoliumLanding"));
const BookCatalog = lazy(() => import("./pages/BookCatalog"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const LoginForm = lazy(
  () => import("./components/Login&RegisterComponents/LoginForm"),
);
const RegisterForm = lazy(
  () => import("./components/Login&RegisterComponents/RegisterForm"),
);

// Páginas de usuario y administración
const Profile = lazy(() => import("./pages/Profile"));
const Favourites = lazy(() => import("./pages/Favourites"));
const UserLoans = lazy(() => import("./pages/UserLoans"));
const UserReservations = lazy(() => import("./pages/UserReservations"));
const Inventory = lazy(() => import("./pages/Inventory"));
const LoadBook = lazy(() => import("./pages/LoadBook"));
const AddAnItem = lazy(() => import("./pages/AddAnItem"));
const LoansDashboard = lazy(() => import("./pages/LoansDashboard"));
const ReservationDashboard = lazy(() => import("./pages/ReservationDashboard"));
const Error404 = lazy(() => import("./pages/Error404"));
const Test = lazy(() => import("./pages/Test"));

// Indicador de carga discreto para transiciones de ruta
function PageLoader() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 text-on-surface">
      <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
      <span className="font-serif italic text-sm text-on-surface-variant">
        Consultando archivo…
      </span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rutas Públicas con Botón de Asistente */}
          <Route index element={<FoliumLanding />} />
          <Route element={<BotLayout />}>
            {/* Catálogo público accesible para invitados */}
            <Route path="catalog" element={<UserLayout />}>
              <Route index element={<BookCatalog />} />
            </Route>

            {/* Ficha de libro pública (con vista limitada para no registrados) */}
            <Route path="book" element={<UserLayout />}>
              <Route index element={<Navigate to="/catalog" replace />} />
              <Route path=":id" element={<BookDetail />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="register" element={<RegisterForm />} />
              <Route path="login" element={<LoginForm />} />
            </Route>

            {import.meta.env.DEV && <Route path="test" element={<Test />} />}

            {/* Rutas protegidas para usuarios registrados (Lectores, Bibliotecarios y Admin) */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["USER", "LIBRARIAN", "ADMIN"]} />
              }
            >
              <Route path="user" element={<UserLayout />}>
                <Route index element={<Navigate to="/catalog" replace />} />
                <Route path="favourites" element={<Favourites />} />
                <Route path="loans" element={<UserLoans />} />
                <Route path="profile" element={<Profile />} />
                <Route path="reservations" element={<UserReservations />} />
              </Route>
            </Route>

            {/* Rutas exclusivas para Bibliotecarios y Administradores */}
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
