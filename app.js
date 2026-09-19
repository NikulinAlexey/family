// ============================================================
// НАШИ ЗАДАНИЯ — DEBUG VERSION
// В этой версии каждое важное действие пишется в Console.
// Открыть консоль на компьютере: F12 → Console.
// На iPhone удобно смотреть через Safari Web Inspector с Mac.
// ============================================================

// In-memory mock data persisted in localStorage instead of Supabase or mock-db.js
const MOCK_FAMILY_ID = "11111111-1111-1111-1111-111111111111";

// Task class — encapsulates all task logic and state
class Task {
  constructor({ id, text, family_id, created_at, repeat_days, next_due_at }) {
    this.id = id || `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.text = text;
    this.family_id = family_id || MOCK_FAMILY_ID;
    this.created_at = created_at || new Date().toISOString();
    this.repeat_days = repeat_days || null;
    this.next_due_at = next_due_at || null;
  }

  // Static factory method to create from plain object (e.g., from storage)
  static fromObject(obj) {
    return new Task(obj);
  }

  // Returns true if task is due now or overdue
  isDue() {
    if (!this.next_due_at) return true;
    return new Date(this.next_due_at).getTime() <= Date.now();
  }

  // Marks task as completed and returns next due date if repeating
  complete() {
    if (this.repeat_days) {
      const completedAt = new Date();
      const nextDueAt = new Date(
        completedAt.getTime() + this.repeat_days * 24 * 60 * 60 * 1000
      );
      this.next_due_at = nextDueAt.toISOString();
      return nextDueAt;
    }
    return null;
  }

  // Converts to plain object for serialization/storage
  toObject() {
    return {
      id: this.id,
      text: this.text,
      family_id: this.family_id,
      created_at: this.created_at,
      repeat_days: this.repeat_days,
      next_due_at: this.next_due_at,
    };
  }
}

// Load tasks from localStorage on startup
function loadTasksFromStorage() {
  const stored = localStorage.getItem("tasks");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map(Task.fromObject);
    } catch (e) {
      console.warn("Failed to parse tasks from localStorage, using defaults", e);
    }
  }
  // Default tasks if localStorage is empty or invalid
  return [
    Task.fromObject({ id: "t_1", text: "Помыть посуду", family_id: MOCK_FAMILY_ID, created_at: new Date(Date.now() - 86400000).toISOString(), repeat_days: null }),
    Task.fromObject({ id: "t_2", text: "Сделать уроки", family_id: MOCK_FAMILY_ID, created_at: new Date(Date.now() - 172800000).toISOString(), repeat_days: 1 }),
    Task.fromObject({ id: "t_3", text: "Прогуляться с собакой", family_id: MOCK_FAMILY_ID, created_at: new Date(Date.now() - 259200000).toISOString(), repeat_days: 7 }),
  ];
}

// Save tasks to localStorage
function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks.map(t => t.toObject())));
}

// Tasks array — each item is a Task instance, loaded from and saved to localStorage
let _tasks = loadTasksFromStorage();

// Mock task history array — kept in memory only, not persisted
let _taskHistory = [
  { id: "h_1", task_id: "t_1", text: "Помыть посуду", family_id: MOCK_FAMILY_ID, completed_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "h_2", task_id: "t_2", text: "Сделать уроки", family_id: MOCK_FAMILY_ID, completed_at: new Date(Date.now() - 7200000).toISOString() },
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let familyId = null;
let editId = null;
let deleteId = null;
let realtimeChannel = null;

const $ = (id) => document.getElementById(id);

// Logging helpers — optimized for readability and performance
const log = (message, data) => {
  if (data === undefined) {
    console.log(`[APP] ${message}`);
  } else {
    console.log(`[APP] ${message}`, data);
  }
};
const logStep = (step, data) => {
  if (data === undefined) {
    console.groupCollapsed(`%c[APP STEP] ${step}`, "font-weight:bold");
  } else {
    console.groupCollapsed(`%c[APP STEP] ${step}`, "font-weight:bold", data);
  }
};
const logError = (message, error, extra = null) => {
  console.group(`[APP ERROR] ${message}`);
  console.error("error:", error);
  if (extra) console.log("details:", extra);
  console.groupEnd();
};

function show(id) {
  log(`UI: показать #${id}`);
  const el = $(id);
  el.classList.remove("hidden");
  if (el.classList.contains("modal")) {
    el.classList.add("show");
  }
}

function hide(id) {
  log(`UI: скрыть #${id}`);
  const el = $(id);
  el.classList.add("hidden");
  if (el.classList.contains("modal")) {
    el.classList.remove("show");
  }
}

function describeResponse(response) {
  return {
    data: response?.data ?? null,
    error: response?.error
      ? {
          message: response.error.message,
          details: response.error.details,
          hint: response.error.hint,
          code: response.error.code,
        }
      : null,
    status: response?.status,
    statusText: response?.statusText,
  };
}

// Simplified family ID handling — no auth, no RPC, no network
function ensureFamily() {
  log("Проверка familyId", familyId);

  if (!familyId || !UUID_RE.test(String(familyId))) {
    // Hardcode family ID for demo — no prompt, no localStorage persistence for family
    familyId = MOCK_FAMILY_ID;
    log("familyId установлен в дефолтное значение", familyId);
  }

  log("familyId корректный", familyId);
}

// No authentication or family connection needed — hardcoded family ID
function auth() {
  logStep("AUTH: авторизация отключена — демо-режим");
  return { user: { id: "demo-user" } };
}

function connectToFamily() {
  logStep("FAMILY: подключение к семье отключено — демо-режим");
  familyId = MOCK_FAMILY_ID;
  return familyId;
}

function loadTasks() {
  logStep("TASKS: загрузка заданий");
  ensureFamily();

  $("loading").classList.remove("hidden");
  $("empty").classList.add("hidden");

  log("TASKS: запрос", {
    table: "tasks",
    familyId,
    select: "*",
    order: "created_at asc",
  });

  // Load from localStorage and filter by family
  const allTasks = _tasks.filter(task => task.family_id === familyId);
  const now = Date.now();

  const visibleTasks = allTasks.filter((task) => task.isDue());

  log("TASKS: получено из localStorage", allTasks.length);
  log("TASKS: отображаем на экране", visibleTasks.length);
  log("TASKS: скрытые повторяющиеся задания", allTasks.filter(t => !t.isDue()));

  renderTasks(visibleTasks);
}

function renderTasks(tasks) {
  log("UI: renderTasks", tasks);

  $("loading").classList.add("hidden");
  $("list").innerHTML = "";
  $("empty").classList.toggle("hidden", tasks.length > 0);

  if (tasks.length === 0) return;

  tasks.forEach((task) => {
    const row = document.createElement("div");
    row.className = "task";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
      log("UI: пользователь отметил задание", task);
      completeTask(task).catch((error) => logError("COMPLETE: необработанная ошибка", error));
    });

    const text = document.createElement("span");
    text.textContent = task.text;
    text.addEventListener("click", () => {
      log("UI: пользователь открыл редактирование", task);
      editTask(task);
    });

    row.append(checkbox, text);
    $("list").append(row);
  });
}

