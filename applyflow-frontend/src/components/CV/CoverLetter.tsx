// Componente para mostrar la carta de presentación generada por la IA, con
// opción de copiarla al portapapeles y de editarla (textarea controlado).
import React, { useState } from "react";

interface CoverLetterProps {
  carta: string;
  cargando: boolean;
  onChange?: (value: string) => void;
}

export const CoverLetter: React.FC<CoverLetterProps> = ({
  carta,
  cargando,
  onChange,
}) => {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    if (!carta) return;
    await navigator.clipboard.writeText(carta);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-apply-bg shadow-sm overflow-hidden">
      <div className="bg-apply-bg/20 px-6 py-3 border-b border-apply-bg flex justify-between items-center">
        <span className="text-sm font-medium text-apply-primary">
          Carta de Presentación Generada
        </span>
        {carta && (
          <button
            onClick={handleCopiar}
            className="text-xs bg-apply-primary text-white px-3 py-1 rounded-md hover:bg-apply-secondary transition-colors"
          >
            {copiado ? "¡Copiado!" : "Copiar Texto"}
          </button>
        )}
      </div>
      <div className="p-6">
        {cargando ? (
          <div className="w-full h-80 flex flex-col items-center justify-center gap-3 text-apply-secondary">
            <div className="h-8 w-8 rounded-full border-4 border-apply-bg border-t-apply-primary animate-spin" />
            <p className="text-sm font-medium animate-pulse">
              Redactando con IA...
            </p>
          </div>
        ) : (
          <textarea
            className="w-full h-80 text-gray-700 leading-relaxed resize-none focus:outline-none text-sm bg-transparent"
            placeholder="El resultado de la IA aparecerá aquí..."
            value={carta}
            onChange={(e) => onChange?.(e.target.value)}
          />
        )}
      </div>
    </div>
  );
};
