// Este componente gestiona el proceso completo de adaptación del CV y la carta
// de presentación con IA. El CV base se envía desde el navegador (localStorage).
// El "envío" de la candidatura se hace con mailto: se abre el correo del usuario
// con la carta preparada y él adjunta el PDF, sin backend de correos.

import React, { useState, useEffect } from "react";
import { CVOptimizer } from "./CV/CVOptimizer";
import { CoverLetter } from "./CV/CoverLetter";
import { API_URL } from "../config";
import {
  consumirAnalisisIA,
  getCvBase,
  limiteDiario,
  quedanAnalisisIA,
} from "../storage";

interface CVManagerProps {
  onOpenCvSetup?: () => void;
}

export const CVManager = ({ onOpenCvSetup }: CVManagerProps) => {
  const [analisis, setAnalisis] = useState(
    () => localStorage.getItem("af_analisis") || "",
  );
  const [cartaPresentacion, setCartaPresentacion] = useState(
    () => localStorage.getItem("af_carta") || "",
  );
  const [cvAdaptado, setCvAdaptado] = useState(
    () => localStorage.getItem("af_cv") || "",
  );
  const [emailEmpresa, setEmailEmpresa] = useState(
    () => localStorage.getItem("af_email") || "",
  );

  const [cargando, setCargando] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);
  const [quedan, setQuedan] = useState(() => quedanAnalisisIA());

  useEffect(() => {
    localStorage.setItem("af_analisis", analisis);
    localStorage.setItem("af_carta", cartaPresentacion);
    localStorage.setItem("af_cv", cvAdaptado);
    localStorage.setItem("af_email", emailEmpresa);
  }, [analisis, cartaPresentacion, cvAdaptado, emailEmpresa]);

  const handleGenerarIA = async (url: string, descripcion: string) => {
    if (!consumirAnalisisIA()) {
      setError(
        `Te has quedado sin análisis gratuitos hoy (${limiteDiario()} por día). Vuelve mañana o escribe a corDEVro para el modo premium.`,
      );
      return;
    }
    setQuedan(quedanAnalisisIA());

    try {
      setCargando(true);
      setError(null);
      setExitoMsg(null);

      const response = await fetch(`${API_URL}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, descripcion, cvBase: getCvBase() }),
      });

      if (!response.ok) {
        throw new Error("El servidor ha fallado al procesar la IA.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalisis(data.analisis || "");
      setCartaPresentacion(data.cartaPresentacion || "");
      setCvAdaptado(data.cvAdaptado || "");
      setEmailEmpresa(data.email || "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al conectar con la IA",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarPDF = async () => {
    if (!cvAdaptado) return;
    try {
      setDescargandoPdf(true);
      const response = await fetch(`${API_URL}/api/cv/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenidoCv: cvAdaptado }),
      });

      if (!response.ok) throw new Error("Error al generar el PDF.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "CV_Adaptado_ApplyFlow.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Error al generar PDF:", err);
      setError("Fallo al generar el PDF. Comprueba la conexión con el servidor.");
    } finally {
      setDescargandoPdf(false);
    }
  };

  const handleEnviarCandidatura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailEmpresa) {
      setError("Por favor, introduce un correo electrónico válido.");
      return;
    }
    setError(null);
    setExitoMsg(null);

    const asunto = encodeURIComponent(
      "Candidatura para el puesto - Currículum y Carta de Presentación",
    );
    const cuerpo = encodeURIComponent(cartaPresentacion);
    const mailtoUrl = `mailto:${emailEmpresa}?subject=${asunto}&body=${cuerpo}`;

    const link = document.createElement("a");
    link.href = mailtoUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setExitoMsg(
      "Se ha abierto tu programa de correo con la carta preparada. Adjunta el PDF descargado y envíalo.",
    );
    setTimeout(() => setExitoMsg(null), 6000);
  };

  return (
    <div className="mb-6">
      <h2 className="text-center text-2xl font-bold text-apply-primary">
        Gestión de Curriculum Vitae y Cartas de Presentación
      </h2>
      <p className="text-center text-apply-secondary mb-6">
        Adapta tu perfil profesional y genera textos persuasivos usando IA.
      </p>

      <p className="text-center text-xs font-semibold text-apply-primary mb-4">
        Análisis gratuitos hoy: {quedan} / {limiteDiario()}
      </p>

      {!getCvBase() && (
        <div className="my-4 p-3 bg-amber-100 text-amber-800 rounded-xl text-sm flex flex-wrap justify-between items-center gap-3">
          <span>
            Tu CV base aún no está configurado: la IA usará un perfil genérico.
          </span>
          {onOpenCvSetup && (
            <button
              onClick={onOpenCvSetup}
              className="px-3 py-1 bg-apply-primary text-white rounded-lg text-xs font-bold hover:bg-apply-secondary transition-colors"
            >
              Configurar CV base
            </button>
          )}
        </div>
      )}

      <CVOptimizer onGenerar={handleGenerarIA} cargando={cargando} />

      {error && (
        <div className="my-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {exitoMsg && (
        <div className="my-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm text-center font-medium">
          {exitoMsg}
        </div>
      )}

      {(cargando || analisis || cartaPresentacion || cvAdaptado) && (
        <div className="flex flex-col lg:flex-row gap-10 mt-6">
        <aside className="lg:w-4/12">
          <div className="sticky top-8 space-y-4">
            <h3 className="text-sm font-bold text-apply-primary uppercase tracking-widest">
              Análisis de la Oferta
            </h3>
            <div className="bg-white p-6 rounded-2xl border border-apply-bg shadow-sm min-h-37.5">
              {analisis ? (
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {analisis}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  {cargando
                    ? "La IA está analizando las palabras clave de forma resumida..."
                    : "Aquí aparecerán los puntos clave de la oferta."}
                </p>
              )}
            </div>
          </div>
        </aside>

        <main className="lg:w-8/12 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-apply-primary uppercase tracking-widest mb-4">
              1. Carta de Presentación
            </h3>
            <CoverLetter
              carta={cartaPresentacion}
              cargando={cargando}
              onChange={setCartaPresentacion}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-apply-primary uppercase tracking-widest">
                2. Currículum Adaptado
              </h3>
              {cvAdaptado && (
                <button
                  onClick={handleDescargarPDF}
                  disabled={descargandoPdf}
                  className="px-3 py-1 text-xs font-semibold bg-apply-primary text-white rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {descargandoPdf ? "Generando PDF..." : "Descargar en PDF"}
                </button>
              )}
            </div>
            <div className="bg-white p-6 rounded-2xl border border-apply-bg shadow-sm h-80 overflow-y-auto">
              {cvAdaptado ? (
                <textarea
                  className="w-full h-full text-sm text-gray-700 bg-transparent border-none focus:outline-none resize-none"
                  value={cvAdaptado}
                  onChange={(e) => setCvAdaptado(e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-500 italic">
                  {cargando
                    ? "Modificando aptitudes para alinearlas..."
                    : "Tu CV base adaptado aparecerá en este bloque listo para revisión."}
                </p>
              )}
            </div>
          </div>

          {(cartaPresentacion || cvAdaptado) && (
            <div className="bg-apply-bg bg-opacity-30 p-6 rounded-2xl border border-apply-bg">
              <h3 className="text-sm font-bold text-apply-primary uppercase tracking-widest mb-3">
                3. Envío de Candidatura
              </h3>
              <p className="text-xs text-apply-secondary mb-4">
                Se abrirá tu programa de correo con la carta en el cuerpo del
                mensaje. Descarga antes el PDF y adjúntalo tú manualmente.
              </p>
              <form
                onSubmit={handleEnviarCandidatura}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  placeholder="Introduce el email de la empresa (ej: rrhh@empresa.com)"
                  value={emailEmpresa}
                  onChange={(e) => setEmailEmpresa(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm bg-white border border-gray-300 text-apply-primary rounded-xl focus:outline-none focus:border-apply-primary"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-bold bg-apply-primary text-white rounded-xl hover:bg-apply-secondary transition shadow-sm"
                >
                  Abrir Correo con Candidatura
                </button>
              </form>
            </div>
          )}
        </main>
        </div>
      )}
    </div>
  );
};
