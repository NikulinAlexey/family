// Универсальное модальное окно: оверлей + карточка с шапкой, контентом и футером.
// - title — заголовок в шапке карточки;
// - onClose — закрытие по крестику (если не передан — крестика нет);
// - overlayClosable — клик по затемнению снаружи карточки закрывает окно;
// - children — контент карточки;
// - footer — ReactNode с кнопками внизу карточки (обычно фрагмент с кнопками).
// Окно видимо, пока оно смонтировано: контент каждый раз начинается с чистого состояния.
export default function Modal({ title, onClose, overlayClosable = false, className = "", children, footer }) {
  const classes = ["modal", "show"];
  if (className) classes.push(className);

  const handleOverlayClick = event => {
    if (!overlayClosable || !onClose) return;
    // Закрываем только при клике строго по оверлею, а не по карточке.
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className={classes.join(" ")} onClick={handleOverlayClick}>
      <div className="card" role="dialog" aria-modal="true" aria-label={title}>
        <div className="head">
          <h2>{title}</h2>
          {onClose && (
            <button type="button" aria-label="Закрыть" onClick={onClose}>×</button>
          )}
        </div>

        {children}

        {footer ? <div className="actions">{footer}</div> : null}
      </div>
    </div>
  );
}