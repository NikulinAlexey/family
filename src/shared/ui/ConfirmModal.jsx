import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function ConfirmModal({ title, text, onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>Отмена</Button>
          <Button variant="danger" onClick={onConfirm}>Удалить</Button>
        </>
      }
    >
      <p>{text}</p>
    </Modal>
  );
}
