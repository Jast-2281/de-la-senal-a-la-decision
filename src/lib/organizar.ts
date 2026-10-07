// Etapa 2 · Organizar: tema por reglas transparentes, agrupación de eventos y procedencia.
// Funciones puras; los embeddings se calculan fuera (scripts/organizar.ts).

export const TEMAS = [
  "economia",
  "logistica_canal",
  "turismo",
  "servicios_publicos",
  "eventos_naturales",
  "regulacion",
] as const;
export type Tema = (typeof TEMAS)[number] | "otros";

export const ETIQUETA_TEMA: Record<Tema, string> = {
  economia: "Economía",
  logistica_canal: "Logística / Canal",
  turismo: "Turismo",
  servicios_publicos: "Servicios públicos",
  eventos_naturales: "Eventos naturales",
  regulacion: "Regulación",
  otros: "Otros",
};

// Reglas versionadas: cada raíz suma 1 punto a su tema. Se comparan sin tildes y en minúsculas.
// v2 (2026-10-06): coincidencia al inicio de palabra ("metro" ya no coincide con "kilómetros") y exclusiones
// explícitas ("puerto rico"). Corrección tras revisar el top-12 de la cola (falsos positivos documentados).
export const REGLAS_TEMA_VERSION = "temas-reglas-v2";
const EXCLUSIONES = ["puerto rico"];
const RAICES: Record<(typeof TEMAS)[number], string[]> = {
  economia: ["econom", "inflaci", "precio", "pib ", "empleo", "desempleo", "salari", "impuesto", "mef ", "presupuesto",
    "deuda", "bonos ", "inversion", "comercio", "exporta", "importa", "mercado", "fiscal", "credito", "banca", "bancos",
    "costo de", "costos", "canasta", "dolar", "jubilac", "pension", "empresa"],
  logistica_canal: ["canal de panama", "acp ", "transito", "buque", "naviera", "puerto", "portuari", "hub logistic", "sector logistic", "logistica portuari", "logistica maritim",
    "contenedor", "carga", "esclusa", "rio indio", "zona libre", "tocumen", "aeropuerto", "maritim"],
  turismo: ["turism", "turista", "hotel", "atp ", "visitante", "crucero", "vuelo", "copa airlines", "temporada alta"],
  servicios_publicos: ["agua", "idaan", "electricidad", "apagon", "energia", "ensa ", "naturgy", "salud", "hospital",
    "css ", "minsa", "medicamento", "educacion", "meduca", "escuela", "metro ", "mibus", "transporte", "basura",
    "potabiliz", "seguro social", "vacuna"],
  eventos_naturales: ["sismo", "terremoto", "temblor", "lluvia", "inundaci", "deslizamiento", "tormenta", "huracan",
    "sinaproc", "sequia", "el nino", "incendio forestal", "marejada", "oleaje", "vaguada", "crecida"],
  regulacion: ["ley ", "proyecto de ley", "decreto", "asamblea", "regulaci", "resolucion", "corte suprema", "norma",
    "reforma", "gaceta oficial", "contraloria", "superintendencia", "asep ", "sbp ", "fallo", "tribunal"],
};

export const sinTildes = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Devuelve el tema principal y el puntaje por tema (explicable). Empate → orden de TEMAS. */
export function clasificarPorReglas(texto: string): { tema: Tema; puntos: Partial<Record<Tema, string[]>> } {
  let t = ` ${sinTildes(texto)} `;
  for (const x of EXCLUSIONES) t = t.replaceAll(x, " ");
  const puntos: Partial<Record<Tema, string[]>> = {};
  for (const tema of TEMAS) {
    const hits = RAICES[tema].filter((r) => new RegExp(`[^a-z0-9ñ]${r.trim()}${r.endsWith(" ") ? "[^a-z0-9ñ]" : ""}`).test(t));
    if (hits.length) puntos[tema] = hits;
  }
  let mejor: Tema = "otros";
  let max = 0;
  for (const tema of TEMAS) {
    const n = puntos[tema]?.length ?? 0;
    if (n > max) [mejor, max] = [tema, n];
  }
  return { tema: mejor, puntos };
}

