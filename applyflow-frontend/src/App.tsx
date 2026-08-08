// Este es el componente raíz de la aplicación React, encargado de gestionar el estado global de la sección activa y renderizar los componentes principales como el Header y el MainContent. Se encarga de:
// 1. Mantener el estado de la sección activa seleccionada por el usuario (Resumen de Ofertas, Centro de Control o Curriculum Vitae).
// 2. Pasar el estado y la función para actualizarlo al Header para que los botones puedan cambiar la sección activa.
// 3. Renderizar el MainContent, que se encargará de mostrar el contenido correspondiente según la sección activa.
import { useState } from "react";
import { Header } from "./components/layout/Header";
import { MainContent } from "./components/MainContent";

export default function App() {
  const [activeButton, setActiveButton] =
    useState<string>("Resumen de Ofertas");

  return (
    <div className="min-h-screen bg-apply-bg text-slate-100 flex flex-col antialiased">
      <Header activeButton={activeButton} setActiveButton={setActiveButton} />
      <MainContent activeButton={activeButton} />
    </div>
  );
}
