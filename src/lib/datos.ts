// Lectura de los artefactos procesados (solo disco local: la demo funciona sin internet, T10).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { EventoCola } from "./evidencia";
import type { Puntaje, EstadoEvidencia } from "./priorizar";
import type { Tema } from "./organizar";

const DIR = join(process.cwd(), "data", "processed");
const REVISIONES = join(process.cwd(), "data", "revisiones", "revisiones.json");

export type EventoUI = EventoCola & {
  tema: Tema;
  medios: string[];
  n_registros: number;
  incluye_tvn: boolean;
  primera_fecha: string | null;
  ultima_fecha: string | null;
  secciones: string[];
  puntaje: Puntaje;
  evidencia: { estado: EstadoEvidencia; motivo: string };
  accion: string;
  noticias: (EventoCola["noticias"][number] & { origen: string; tema: Tema; tema_evidencia: Record<string, string[]>; seccion: string | null })[];
};

export type Cola = {
  generado_desde: { snapshot: string; fecha_corte_UTC: string; aviso: string };
  reglas: { puntaje: string; pesos: Record<string, number>; organizar: Record<string, string | number> };
  eventos: EventoUI[];
};

export const leerCola = async (): Promise<Cola> => JSON.parse(await readFile(join(DIR, "cola.json"), "utf8"));
export const leerCalidad = async () => JSON.parse(await readFile(join(DIR, "calidad.json"), "utf8"));

export const ESTADOS_REVISION = ["nuevo", "en revisión", "requiere evidencia", "aprobado como borrador", "descartado"] as const;
export type EstadoRevision = (typeof ESTADOS_REVISION)[number];
export type Revision = { estado: EstadoRevision; revisor: string; nota: string; fecha: string };

export async function leerRevisiones(): Promise<Record<string, Revision[]>> {
  return JSON.parse(await readFile(REVISIONES, "utf8").catch(() => "{}"));
}

export async function agregarRevision(idEvento: string, r: Revision) {
  const todas = await leerRevisiones();
  todas[idEvento] = [...(todas[idEvento] ?? []), r];
  await mkdir(join(process.cwd(), "data", "revisiones"), { recursive: true });
  await writeFile(REVISIONES, JSON.stringify(todas, null, 1));
  return todas[idEvento];
}

export const estadoActual = (hist: Revision[] | undefined): EstadoRevision => hist?.at(-1)?.estado ?? "nuevo";

const fmt = new Intl.DateTimeFormat("es-PA", {
  timeZone: "America/Panama", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});
/** Fechas en UTC en los datos; en la interfaz, hora de Panamá (pág. 7). */
export const horaPanama = (iso: string | null) => (iso ? `${fmt.format(new Date(iso))} (hora de Panamá)` : "sin fecha");