function openNewTask() {
  logStep("UI: открыть создание нового задания");

  editId = null;
  $("title").textContent = "Новое задание";
  $("text").value = "";
  $("repeat").value = "";
  $("days").value = 7;
  $("save").textContent = "Добавить";

  hide("remove");
  toggleRepeatField();
  show("modal");
  $("text").focus();
}

function editTask(task) {
  logStep("UI: открыть редактирование", task);

  editId = task.id;
  $("title").textContent = "Редактировать задание";
  $("text").value = task.text;
  $("repeat").value = task.repeat_days ? "days" : "";
  $("days").value = task.repeat_days || 7;
  $("save").textContent = "Сохранить";

  show("remove");
  toggleRepeatField();
  show("modal");
  $("text").focus();
}

function toggleRepeatField() {
  const repeatValue = $("repeat").value;
  log("UI: изменение повторения", repeatValue);
  $("daysBox").classList.toggle("hidden", repeatValue !== "days");
}

function saveTask() {
  logStep("SAVE: нажата кнопка сохранения");

  try {
    ensureFamily();

    const text = $("text").value.trim();
    const repeatValue = $("repeat").value;
    const daysValue = $("days").value;

    log("SAVE: данные формы", {
      text,
      repeatValue,
      daysValue,
      editId,
      familyId,
    });

    if (!text) {
      log("SAVE: валидация не пройдена — пустой текст");
      alert("Введите текст задания");
      return;
    }

    let repeatDays = null;

    if (repeatValue === "days") {
      repeatDays = Number(daysValue);

      log("SAVE: преобразование количества дней", {
        original: daysValue,
        parsed: repeatDays,
      });

      if (!Number.isInteger(repeatDays) || repeatDays < 1) {
        log("SAVE: валидация не пройдена — неверное количество дней");
        alert("Введите целое число дней больше 0");
        return;
      }
    }

    const payload = {
      text,
      repeat_days: repeatDays,
      family_id: familyId,
    };

    log("SAVE: payload для localStorage", payload);
    log("SAVE: операция", editId ? "UPDATE" : "INSERT");

    $("save").disabled = true;
    $("save").textContent = "Сохраняю…";

    if (editId) {
      log("SAVE: выполняем UPDATE", { id: editId, payload });
      const index = _tasks.findIndex(task => task.id === editId);
      if (index !== -1) {
        _tasks[index] = new Task({ ..._tasks[index].toObject(), ...payload, id: editId });
      }
    } else {
      log("SAVE: выполняем INSERT", { payload });
      const newTask = new Task(payload);
      _tasks.push(newTask);
    }

    log("SAVE: задание успешно сохранено");
    hide("modal");

    log("SAVE: сохраняем в localStorage");
    saveTasksToStorage(_tasks);

    log("SAVE: перезагружаем список заданий");
    loadTasks();
    log("SAVE: завершено успешно");
  } catch (error) {
    logError("SAVE: исключение", error);
    alert(`Ошибка приложения: ${error?.message || error}`);
  } finally {
    $("save").disabled = false;
    $("save").textContent = editId ? "Сохранить" : "Добавить";
    log("SAVE: кнопка снова активна");
  }
}

