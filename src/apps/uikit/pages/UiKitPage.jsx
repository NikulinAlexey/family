import { useState } from "react";
import Header from "@/shared/ui/Header.jsx";
import Modal from "@/shared/ui/Modal.jsx";
import ConfirmModal from "@/shared/ui/ConfirmModal.jsx";
import Button from "@/shared/ui/Button.jsx";
import Icon from "@/shared/ui/Icon.jsx";
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
                <Button>Обычная</Button>
                <Button variant="primary">Primary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="danger-outline">Danger outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger-ghost">Danger ghost</Button>
                <Button variant="text">Текстовая</Button>
              </div>
              <div className="uikit__row">
                <Button variant="primary">
                  <Icon name="plus" size={18} /> С иконкой
                </Button>
                <Button size="lg" variant="primary">
                  <Icon name="plus" size={22} /> Крупная (lg)
                </Button>
                <Button size="sm">Малая (sm)</Button>
              </div>
              <div className="uikit__row">
                <Button isSquare aria-label="Квадратная">
                  <Icon name="plus" />
                </Button>
                <Button isSquare variant="ghost" aria-label="Квадратная ghost">
                  <Icon name="close" />
                </Button>
                <Button isSquare size="sm" variant="danger-ghost" aria-label="Квадратная danger">
                  <Icon name="delete" size={18} />
                </Button>
                <Button href="/tasks">Это ссылка с видом кнопки</Button>
              </div>
              <div className="uikit__row">
                <Button wide variant="primary">На всю ширину (wide)</Button>
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
                <Button variant="primary" onClick={() => setDemoModal("modal")}>
                  Открыть Modal
                </Button>
                <Button variant="danger" onClick={() => setDemoModal("confirm")}>
                  Открыть ConfirmModal
                </Button>
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
              <Button onClick={() => setDemoModal(null)}>Закрыть</Button>
              <Button variant="primary" onClick={() => setDemoModal(null)}>
                Ок
              </Button>
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