// Capa de datos de ApplyFlow (MVP sin base de datos).
// Toda la información del usuario vive en el localStorage de su navegador:
// aislada por dispositivo/navegador y lista para migrar a una BD futura
// cambiando solo estas funciones (repository pattern).

import type { ApplicationWithPlatform } from "./types";

const KEY_APPS = "af_applications";
const KEY_CV_BASE = "af_cv_base";
const KEY_CV_SKIPPED = "af_cv_skipped";
const KEY_USO = "af_uso_diario";

const LIMITE_IA_DIARIO = 5;

export function limiteDiario(): number {
  return LIMITE_IA_DIARIO;
}

function fechaLocalHoy(): string {
  return new Date().toLocaleDateString("sv-SE");
}

export function quedanAnalisisIA(): number {
  try {
    const raw = localStorage.getItem(KEY_USO);
    if (!raw) return LIMITE_IA_DIARIO;
    const { fecha, usos } = JSON.parse(raw);
    if (fecha !== fechaLocalHoy()) return LIMITE_IA_DIARIO;
    return Math.max(0, LIMITE_IA_DIARIO - usos);
  } catch {
    return LIMITE_IA_DIARIO;
  }
}

export function consumirAnalisisIA(): boolean {
  if (quedanAnalisisIA() <= 0) return false;
  try {
    const raw = localStorage.getItem(KEY_USO);
    const prev = raw ? JSON.parse(raw) : { fecha: "", usos: 0 };
    const hoy = fechaLocalHoy();
    const esHoy = prev.fecha === hoy;
    localStorage.setItem(
      KEY_USO,
      JSON.stringify({ fecha: hoy, usos: (esHoy ? prev.usos : 0) + 1 }),
    );
  } catch {
    // Si localStorage falla, permitimos la llamada igualmente.
  }
  return true;
}

export function getApplications(): ApplicationWithPlatform[] {
  try {
    const raw = localStorage.getItem(KEY_APPS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveApplications(applications: ApplicationWithPlatform[]): void {
  localStorage.setItem(KEY_APPS, JSON.stringify(applications));
}

export function getCvBase(): string {
  return localStorage.getItem(KEY_CV_BASE) || "";
}

export function saveCvBase(texto: string): void {
  if (texto.trim()) {
    localStorage.setItem(KEY_CV_BASE, texto);
    localStorage.removeItem(KEY_CV_SKIPPED);
  } else {
    localStorage.removeItem(KEY_CV_BASE);
  }
}

export function getCvSkipped(): boolean {
  return localStorage.getItem(KEY_CV_SKIPPED) === "1";
}

export function setCvSkipped(): void {
  localStorage.setItem(KEY_CV_SKIPPED, "1");
}

export function exportData(): string {
  return JSON.stringify(
    {
      version: 1,
      applications: getApplications(),
      cvBase: getCvBase(),
      analisis: localStorage.getItem("af_analisis") || "",
      carta: localStorage.getItem("af_carta") || "",
      cv: localStorage.getItem("af_cv") || "",
    },
    null,
    2,
  );
}

export function importData(json: string): { ok: boolean; message?: string } {
  try {
    const parsed = JSON.parse(json);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.applications)
    ) {
      return { ok: false, message: "El fichero no es un respaldo válido de ApplyFlow." };
    }
    saveApplications(parsed.applications);
    if (typeof parsed.cvBase === "string") saveCvBase(parsed.cvBase);
    return { ok: true };
  } catch {
    return { ok: false, message: "No se pudo leer el fichero JSON." };
  }
}