function completeTask(task) {
  logStep("COMPLETE: начало выполнения задания", task);
  ensureFamily();

  const completedAt = new Date();
  log("COMPLETE: время выполнения", completedAt.toISOString());

  const historyPayload = {
    task_id: task.id,
    family_id: familyId,
    text: task.text,
    completed_at: completedAt.toISOString(),
  };

  log("COMPLETE: INSERT в task_history", historyPayload);

  // Use in-memory mock data instead of Supabase
  const newHistoryItem = {
    ...historyPayload,
    id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };
  _taskHistory.push(newHistoryItem);

  log("COMPLETE: история записана", newHistoryItem);

  if (task.repeat_days) {
    log("COMPLETE: задание повторяющееся → вызываем task.complete()");
    task.complete();
  } else {
    log("COMPLETE: задание одноразовое → DELETE из tasks", { id: task.id });

    const index = _tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      _tasks.splice(index, 1);
    }
  }

  log("COMPLETE: сохраняем в localStorage");
  saveTasksToStorage(_tasks);

  log("COMPLETE: обновляем список");
  loadTasks();
  log("COMPLETE: завершено успешно");
}

function askDelete() {
  logStep("UI: пользователь запросил удаление", { editId });
  deleteId = editId;
  hide("modal");
  show("confirm");
}

