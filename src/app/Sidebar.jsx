import { useState } from "react";
import { NavLink } from "react-router";
import { cn } from "@/shared/lib/cn";

// Навигация по подприложениям общего приложения «Семья».
// Каждый пункт — ссылка на раздел из реестра routes.jsx.
const NAV_ITEMS = [
  { to: "/tasks", icon: "✓", label: "Задачи" },
  { to: "/reciept", icon: "🍳", label: "Рецепты" },
  { to: "/ui-kit", icon: "◈", label: "UI-кит" }
];

export default function Sidebar({ className }) {
  // Компактный режим: burger сворачивает сайдбар в узкий рельс с иконками.
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(prev => !prev);

  return (
    <aside className={cn(className, "sidebar", collapsed && "sidebar--collapsed")}>
      <div className="sidebar__container">
        <button
          className="sidebar-burger"
          type="button"
          title={collapsed ? "Развернуть меню" : "Свернуть меню"}
          aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
          aria-expanded={!collapsed}
          aria-controls="sidebar-nav"
          onClick={toggleSidebar}
        >
          ☰
        </button>

        <nav className="sidebar__nav" id="sidebar-nav" aria-label="Разделы">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn("sidebar-link", isActive && "sidebar-link--active")}
              title={item.label}
            >
              <span className="sidebar-link__icon">{item.icon}</span>
              <span className="sidebar-link__text">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}