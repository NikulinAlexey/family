Приложение «Семья»: единый фронтенд для нескольких подприложений семьи.

АРХИТЕКТУРА (расширяемая)
=========================
Один base URL, разделение по путям:

  /          -> редирект на /tasks
  /tasks     -> to-do list (src/apps/tasks)
  /reciept   -> рецепты семьи (src/apps/recipes)
  /ui-kit    -> витрина общего UI-кита (src/apps/uikit)

Структура:
  src/app/      — shell приложения: router (App.jsx), реестр маршрутов
                  (routes.jsx), layout с сайдбаром (AppLayout.jsx, Sidebar.jsx)
  src/shared/   — ОБЩЕЕ для всех разделов:
      ui/       — UI-кит: Modal, ConfirmModal, Header
      lib/      — утилиты: cn, log, format
  src/apps/     — подприложения, каждое в своём каталоге:
      tasks/    — задачи (components/, model/, scss/)
      recipes/  — рецепты (каркас)
      uikit/    — страница-витрина UI-кита (/ui-kit)

Как добавить новый раздел:
  1. Создать src/apps/<name>/<Name>App.jsx (и при необходимости model/, scss/).
  2. Добавить одну запись в src/app/routes.jsx:
       { path: "name/*", element: <NameApp /> }  (через lazy())
  3. Добавить пункт в NAV_ITEMS в src/app/Sidebar.jsx.
  Общий переиспользуемый компонент — в src/shared/ui (+.demo на /ui-kit).

UI-КИТ
======
Отдельная страница: /ui-kit. Показывает только компоненты из src/shared/,
те же, что используют подприложения — расхождения «демо vs прод» нет.

ЗАПУСК
======
  npm install
  npm run dev      — дев-сервер Vite
  npm run build    — прод-сборка в dist/
  npm run preview  — локальный просмотр прод-сборки

ДАННЫЕ
======
Мок-версия: данные задач хранятся в localStorage.
1. Заголовок «Задачи».
2. Кнопка «Очистить историю» в окне истории.
3. Раздел «Периодические» показывает повторяющиеся задания и максимум 4 последние даты выполнения каждого.
4. У срочных заданий: через 4 дня — оранжевый, через 6 дней — красный. Несрочные не окрашиваются.
5. У повторяющихся заданий отображается значок ↻.

ДЕПЛОЙ НА ОДИН СЕРВЕР
======================
Фронтенд — статика из dist/, бэкенд (API) — ваш отдельный сервер.
Обязателен SPA-fallback: любой неизвестный путь отдаёт index.html,
иначе прямой заход на /tasks или /reciept даст 404.

Nginx:
  server {
    listen 80;
    root /var/www/family/dist;
    location /api/ {
      proxy_pass http://127.0.0.1:3000;   # ваш API
    }
    location / {
      try_files $uri $uri/ /index.html;    # SPA-fallback
    }
  }

Express (если сервер на Node):
  app.use(express.static(dist));
  app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
  // API-роуты регистрируются ДО fallback: app.use("/api", apiRouter)

Старая vanilla-версия сохранена в legacy/ (app.js, style.css, _test_*.html).
