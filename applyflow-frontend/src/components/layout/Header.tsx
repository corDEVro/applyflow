// Este componente representa el encabezado de la aplicación: el logo y la
// navegación principal entre secciones. En desktop el menú queda centrado y el
// botón "Cómo funciona" anclado a la derecha. En móvil se muestra un menú
// hamburguesa que despliega las secciones.

import React, { useState } from "react";
import { Button } from "../ui/Button";

interface HeaderProps {
  activeButton: string;
  setActiveButton: (button: string) => void;
}

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-4 w-4"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
      clipRule="evenodd"
    />
  </svg>
);

const secciones = [
  "Resumen de Ofertas",
  "Centro de Control",
  "Curriculum Vitae",
];

interface NavProps {
  activeButton: string;
  onNavigate: (button: string) => void;
}

const MainNav = ({ activeButton, onNavigate }: NavProps) => (
  <>
    {secciones.map((item) => (
      <Button
        key={item}
        label={item}
        onClick={() => onNavigate(item)}
        variant="primary"
        isActivePrim={activeButton === item}
      />
    ))}
  </>
);

const HelpButton = ({ activeButton, onNavigate }: NavProps) => (
  <Button
    label="Cómo funciona"
    onClick={() => onNavigate("Cómo funciona")}
    variant="ghost"
    isActivePrim={activeButton === "Cómo funciona"}
    icon={<InfoIcon />}
    forceShowLabel
  />
);

export const Header: React.FC<HeaderProps> = ({
  activeButton,
  setActiveButton,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (button: string) => {
    setActiveButton(button);
    setMenuOpen(false);
  };

  return (
    <header className="relative bg-apply-secondary/10 h-14 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center flex-1">
        <img
          src="/applyFlow_logo.png"
          alt="ApplyFlow"
          className="hidden sm:block h-9 md:h-10 lg:h-12 w-auto"
        />
        <img
          src="/applyFlow_icon.png"
          alt="ApplyFlow"
          className="sm:hidden h-9 w-auto"
        />
      </div>

      {/* Navegación desktop: menú centrado */}
      <nav className="hidden md:flex flex-1 items-center justify-center gap-3 lg:gap-6 text-sm font-medium text-gray-300">
        <MainNav activeButton={activeButton} onNavigate={handleNavigate} />
      </nav>

      {/* "Cómo funciona" anclado a la derecha (desktop) */}
      <div className="hidden md:flex flex-1 justify-end">
        <HelpButton activeButton={activeButton} onNavigate={handleNavigate} />
      </div>

      {/* Botón hamburguesa (solo móvil) */}
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="md:hidden flex flex-col items-center justify-center gap-1.5 p-2 rounded-md hover:bg-apply-primary/10 focus:outline-none focus:ring-2 focus:ring-apply-primary"
      >
        <span
          className={`block h-0.5 w-6 bg-apply-primary transition-all duration-300 ${
            menuOpen ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-apply-primary transition-all duration-300 ${
            menuOpen ? "-rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-apply-primary transition-all duration-300 ${
            menuOpen ? "opacity-0" : ""
          }`}
        />
      </button>

      {/* Menú desplegable (solo móvil) */}
      {menuOpen && (
        <nav className="md:hidden absolute top-full left-0 right-0 z-50 bg-white shadow-lg border-b border-apply-bg p-4 flex flex-col items-stretch gap-2 animate-fade-in">
          <MainNav activeButton={activeButton} onNavigate={handleNavigate} />
          <div className="my-1 border-t border-apply-bg" />
          <HelpButton activeButton={activeButton} onNavigate={handleNavigate} />
        </nav>
      )}
    </header>
  );
};
