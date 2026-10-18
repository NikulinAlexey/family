import { useOutletContext } from "react-router";
import Button from "@/shared/ui/Button.jsx";
import Icon from "@/shared/ui/Icon.jsx";

// Шапка раздела: бургер сайдбара (слева, по аналогии с DeepSeek), заголовок
// страницы и зона действий справа (например, кнопки раздела).
// Состояние сайдбара поднимается в AppLayout и приходит через context роутера;
// если Header используется вне AppLayout — контекста нет, бургер не рендерится.
export default function Header({ title, actions }) {
  const { sidebarCollapsed, onToggleSidebar } = useOutletContext() || {};

  return (
    <header className="header">
      <div className="header__container container">
        {onToggleSidebar && (
          <Button
            className="header__sidebar-toggle"
            isSquare
            variant="ghost"
            title={sidebarCollapsed ? "Показать меню" : "Скрыть меню"}
            aria-label={sidebarCollapsed ? "Показать меню" : "Скрыть меню"}
            aria-expanded={!sidebarCollapsed}
            aria-controls="sidebar-nav"
            onClick={onToggleSidebar}
          >
            <Icon name="menu" />
          </Button>
        )}
        <div className="header__title">
          <h1>{title}</h1>
        </div>
        {actions ? <div className="header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
