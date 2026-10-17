import { MOCK_FAMILY_ID, MAX_PERIODIC_DATES } from "../model/Task.js";
import { formatDate } from "@/shared/lib/format.js";
import Modal from "@/shared/ui/Modal.jsx";

export default function PeriodicModal({ tasks, onClose, onDelete }) {
  const periodic = tasks.filter(t => t.family_id === MOCK_FAMILY_ID && t.repeat_days);

  return (
    <Modal
      title="Периодические"
      onClose={onClose}
      overlayClosable
      className="modal--periodic"
    >
      <div className="periodic-list">
        {!periodic.length && <p className="empty">Периодических заданий пока нет</p>}

        {periodic.map(task => {
          const dates = task.completed_dates.slice(-MAX_PERIODIC_DATES).reverse();
          return (
            <div className="periodic-item" key={task.id}>
              <div className="periodic-top">
                <div className="periodic-title">{task.text}</div>
                <button
                  className="periodic-delete"
                  type="button"
                  title="Удалить периодическое задание"
                  aria-label="Удалить периодическое задание"
                  onClick={() => onDelete(task)}
                >
                  ⌫
                </button>
              </div>

              <div className="periodic-info">Каждые {task.repeat_days} дн.</div>

              {!dates.length ? (
                <p className="periodic-empty">Пока не выполнялось</p>
              ) : (
                <ul className="periodic-dates">
                  {dates.map((date, index) => (
                    <li key={index}>✓ {formatDate(date)}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
