// Шапка раздела: заголовок страницы + зона действий справа (например, кнопки раздела).
export default function Header({ title, actions }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <div>
          <h1>{title}</h1>
        </div>
        {actions ? <div className="header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}