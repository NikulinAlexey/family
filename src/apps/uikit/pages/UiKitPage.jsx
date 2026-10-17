import { useState } from "react";
import Header from "@/shared/ui/Header.jsx";
import Modal from "@/shared/ui/Modal.jsx";
import ConfirmModal from "@/shared/ui/ConfirmModal.jsx";
import "../_uikit.scss";

// Витрина общего UI-кита (/ui-kit).
// Показывает только компоненты из src/shared/ — те же, что используют подприложения.
// Новый общий компонент добавляется в shared/ui и сюда же — в соответствующий раздел.
const SECTIONS = [
  { id: "buttons", title: "Кнопки" },
  { id: "forms", title: "Формы" },
  { id: "states", title: "Состояния" },
  { id: "modals", title: "Модальные окна" }
];

export default function UiKitPage() {
  const [demoModal, setDemoModal] = useState(null); // "modal" | "confirm" | null

  return (
    <>
      <Header title="UI-кит" />
      <main className="page__main">
        <div className="page__scroll">
          <div className="container uikit">
            <nav className="uikit__nav" aria-label="Разделы кита">
              {SECTIONS.map(section => (
                <a className="uikit__nav-link" key={section.id} href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
            </nav>

            <section className="uikit__section" id="buttons">
              <h2>Кнопки</h2>
              <div className="uikit__row">
                <button className="primary" type="button">Primary</button>
                <button className="danger" type="button">Danger</button>
                <button className="danger-outline" type="button">Danger outline</button>
                <button type="button">Обычная</button>
              </div>
              <div className="uikit__row">
                <button className="add" type="button">
                  <span className="add__plus">＋</span> Добавить
                </button>
              </div>
            </section>

            <section className="uikit__section" id="forms">
              <h2>Формы</h2>
              <label>
                Текстовое поле
                <textarea rows="2" placeholder="Например, новое задание" />
              </label>
              <label>
                Выпадающий список
                <select defaultValue="">
                  <option value="">Выберите вариант</option>
                  <option value="a">Вариант А</option>
                  <option value="b">Вариант Б</option>
                </select>
              </label>
              <label>
                Число
                <input type="number" min="1" defaultValue="7" />
              </label>
              <fieldset className="urgency">
                <legend>Радиогруппа</legend>
                <label className="radio-option">
                  <input type="radio" name="uikit-demo" defaultChecked />
                  <span>Не срочно</span>
                </label>
                <label className="radio-option">
                  <input type="radio" name="uikit-demo" />
                  <span>Срочно</span>
                </label>
              </fieldset>
            </section>

            <section className="uikit__section" id="states">
              <h2>Состояния</h2>
              <div className="loading" aria-live="polite">
                <span className="spinner"></span>
                <span>Загрузка</span>
              </div>
              <p className="empty">Пока ничего нет</p>
            </section>

            <section className="uikit__section" id="modals">
              <h2>Модальные окна</h2>
              <div className="uikit__row">
                <button className="primary" type="button" onClick={() => setDemoModal("modal")}>
                  Открыть Modal
                </button>
                <button className="danger" type="button" onClick={() => setDemoModal("confirm")}>
                  Открыть ConfirmModal
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {demoModal === "modal" && (
        <Modal
          title="Универсальное окно"
          onClose={() => setDemoModal(null)}
          overlayClosable
          footer={
            <>
              <button type="button" onClick={() => setDemoModal(null)}>Закрыть</button>
              <button className="primary" type="button" onClick={() => setDemoModal(null)}>
                Ок
              </button>
            </>
          }
        >
          <p>Контент карточки: любой текст, формы, списки.</p>
        </Modal>
      )}

      {demoModal === "confirm" && (
        <ConfirmModal
          title="Удалить элемент?"
          text="Это действие нельзя отменить."
          onConfirm={() => setDemoModal(null)}
          onCancel={() => setDemoModal(null)}
        />
      )}
    </>
  );
}