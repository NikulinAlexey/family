import { NavLink } from "react-router";
import { cn } from "@/shared/lib/cn";
import Icon from "@/shared/ui/Icon.jsx";

// Навигация по подприложениям общего приложения «Семья».
// Каждый пункт — ссылка на раздел из реестра routes.jsx.
const NAV_ITEMS = [
  { to: "/tasks", icon: "check", label: "Задачи" },
  { to: "/reciept", icon: "cooking", label: "Рецепты" },
  { to: "/ui-kit", icon: "diamond", label: "UI-кит" }
];

// Тумблер сайдбара (бургер) живёт в шапке раздела — shared/ui/Header.jsx.
// Здесь только навигация; состояние collapsed/onToggle приходят из AppLayout.
export default function Sidebar({ className, collapsed, onToggle }) {
  // На мобильных сайдбар — выдвижной ящик: после выбора раздела закрываем его.
  const handleNavClick = () => {
    const isMobile = !window.matchMedia("(min-width: 768px)").matches;
    if (isMobile && !collapsed) onToggle();
  };

  return (
    <>
      {/* Подложка выдвижного ящика (только мобильные): клик закрывает сайдбар. */}
      <div
        className={cn("sidebar-backdrop", !collapsed && "sidebar-backdrop--visible")}
        onClick={onToggle}
        aria-hidden="true"
      />
      <aside className={cn(className, "sidebar", collapsed && "sidebar--collapsed")}>
        <div className="sidebar__container">
          <nav className="sidebar__nav" id="sidebar-nav" aria-label="Разделы">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) => cn("sidebar-link", isActive && "sidebar-link--active")}
                title={item.label}
              >
                <span className="sidebar-link__icon">
                  <Icon name={item.icon} size={22} />
                </span>
                <span className="sidebar-link__text">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}