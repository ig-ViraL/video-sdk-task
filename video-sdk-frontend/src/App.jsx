import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import SessionTimeline from "./pages/SessionTimeline";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: ":sessionId",
    element: <SessionTimeline />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
