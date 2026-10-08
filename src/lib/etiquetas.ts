// Etiquetas humanas para la evaluación (sección 9.1): se guardan en data/eval/etiquetas.json.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DIR = join(process.cwd(), "data", "eval");
const ARCHIVO = join(DIR, "etiquetas.json");

export const OPCIONES = {
  benchmark: ["correcta", "corregir", "descartar"],
  pares: ["mismo_evento", "distinto_evento", "no_se"],
  sustento: ["respaldada", "parcialmente_respaldada", "no_respaldada", "cita_correcta_alcance_insuficiente"],
} as const;
export type Conjunto = keyof typeof OPCIONES;
export type Etiqueta = { valor: string; nota: string; revisor: string; fecha: string };
export type Etiquetas = Record<Conjunto, Record<string, Etiqueta>>;

export async function leerEtiquetas(): Promise<Etiquetas> {
  const e = JSON.parse(await readFile(ARCHIVO, "utf8").catch(() => "{}"));
  return { benchmark: e.benchmark ?? {}, pares: e.pares ?? {}, sustento: e.sustento ?? {} };
}

export async function guardarEtiqueta(conjunto: Conjunto, id: string, et: Etiqueta) {
  const todas = await leerEtiquetas();
  todas[conjunto][id] = et;
  await mkdir(DIR, { recursive: true });
  await writeFile(ARCHIVO, JSON.stringify(todas, null, 1));
  return todas;
}

export async function leerJsonl<T>(nombre: string): Promise<T[]> {
  const txt = await readFile(join(DIR, nombre), "utf8").catch(() => "");
  return txt.split("\n").filter(Boolean).map((l) => JSON.parse(l) as T);
}

/**
 * Casos del benchmark visibles en /evaluacion (auditoría Codex 007, C1): por defecto solo desarrollo; la reserva solo
 * en su vista explícita, para validarla al final con el sistema congelado.
 */
export function casosVisibles<T extends { split: string }>(casos: T[], vistaReserva: boolean): T[] {
  return casos.filter((c) => c.split === (vistaReserva ? "reserva" : "desarrollo"));
}
