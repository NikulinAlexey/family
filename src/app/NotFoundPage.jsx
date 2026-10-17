import Header from "@/shared/ui/Header.jsx";

export default function NotFoundPage() {
  return (
    <>
      <Header title="Не найдено" />
      <main className="page__main">
        <div className="page__scroll">
          <div className="container">
            <p className="empty">Такого раздела нет</p>
          </div>
        </div>
      </main>
    </>
  );
}