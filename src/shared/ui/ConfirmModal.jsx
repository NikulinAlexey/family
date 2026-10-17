import Modal from "./Modal.jsx";

export default function ConfirmModal({ title, text, onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" onClick={onCancel}>Отмена</button>
          <button className="danger" type="button" onClick={onConfirm}>Удалить</button>
        </>
      }
    >
      <p>{text}</p>
    </Modal>
  );
}
