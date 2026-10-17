import { useRef, useState } from "react";
import Modal from "@/shared/ui/Modal.jsx";

export default function TaskModal({ editTask, onSave, onCancel, onAskDelete }) {
  const isEdit = Boolean(editTask);

  const [chainTexts, setChainTexts] = useState(() => [editTask ? editTask.text : ""]);
  const [repeatMode, setRepeatMode] = useState(() => (editTask && editTask.repeat_days ? "days" : ""));
  const [days, setDays] = useState(() => String(editTask?.repeat_days || 7));
  const [urgency, setUrgency] = useState(() => (editTask?.urgency === "urgent" ? "urgent" : "not_urgent"));

  const fieldsRef = useRef(null);

  const title = isEdit ? "Редактировать задание" : "Новое задание";
  const saveLabel = isEdit ? "Сохранить" : "Добавить";

  const updateChainText = (index, value) => {
    setChainTexts(prev => prev.map((text, i) => (i === index ? value : text)));
  };

  const addChainField = () => {
    setChainTexts(prev => [...prev, ""]);
    requestAnimationFrame(() => {
      const areas = fieldsRef.current?.querySelectorAll(".chain-text");
      if (areas?.length) areas[areas.length - 1].focus();
    });
  };

  const removeChainField = index => {
    setChainTexts(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const submit = () => {
    const texts = chainTexts.map(text => text.trim()).filter(Boolean);
    onSave({
      editId: editTask ? editTask.id : null,
      texts,
      repeatMode,
      days,
      urgency
    });
  };

  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" onClick={onCancel}>Отмена</button>
          {isEdit && (
            <button className="danger" type="button" onClick={onAskDelete}>
              Удалить
            </button>
          )}
          <button className="primary" type="button" onClick={submit}>
            {saveLabel}
          </button>
        </>
      }
    >
      <label>
        Задание
        <div className="chain-fields" ref={fieldsRef}>
          {chainTexts.map((value, index) => (
            <div className="chain-field" key={index}>
              <textarea
                className="chain-text"
                rows="3"
                value={value}
                placeholder={index === 0 ? "Напишите задание" : "Следующее задание в цепочке"}
                autoFocus={index === 0}
                onChange={event => updateChainText(index, event.target.value)}
              />
              {index > 0 && (
                <button
                  className="chain-remove"
                  type="button"
                  title="Убрать это задание из цепочки"
                  onClick={() => removeChainField(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {!isEdit && (
          <button className="chain-add" type="button" onClick={addChainField}>
            <span>＋</span> Добавить следующее задание
          </button>
        )}
      </label>

      <label>
        Повторение
        <select value={repeatMode} onChange={event => setRepeatMode(event.target.value)}>
          <option value="">Не повторять</option>
          <option value="days">Через N дней после выполнения</option>
        </select>
      </label>

      {repeatMode === "days" && (
        <label>
          Количество дней
          <input type="number" min="1" value={days} onChange={event => setDays(event.target.value)} />
        </label>
      )}

      <fieldset className="urgency">
        <legend>Срочность</legend>
        <label className="radio-option">
          <input
            type="radio"
            name="urgency"
            value="not_urgent"
            checked={urgency === "not_urgent"}
            onChange={() => setUrgency("not_urgent")}
          />
          <span>Не срочно</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="urgency"
            value="urgent"
            checked={urgency === "urgent"}
            onChange={() => setUrgency("urgent")}
          />
          <span>Срочно</span>
        </label>
      </fieldset>
    </Modal>
  );
}
