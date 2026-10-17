import { Suspense } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar.jsx";
import { log, logError } from "@/shared/lib/log.js";
import { useEffect } from "react";

// Общий shell приложения: сайдбар с навигацией по разделам и зона контента.
// Каждый раздел сам рендерит свой Header и main внутри <Outlet/>.
export default function AppLayout() {
  useEffect(() => {
    log("INIT: приложение готово");

    const onGlobalError = event => logError("GLOBAL JS ERROR", event.error || event.message);
    window.addEventListener("error", onGlobalError);
    return () => window.removeEventListener("error", onGlobalError);
  }, []);

  return (
    <div className="page">
      <Sidebar className="page__sidebar" />
      <div className="page__content">
        <Suspense
          fallback={
            <div className="loading" aria-live="polite">
              <span className="spinner"></span>
              <span>Загрузка</span>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}