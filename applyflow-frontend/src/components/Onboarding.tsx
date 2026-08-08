// Ventana de bienvenida que aparece la primera vez que el usuario abre la app.
// Le pide su CV base (pegando el texto o subiendo un .docx) y lo guarda SOLO
// en su navegador (localStorage). Puede saltarse el paso y configurarlo luego.

import React, { useRef, useState } from "react";
import { saveCvBase, setCvSkipped } from "../storage";
import { API_URL } from "../config";

interface OnboardingProps {
  open: boolean;
  onClose: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ open, onClose }) => {
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const guardarTexto = () => {
    if (!texto.trim()) {
      setError("Pega tu CV en el cuadro antes de guardar.");
      return;
    }
    saveCvBase(texto);
    setTexto("");
    setError(null);
    onClose();
  };

  const subirDocx = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCargando(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_URL}/api/cv/extract-text`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("El servidor no pudo extraer el texto del documento.");
      }
      const textoExtraido = await response.text();
      saveCvBase(textoExtraido);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al extraer el texto del .docx",
      );
    } finally {
      setCargando(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saltar = () => {
    setCvSkipped();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-apply-primary text-center mb-2">
          Configura tu CV base
        </h2>
        <p className="text-sm text-apply-secondary text-center mb-6">
          Pega el texto de tu CV o sube tu archivo .docx. Se guardará{" "}
          <strong>solo en tu navegador</strong> y nadie más podrá verlo.
        </p>

        <label className="block text-xs font-bold text-apply-primary uppercase mb-1">
          Pega tu CV (texto)
        </label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={8}
          placeholder={"# Tu Nombre Completo\n\n## EXPERIENCIA\n- Desarrollador..."}
          className="w-full p-3 rounded-xl border border-apply-secondary text-sm text-apply-primary focus:outline-none focus:ring-2 focus:ring-apply-primary resize-y"
        />
        <button
          onClick={guardarTexto}
          className="w-full mt-3 bg-apply-primary text-white py-3 rounded-xl font-bold hover:bg-apply-secondary transition-colors"
        >
          Guardar mi CV
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-apply-bg" />
          <span className="text-xs text-apply-secondary font-semibold uppercase">
            o
          </span>
          <div className="flex-1 h-px bg-apply-bg" />
        </div>

        <label className="block w-full text-center bg-apply-bg/30 border border-dashed border-apply-secondary py-4 rounded-xl cursor-pointer hover:bg-apply-bg/50 transition-colors">
          {cargando ? (
            <span className="text-sm font-semibold text-apply-primary">
              Extrayendo texto del .docx...
            </span>
          ) : (
            <span className="text-sm font-semibold text-apply-primary">
              Subir mi CV en .docx
            </span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".docx"
            onChange={subirDocx}
            disabled={cargando}
            className="hidden"
          />
        </label>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={saltar}
            className="text-xs text-apply-secondary hover:text-apply-primary underline"
          >
            Ahora no, quiero crearlo desde cero
          </button>
        </div>
      </div>
    </div>
  );
};
