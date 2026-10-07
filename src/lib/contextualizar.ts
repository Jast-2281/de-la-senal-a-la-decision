// Etapa 3 · Contextualizar: enlaza eventos con indicadores (Banco Mundial) o sismos (USGS) solo cuando
// hay una relación explícita en los titulares. Si no existe relación sustentada, no se fuerza.
import { sinTildes } from "./organizar";

export type Indicador = {
  pais_iso3: string;
  indicador_id: string;
  indicador_nombre: string;
  anio: number;
  valor: number | null;
  unidad: string;
  fuente_url: string;
};

export type Sismo = { id: string; magnitude: number; time: string; place: string; url: string };

export type EnlaceIndicador = {
  tipo: "indicador";
  id_evidencia: string; // p. ej. "BM:PAN:FP.CPI.TOTL.ZG:2024"
  indicador_id: string;
  indicador_nombre: string;
  pais_iso3: string;
  anio: number;
  valor: number;
  unidad: string;
  fuente_url: string;
  motivo: string;
  limitacion: string;
  comparacion: { pais_iso3: string; valor: number | null }[];
};

export type EnlaceSismo = { tipo: "sismo"; id_evidencia: string; limitacion: string; sismos: Sismo[]; motivo: string };

// Palabra clave en el titular → indicador. Sin coincidencia explícita no hay enlace.
export const DISPARADORES: { indicador: string; raices: string[] }[] = [
  { indicador: "FP.CPI.TOTL.ZG", raices: ["inflaci", "costo de la vida", "alza de precios", "canasta basica"] },
  { indicador: "SL.UEM.TOTL.ZS", raices: ["desempleo", "empleo", "desocupa", "informalidad"] },
  { indicador: "NY.GDP.MKTP.KD.ZG", raices: ["pib", "crecimiento economico", "economia crece", "economia panamena", "recesion"] },
  { indicador: "NE.EXP.GNFS.ZS", raices: ["exportaci"] },
  { indicador: "IT.NET.USER.ZS", raices: ["internet", "conectividad", "brecha digital"] },
  { indicador: "SP.POP.TOTL", raices: ["censo", "habitantes", "poblacion de panama", "poblacion total"] },
];
const SISMICO = ["sismo", "temblor", "terremoto", "movimiento telurico"];

export function enlazarIndicadores(titulos: string[], indicadores: Indicador[], pais = "PAN"): EnlaceIndicador[] {
  const texto = ` ${sinTildes(titulos.join(" | "))} `;
  const out: EnlaceIndicador[] = [];
  for (const d of DISPARADORES) {
    const hit = d.raices.find((r) => texto.includes(r));
    if (!hit) continue;
    const serie = indicadores
      .filter((x) => x.pais_iso3 === pais && x.indicador_id === d.indicador && x.valor !== null)
      .sort((a, b) => b.anio - a.anio);
    if (!serie.length) continue; // sin dato: no se inventa
    const u = serie[0];
    out.push({
      tipo: "indicador",
      id_evidencia: `BM:${pais}:${u.indicador_id}:${u.anio}`,
      indicador_id: u.indicador_id,
      indicador_nombre: u.indicador_nombre,
      pais_iso3: pais,
      anio: u.anio,
      valor: u.valor!,
      unidad: u.unidad,
      fuente_url: u.fuente_url,
      motivo: `el titular menciona "${hit}"`,
      limitacion: `Dato anual de ${u.anio} (Banco Mundial). No es una medición actual ni confirma lo que reporta la noticia.`,
      comparacion: indicadores
        .filter((x) => x.indicador_id === d.indicador && x.anio === u.anio && x.pais_iso3 !== pais)
        .map((x) => ({ pais_iso3: x.pais_iso3, valor: x.valor })),
    });
  }
  return out;
}

/** El catálogo USGS del paquete cubre solo 2024 y una caja regional: se enlaza con su límite explícito. */
export function enlazarSismos(titulos: string[], fechaEvento: string | null, sismos: Sismo[]): EnlaceSismo | null {
  const texto = sinTildes(titulos.join(" "));
  const hit = SISMICO.find((r) => texto.includes(r));
  if (!hit) return null;
  const t = fechaEvento ? new Date(fechaEvento).getTime() : null;
  const cercanos = t === null ? [] : sismos.filter((s) => Math.abs(new Date(s.time).getTime() - t) <= 48 * 3_600_000);
  return {
    tipo: "sismo",
    id_evidencia: cercanos.length ? `USGS:${cercanos.map((s) => s.id).join(",")}` : "USGS:sin-coincidencia",
    sismos: cercanos,
    motivo: `el titular menciona "${hit}"`,
    limitacion: cercanos.length
      ? "Coincidencia temporal (±48 h) en la caja regional lat 5–12, lon −86 a −76; no equivale al territorio de Panamá."
      : "El catálogo USGS del paquete cubre solo 2024 (caja regional). No hay registro oficial que respalde este sismo en el corpus: verificación pendiente.",
  };
}
