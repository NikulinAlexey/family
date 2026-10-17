import { lazy } from "react";
import { Navigate } from "react-router";
import AppLayout from "./AppLayout.jsx";

// Реестр подприложений: каждый раздел — лениво загружаемый чанк с wildcard-роутом.
// Новый раздел = новый файл в src/apps/ + одна запись здесь.
const TasksApp = lazy(() => import("../apps/tasks/TasksApp.jsx"));
const RecipesApp = lazy(() => import("../apps/recipes/RecipesApp.jsx"));
const UiKitPage = lazy(() => import("../apps/uikit/pages/UiKitPage.jsx"));
const NotFoundPage = lazy(() => import("./NotFoundPage.jsx"));

export const routes = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/tasks" replace /> },
      { path: "tasks/*", element: <TasksApp /> },
      { path: "reciept/*", element: <RecipesApp /> },
      { path: "ui-kit/*", element: <UiKitPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
];