function deleteTask() {
  logStep("DELETE: подтверждено удаление", { deleteId });

  try {
    ensureFamily();

    if (!deleteId) {
      throw new Error("Не указан ID удаляемого задания");
    }

    log("DELETE: запрос", { id: deleteId, familyId });

    const index = _tasks.findIndex(task => task.id === deleteId);
    if (index !== -1) {
      _tasks.splice(index, 1);
      log("DELETE: задание удалено");
    }

    deleteId = null;
    hide("confirm");
    saveTasksToStorage(_tasks);
    loadTasks();
  } catch (error) {
    logError("DELETE: исключение", error);
    alert(error?.message || error);
  }
}

function openHistory() {
  logStep("HISTORY: открываем историю");
  ensureFamily();

  log("HISTORY: запрос", { familyId });

  // Use in-memory mock data instead of Supabase
  const historyItems = _taskHistory.filter(item => item.family_id === familyId);

  log("HISTORY: количество записей", historyItems.length);

  $("historyList").innerHTML = "";

  if (!historyItems.length) {
    $("historyList").innerHTML = '<p class="empty">История пока пуста</p>';
  }

  historyItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "task";
    row.textContent =
      "✓ " +
      item.text +
      " — " +
      new Date(item.completed_at).toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    $("historyList").append(row);
  });

  show("hist");
}

function attachUiHandlers() {
  logStep("UI: подключаем обработчики кнопок");

  $("add").addEventListener("click", () => {
    log("CLICK: Добавить задание");
    openNewTask();
  });

  $("cancel").addEventListener("click", () => {
    log("CLICK: Отмена в модальном окне");
    hide("modal");
  });

  $("save").addEventListener("click", () => {
    log("CLICK: Добавить/Сохранить");
    saveTask();
  });

  $("remove").addEventListener("click", () => {
    log("CLICK: Удалить из редактирования");
    askDelete();
  });

  $("repeat").addEventListener("change", () => {
    log("CHANGE: поле повторения", $("repeat").value);
    toggleRepeatField();
  });

  $("no").addEventListener("click", () => {
    log("CLICK: Отмена удаления");
    hide("confirm");
  });

  $("yes").addEventListener("click", () => {
    log("CLICK: Подтвердить удаление");
    deleteTask();
  });

  $("history").addEventListener("click", () => {
    log("CLICK: История");
    openHistory();
  });

  $("close").addEventListener("click", () => {
    log("CLICK: Закрыть историю");
    hide("hist");
  });

  log("UI: обработчики подключены");
}

// Realtime is not needed for in-memory mock data — removed
function subscribeToRealtime() {
  logStep("REALTIME: подписка на изменения tasks — отключена для in-memory mock");
}

function init() {
  logStep("INIT: запуск приложения");
  console.log("%c=== ДЕЛА / DEBUG ===", "font-size:16px;font-weight:bold");
  console.log("Версия: DEBUG-5");
  console.log("Время запуска:", new Date().toISOString());

  try {
    attachUiHandlers();
    log("INIT: UI готов");

    const session = auth();
    log("INIT: AUTH завершён", { userId: session?.user?.id });

    connectToFamily();
    log("INIT: FAMILY завершён", { familyId });

    loadTasks();
    log("INIT: TASKS загружены");

    // Realtime is disabled for in-memory mock
    subscribeToRealtime();
    log("INIT: REALTIME отключён (in-memory mock)");

    logStep("INIT: приложение полностью готово");
  } catch (error) {
    logError("INIT: критическая ошибка инициализации", error, {
      familyId,
      localStorageFamilyId: localStorage.getItem("family_id"),
      hasInviteToken: Boolean(localStorage.getItem("family_invite_token")),
    });

    alert(
      `Не удалось подключиться к семейной базе.\n\n${error?.message || error}\n\nОткройте консоль браузера — там есть подробный журнал.`
    );
  }
}

// Логируем глобальные ошибки JavaScript, которые иначе могли бы остаться незаметными.
window.addEventListener("error", (event) => {
  logError("GLOBAL JS ERROR", event.error || event.message, {
    filename: event.filename,
    line: event.lineno,
    column: event.colno,
  });
});

// Remove unhandledrejection listener — no async promises left
log("APP: app.js загружен");
init();
