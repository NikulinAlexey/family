import TaskModal from "./TaskModal.jsx";
import ConfirmModal from "@/shared/ui/ConfirmModal.jsx";
import HistoryModal from "./HistoryModal.jsx";
import PeriodicModal from "./PeriodicModal.jsx";

// Единая точка рендеринга всех модальных окон приложения.
// Окна монтируются только пока открыты — состояние каждого начинается заново.
// Чтобы добавить новое окно: создайте компонент в ui/, заведите состояние
// открытия у владельца флоу (TaskBoard или App) и добавьте блок здесь.
export default function Modals({
  taskModal,
  editTask,
  onSaveTask,
  onCloseTask,
  onAskDeleteTask,
  confirmState,
  onConfirmDelete,
  onCloseConfirm,
  historyOpen,
  history,
  onCloseHistory,
  onClearHistory,
  periodicOpen,
  tasks,
  onClosePeriodic,
  onDeletePeriodic
}) {
  return (
    <>
      {taskModal && (
        <TaskModal
          editTask={editTask}
          onSave={onSaveTask}
          onCancel={onCloseTask}
          onAskDelete={onAskDeleteTask}
        />
      )}

      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          text={confirmState.text}
          onConfirm={onConfirmDelete}
          onCancel={onCloseConfirm}
        />
      )}

      {historyOpen && (
        <HistoryModal
          history={history}
          onClose={onCloseHistory}
          onClear={onClearHistory}
        />
      )}

      {periodicOpen && (
        <PeriodicModal
          tasks={tasks}
          onClose={onClosePeriodic}
          onDelete={onDeletePeriodic}
        />
      )}
    </>
  );
}
