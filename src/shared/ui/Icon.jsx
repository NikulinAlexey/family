// Иконка из SVG-спрайта.
// Спрайт src/shared/assets/icons.sprite.svg генерируется scripts/build-sprite.mjs
// при старте dev-сервера и при каждой сборке (vite.config.js -> iconSprite),
// инлайнится в DOM из main.jsx, поэтому <use href="#icon-..."> работает без
// отдельных запросов (dev и прод одинаково).
//
// Пропсы:
// - name — имя файла иконки в src/shared/assets/icons без .svg;
// - size — размер в px; цвет наследуется от кнопки/текста (stroke: currentColor).
import { cn } from "@/shared/lib/cn";

export default function Icon({ name, size = 20, className, ...props }) {
  return (
    <svg
      className={cn("icon", className)}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <use href={`#icon-${name}`} />
    </svg>
  );
}
