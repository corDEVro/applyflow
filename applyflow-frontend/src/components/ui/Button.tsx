import React from "react";

// Definimos las propiedades del botón:
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  isActivePrim?: boolean;
  isActiveSec?: boolean;
  icon?: React.ReactNode;
}

// Creamos el componente Button:
export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  disabled = false,
  isActivePrim = false,
  isActiveSec = false,
  icon,
}) => {
  // Estilos base con tailwindcss:
  const baseStyles = "px-4 py-2 rounded text-sm font-semibold transition-all";

  // Estilos según el variant:
  const variantStyles = {
    primary: "bg-apply-secondary hover:bg-apply-primary text-white",
    secondary:
      "bg-apply-accent hover:bg-apply-terracotta text-white flex items-center gap-2",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center transition-all duration-200 ${baseStyles} ${!isActivePrim ? variantStyles[variant] : ""} ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : isActivePrim
            ? "bg-apply-primary ring-2 ring-apply-accent text-white"
            : isActiveSec
              ? "bg-apply-terracotta ring-2 ring-apply-primary text-white"
              : "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-apply-primary"
      }`}
    >
      {/* 1. Pintamos primero el icono si existe (en su sitio natural a la izquierda) */}
      {icon && (
        <span className="inline-flex items-center justify-center">{icon}</span>
      )}

      {/* 2. Envolvemos el texto: en móvil se oculta (hidden) y en PC aparece con su margen (md:ml-2) */}
      <span
        className={`${icon ? "hidden md:inline-block md:ml-2" : "inline-block"}`}
      >
        {label}
      </span>
    </button>
  );
};
