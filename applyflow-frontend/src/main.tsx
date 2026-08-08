// Archivo que muestra el punto de entrada de la aplicación React. Aquí se renderiza el componente raíz (App) dentro del elemento con id 'root' en el DOM. Se utiliza StrictMode para ayudar a identificar problemas potenciales en la aplicación durante el desarrollo.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
