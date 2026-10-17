import { useState } from "react";
import Header from "@/shared/ui/Header.jsx";
import TaskBoard from "./components/TaskBoard.jsx";
import "./scss/tasks.scss";

// Приложение «Задачи» (маршрут /tasks): шапка раздела с действиями
// (история, периодические) и доска задач с модальными окнами.
export default function TasksApp() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [periodicOpen, setPeriodicOpen] = useState(false);

  return (
    <>
      <Header
        title="Задачи"
        actions={
          <>
            <button className="header-action" type="button" onClick={() => setPeriodicOpen(true)}>
              <span aria-hidden="true">↻</span> Периодические
            </button>
            <button className="header-action" type="button" onClick={() => setHistoryOpen(true)}>
              <span aria-hidden="true">◷</span> История
            </button>
          </>
        }
      />
      <TaskBoard
        historyOpen={historyOpen}
        onCloseHistory={() => setHistoryOpen(false)}
        periodicOpen={periodicOpen}
        onOpenPeriodic={() => setPeriodicOpen(true)}
        onClosePeriodic={() => setPeriodicOpen(false)}
      />
    </>
  );
}