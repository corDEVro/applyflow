// Componente para gestionar las ofertas de empleo, mostrando las candidaturas
// existentes y permitiendo añadir nuevas sin recargar la página.
// Los datos viven en localStorage (capa storage.ts), sin backend de datos.
// Incluye botones de Exportar/Importar para hacer copias de seguridad JSON.

import React, { useRef, useState } from "react";
import { type ApplicationWithPlatform } from "../../types";

interface OffersManagerProps {
  data: ApplicationWithPlatform[];
  onAdd: (application: ApplicationWithPlatform) => void;
  onExport: () => string;
  onImport: (json: string) => string | null;
}

const detectPlatformFromUrl = (url: string): string => {
  if (!url) return "Otros";
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("linkedin")) return "LinkedIn";
  if (lowerUrl.includes("infojobs")) return "InfoJobs";
  if (lowerUrl.includes("indeed")) return "Indeed";
  if (lowerUrl.includes("tecnoempleo")) return "Tecnoempleo";
  if (lowerUrl.includes("ticjob")) return "TicJob";
  if (lowerUrl.includes("glassdoor")) return "Glassdoor";
  if (lowerUrl.includes("jobandtalent")) return "Job&Talent";
  return "Otros";
};

export const OffersManager: React.FC<OffersManagerProps> = ({
  data,
  onAdd,
  onExport,
  onImport,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showMessage = (message: string, duracionMs = 3000) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(null), duracionMs);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const urlInput = (formData.get("url") as string) || "";

    const applicationData: ApplicationWithPlatform = {
      id: Date.now(),
      job_title: formData.get("jobTitle") as string,
      company: formData.get("company") as string,
      salary_range: (formData.get("salary") as string) || undefined,
      status: "Inscrito",
      platform_name: detectPlatformFromUrl(urlInput),
      url: urlInput || undefined,
      date: new Date().toISOString(),
    };

    onAdd(applicationData);
    formRef.current?.reset();
    showMessage("¡Candidatura guardada!");
  };

  const handleExportar = () => {
    const json = onExport();
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "applyflow-datos.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    showMessage("Respaldo descargado. Guárdalo en un sitio seguro.");
  };

  const handleImportar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const texto = await file.text();
      const error = onImport(texto);
      if (error) {
        showMessage(error, 5000);
      } else {
        showMessage("Datos importados correctamente.");
      }
    } catch {
      showMessage("No se pudo leer el fichero.", 5000);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <section className="w-full">
      <div className="mb-6">
        <h2 className="text-center text-2xl font-bold text-apply-primary">
          Centro de Control
        </h2>
        <p className="text-center text-apply-secondary mb-6">
          Consulta y añade tus candidaturas de forma rápida y sencilla
        </p>

        {successMsg && (
          <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-xl text-sm text-center font-medium">
            {successMsg}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-7/12 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-bold text-apply-primary">
                Mis Candidaturas
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportar}
                  className="text-xs px-3 py-1.5 rounded-lg border border-apply-secondary text-apply-primary hover:bg-apply-bg/30 font-semibold transition-colors"
                >
                  Exportar datos
                </button>
                <label className="text-xs px-3 py-1.5 rounded-lg border border-apply-secondary text-apply-primary hover:bg-apply-bg/30 font-semibold cursor-pointer transition-colors">
                  Importar datos
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportar}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {data.map((app) => (
                <div
                  key={app.id}
                  className="bg-white p-5 rounded-xl border border-apply-bg hover:shadow-md transition-shadow flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg text-apply-primary">
                      {app.job_title}
                    </h3>
                    <p className="text-apply-secondary font-medium">
                      {app.company}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] bg-apply-bg text-apply-primary px-2 py-0.5 rounded">
                        {app.platform_name || "Otros"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-apply-primary">
                      {app.salary_range && app.salary_range !== "---"
                        ? `${app.salary_range}€`
                        : "---"}
                    </p>
                    <p className="text-xs text-apply-secondary">{app.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="w-full lg:w-5/12">
            <div className="bg-white p-8 rounded-2xl border-2 border-apply-secondary/30 sticky top-8">
              <h3 className="text-xl font-bold text-apply-primary mb-6">
                Nueva Oferta
              </h3>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-apply-primary uppercase mb-1">
                    Título del puesto
                  </label>
                  <input
                    name="jobTitle"
                    type="text"
                    placeholder="Ej: Desarrollador Frontend"
                    required
                    className="w-full p-2 rounded bg-apply-bg/30 border border-apply-secondary text-apply-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-apply-primary uppercase mb-1">
                      Empresa
                    </label>
                    <input
                      name="company"
                      type="text"
                      placeholder="Ej: Google"
                      required
                      className="w-full p-2.5 rounded bg-apply-bg/30 border border-apply-secondary text-apply-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-apply-primary uppercase mb-1">
                      Salario
                    </label>
                    <input
                      name="salary"
                      type="text"
                      placeholder="Ej: 45000"
                      className="w-full p-2.5 rounded bg-apply-bg/30 border border-apply-secondary text-apply-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-apply-primary uppercase mb-1">
                    URL de la oferta
                  </label>
                  <input
                    name="url"
                    type="url"
                    placeholder="https://example.com"
                    className="w-full p-2.5 rounded bg-apply-bg/30 border border-apply-secondary text-apply-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-apply-primary text-white font-bold py-3 rounded-xl hover:bg-apply-secondary transition-colors"
                >
                  Guardar Candidatura
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
