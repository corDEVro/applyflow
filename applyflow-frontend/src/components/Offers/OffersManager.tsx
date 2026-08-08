// Componente para gestionar las ofertas de empleo. Añadir una oferta es tan
// fácil como pegar su URL: el backend descarga la página y la IA extrae
// título, empresa, salario, plataforma y email. Si la extracción falla (hay
// portales que bloquean a los bots), se muestra un pequeño formulario de
// respaldo para completar los datos a mano.
// Los datos viven en localStorage (capa storage.ts), sin backend de datos.
// Incluye Exportar/Importar para copias de seguridad JSON.

import React, { useRef, useState } from "react";
import { type ApplicationWithPlatform } from "../../types";
import { API_URL } from "../../config";
import {
  consumirAnalisisIA,
  limiteDiario,
  quedanAnalisisIA,
} from "../../storage";

interface OffersManagerProps {
  data: ApplicationWithPlatform[];
  onAdd: (application: ApplicationWithPlatform) => void;
  onExport: () => string;
  onImport: (json: string) => string | null;
}

interface DatosOferta {
  url: string;
  titulo?: string;
  empresa?: string;
  salario?: string;
  plataforma?: string;
  email?: string;
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
  const [url, setUrl] = useState("");
  const [extrayendo, setExtrayendo] = useState(false);
  const [datos, setDatos] = useState<DatosOferta | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [quedan, setQuedan] = useState(() => quedanAnalisisIA());

  const showMessage = (message: string, duracionMs = 3000) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(null), duracionMs);
  };

  const crearCandidatura = (datosOferta: DatosOferta): ApplicationWithPlatform => {
    const plataforma =
      (datosOferta.plataforma && datosOferta.plataforma.trim()
        ? datosOferta.plataforma
        : detectPlatformFromUrl(datosOferta.url)) || "Otros";
    return {
      id: Date.now(),
      job_title: datosOferta.titulo?.trim() || "",
      company: datosOferta.empresa?.trim() || "",
      salary_range: datosOferta.salario?.trim() || undefined,
      status: "Inscrito",
      platform_name: plataforma,
      url: datosOferta.url || undefined,
      date: new Date().toISOString(),
    };
  };

  const handleExtract = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const urlLimpia = url.trim();
    if (!urlLimpia) return;

    setExtrayendo(true);
    setExtractError(null);
    setDatos(null);

    if (!consumirAnalisisIA()) {
      setExtrayendo(false);
      setExtractError(
        `Te has quedado sin extracciones gratuitas hoy (${limiteDiario()} por día). Vuelve mañana.`,
      );
      setQuedan(0);
      return;
    }
    setQuedan(quedanAnalisisIA());

    try {
      const response = await fetch(`${API_URL}/api/offer/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlLimpia }),
      });
      const resultado = await response.json();

      if (
        resultado.error ||
        (!resultado.titulo && !resultado.empresa && !resultado.salario)
      ) {
        setDatos({ url: urlLimpia });
        setExtractError(
          resultado.error ||
            "No se pudieron extraer los datos automáticamente.",
        );
      } else {
        onAdd(crearCandidatura({ url: urlLimpia, ...resultado }));
        setUrl("");
        formRef.current?.reset();
        showMessage("¡Candidatura guardada! Datos extraídos de la oferta.");
      }
    } catch {
      setDatos({ url: urlLimpia });
      setExtractError(
        "No se pudo conectar con el servidor. Completa los datos manualmente.",
      );
    } finally {
      setExtrayendo(false);
    }
  };

  const handleGuardarManual = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!datos) return;
    const formData = new FormData(event.currentTarget);

    onAdd(
      crearCandidatura({
        url: datos.url,
        titulo: (formData.get("titulo") as string) || datos.titulo || "",
        empresa: (formData.get("empresa") as string) || datos.empresa || "",
        salario: (formData.get("salario") as string) || datos.salario || "",
        plataforma: datos.plataforma,
      }),
    );

    setDatos(null);
    setExtractError(null);
    setUrl("");
    formRef.current?.reset();
    showMessage("¡Candidatura guardada!");
  };

  const handleExportar = () => {
    const json = onExport();
    const blob = new Blob([json], { type: "application/json" });
    const urlDescarga = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlDescarga;
    a.download = "applyflow-datos.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(urlDescarga);
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
                      {app.job_title || "Oferta sin título"}
                    </h3>
                    <p className="text-apply-secondary font-medium">
                      {app.company || "Empresa no disponible"}
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
              <h3 className="text-xl font-bold text-apply-primary mb-2">
                Nueva Oferta
              </h3>
              <p className="text-xs text-apply-secondary mb-6">
                Pega la URL de la oferta y ApplyFlow extraerá los datos
                automáticamente. Extracciones gratuitas hoy:{" "}
                <span className="font-bold text-apply-primary">
                  {quedan} / {limiteDiario()}
                </span>
              </p>

              {!datos && extractError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-xs text-center">
                  {extractError}
                </div>
              )}

              {!datos && (
                <form ref={formRef} onSubmit={handleExtract} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-apply-primary uppercase mb-1">
                      URL de la oferta
                    </label>
                    <input
                      name="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.infojobs.net/.../"
                      required
                      disabled={extrayendo}
                      className="w-full p-2.5 rounded bg-apply-bg/30 border border-apply-secondary text-apply-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={extrayendo || !url.trim()}
                    className="w-full bg-apply-primary text-white font-bold py-3 rounded-xl hover:bg-apply-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {extrayendo ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Extrayendo datos de la oferta...
                      </>
                    ) : (
                      "Guardar Oferta"
                    )}
                  </button>
                </form>
              )}

              {datos && (
                <form onSubmit={handleGuardarManual} className="space-y-4">
                  {extractError && (
                    <div className="p-3 bg-amber-100 text-amber-800 rounded-xl text-xs">
                      {extractError} Completa los campos y guarda.
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-apply-primary uppercase mb-1">
                      Título del puesto
                    </label>
                    <input
                      name="titulo"
                      type="text"
                      defaultValue={datos.titulo || ""}
                      placeholder="Ej: Desarrollador Frontend"
                      className="w-full p-2 rounded bg-apply-bg/30 border border-apply-secondary text-apply-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-apply-primary uppercase mb-1">
                        Empresa
                      </label>
                      <input
                        name="empresa"
                        type="text"
                        defaultValue={datos.empresa || ""}
                        placeholder="Ej: Google"
                        className="w-full p-2.5 rounded bg-apply-bg/30 border border-apply-secondary text-apply-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-apply-primary uppercase mb-1">
                        Salario
                      </label>
                      <input
                        name="salario"
                        type="text"
                        defaultValue={datos.salario || ""}
                        placeholder="Ej: 45000"
                        className="w-full p-2.5 rounded bg-apply-bg/30 border border-apply-secondary text-apply-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-apply-primary text-white font-bold py-3 rounded-xl hover:bg-apply-secondary transition-colors"
                  >
                    Guardar Candidatura
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
