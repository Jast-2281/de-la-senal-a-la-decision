// Etapa 2 · Organizar: tema (reglas), embeddings locales, agrupación de eventos (IA) y baseline (Jaccard),
// más el conteo de procedencias independientes por evento.
//   npm run organizar
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Noticia } from "../src/lib/ingest";
import { MODELO_EMBEDDINGS, coseno, embeber } from "../src/lib/embeddings";
import {
  REGLAS_TEMA_VERSION,
  type Tema,
  agrupar,
  clasificarPorReglas,
  jaccard,
  procedencias,
  tokens,
} from "../src/lib/organizar";

export const UMBRAL_EMBEDDINGS = Number(process.env.UMBRAL_EMB ?? 0.88);
export const UMBRAL_JACCARD = Number(process.env.UMBRAL_JAC ?? 0.4);
const VENTANA_H = 96;
const DIR = join("data", "processed");

async function main() {
  const noticias: Noticia[] = JSON.parse(await readFile(join(DIR, "noticias.json"), "utf8"));
  const horas = noticias.map((n) => {
    const f = n.fecha_publicacion ?? n.fecha_deteccion;
    return f ? new Date(f).getTime() / 3_600_000 : null;
  });

  // Tema por reglas transparentes (también es el baseline temático).
  const temas = noticias.map((n) => clasificarPorReglas(`${n.titulo} ${n.descripcion ?? ""} ${n.palabras_clave.join(" ")}`));

  // Embeddings locales del titular (GDELT solo trae titular: se usa lo mismo para todas las fuentes).
  const t0 = Date.now();
  const vec = await embeber(noticias.map((n) => n.titulo));
  const msEmb = Date.now() - t0;
  const tok = noticias.map((n) => tokens(n.titulo));

  const t1 = Date.now();
  const grupoIA = agrupar(noticias.length, (i, j) => coseno(vec[i], vec[j]), UMBRAL_EMBEDDINGS, horas, VENTANA_H);
  const msIA = Date.now() - t1;
  const grupoBase = agrupar(noticias.length, (i, j) => jaccard(tok[i], tok[j]), UMBRAL_JACCARD, horas, VENTANA_H);

  const porGrupo = new Map<number, number[]>();
  grupoIA.forEach((g, i) => porGrupo.set(g, [...(porGrupo.get(g) ?? []), i]));

  const eventos = [...porGrupo.values()].map((idx) => {
    const items = idx.map((i) => ({ id: noticias[i].id_noticia, medio: noticias[i].medio, titulo: noticias[i].titulo }));
    const proc = procedencias(items, (a, b) => {
      const [i, j] = [idx[a], idx[b]];
      return coseno(vec[i], vec[j]) >= 0.97 || jaccard(tok[i], tok[j]) >= 0.8;
    });
    const conteo = new Map<Tema, number>();
    idx.forEach((i) => conteo.set(temas[i].tema, (conteo.get(temas[i].tema) ?? 0) + 1));
    const tema = [...conteo.entries()].filter(([t]) => t !== "otros").sort((a, b) => b[1] - a[1])[0]?.[0] ?? "otros";
    const fechas = idx.map((i) => horas[i]).filter((h): h is number => h !== null).sort((a, b) => a - b);
    // Titular representativo: el más central del grupo.
    const centro = idx
      .map((i) => ({ i, s: idx.reduce((acc, j) => acc + coseno(vec[i], vec[j]), 0) }))
      .sort((a, b) => b.s - a.s)[0].i;
    return {
      id_evento: "E-" + noticias[centro].id_noticia.slice(2),
      titulo: noticias[centro].titulo,
      tema,
      ids_noticias: items.map((x) => x.id),
      n_registros: idx.length,
      medios: [...new Set(items.map((x) => x.medio))],
      procedencias_independientes: proc.independientes,
      procedencias_si_se_confirman_replicas: proc.independientes_si_se_confirman_replicas,
      posibles_replicas: proc.posibles_replicas,
      grupos_procedencia: proc.grupos,
      incluye_tvn: items.some((x) => x.medio === "tvn-2.com"),
      primera_fecha: fechas.length ? new Date(fechas[0] * 3_600_000).toISOString() : null,
      ultima_fecha: fechas.length ? new Date(fechas.at(-1)! * 3_600_000).toISOString() : null,
    };
  });

  const salida = {
    version: {
      reglas_tema: REGLAS_TEMA_VERSION,
      modelo_embeddings: MODELO_EMBEDDINGS,
      umbral_embeddings: UMBRAL_EMBEDDINGS,
      umbral_jaccard_baseline: UMBRAL_JACCARD,
      ventana_horas: VENTANA_H,
    },
    tiempos_ms: { embeddings: msEmb, agrupacion_ia: msIA, n: noticias.length },
    noticias: noticias.map((n, i) => ({
      id_noticia: n.id_noticia,
      tema: temas[i].tema,
      tema_evidencia: temas[i].puntos,
      evento_ia: eventos.find((e) => e.ids_noticias.includes(n.id_noticia))!.id_evento,
      grupo_baseline: grupoBase[i],
    })),
    eventos: eventos.sort((a, b) => b.n_registros - a.n_registros),
  };
  await writeFile(join(DIR, "organizado.json"), JSON.stringify(salida, null, 1));
  await writeFile(join(DIR, "embeddings.json"), JSON.stringify({ modelo: MODELO_EMBEDDINGS, ids: noticias.map((n) => n.id_noticia), vectores: vec.map((v) => v.map((x) => +x.toFixed(5))) }));

  const multi = eventos.filter((e) => e.n_registros > 1);
  console.log({
    noticias: noticias.length,
    eventos: eventos.length,
    eventos_multi: multi.length,
    grupos_baseline: new Set(grupoBase).size,
    tiempos_ms: salida.tiempos_ms,
    temas: Object.fromEntries([...new Set(temas.map((t) => t.tema))].map((t) => [t, temas.filter((x) => x.tema === t).length])),
  });
  for (const e of multi.slice(0, 8)) console.log(`${e.n_registros} reg · ${e.procedencias_independientes} proc · ${e.tema} · ${e.titulo}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
