// Este componente permite al usuario ingresar un enlace o una descripción de la oferta laboral para que la IA pueda analizarla y optimizar el CV en función de esa información. El componente maneja el estado del input y deshabilita el botón mientras se procesa la información.

import React, { useState } from "react";

interface CVOptimizerProps {
  onGenerar: (url: string, descripcion: string) => void;
  cargando: boolean;
}

export const CVOptimizer: React.FC<CVOptimizerProps> = ({
  onGenerar,
  cargando,
}) => {
  const [inputText, setInputText] = useState("");

  const handleAnalizar = () => {
    if (!inputText.trim()) return;

    if (inputText.startsWith("http://") || inputText.startsWith("https://")) {
      onGenerar(inputText, "");
    } else {
      onGenerar("", inputText);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border-2 border-apply-secondary/50 text-center">
      <h3 className="text-xl font-bold text-apply-primary mb-4">
        ¿A qué oferta quieres aplicar?
      </h3>
      <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="Pega el enlace de la oferta o descripción..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={cargando}
          className="flex-1 p-3 rounded-xl border text-apply-primary border-apply-secondary focus:ring-2 focus:ring-apply-primary outline-none text-sm disabled:bg-gray-100"
        />
        <button
          onClick={handleAnalizar}
          disabled={cargando || !inputText.trim()}
          className="bg-apply-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-apply-secondary transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {cargando ? "Procesando..." : "Analizar con IA"}
        </button>
      </div>
    </div>
  );
};
