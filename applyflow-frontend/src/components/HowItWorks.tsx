// Vista "Cómo funciona": explica al usuario, de forma clara, cómo usar la
// aplicación paso a paso, el límite gratuito de IA y cómo se tratan sus datos.
// Solo información de producto, sin detalles técnicos de desarrollo.

import React from "react";

interface Step {
  numero: number;
  titulo: string;
  texto: string;
}

const pasos: Step[] = [
  {
    numero: 1,
    titulo: "Prepara tu CV base",
    texto:
      "La primera vez que entres te pedirá tu currículum: pégalo como texto o sube tu archivo .docx. Este será la base que ApplyFlow adaptará a cada oferta.",
  },
  {
    numero: 2,
    titulo: "Añade tus ofertas",
    texto:
      "Ve a Centro de Control y pega solo la URL de la oferta. ApplyFlow extrae automáticamente el puesto, la empresa, el salario y la plataforma.",
  },
  {
    numero: 3,
    titulo: "Analiza con IA",
    texto:
      "En Currículum Vitae, pega la oferta y pulsa Analizar con IA. ApplyFlow detecta las palabras clave que la empresa valora, adapta tu currículum y escribe tu carta de presentación.",
  },
  {
    numero: 4,
    titulo: "Descarga tu CV y envía la candidatura",
    texto:
      "Genera tu currículum adaptado en PDF y, con un clic, se abre tu correo con la carta preparada para que adjuntes el PDF y envíes la candidatura.",
  },
];

const beneficios = [
  "Análisis de IA gratuitos: 10 por día y usuario",
  "Tus datos se guardan solo en tu navegador: nadie más puede verlos",
  "Exporta e importa tus datos para hacer copias de seguridad o cambiar de dispositivo",
  "Si algún portal no permite leer la oferta, puedes rellenar los datos a mano",
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="w-full">
      <div className="mb-6">
        <h2 className="text-center text-2xl font-bold text-apply-primary">
          Cómo funciona
        </h2>
        <p className="text-center text-apply-secondary mb-2 text-sm">
          Tu asistente para gestionar candidaturas y adaptar tu CV con IA
        </p>
        <p className="mx-auto max-w-2xl text-center text-sm text-gray-600 mb-6">
          ApplyFlow centraliza todas tus candidaturas de empleo en un solo
          sitio: guarda las ofertas que te interesan, sigue su estado y, con
          ayuda de la inteligencia artificial, adapta tu currículum y escribe
          la carta de presentación perfecta para cada puesto.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {pasos.map((paso) => (
          <div
            key={paso.numero}
            className="bg-white rounded-xl shadow-sm border border-apply-bg p-6 flex gap-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-apply-primary text-white font-bold">
              {paso.numero}
            </div>
            <div>
              <h3 className="font-semibold text-apply-primary mb-1">
                {paso.titulo}
              </h3>
              <p className="text-sm text-gray-600">{paso.texto}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-apply-bg p-6">
        <h3 className="font-semibold text-apply-primary mb-3">
          Gratis y privado
        </h3>
        <ul className="space-y-2">
          {beneficios.map((beneficio) => (
            <li key={beneficio} className="flex items-start gap-2 text-sm">
              <span className="mt-1 text-apply-primary">✓</span>
              <span className="text-gray-700">{beneficio}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          Aplicación creada por{" "}
          <a
            href="https://cordevro.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-apply-primary hover:underline"
          >
            corDEVro
          </a>
          . Para más análisis, escribe a corDEVro.
        </p>
      </div>
    </section>
  );
};
