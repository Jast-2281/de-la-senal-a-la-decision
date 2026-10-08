// Etapa 4 · Priorizar: P = 30R + 25I + 20U + 15N + 10E (pág. 4 del pliego).
// Herramienta de ordenamiento, no probabilidad de verdad. El estado de evidencia es independiente del puntaje.
import { type Tema } from "./organizar";

// v2 (2026-10-06): R penaliza secciones de entretenimiento/deportes y temas fuera de la modalidad;
// I pesa 50 % tema y 50 % cobertura independiente (antes 70/30). Ver docs/005.
export const REGLAS_PUNTAJE_VERSION = "puntaje-v2";
export const SECCIONES_FUERA = ["entretenimiento", "tvmax", "gente-tvn", "videos"];
export const PESOS = { R: 30, I: 25, U: 20, N: 15, E: 10 } as const;

export type EventoParaPuntaje = {
  id_evento: string;
  tema: Tema;
  n_registros: number;
  procedencias_independientes: number;
  incluye_tvn: boolean;
  medios: string[];
  ultima_fecha: string | null;
  primera_fecha: string | null;
  /** Indicadores oficiales pertinentes enlazados en la etapa 3 (0 si no hay relación sustentada). */
  n_indicadores: number;
  /** Eventos oficiales (p. ej. sismos USGS) enlazados en la etapa 3. */
  n_eventos_oficiales: number;
  /** Secciones del RSS de TVN (p. ej. "nacionales", "mundo") cuando existan. */
  secciones: string[];
};

export type Componente = { valor: number; criterio: string };
export type Puntaje = {
  P: number;
  rango: "bajo" | "medio" | "alto";
  componentes: Record<keyof typeof PESOS, Componente>;
  version: string;
};

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const IMPACTO_TEMA: Record<Tema, number> = {
  economia: 0.8, logistica_canal: 0.9, servicios_publicos: 0.9, eventos_naturales: 0.8,
  regulacion: 0.7, turismo: 0.6, otros: 0.3,
};

export function puntuar(e: EventoParaPuntaje, ahora: Date): Puntaje {
  const mundo = e.secciones.length > 0 && e.secciones.every((x) => x === "mundo");
  const fuera = e.secciones.length > 0 && e.secciones.every((x) => SECCIONES_FUERA.includes(x));
  const enModalidad = e.tema !== "otros" && !fuera;
  const R: Componente = {
    valor: clamp((mundo ? 0.15 : 0.5) + (enModalidad ? 0.5 : 0)),
    criterio: `${mundo ? "sección internacional" : "ámbito nacional"} · ${enModalidad ? "tema de la modalidad" : fuera ? "sección de entretenimiento/deportes" : "tema fuera de la modalidad"}`,
  };
  // Impacto: base por tema + alcance (procedencias independientes, no volumen bruto).
  const I: Componente = {
    valor: clamp(IMPACTO_TEMA[e.tema] * 0.5 + Math.min(e.procedencias_independientes, 4) / 4 * 0.5),
    criterio: `tema ${e.tema} (base ${IMPACTO_TEMA[e.tema]}) + ${e.procedencias_independientes} procedencia(s) independiente(s)`,
  };
  const edadH = e.ultima_fecha ? (ahora.getTime() - new Date(e.ultima_fecha).getTime()) / 3_600_000 : null;
  const U: Componente = {
    valor: edadH === null ? 0 : clamp(1 - edadH / (7 * 24)),
    criterio: edadH === null ? "sin fecha: urgencia 0" : `última señal hace ${Math.round(edadH)} h (decae a 0 en 7 días)`,
  };
  // Novedad: un evento cuya primera señal es antigua no es nuevo (T03). Duplicar no suma.
  const edadPrimeraH = e.primera_fecha ? (ahora.getTime() - new Date(e.primera_fecha).getTime()) / 3_600_000 : null;
  const N: Componente = {
    valor: edadPrimeraH === null ? 0.5 : clamp(1 - edadPrimeraH / (14 * 24)),
    criterio: edadPrimeraH === null ? "sin fecha de primera señal" : `primera señal hace ${Math.round(edadPrimeraH / 24)} día(s)`,
  };
  const E: Componente = {
    valor: clamp(Math.min(e.procedencias_independientes, 3) / 3 * 0.6 + (e.n_indicadores + e.n_eventos_oficiales > 0 ? 0.4 : 0)),
    criterio: `${e.procedencias_independientes} procedencia(s) + ${e.n_indicadores + e.n_eventos_oficiales} fuente(s) oficial(es) enlazada(s)`,
  };
  const comps = { R, I, U, N, E };
  const P = Math.round(
    (Object.keys(PESOS) as (keyof typeof PESOS)[]).reduce((s, k) => s + PESOS[k] * comps[k].valor, 0) * 10,
  ) / 10;
  return { P, rango: P >= 70 ? "alto" : P >= 40 ? "medio" : "bajo", componentes: comps, version: REGLAS_PUNTAJE_VERSION };
}

export type EstadoEvidencia = "insuficiente" | "parcial" | "suficiente para el borrador";

/** Independiente del puntaje: una prioridad alta puede tener evidencia insuficiente (T08). */
export function estadoEvidencia(e: EventoParaPuntaje, hayContradiccion = false): { estado: EstadoEvidencia; motivo: string } {
  const oficiales = e.n_indicadores + e.n_eventos_oficiales;
  if (e.procedencias_independientes < 2 && oficiales === 0)
    return { estado: "insuficiente", motivo: "una sola procedencia y ninguna fuente oficial enlazada" };
  if (hayContradiccion)
    return { estado: "parcial", motivo: "hay cifras distintas entre fuentes pendientes de verificación" };
  if (e.procedencias_independientes >= 2 && oficiales > 0)
    return { estado: "suficiente para el borrador", motivo: "≥2 procedencias independientes y respaldo oficial" };
  return { estado: "parcial", motivo: e.procedencias_independientes >= 2 ? "≥2 procedencias, sin respaldo oficial" : "respaldo oficial, una sola procedencia" };
}

/** Orden: P descendente; empates por mayor urgencia y luego ID (pág. 4). */
export function ordenar<T extends { id_evento: string; puntaje: Puntaje }>(xs: T[]): T[] {
  return [...xs].sort(
    (a, b) =>
      b.puntaje.P - a.puntaje.P ||
      b.puntaje.componentes.U.valor - a.puntaje.componentes.U.valor ||
      a.id_evento.localeCompare(b.id_evento),
  );
}
