// Este componente es el corazón de la aplicación. Muestra el contenido según la
// sección activa y mantiene el estado de las candidaturas EN EL NAVEGADOR
// (localStorage) gracias a la capa de datos storage.ts. No hay base de datos:
// cada usuario tiene sus propios datos aislados.

import { useState } from "react";
import { type ApplicationWithPlatform } from "../types";
import {
  exportData,
  getApplications,
  importData,
  saveApplications,
} from "../storage";
import { Summary } from "./Summary/Summary";
import { OffersManager } from "./Offers/OffersManager";
import { CVManager } from "./CVManager";
import { HowItWorks } from "./HowItWorks";

interface MainContentProps {
  activeButton: string;
  onOpenCvSetup: () => void;
}

export function MainContent({ activeButton, onOpenCvSetup }: MainContentProps) {
  const [applications, setApplications] = useState<ApplicationWithPlatform[]>(
    () => getApplications(),
  );

  const handleStatusChange = (id: number, newStatus: string) => {
    setApplications((prev) => {
      const next = prev.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app,
      );
      saveApplications(next);
      return next;
    });
  };

  const handleAddApplication = (app: ApplicationWithPlatform) => {
    setApplications((prev) => {
      const next = [...prev, app];
      saveApplications(next);
      return next;
    });
  };

  const handleImport = (json: string): string | null => {
    const result = importData(json);
    if (result.ok) {
      setApplications(getApplications());
      return null;
    }
    return result.message ?? "No se pudo importar los datos.";
  };

  return (
    <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
      <div
        className={`card-premium p-6 animate-fade-in ${
          activeButton === "Resumen de Ofertas" ? "" : "hidden"
        }`}
      >
        <Summary data={applications} onStatusChange={handleStatusChange} />
      </div>

      <div
        className={`card-premium p-6 animate-fade-in ${
          activeButton === "Centro de Control" ? "" : "hidden"
        }`}
      >
        <OffersManager
          data={applications}
          onAdd={handleAddApplication}
          onExport={exportData}
          onImport={handleImport}
        />
      </div>

      <div
        className={`card-premium p-6 animate-fade-in ${
          activeButton === "Curriculum Vitae" ? "" : "hidden"
        }`}
      >
        <CVManager onOpenCvSetup={onOpenCvSetup} />
      </div>

      <div
        className={`card-premium p-6 animate-fade-in ${
          activeButton === "Cómo funciona" ? "" : "hidden"
        }`}
      >
        <HowItWorks />
      </div>
    </main>
  );
}
