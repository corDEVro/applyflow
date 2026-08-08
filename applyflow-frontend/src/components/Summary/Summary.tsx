// Componentes para mostrar un resumen de las ofertas registradas por el usuario, con la posibilidad de cambiar el estado de cada candidatura directamente desde la tabla.
import React from "react";
import { type ApplicationWithPlatform } from "../../types";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Inscrito":
      return "bg-apply-secondary/20 text-apply-secondary border-apply-secondary/30";
    case "En Proceso":
      return "bg-apply-primary/10 text-apply-primary border-apply-primary/20";
    case "Descartado":
      return "bg-apply-accent text-apply-terracotta border-apply-terracotta";
    case "Contratado":
      return "bg-apply-primary text-white border-apply-primary";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

interface SummaryProps {
  data: ApplicationWithPlatform[];
  onStatusChange?: (id: number, newStatus: string) => void;
}

export const Summary: React.FC<SummaryProps> = ({ data, onStatusChange }) => {
  return (
    <section className="w-full">
      <div className="mb-6">
        <h2 className="text-center text-2xl font-bold text-apply-primary">
          Resumen de Ofertas
        </h2>
        <p className="text-center text-apply-secondary mb-6 text-sm">
          Gestiona y consulta el estado de tus candidaturas
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-apply-bg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-apply-bg/50 border-b border-apply-bg">
                <th className="px-6 py-4 font-semibold text-apply-primary">
                  Empresa
                </th>
                <th className="px-6 py-4 font-semibold text-apply-primary">
                  Puesto / Stack
                </th>
                <th className="hidden md:table-cell px-6 py-4 font-semibold text-apply-primary">
                  Plataforma
                </th>
                <th className="hidden md:table-cell px-6 py-4 font-semibold text-apply-primary">
                  Salario
                </th>
                <th className="hidden md:table-cell px-6 py-4 font-semibold text-apply-primary">
                  Estado
                </th>
                <th className="hidden md:table-cell px-6 py-4 font-semibold text-apply-primary text-center">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apply-bg">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500 italic"
                  >
                    Aún no has registrado ninguna oferta.
                  </td>
                </tr>
              ) : (
                data.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-apply-bg/10 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {app.company}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-apply-primary">
                        {app.job_title}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600">
                      {app.platform_name || "Otros"}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600">
                      {app.salary_range && app.salary_range !== "---"
                        ? `${app.salary_range}€`
                        : "Sin Especificar"}
                    </td>

                    <td className="px-6 py-4 hidden md:table-cell">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          onStatusChange &&
                          onStatusChange(app.id, e.target.value)
                        }
                        className={`text-[11px] font-bold px-2 py-1 rounded-full uppercase border cursor-pointer focus:outline-none transition-all duration-300 ${getStatusStyles(app.status)}`}
                      >
                        <option
                          value="Inscrito"
                          className="bg-white text-apply-secondary font-semibold"
                        >
                          Inscrito
                        </option>
                        <option
                          value="En Proceso"
                          className="bg-white text-apply-primary font-semibold"
                        >
                          En Proceso
                        </option>
                        <option
                          value="Descartado"
                          className="bg-white text-apply-terracotta font-semibold"
                        >
                          Descartado
                        </option>
                        <option
                          value="Contratado"
                          className="bg-white text-apply-primary font-bold"
                        >
                          ¡Contratado!
                        </option>
                      </select>
                    </td>

                    <td className="px-6 py-4 hidden md:table-cell text-center">
                      <a
                        href={
                          app.url
                            ? app.url.startsWith("http")
                              ? app.url
                              : `https://${app.url}`
                            : "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-apply-primary hover:text-apply-secondary transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
