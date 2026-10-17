import { RouterProvider, createBrowserRouter } from "react-router";
import { routes } from "./routes.jsx";

// Единый router для всех подприложений семьи (реестр — в routes.jsx).
const router = createBrowserRouter(routes);

export default function App() {
  return <RouterProvider router={router} />;
}