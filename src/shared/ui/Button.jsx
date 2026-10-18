// Универсальная кнопка UI-кита (единая для всех разделов).
// Рендерится как <button> или, при наличии href, как <a> — стили одинаковые,
// классы вешаются на оба тега. Для ссылок-типографики (текстовых) отдельный
// компонент будет позже, сейчас только кнопки с видом кнопки.
//
// Пропсы:
// - variant  — вид: default | primary | danger | danger-outline | ghost | danger-ghost | text;
// - size     — md (по умолчанию) | sm | lg;
// - wide     — модификация: width: 100% (без неё — width: fit-content);
// - isSquare — квадратная кнопка под одну иконку (строго иконочная, без текста),
//              размер стороны берётся из токенов --btn-square-size-* по size.
// - className — дополнительные классы-модификаторы блока (например, btn--text-md:
//              на мобильных только иконка, текст появляется с брейкпоинта md —
//              текст при этом оборачивается в <span class="btn__label">).
// - type     — только для <button>, по умолчанию "button".
import { cn } from "@/shared/lib/cn";

export default function Button({
  href,
  variant = "default",
  size = "md",
  wide = false,
  isSquare = false,
  type = "button",
  className,
  children,
  ...props
}) {
  const classes = cn(
    "btn",
    variant !== "default" && `btn--${variant}`,
    size !== "md" && `btn--${size}`,
    wide && "btn--wide",
    isSquare && "btn--square",
    className
  );

  if (href !== undefined) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
