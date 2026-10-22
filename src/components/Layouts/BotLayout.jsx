import { Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

// Carga bajo demanda del Asistente Virtual para no penalizar la carga inicial
const FoliumBot = lazy(() => import("../../chatbot/FoliumBot"));

export default function BotLayout() {
  return (
    <div>
      <Suspense fallback={null}>
        <FoliumBot />
      </Suspense>
      <main style={{ width: "100%" }}>
        <Outlet />
      </main>
    </div>
  );
}
