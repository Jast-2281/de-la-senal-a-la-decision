// Corrección del muestreo de pares (2026-10-08): la muestra original (P-001…P-080) quedó concentrada en similitudes
// 0,80–0,82 y casi sin pares "mismo evento" (la IA predijo 1 y el baseline 0), así que no permite medir precisión/recall.
// Se AÑADEN 40 pares (P-081…P-120) sin tocar los existentes ni sus etiquetas humanas:
//  - 30 pares que la IA o el baseline consideran "mismo evento" (mide precisión de cada método);
//  - 10 pares justo debajo del umbral de la IA (0,85–0,88, misma ventana temporal) (mide lo que la IA deja escapar).
//   npm run ampliar-pares
import { appendFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Noticia } from "../src/lib/ingest";
import { coseno } from "../src/lib/embeddings";
import { jaccard, tokens } from "../src/lib/organizar";

let semilla = 20261008;
const azar = () => ((semilla = (semilla * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const mezclar = <T,>(xs: T[]) => xs.map((x) => ({ x, k: azar() })).sort((a, b) => a.k - b.k).map((y) => y.x);

async function main() {
  const DIR = join("data", "processed");
  const ARCHIVO = join("data", "eval", "pares-agrupacion.jsonl");
  const existentes = (await readFile(ARCHIVO, "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l));
  if (existentes.length !== 80) throw new Error(`Se esperaban 80 pares existentes, hay ${existentes.length}: no se amplía dos veces.`);
  const yaUsados = new Set(existentes.map((p: { a: { id: string }; b: { id: string } }) => [p.a.id, p.b.id].sort().join("|")));

  const noticias: Noticia[] = JSON.parse(await readFile(join(DIR, "noticias.json"), "utf8"));
  const emb = JSON.parse(await readFile(join(DIR, "embeddings.json"), "utf8"));
  const org = JSON.parse(await readFile(join(DIR, "organizado.json"), "utf8"));
  const pos = new Map<string, number>(emb.ids.map((id: string, i: number) => [id, i]));
  const info = new Map<string, { evento_ia: string; grupo_baseline: number }>(org.noticias.map((n: { id_noticia: string; evento_ia: string; grupo_baseline: number }) => [n.id_noticia, n]));
  const v = (id: string) => emb.vectores[pos.get(id)!] as number[];
  const h = (n: Noticia) => new Date(n.fecha_publicacion ?? n.fecha_deteccion ?? 0).getTime() / 3.6e6;

  const positivos: [Noticia, Noticia, number][] = [];
  const bordes: [Noticia, Noticia, number][] = [];
  for (let i = 0; i < noticias.length; i++)
    for (let j = i + 1; j < noticias.length; j++) {
      const a = noticias[i], b = noticias[j];
      if (yaUsados.has([a.id_noticia, b.id_noticia].sort().join("|"))) continue;
      const ia = info.get(a.id_noticia)!, ib = info.get(b.id_noticia)!;
      const s = coseno(v(a.id_noticia), v(b.id_noticia));
      if (ia.evento_ia === ib.evento_ia || ia.grupo_baseline === ib.grupo_baseline) positivos.push([a, b, s]);
      else if (s >= 0.85 && s < 0.88 && Math.abs(h(a) - h(b)) <= 96) bordes.push([a, b, s]);
    }

  const muestra = [
    ...mezclar(positivos).slice(0, 30).map((p) => ({ p, origen: "predicho_mismo_evento" })),
    ...mezclar(bordes).slice(0, 10).map((p) => ({ p, origen: "borde_bajo_umbral" })),
  ];
  const tok = (n: Noticia) => tokens(n.titulo);
  const lineas = mezclar(muestra).map(({ p: [a, b, s], origen }, k) => ({
    id: `P-${String(81 + k).padStart(3, "0")}`,
    origen_muestra: origen,
    a: { id: a.id_noticia, titulo: a.titulo, medio: a.medio, fecha: a.fecha_publicacion ?? a.fecha_deteccion, descripcion: a.descripcion },
    b: { id: b.id_noticia, titulo: b.titulo, medio: b.medio, fecha: b.fecha_publicacion ?? b.fecha_deteccion, descripcion: b.descripcion },
    prediccion: {
      similitud_embeddings: +s.toFixed(4),
      jaccard: +jaccard(tok(a), tok(b)).toFixed(4),
      mismo_evento_ia: info.get(a.id_noticia)!.evento_ia === info.get(b.id_noticia)!.evento_ia,
      mismo_grupo_baseline: info.get(a.id_noticia)!.grupo_baseline === info.get(b.id_noticia)!.grupo_baseline,
    },
  }));
  await appendFile(ARCHIVO, lineas.map((x) => JSON.stringify(x)).join("\n") + "\n");
  console.log(`añadidos ${lineas.length} pares (disponibles: ${positivos.length} predichos "mismo evento", ${bordes.length} en el borde)`);
  console.log(`IA "mismo evento" en la ampliación: ${lineas.filter((x) => x.prediccion.mismo_evento_ia).length} · baseline: ${lineas.filter((x) => x.prediccion.mismo_grupo_baseline).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