const STOP = new Set(
  "el la los las de del y en a un una por para con al se su sus que es lo como mas sobre tras ante este esta ser fue son han ha".split(" "),
);
export const tokens = (s: string) =>
  new Set(sinTildes(s).replace(/[^a-z0-9ñ ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * Agrupación aglomerativa por enlace promedio con umbral de similitud y ventana temporal.
 * `sim(i, j)` devuelve la similitud entre dos registros; `horas[i]` su marca de tiempo (h) o null.
 * Dos grupos solo pueden superar el umbral en promedio si al menos un par lo supera, así que
 * primero se forman componentes conexas con aristas ≥ umbral y se aglomera dentro de cada una.
 * Devuelve el índice de grupo de cada registro.
 */
export function agrupar(n: number, sim: (i: number, j: number) => number, umbral: number, horas: (number | null)[], ventanaH = 96): number[] {
  const s = (i: number, j: number) => {
    const hi = horas[i], hj = horas[j];
    return hi === null || hj === null || Math.abs(hi - hj) <= ventanaH ? sim(i, j) : 0;
  };
  const padre = Array.from({ length: n }, (_, i) => i);
  const raiz = (i: number): number => (padre[i] === i ? i : (padre[i] = raiz(padre[i])));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (s(i, j) >= umbral) padre[raiz(i)] = raiz(j);
  const componentes = new Map<number, number[]>();
  for (let i = 0; i < n; i++) componentes.set(raiz(i), [...(componentes.get(raiz(i)) ?? []), i]);

  const asignacion = new Array(n).fill(-1);
  let siguiente = 0;
  for (const miembros of componentes.values()) {
    let grupos = miembros.map((i) => [i]);
    for (;;) {
      let best = -1, bi = -1, bj = -1;
      for (let a = 0; a < grupos.length; a++)
        for (let b = a + 1; b < grupos.length; b++) {
          let t = 0;
          for (const i of grupos[a]) for (const j of grupos[b]) t += s(i, j);
          t /= grupos[a].length * grupos[b].length;
          if (t > best) [best, bi, bj] = [t, a, b];
        }
      if (best < umbral) break;
      grupos[bi] = grupos[bi].concat(grupos[bj]);
      grupos = grupos.filter((_, k) => k !== bj);
    }
    for (const g of grupos) {
      for (const i of g) asignacion[i] = siguiente;
      siguiente++;
    }
  }
  return asignacion;
}

export const AGENCIAS = ["efe", "afp", "reuters", "associated press", "ap", "europa press", "dpa", "xinhua", "ansa"];
/** Agencia citada explícitamente en el titular (palabra completa, sin importar puntuación). */
export const agenciaCitada = (titulo: string) =>
  AGENCIAS.find((a) => new RegExp(`(^|[^a-z0-9ñ])${a}([^a-z0-9ñ]|$)`).test(sinTildes(titulo))) ?? null;

export type MotivoProcedencia = "mismo_medio" | "agencia_explicita";

/**
 * Procedencias independientes dentro de un grupo (CU-03, T02). Criterio conservador (auditoría 003, R7):
 * - SE CONSOLIDAN automáticamente: notas del mismo medio y notas que citan explícitamente la misma agencia.
 * - NO se consolidan: titulares casi idénticos de medios distintos. Se marcan como "posible réplica" para
 *   revisión humana y se informa el rango (independientes si se confirman esas réplicas).
 */
export function procedencias(
  items: { id: string; medio: string; titulo: string }[],
  casiIdentico: (a: number, b: number) => boolean,
) {
  const padre = items.map((_, i) => i);
  const raiz = (i: number): number => (padre[i] === i ? i : (padre[i] = raiz(padre[i])));
  const agencia = items.map((it) => agenciaCitada(it.titulo));
  const motivos = new Map<number, Set<MotivoProcedencia>>();
  const posibles: { ids: [string, string]; medios: [string, string] }[] = [];
  for (let a = 0; a < items.length; a++)
    for (let b = a + 1; b < items.length; b++) {
      const motivo: MotivoProcedencia | null =
        items[a].medio === items[b].medio ? "mismo_medio" : agencia[a] !== null && agencia[a] === agencia[b] ? "agencia_explicita" : null;
      if (motivo) {
        const [ra, rb] = [raiz(a), raiz(b)];
        const m = new Set([...(motivos.get(ra) ?? []), ...(motivos.get(rb) ?? []), motivo]);
        padre[ra] = rb;
        motivos.set(rb, m);
      } else if (casiIdentico(a, b)) {
        posibles.push({ ids: [items[a].id, items[b].id], medios: [items[a].medio, items[b].medio] });
      }
    }
  const mapa = new Map<number, { medios: Set<string>; ids: string[]; agencia: string | null }>();
  items.forEach((it, i) => {
    const r = raiz(i);
    const g = mapa.get(r) ?? { medios: new Set<string>(), ids: [], agencia: null };
    g.medios.add(it.medio);
    g.ids.push(it.id);
    g.agencia ??= agencia[i];
    mapa.set(r, g);
  });
  const grupos = [...mapa.entries()].map(([r, g]) => ({
    medios: [...g.medios],
    ids: g.ids,
    agencia: g.agencia,
    motivos: [...(motivos.get(r) ?? [])],
    replica: g.medios.size > 1, // varios medios repiten una misma agencia explícita
  }));

  // Cota inferior: cuántas quedarían si todas las posibles réplicas se confirmaran.
  const grupoDe = new Map<string, number>();
  grupos.forEach((g, k) => g.ids.forEach((id) => grupoDe.set(id, k)));
  const p2 = grupos.map((_, k) => k);
  const r2 = (i: number): number => (p2[i] === i ? i : (p2[i] = r2(p2[i])));
  for (const pr of posibles) p2[r2(grupoDe.get(pr.ids[0])!)] = r2(grupoDe.get(pr.ids[1])!);
  const minimo = new Set(grupos.map((_, k) => r2(k))).size;

  return { independientes: grupos.length, independientes_si_se_confirman_replicas: minimo, posibles_replicas: posibles, grupos };
}
