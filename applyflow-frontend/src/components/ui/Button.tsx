import React from "react";

// Definimos las propiedades del botón:
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  isActivePrim?: boolean;
  isActiveSec?: boolean;
  icon?: React.ReactNode;
  className?: string;
  forceShowLabel?: boolean;
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
  className = "",
  forceShowLabel = false,
}) => {
  // Estilos base con tailwindcss:
  const baseStyles =
    "px-4 py-2 rounded text-sm font-semibold transition-all whitespace-nowrap";

  // Estilos según el variant:
  const variantStyles = {
    primary: "bg-apply-secondary hover:bg-apply-primary text-white",
    secondary:
      "bg-apply-accent hover:bg-apply-terracotta text-white flex items-center gap-2",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    // Variante "información/ayuda": outline que destaca del resto de la navegación
    ghost:
      "bg-white/60 border-2 border-apply-primary text-apply-primary hover:bg-apply-primary hover:text-white flex items-center gap-1",
  };

  const activeStyles = isActivePrim
    ? "bg-apply-primary ring-2 ring-apply-accent text-white"
    : isActiveSec
      ? "bg-apply-terracotta ring-2 ring-apply-primary text-white"
      : "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-apply-primary";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center transition-all duration-200 ${baseStyles} ${
        disabled ? "opacity-50 cursor-not-allowed" : activeStyles
      } ${
        !isActivePrim && !isActiveSec
          ? variantStyles[variant]
          : variant === "ghost"
            ? "bg-apply-primary ring-2 ring-apply-accent text-white"
            : ""
      } ${className}`}
    >
      {/* 1. Pintamos primero el icono si existe (en su sitio natural a la izquierda) */}
      {icon && (
        <span className="inline-flex items-center justify-center">{icon}</span>
      )}

      {/* 2. Envolvemos el texto: en móvil se oculta (hidden) y en PC aparece con su margen (md:ml-2) */}
      <span
        className={`${
          icon && !forceShowLabel
            ? "hidden md:inline-block md:ml-1"
            : "inline-block"
        }`}
      >
        {label}
      </span>
    </button>
  );
};
