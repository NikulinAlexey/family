import { Suspense } from "react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar.jsx";
import { log, logError } from "@/shared/lib/log.js";

// Ключ localStorage с состоянием сайдбара ("1" — свёрнут, "0" — развёрнут).
// Выбор живёт между перезагрузками — как в DeepSeek.
const SIDEBAR_STORAGE_KEY = "family:sidebar-collapsed";

// Первый запуск: сохранённый выбор из localStorage, иначе на десктопе сайдбар
// развёрнут, на мобильных (<768px) — свёрнут (ящик открывается бургером в шапке).
function readInitialCollapsed() {
  const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  if (saved !== null) return saved === "1";
  return !window.matchMedia("(min-width: 768px)").matches;
}

// Общий shell приложения: сайдбар с навигацией по разделам и зона контента.
// Каждый раздел сам рендерит свой Header и main внутри <Outlet/>.
// Состояние «схлопнут ли сайдбар» живёт здесь: оно нужно и сайдбару (ширина /
// выдвижной ящик), и бургеру-тумблеру в шапке разделов — состояние передаётся
// в сайдбар пропсами, в разделы — через context роутера (<Outlet context>).
export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readInitialCollapsed);

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  useEffect(() => {
    log("INIT: приложение готово");

    const onGlobalError = event => logError("GLOBAL JS ERROR", event.error || event.message);
    window.addEventListener("error", onGlobalError);
    return () => window.removeEventListener("error", onGlobalError);
  }, []);

  return (
    <div className="page">
      <Sidebar className="page__sidebar" collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="page__content">
        <Suspense
          fallback={
            <div className="loading" aria-live="polite">
              <span className="spinner"></span>
              <span>Загрузка</span>
            </div>
          }
        >
          <Outlet context={{ sidebarCollapsed, onToggleSidebar: toggleSidebar }} />
        </Suspense>
      </div>
    </div>
  );
}