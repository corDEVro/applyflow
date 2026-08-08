// Componente para gestionar las ofertas de empleo, mostrando las candidaturas
// existentes y permitiendo añadir nuevas sin recargar la página.

import React, { useRef, useState } from "react";
import { type ApplicationWithPlatform } from "../../types";
import { API_URL } from "../../config";

interface OffersManagerProps {
  data: ApplicationWithPlatform[];
  onAdd: (application: ApplicationWithPlatform) => void;
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

export const OffersManager: React.FC<OffersManagerProps> = ({ data, onAdd }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const urlInput = formData.get("url") as string;

    const applicationData = {
      jobTitle: formData.get("jobTitle") as string,
      company: formData.get("company") as string,
      salaryRange: formData.get("salary") as string,
      applicationUrl: urlInput,
      status: "Inscrito",
      platformName: detectPlatformFromUrl(urlInput),
    };

    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        throw new Error("El servidor rechazó la candidatura.");
      }

      const created = await response.json();
      onAdd({
        id: created.id,
        job_title: created.jobTitle,
        company: created.company,
        platform_name: created.platformName || "Otros",
        salary_range: created.salaryRange || undefined,
        status: created.status,
        url: created.applicationUrl,
        date: created.date,
      });

      formRef.current?.reset();
      setSuccessMsg("¡Candidatura guardada con éxito!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setSaving(false);
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-apply-primary">
                Mis Candidaturas
              </h2>
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
                  disabled={saving}
                  className="w-full bg-apply-primary text-white font-bold py-3 rounded-xl hover:bg-apply-secondary transition-colors disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar Candidatura"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
