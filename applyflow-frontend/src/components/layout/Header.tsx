// Este componente representa el encabezado de la aplicación, que incluye el logo, la navegación principal y un botón para descargar el CV del usuario. El diseño es responsivo, adaptándose a diferentes tamaños de pantalla. El botón de descarga del CV utiliza un enlace dinámico para permitir a los usuarios descargar su CV en formato PDF.
import React from "react";
import { Button } from "../ui/Button";

interface HeaderProps {
  activeButton: string;
  setActiveButton: (button: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeButton,
  setActiveButton,
}) => {
  return (
    <header className="bg-apply-secondary/10 h-14 flex items-center justify-between px-6 md:h-14">
      <div className="flex items-center space-x-3">
        <img src="/applyFlow_logo.png" alt="Logo" className="h-18 w-auto" />
      </div>

      <nav className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-sm font-medium w-full md:w-auto text-gray-300">
        <Button
          label="Resumen de Ofertas"
          onClick={() => setActiveButton("Resumen de Ofertas")}
          variant="primary"
          disabled={false}
          isActivePrim={activeButton === "Resumen de Ofertas"}
        />
        <Button
          label="Centro de Control"
          onClick={() => setActiveButton("Centro de Control")}
          variant="primary"
          disabled={false}
          isActivePrim={activeButton === "Centro de Control"}
        />
        <Button
          label="Curriculum Vitae"
          onClick={() => setActiveButton("Curriculum Vitae")}
          variant="primary"
          disabled={false}
          isActivePrim={activeButton === "Curriculum Vitae"}
        />
      </nav>

      <div className="flex items-center">
        <Button
          label="Mi CV"
          onClick={() => {
            const link = document.createElement("a");
            link.href = "/mi-cv.pdf";
            link.download = "mi-cv.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          variant="secondary"
          disabled={false}
          isActiveSec={false}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-file-type-pdf"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
              <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" />
              <path d="M17 18h2" />
              <path d="M20 15h-3v6" />
              <path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1" />
            </svg>
          }
        />
      </div>
    </header>
  );
};
