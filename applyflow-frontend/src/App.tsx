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

      <footer className="mt-auto py-8 px-6 bg-apply-primary text-white">
        <div className="flex flex-col items-center gap-3">
          <a
            href="https://cordevro.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            title="corDEVro"
            className="flex items-center justify-center bg-[#a8dadc] rounded-full p-2.5 opacity-95 hover:opacity-100 hover:scale-105 transition-all shadow-md"
          >
            <img
              src="/cordevro_logo.png"
              alt="corDEVro"
              className="h-7 w-auto"
            />
          </a>
          <p className="text-xs text-white/70">
            © 2026 corDEVro · Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
