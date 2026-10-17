import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { buildSprite, ICONS_DIR } from "./scripts/build-sprite.mjs";

// Сборка SVG-спрайта иконок (src/shared/assets/icons/*.svg):
// - buildStart — при каждом запуске dev-сервера и при каждой прод-сборке;
// - watcher    — в dev пересобирает спрайт при добавлении/изменении/удалении
//                файлов иконок и дёргает full-reload (main.jsx импортирует
//                спрайт через ?raw, поэтому подхватит новый файл).
function iconSprite() {
  let server;

  // Страховка на время загрузки конфига (до buildStart): спрайт существует
  // в любом случае, даже если main.jsx запросится необычно рано.
  buildSprite();

  const iconsPrefix = ICONS_DIR.replace(/\\/g, "/") + "/";
  const rebuild = file => {
    const normalized = String(file).replace(/\\/g, "/");
    if (!normalized.startsWith(iconsPrefix) || !normalized.endsWith(".svg")) return;
    const { count, output, changed } = buildSprite();
    if (changed) console.log(`[sprite] пересобрано (dev): ${count} иконок -> ${output}`);
    if (server && changed) server.ws.send({ type: "full-reload", path: "*" });
  };

  return {
    name: "family:icon-sprite",
    buildStart() {
      const { count, output, changed } = buildSprite();
      console.log(`[sprite] ${changed ? "собрано" : "без изменений"}: ${count} иконок -> ${output}`);
    },
    configureServer(devServer) {
      server = devServer;
      devServer.watcher.on("add", rebuild);
      devServer.watcher.on("change", rebuild);
      devServer.watcher.on("unlink", rebuild);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  // Абсолютный base обязателен для SPA-роутинга: ассеты на /tasks и /reciept
  // иначе искались бы в подкаталогах маршрута.
  base: "/",
  plugins: [react(), iconSprite()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
});
