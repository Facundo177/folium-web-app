import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Render a themed loading spinner or skeleton screen here
    return <div className="min-h-screen bg-background flex items-center justify-center">Cargando archivos...</div>;
  }

  if (!user) {
    // Not logged in -> send to login page, saving the route they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role -> send to a default dashboard or 403 page
    return <Navigate to="/catalog" replace />;
  }

  // Authorized -> render the child routes
  return <Outlet />;
}