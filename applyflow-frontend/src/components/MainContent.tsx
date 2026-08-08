// Este componente es el corazón de la aplicación, encargado de mostrar el contenido principal basado en la sección seleccionada por el usuario. Se encarga de:
// 1. Conectar con el backend de Java para obtener los datos de las aplicaciones.
// 2. Manejar el estado de carga y errores durante la conexión.
// 3. Renderizar el contenido adecuado (Resumen de Ofertas, Centro de Control o Curriculum Vitae) según la sección activa seleccionada por el usuario.
import { useState, useEffect } from "react";
import { type ApplicationWithPlatform } from "../types";
import { Summary } from "./Summary/Summary";
import { OffersManager } from "./Offers/OffersManager";
import { CVManager } from "./CVManager";
import { API_URL } from "../config";

interface JavaApplication {
  id: number;
  company: string;
  jobTitle: string;
  platformName: string | null;
  salaryRange: string | null;
  status: string;
  applicationUrl: string | null;
  date: string;
}

interface MainContentProps {
  activeButton: string;
}

export function MainContent({ activeButton }: MainContentProps) {
  const [initialData, setInitialData] = useState<ApplicationWithPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/applications`);

        if (!response.ok) {
          throw new Error(`Error en el servidor: ${response.status}`);
        }

        const dataFromServer = await response.json();

        const mappedData: ApplicationWithPlatform[] = dataFromServer.map(
          (app: JavaApplication) => ({
            id: app.id,
            job_title: app.jobTitle,
            company: app.company,
            platform_name: app.platformName || "Otros",
            salary_range: app.salaryRange || "---",
            status: app.status,
            url: app.applicationUrl,
            date: app.date,
          }),
        );

        setInitialData(mappedData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al conectar con el servidor",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/applications/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        setInitialData((prevData) =>
          prevData.map((app) =>
            app.id === id ? { ...app, status: newStatus } : app,
          ),
        );
      } else {
        console.error(
          "El backend de Java rechazó la actualización del estado.",
        );
      }
    } catch (err) {
      console.error(
        "Error de red al conectar con el endpoint PATCH de Java:",
        err,
      );
    }
  };

  const handleAddApplication = (app: ApplicationWithPlatform) => {
    setInitialData((prev) => [...prev, app]);
  };

  if (error) {
    return (
      <div className="flex-center p-10 text-red-500 font-medium">
        Error: {error}. ¿Está el backend encendido?
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex-center flex-col gap-3 text-slate-400">
        <div className="h-8 w-8 rounded-full border-4 border-slate-700 border-t-emerald-400 animate-spin" />
        <p className="text-sm font-medium">Conectando con base de datos...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
      {activeButton === "Resumen de Ofertas" && (
        <div className="card-premium p-6 animate-fade-in">
          <Summary data={initialData} onStatusChange={handleStatusChange} />
        </div>
      )}

      {activeButton === "Centro de Control" && (
        <div className="card-premium p-6 animate-fade-in">
          <OffersManager data={initialData} onAdd={handleAddApplication} />
        </div>
      )}

      {activeButton === "Curriculum Vitae" && (
        <div className="card-premium p-6 animate-fade-in">
          <CVManager />
        </div>
      )}
    </main>
  );
}
