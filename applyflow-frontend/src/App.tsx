// Este es el componente raíz de la aplicación React, encargado de gestionar el
// estado global de la sección activa y de mostrar la ventana de configuración
// inicial (Onboarding) si el usuario aún no ha configurado su CV base.

import { useState } from "react";
import { Header } from "./components/layout/Header";
import { MainContent } from "./components/MainContent";
import { Onboarding } from "./components/Onboarding";
import { getCvBase, getCvSkipped } from "./storage";

export default function App() {
  const [activeButton, setActiveButton] =
    useState<string>("Resumen de Ofertas");
  const [showOnboarding, setShowOnboarding] = useState(
    () => !getCvBase() && !getCvSkipped(),
  );

  return (
    <div className="min-h-screen bg-apply-bg text-slate-100 flex flex-col antialiased">
      <Onboarding
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      <Header activeButton={activeButton} setActiveButton={setActiveButton} />
      <MainContent
        activeButton={activeButton}
        onOpenCvSetup={() => setShowOnboarding(true)}
      />
    </div>
  );
}
