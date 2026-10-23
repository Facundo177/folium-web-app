import { Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "../../auth/AuthProvider";

// Carga bajo demanda del Asistente Virtual para no penalizar la carga inicial
const FoliumBot = lazy(() => import("../../chatbot/FoliumBot"));

export default function BotLayout() {
  const { user } = useAuth();

  return (
    <div>
      {/* El asistente virtual solo se muestra a usuarios registrados */}
      {user && (
        <Suspense fallback={null}>
          <FoliumBot />
        </Suspense>
      )}
      <main style={{ width: "100%" }}>
        <Outlet />
      </main>
    </div>
  );
}
