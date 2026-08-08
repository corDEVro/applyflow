// Este componente representa el encabezado de la aplicación: el logo y la
// navegación principal entre secciones. Diseño responsivo.

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
    </header>
  );
};
