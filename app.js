// ============================================================
// ЗАДАНИЯ — MOCK VERSION
// Все данные работают локально через localStorage.
// ============================================================
const MOCK_FAMILY_ID = "11111111-1111-1111-1111-111111111111";
const MAX_PERIODIC_DATES = 4;
const DAY = 24 * 60 * 60 * 1000;

class Task {
  constructor({ id, text, family_id, created_at, repeat_days, next_due_at, urgency, urgent_started_at, completed_dates }) {
    this.id = id || `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.text = text || "";
    this.family_id = family_id || MOCK_FAMILY_ID;
    this.created_at = created_at || new Date().toISOString();
    this.repeat_days = repeat_days || null;
    this.next_due_at = next_due_at || null;
    this.urgency = urgency === "urgent" ? "urgent" : "not_urgent";
    this.urgent_started_at = urgent_started_at || this.created_at;
    this.completed_dates = Array.isArray(completed_dates) ? completed_dates.slice(-MAX_PERIODIC_DATES) : [];
  }

  static fromObject(obj) { return new Task(obj); }
  isDue() { return !this.next_due_at || new Date(this.next_due_at).getTime() <= Date.now(); }

  complete() {
    const completedAt = new Date();
    if (this.repeat_days) {
      const nextDueAt = new Date(completedAt.getTime() + this.repeat_days * DAY);
      this.next_due_at = nextDueAt.toISOString();
      // Новый цикл начинается с момента, когда задание снова станет доступным.
      this.urgent_started_at = nextDueAt.toISOString();
      this.completed_dates.push(completedAt.toISOString());
      this.completed_dates = this.completed_dates.slice(-MAX_PERIODIC_DATES);
      return nextDueAt;
    }
    return null;
  }

  urgencyLevel() {
    if (this.urgency !== "urgent") return "";
    const age = Date.now() - new Date(this.urgent_started_at).getTime();
    if (age >= 6 * DAY) return "urgent-red";
    if (age >= 4 * DAY) return "urgent-orange";
    return "";
  }

  toObject() {
    return {
      id: this.id, text: this.text, family_id: this.family_id, created_at: this.created_at,
      repeat_days: this.repeat_days, next_due_at: this.next_due_at, urgency: this.urgency,
      urgent_started_at: this.urgent_started_at, completed_dates: this.completed_dates.slice(-MAX_PERIODIC_DATES)
    };
  }
}

function loadTasksFromStorage() {
  const stored = localStorage.getItem("tasks");
  if (stored) {
    try { return JSON.parse(stored).map(Task.fromObject); }
    catch (e) { console.warn("Не удалось прочитать tasks из localStorage", e); }
  }
  return [
    Task.fromObject({ id: "t_1", text: "Помыть посуду", family_id: MOCK_FAMILY_ID, created_at: new Date(Date.now() - DAY).toISOString() }),
    Task.fromObject({ id: "t_2", text: "Сделать уроки", family_id: MOCK_FAMILY_ID, created_at: new Date(Date.now() - 2 * DAY).toISOString(), repeat_days: 1, completed_dates: [new Date(Date.now() - 3 * DAY).toISOString(), new Date(Date.now() - 2 * DAY).toISOString()] }),
    Task.fromObject({ id: "t_3", text: "Прогуляться с собакой", family_id: MOCK_FAMILY_ID, created_at: new Date(Date.now() - 3 * DAY).toISOString(), repeat_days: 7, completed_dates: [new Date(Date.now() - 10 * DAY).toISOString()] })
  ];
}
function saveTasksToStorage(tasks) { localStorage.setItem("tasks", JSON.stringify(tasks.map(t => t.toObject()))); }
let _tasks = loadTasksFromStorage();
let _taskHistory = [
  { id: "h_1", task_id: "t_1", text: "Помыть посуду", family_id: MOCK_FAMILY_ID, completed_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "h_2", task_id: "t_2", text: "Сделать уроки", family_id: MOCK_FAMILY_ID, completed_at: new Date(Date.now() - 7200000).toISOString() }
];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let familyId = null, editId = null, deleteId = null;
const $ = id => document.getElementById(id);
const log = (message, data) => data === undefined ? console.log(`[APP] ${message}`) : console.log(`[APP] ${message}`, data);
const logStep = (step, data) => data === undefined ? console.groupCollapsed(`%c[APP STEP] ${step}`, "font-weight:bold") : console.groupCollapsed(`%c[APP STEP] ${step}`, "font-weight:bold", data);
const logError = (message, error) => { console.group(`[APP ERROR] ${message}`); console.error(error); console.groupEnd(); };
function show(id) { const el = $(id); el.classList.remove("hidden"); if (el.classList.contains("modal")) el.classList.add("show"); }
function hide(id) { const el = $(id); el.classList.add("hidden"); if (el.classList.contains("modal")) el.classList.remove("show"); }
function ensureFamily() { if (!familyId || !UUID_RE.test(String(familyId))) familyId = MOCK_FAMILY_ID; }
function auth() { return { user: { id: "demo-user" } }; }
function connectToFamily() { familyId = MOCK_FAMILY_ID; return familyId; }

function loadTasks() {
  logStep("TASKS: загрузка заданий"); ensureFamily();
  $("loading").classList.remove("hidden"); $("empty").classList.add("hidden");
  const allTasks = _tasks.filter(task => task.family_id === familyId);
  const visibleTasks = allTasks.filter(task => task.isDue());
  renderTasks(visibleTasks);
}

function renderTasks(tasks) {
  $("loading").classList.add("hidden"); $("list").innerHTML = ""; $("empty").classList.toggle("hidden", tasks.length > 0);
  tasks.forEach(task => {
    const row = document.createElement("div"); row.className = `task ${task.urgencyLevel()}`;
    const checkbox = document.createElement("input"); checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => completeTask(task));
    const text = document.createElement("span"); text.className = "task-text"; text.textContent = task.text;
    text.addEventListener("click", () => editTask(task));
    row.append(checkbox, text);
    if (task.repeat_days) {
      const icon = document.createElement("span"); icon.className = "task-repeat-icon"; icon.title = `Повторяется каждые ${task.repeat_days} дн.`; icon.textContent = "↻"; row.append(icon);
    }
    $("list").append(row);
  });
}

function resetUrgencyInputs(value = "not_urgent") {
  $("urgencyUrgent").checked = value === "urgent";
  $("urgencyNotUrgent").checked = value !== "urgent";
}
function openNewTask() {
  editId = null; $("title").textContent = "Новое задание"; $("text").value = ""; $("repeat").value = ""; $("days").value = 7; $("save").textContent = "Добавить"; hide("remove"); resetUrgencyInputs(); toggleRepeatField(); show("modal"); $("text").focus();
}
function editTask(task) {
  editId = task.id; $("title").textContent = "Редактировать задание"; $("text").value = task.text; $("repeat").value = task.repeat_days ? "days" : ""; $("days").value = task.repeat_days || 7; $("save").textContent = "Сохранить"; resetUrgencyInputs(task.urgency); show("remove"); toggleRepeatField(); show("modal"); $("text").focus();
}
function toggleRepeatField() { $("daysBox").classList.toggle("hidden", $("repeat").value !== "days"); }

function saveTask() {
  try {
    ensureFamily();
    const text = $("text").value.trim(), repeatValue = $("repeat").value, daysValue = $("days").value;
    if (!text) { alert("Введите текст задания"); return; }
    let repeatDays = null;
    if (repeatValue === "days") { repeatDays = Number(daysValue); if (!Number.isInteger(repeatDays) || repeatDays < 1) { alert("Введите целое число дней больше 0"); return; } }
    const urgency = $("urgencyUrgent").checked ? "urgent" : "not_urgent";
    $("save").disabled = true;
    if (editId) {
      const index = _tasks.findIndex(t => t.id === editId);
      if (index !== -1) {
        const old = _tasks[index];
        _tasks[index] = new Task({ ...old.toObject(), text, repeat_days: repeatDays, urgency, urgent_started_at: urgency === old.urgency ? old.urgent_started_at : new Date().toISOString() });
      }
    } else {
      _tasks.push(new Task({ text, repeat_days: repeatDays, family_id: familyId, urgency, urgent_started_at: new Date().toISOString() }));
    }
    saveTasksToStorage(_tasks); hide("modal"); loadTasks();
  } catch (error) { logError("SAVE: исключение", error); alert(`Ошибка приложения: ${error?.message || error}`); }
  finally { $("save").disabled = false; $("save").textContent = editId ? "Сохранить" : "Добавить"; }
}

function completeTask(task) {
  try {
    ensureFamily();
    const completedAt = new Date().toISOString();
    _taskHistory.push({ id: `h_${Date.now()}`, task_id: task.id, family_id: familyId, text: task.text, completed_at: completedAt });
    if (task.repeat_days) task.complete();
    else { const index = _tasks.findIndex(t => t.id === task.id); if (index !== -1) _tasks.splice(index, 1); }
    saveTasksToStorage(_tasks); loadTasks();
  } catch (error) { logError("COMPLETE: исключение", error); alert(error?.message || error); loadTasks(); }
}
function askDelete() { deleteId = editId; hide("modal"); show("confirm"); }
function deleteTask() { try { ensureFamily(); if (!deleteId) throw new Error("Не указан ID удаляемого задания"); const index = _tasks.findIndex(t => t.id === deleteId); if (index !== -1) _tasks.splice(index, 1); deleteId = null; hide("confirm"); saveTasksToStorage(_tasks); loadTasks(); } catch (error) { logError("DELETE: исключение", error); alert(error?.message || error); } }

function formatDate(date) { return new Date(date).toLocaleString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
function openHistory() {
  ensureFamily(); const historyItems = _taskHistory.filter(item => item.family_id === familyId).sort((a,b) => new Date(b.completed_at) - new Date(a.completed_at));
  $("historyList").innerHTML = "";
  if (!historyItems.length) $("historyList").innerHTML = '<p class="empty">История пока пуста</p>';
  historyItems.forEach(item => { const row = document.createElement("div"); row.className = "history-row"; row.innerHTML = `<span>✓ ${escapeHtml(item.text)}</span><small>${formatDate(item.completed_at)}</small>`; $("historyList").append(row); });
  show("hist");
}
function clearHistory() {
  if (!confirm("Очистить всю историю выполненных заданий? Это действие нельзя отменить.")) return;
  _taskHistory = _taskHistory.filter(item => item.family_id !== familyId);
  openHistory();
}
function openPeriodic() {
  ensureFamily(); const periodic = _tasks.filter(t => t.family_id === familyId && t.repeat_days);
  $("periodicList").innerHTML = "";
  if (!periodic.length) $("periodicList").innerHTML = '<p class="empty">Периодических заданий пока нет</p>';
  periodic.forEach(task => {
    const block = document.createElement("div"); block.className = "periodic-item";
    const title = document.createElement("div"); title.className = "periodic-title"; title.textContent = task.text;
    const info = document.createElement("div"); info.className = "periodic-info"; info.textContent = `Каждые ${task.repeat_days} дн.`;
    block.append(title, info);
    const dates = task.completed_dates.slice(-MAX_PERIODIC_DATES).reverse();
    if (!dates.length) { const p = document.createElement("p"); p.className = "periodic-empty"; p.textContent = "Пока не выполнялось"; block.append(p); }
    else { const ul = document.createElement("ul"); ul.className = "periodic-dates"; dates.forEach(date => { const li = document.createElement("li"); li.textContent = `✓ ${formatDate(date)}`; ul.append(li); }); block.append(ul); }
    $("periodicList").append(block);
  });
  show("periodicModal");
}
function escapeHtml(value) { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }

function attachUiHandlers() {
  $("add").addEventListener("click", openNewTask); $("cancel").addEventListener("click", () => hide("modal")); $("save").addEventListener("click", saveTask); $("remove").addEventListener("click", askDelete); $("repeat").addEventListener("change", toggleRepeatField);
  $("no").addEventListener("click", () => hide("confirm")); $("yes").addEventListener("click", deleteTask); $("history").addEventListener("click", openHistory); $("close").addEventListener("click", () => hide("hist")); $("clearHistory").addEventListener("click", clearHistory); $("periodic").addEventListener("click", openPeriodic); $("closePeriodic").addEventListener("click", () => hide("periodicModal"));
}
function init() { logStep("INIT: запуск приложения"); attachUiHandlers(); auth(); connectToFamily(); loadTasks(); log("INIT: приложение готово"); }
window.addEventListener("error", event => logError("GLOBAL JS ERROR", event.error || event.message));
log("APP: app.js загружен"); init();
