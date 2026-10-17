// ============================================================
// ЗАДАНИЯ — MOCK VERSION
// Все данные работают локально через localStorage.
// ============================================================
export const MOCK_FAMILY_ID = "11111111-1111-1111-1111-111111111111";
export const MAX_PERIODIC_DATES = 4;
export const DAY = 24 * 60 * 60 * 1000;

export class Task {
  constructor({ id, text, family_id, created_at, repeat_days, next_due_at, urgency, urgent_started_at, completed_dates, chain_id, chain_order, chain_done, chain_repeat_days }) {
    this.id = id || `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.text = text || "";
    this.family_id = family_id || MOCK_FAMILY_ID;
    this.created_at = created_at || new Date().toISOString();
    this.repeat_days = repeat_days || null;
    this.next_due_at = next_due_at || null;
    this.urgency = urgency === "urgent" ? "urgent" : "not_urgent";
    this.urgent_started_at = urgent_started_at || this.created_at;
    this.completed_dates = Array.isArray(completed_dates) ? completed_dates.slice(-MAX_PERIODIC_DATES) : [];
    this.chain_id = chain_id || null;
    this.chain_order = Number.isInteger(chain_order) ? chain_order : 0;
    this.chain_done = chain_done === true;
    this.chain_repeat_days = Number.isInteger(chain_repeat_days) ? chain_repeat_days : null;
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
      urgent_started_at: this.urgent_started_at, completed_dates: this.completed_dates.slice(-MAX_PERIODIC_DATES),
      chain_id: this.chain_id, chain_order: this.chain_order, chain_done: this.chain_done, chain_repeat_days: this.chain_repeat_days
    };
  }
}

export function loadTasksFromStorage() {
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

export function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks.map(t => t.toObject())));
}

export function createMockHistory() {
  return [
    { id: "h_1", task_id: "t_1", text: "Помыть посуду", family_id: MOCK_FAMILY_ID, completed_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "h_2", task_id: "t_2", text: "Сделать уроки", family_id: MOCK_FAMILY_ID, completed_at: new Date(Date.now() - 7200000).toISOString() }
  ];
}

export function getFamilyTasks(tasks, familyId = MOCK_FAMILY_ID) {
  return tasks.filter(task => task.family_id === familyId);
}

export function isTaskVisible(task, allTasks) {
  if (!task.chain_id) return true;
  const chain = allTasks
    .filter(other => other.family_id === task.family_id && other.chain_id === task.chain_id)
    .sort((a, b) => a.chain_order - b.chain_order);
  const current = chain.find(item => !item.chain_done);
  return current ? current.id === task.id : false;
}

export function getVisibleTasks(tasks, familyId = MOCK_FAMILY_ID) {
  const allTasks = getFamilyTasks(tasks, familyId);
  return allTasks.filter(task => task.isDue() && isTaskVisible(task, allTasks));
}

export function getChain(tasks, task) {
  return tasks
    .filter(t => t.family_id === task.family_id && t.chain_id === task.chain_id)
    .sort((a, b) => a.chain_order - b.chain_order);
}
