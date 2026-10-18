import { useState } from "react";
import Header from "@/shared/ui/Header.jsx";
import Button from "@/shared/ui/Button.jsx";
import Icon from "@/shared/ui/Icon.jsx";
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
            {/* btn--text-md: на мобиле только иконка, текст — с брейкпоинта md. */}
            <Button
              className="btn--text-md"
              aria-label="Периодические"
              title="Периодические"
              onClick={() => setPeriodicOpen(true)}
            >
              <Icon name="repeat" size={18} /> <span className="btn__label">Периодические</span>
            </Button>
            <Button
              className="btn--text-md"
              aria-label="История"
              title="История"
              onClick={() => setHistoryOpen(true)}
            >
              <Icon name="clock" size={18} /> <span className="btn__label">История</span>
            </Button>
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