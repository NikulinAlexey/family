import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./scss/main.scss";
// SVG-спрайт иконок: файл генерируется scripts/build-sprite.mjs на каждом
// запуске dev/билда (см. vite.config.js), импорт ?raw встраивает его в DOM,
// чтобы <use href="#icon-..."> работал без отдельного запроса.
import iconsSprite from "./shared/assets/icons.sprite.svg?raw";
import App from "./app/App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Хранилище спрайта: скрыто, но доступно по id для <use> из иконок. */}
    <div className="svg-sprite" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconsSprite }} />
    <App />
  </StrictMode>
);
