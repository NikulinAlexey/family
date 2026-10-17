import Header from "@/shared/ui/Header.jsx";

// Приложение «Рецепты» (маршрут /reciept): каркас раздела.
// Логика (модель Recipe, списки, редактор) добавляется здесь же.
export default function RecipesApp() {
  return (
    <>
      <Header title="Рецепты" />
      <main className="page__main">
        <div className="page__scroll">
          <div className="container">
            <p className="empty">Рецептов пока нет</p>
          </div>
        </div>
      </main>
    </>
  );
}