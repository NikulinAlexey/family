import { MOCK_FAMILY_ID } from "../model/Task.js";
import { formatDate } from "@/shared/lib/format.js";
import Modal from "@/shared/ui/Modal.jsx";

export default function HistoryModal({ history, onClose, onClear }) {
  const items = history
    .filter(item => item.family_id === MOCK_FAMILY_ID)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

  return (
    <Modal
      title="История"
      onClose={onClose}
      overlayClosable
      className="modal--history"
      footer={
        <button className="danger-outline" type="button" onClick={onClear}>
          Очистить историю
        </button>
      }
    >
      <div className="history-list">
        {!items.length && <p className="empty">История пока пуста</p>}
        {items.map(item => (
          <div className="history-row" key={item.id}>
            <span>✓ {item.text}</span>
            <small>{formatDate(item.completed_at)}</small>
          </div>
        ))}
      </div>
    </Modal>
  );
}
