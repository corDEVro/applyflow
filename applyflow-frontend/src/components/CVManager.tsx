// Este componente se encarga de gestionar el proceso completo de adaptación del CV y la carta de presentación, así como el envío directo de la candidatura por correo electrónico. Integra las funcionalidades de análisis de la oferta, generación de textos con IA, descarga en PDF y envío de correos, proporcionando una experiencia fluida y centralizada para el usuario.
import React, { useState, useEffect } from "react";
import { CVOptimizer } from "./CV/CVOptimizer";
import { CoverLetter } from "./CV/CoverLetter";
import { API_URL } from "../config";

export const CVManager = () => {
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
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("af_analisis", analisis);
    localStorage.setItem("af_carta", cartaPresentacion);
    localStorage.setItem("af_cv", cvAdaptado);
    localStorage.setItem("af_email", emailEmpresa);
  }, [analisis, cartaPresentacion, cvAdaptado, emailEmpresa]);

  const handleGenerarIA = async (url: string, descripcion: string) => {
    try {
      setCargando(true);
      setError(null);
      setExitoMsg(null);

      const response = await fetch(`${API_URL}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, descripcion }),
      });

      if (!response.ok) {
        throw new Error("El servidor de Java ha fallado al procesar la IA.");
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
      const response = await fetch(
        `${API_URL}/api/cv/generate-pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contenidoCv: cvAdaptado }),
        },
      );

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
      setError(
        "Fallo al generar el PDF. Revisa la configuración en el servidor Java.",
      );
    } finally {
      setDescargandoPdf(false);
    }
  };

  const handleEnviarCandidatura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailEmpresa) {
      setError("Por favor, introduce un correo electrónico válido.");
      return;
    }
    try {
      setEnviandoEmail(true);
      setError(null);
      setExitoMsg(null);

      const response = await fetch(`${API_URL}/api/cv/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatario: emailEmpresa,
          cuerpoEmail: cartaPresentacion,
          contenidoCv: cvAdaptado,
        }),
      });

      if (!response.ok) throw new Error("Error en el servidor de correos.");

      setExitoMsg(
        "¡Candidatura enviada con éxito! El correo electrónico y el PDF se han despachado correctamente.",
      );
    } catch (err) {
      console.error("Error al enviar el correo:", err);
      setError(
        "Fallo al enviar el correo. Revisa la configuración de correo en Java.",
      );
    } finally {
      setEnviandoEmail(false);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-center text-2xl font-bold text-apply-primary">
        Gestión de Curriculum Vitae y Cartas de Presentación
      </h2>
      <p className="text-center text-apply-secondary mb-6">
        Adapta tu perfil profesional y genera textos persuasivos usando IA.
      </p>

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
                3. Envío Directo de Candidatura
              </h3>
              <p className="text-xs text-apply-secondary mb-4">
                La carta de presentación se colocará en el cuerpo del correo y
                el Currículum se adjuntará automáticamente en formato PDF.
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
                  disabled={enviandoEmail}
                  className="px-6 py-2 text-sm font-bold bg-apply-primary text-white rounded-xl hover:bg-apply-secondary transition shadow-sm disabled:opacity-50"
                >
                  {enviandoEmail ? "Enviando Correo..." : "Enviar Candidatura"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
