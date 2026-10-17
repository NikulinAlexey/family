// Сборка SVG-спрайта из src/shared/assets/icons/*.svg в
// src/shared/assets/icons.sprite.svg (генерируется, в git не коммитится).
// Каждый <имя>.svg становится <symbol id="icon-<имя>">; атрибуты корневого
// <svg> (viewBox, fill, stroke, stroke-*) переносятся на symbol, чтобы иконки
// наследовали currentColor от кнопки/текста.
//
// Запуск вручную: npm run sprite (node scripts/build-sprite.mjs).
// Автоматически: vite-плагин iconSprite() в vite.config.js — при каждом старте
// dev-сервера, при каждой сборке и при изменении файлов иконок в dev.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ICONS_DIR = join(ROOT, "src", "shared", "assets", "icons");
export const SPRITE_FILE = join(ROOT, "src", "shared", "assets", "icons.sprite.svg");

// Атрибуты корневого <svg>, которые переносятся на <symbol>.
const PASSTHROUGH = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-dashoffset"
];

export function buildSprite() {
  mkdirSync(ICONS_DIR, { recursive: true });

  const files = readdirSync(ICONS_DIR)
    .filter(name => name.toLowerCase().endsWith(".svg"))
    .sort((a, b) => a.localeCompare(b, "ru"));

  const symbols = files.map(name => {
    const id = `icon-${name.replace(/\.svg$/i, "")}`;
    const source = readFileSync(join(ICONS_DIR, name), "utf8").trim();

    const openTag = source.match(/<svg\b([^>]*)>/i);
    const attrs = openTag ? openTag[1] : "";
    const inner = source
      .replace(/^[\s\S]*?<svg\b[^>]*>/i, "")
      .replace(/<\/svg\s*>[\s\S]*$/i, "")
      .trim();

    const viewBoxMatch = attrs.match(/viewBox="([^"]+)"/i);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";

    const passthrough = PASSTHROUGH
      .map(attr => {
        const match = attrs.match(new RegExp(`\\b${attr}="([^"]+)"`, "i"));
        return match ? ` ${attr}="${match[1]}"` : "";
      })
      .join("");

    return `  <symbol id="${id}" viewBox="${viewBox}"${passthrough}>\n    ${inner}\n  </symbol>`;
  });

  const sprite = [
    "<!-- GENERATED FILE — не редактируйте вручную.",
    "     Источник: src/shared/assets/icons/*.svg, сборка: scripts/build-sprite.mjs. -->",
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none" aria-hidden="true">',
    ...symbols,
    "</svg>",
    ""
  ].join("\n");

  // Перезаписываем только при реальном изменении: иначе Vite-watcher увидит
  // новый mtime и сделает лишний page reload при каждом старте dev.
  const previous = existsSync(SPRITE_FILE) ? readFileSync(SPRITE_FILE, "utf8") : null;
  if (previous !== sprite) {
    writeFileSync(SPRITE_FILE, sprite, "utf8");
    return { count: files.length, output: SPRITE_FILE, changed: true };
  }
  return { count: files.length, output: SPRITE_FILE, changed: false };
}

// CLI-режим (npm run sprite). При импорте из vite.config.js модуль не печатает
// ничего и ничего не выполняет — сборку запускают хуки плагина.
const isDirectRun = String(process.argv[1] ?? "")
  .replace(/\\/g, "/")
  .endsWith("build-sprite.mjs");

if (isDirectRun) {
  const result = buildSprite();
  console.log(`[sprite] собрано иконок: ${result.count} -> ${result.output}`);
}
