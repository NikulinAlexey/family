import { useEffect, useMemo, useRef, useState } from "react";
import TaskList from "./TaskList.jsx";
import Modals from "./Modals.jsx";
import Button from "@/shared/ui/Button.jsx";
import Icon from "@/shared/ui/Icon.jsx";
import { log, logError } from "@/shared/lib/log.js";
import {
  Task,
  MOCK_FAMILY_ID,
  DAY,
  loadTasksFromStorage,
  saveTasksToStorage,
  createMockHistory,
  getVisibleTasks,
  getChain
} from "../model/Task.js";

const FAMILY_ID = MOCK_FAMILY_ID;
const COMPLETION_DELAY = 4000;

// Список заданий: данные и вся бизнес-логика списков (выполнение, цепочки,
// повторы, сохранение, удаление, история) плюс связанные модальные окна.
// Навигационные модалки (история, периодические) открываются из App.
export default function TaskBoard({
  historyOpen,
  onCloseHistory,
  periodicOpen,
  onOpenPeriodic,
  onClosePeriodic
}) {
  const [tasks, setTasks] = useState(loadTasksFromStorage);
  const [history, setHistory] = useState(createMockHistory);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null); // { editId: string | null }
  const [confirmState, setConfirmState] = useState(null); // { title, text, kind, taskId, chainId }
  const [pendingIds, setPendingIds] = useState(() => new Set());

  const completionTimers = useRef(new Map());
  const tasksRef = useRef(tasks);
  const historyRef = useRef(history);

  useEffect(() => {
    setLoading(false);

    const timers = completionTimers.current;
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { historyRef.current = history; }, [history]);

  const visibleTasks = useMemo(() => getVisibleTasks(tasks, FAMILY_ID), [tasks]);

  const commitTasks = nextTasks => {
    setTasks(nextTasks);
    saveTasksToStorage(nextTasks);
  };

  const openNewTask = () => setTaskModal({ editId: null });
  const openEditTask = task => setTaskModal({ editId: task.id });
  const closeTaskModal = () => setTaskModal(null);
  // ------------------------------------------------------------
  // Сохранение нового/редактируемого задания (в т.ч. цепочки)
  // ------------------------------------------------------------
  const handleSaveTask = form => {
    try {
      const texts = form.texts;
      if (!texts.length) {
        alert("Введите хотя бы одно задание");
        return;
      }

      let repeatDays = null;
      if (form.repeatMode === "days") {
        repeatDays = Number(form.days);
        if (!Number.isInteger(repeatDays) || repeatDays < 1) {
          alert("Введите целое число дней больше 0");
          return;
        }
      }

      const urgency = form.urgency === "urgent" ? "urgent" : "not_urgent";
      let next = tasks;

      if (form.editId) {
        const old = tasks.find(t => t.id === form.editId);
        if (old) {
          next = tasks.map(t => {
            if (t.id === form.editId) {
              return new Task({
                ...t.toObject(),
                text: texts[0],
                repeat_days: repeatDays,
                chain_repeat_days: t.chain_id ? repeatDays : t.chain_repeat_days,
                urgency,
                urgent_started_at: urgency === t.urgency ? t.urgent_started_at : new Date().toISOString()
              });
            }
            if (old.chain_id && t.chain_id === old.chain_id) {
              return new Task({ ...t.toObject(), repeat_days: repeatDays, chain_repeat_days: repeatDays });
            }
            return t;
          });
        }
      } else {
        const chainId = texts.length > 1 ? `chain_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` : null;
        next = [...tasks];
        texts.forEach((text, index) => {
          next.push(new Task({
            text,
            repeat_days: repeatDays,
            family_id: FAMILY_ID,
            urgency,
            urgent_started_at: new Date().toISOString(),
            chain_id: chainId,
            chain_order: index,
            chain_done: false,
            chain_repeat_days: repeatDays
          }));
        });
      }

      commitTasks(next);
      closeTaskModal();
      log("SAVE: задание сохранено");
    } catch (error) {
      logError("SAVE: исключение", error);
      alert(`Ошибка приложения: ${error?.message || error}`);
    }
  };
  // ------------------------------------------------------------
  // Выполнение задания (включая логику цепочек и повторов)
  // ------------------------------------------------------------
  const handleCompleteTask = task => {
    try {
      // Чтение через ref: срабатывает по таймеру через 4 секунды,
      // к этому моменту состояние могло уже обновиться.
      const currentTasks = tasksRef.current;
      const currentHistory = historyRef.current;
      const completedAt = new Date().toISOString();

      let next = currentTasks;
      const nextHistory = [...currentHistory, {
        id: `h_${Date.now()}`,
        task_id: task.id,
        family_id: FAMILY_ID,
        text: task.text,
        completed_at: completedAt
      }];

      if (task.chain_id) {
        const chain = getChain(currentTasks, task);
        const currentIndex = chain.findIndex(t => t.id === task.id);
        if (currentIndex !== -1) {
          const current = chain[currentIndex];
          const isLast = currentIndex === chain.length - 1;
          const chainIds = new Set(chain.map(t => t.id));

          if (isLast) {
            const repeatDays = current.chain_repeat_days || current.repeat_days || null;
            if (repeatDays) {
              // Цепочка завершена и повторяется: первый элемент снова становится доступным.
              const nextDue = new Date(Date.now() + repeatDays * DAY).toISOString();
              const firstId = chain[0].id;
              next = currentTasks.map(t => {
                if (!chainIds.has(t.id)) return t;
                const obj = {
                  ...t.toObject(),
                  chain_done: false,
                  next_due_at: null,
                  repeat_days: repeatDays,
                  chain_repeat_days: repeatDays
                };
                if (t.id === firstId) {
                  obj.next_due_at = nextDue;
                  obj.urgent_started_at = nextDue;
                }
                return new Task(obj);
              });
            } else {
              next = currentTasks.filter(t => !chainIds.has(t.id));
            }
          } else {
            next = currentTasks.map(t =>
              t.id === current.id ? new Task({ ...t.toObject(), chain_done: true }) : t
            );
          }
        }
      } else if (task.repeat_days) {
        next = currentTasks.map(t => {
          if (t.id !== task.id) return t;
          const copy = new Task(t.toObject());
          copy.complete();
          return copy;
        });
      } else {
        next = currentTasks.filter(t => t.id !== task.id);
      }

      commitTasks(next);
      setHistory(nextHistory);
      log("COMPLETE: задание выполнено");
    } catch (error) {
      logError("COMPLETE: исключение", error);
      alert(error?.message || error);
    }
  };
  // ------------------------------------------------------------
  // Чекбокс: 4 секунды на отмену перед фиксацией выполнения
  // ------------------------------------------------------------
  const clearPending = id => {
    const timer = completionTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      completionTimers.current.delete(id);
    }
    setPendingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleTogglePending = (task, checked) => {
    if (!checked) {
      clearPending(task.id);
      return;
    }

    setPendingIds(prev => new Set(prev).add(task.id));
    const timer = setTimeout(() => {
      completionTimers.current.delete(task.id);
      clearPending(task.id);
      handleCompleteTask(task);
    }, COMPLETION_DELAY);
    completionTimers.current.set(task.id, timer);
  };
  // ------------------------------------------------------------
  // Удаление: подтверждение для обычных и периодических заданий
  // ------------------------------------------------------------
  const askDeleteTask = () => {
    if (!taskModal) return;
    setConfirmState({
      title: "Удалить задание?",
      text: "Это действие нельзя отменить.",
      kind: "task",
      taskId: taskModal.editId,
      chainId: null
    });
    closeTaskModal();
  };

  const askDeletePeriodic = task => {
    setConfirmState({
      title: task.chain_id ? "Удалить цепочку?" : "Удалить периодическое задание?",
      text: "Оно больше не будет повторяться.",
      kind: "periodic",
      taskId: task.id,
      chainId: task.chain_id || null
    });
    onClosePeriodic();
  };

  const handleConfirmDelete = () => {
    if (!confirmState) return;
    try {
      if (confirmState.kind === "periodic") {
        let next = tasks;
        if (confirmState.chainId) {
          next = next.filter(t => !(t.family_id === FAMILY_ID && t.chain_id === confirmState.chainId));
        } else if (confirmState.taskId) {
          next = next.filter(t => !(t.family_id === FAMILY_ID && t.id === confirmState.taskId));
        }
        commitTasks(next);
        setConfirmState(null);
        onOpenPeriodic();
        log("DELETE: периодическое задание удалено");
        return;
      }

      if (!confirmState.taskId) throw new Error("Не указан ID удаляемого задания");
      commitTasks(tasks.filter(t => t.id !== confirmState.taskId));
      setConfirmState(null);
      log("DELETE: задание удалено");
    } catch (error) {
      logError("DELETE: исключение", error);
      alert(error?.message || error);
    }
  };

  // ------------------------------------------------------------
  // История
  // ------------------------------------------------------------
  const clearHistory = () => {
    if (!window.confirm("Очистить всю историю выполненных заданий? Это действие нельзя отменить.")) return;
    setHistory(history.filter(item => item.family_id !== FAMILY_ID));
  };

  const editTask = taskModal && taskModal.editId
    ? tasks.find(t => t.id === taskModal.editId) || null
    : null;

  return (
    <>
      <main className="page__main">
        <div className="page__scroll">
          <div className="container">
            {loading && (
              <div className="loading" aria-live="polite">
                <span className="spinner"></span>
                <span>Загрузка</span>
              </div>
            )}

            <TaskList
              tasks={visibleTasks}
              allTasks={tasks}
              pendingIds={pendingIds}
              onToggle={handleTogglePending}
              onEdit={openEditTask}
            />

            {!loading && !visibleTasks.length && (
              <p className="empty">Заданий пока нет</p>
            )}
          </div>
        </div>

        {/* Кнопка закреплена у нижнего края экрана: список скроллится отдельно. */}
        <div className="add-bar">
          <div className="container">
            <Button wide size="lg" variant="primary" onClick={openNewTask}>
              <Icon name="plus" size={22} /> Добавить задание
            </Button>
          </div>
        </div>
      </main>

      <Modals
        taskModal={taskModal}
        editTask={editTask}
        onSaveTask={handleSaveTask}
        onCloseTask={closeTaskModal}
        onAskDeleteTask={askDeleteTask}
        confirmState={confirmState}
        onConfirmDelete={handleConfirmDelete}
        onCloseConfirm={() => setConfirmState(null)}
        historyOpen={historyOpen}
        history={history}
        onCloseHistory={onCloseHistory}
        onClearHistory={clearHistory}
        periodicOpen={periodicOpen}
        tasks={tasks}
        onClosePeriodic={onClosePeriodic}
        onDeletePeriodic={askDeletePeriodic}
      />
    </>
  );
}
