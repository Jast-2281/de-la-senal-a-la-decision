// Prepara los conjuntos para etiquetado humano (sección 9.1 del pliego):
// - data/eval/pares-agrupacion.jsonl: 80 pares de titulares (40 cercanos al umbral + 40 aleatorios) para medir
//   agrupación con embeddings frente al baseline Jaccard. Las predicciones se guardan aparte para no sesgar al revisor.
// - data/eval/afirmaciones-muestra.jsonl: 30 afirmaciones factuales de borradores reales con su texto citado.
//   npm run preparar-eval
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Noticia } from "../src/lib/ingest";
import { coseno } from "../src/lib/embeddings";
import { jaccard, tokens } from "../src/lib/organizar";
import { construirFichas } from "../src/lib/fichas";

// Generador pseudoaleatorio con semilla: la muestra es reproducible.
let semilla = 20261007;
const azar = () => ((semilla = (semilla * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);

async function main() {
  const DIR = join("data", "processed");
  const noticias: Noticia[] = JSON.parse(await readFile(join(DIR, "noticias.json"), "utf8"));
  const emb = JSON.parse(await readFile(join(DIR, "embeddings.json"), "utf8"));
  const org = JSON.parse(await readFile(join(DIR, "organizado.json"), "utf8"));
  const pos = new Map<string, number>(emb.ids.map((id: string, i: number) => [id, i]));
  const info = new Map(org.noticias.map((n: { id_noticia: string; evento_ia: string; grupo_baseline: number }) => [n.id_noticia, n]));
  const v = (id: string) => emb.vectores[pos.get(id)!] as number[];
  const tok = new Map(noticias.map((n) => [n.id_noticia, tokens(n.titulo)]));

  // Todos los pares con similitud ≥ 0,80 dentro de 96 h son candidatos “cercanos” (zona donde se decide la agrupación).
  const h = (n: Noticia) => new Date(n.fecha_publicacion ?? n.fecha_deteccion ?? 0).getTime() / 3.6e6;
  const cercanos: [Noticia, Noticia, number][] = [];
  for (let i = 0; i < noticias.length; i++)
    for (let j = i + 1; j < noticias.length; j++) {
      const s = coseno(v(noticias[i].id_noticia), v(noticias[j].id_noticia));
      if (s >= 0.8 && Math.abs(h(noticias[i]) - h(noticias[j])) <= 96) cercanos.push([noticias[i], noticias[j], s]);
    }
  // Muestreo estratificado por similitud para cubrir ambos lados del umbral (0,88).
  cercanos.sort((a, b) => a[2] - b[2]);
  const paso = cercanos.length / 40;
  const muestraCercana = Array.from({ length: 40 }, (_, k) => cercanos[Math.floor(k * paso + azar() * paso)]);
  const aleatorios: [Noticia, Noticia, number][] = [];
  while (aleatorios.length < 40) {
    const a = noticias[Math.floor(azar() * noticias.length)], b = noticias[Math.floor(azar() * noticias.length)];
    if (a.id_noticia !== b.id_noticia) aleatorios.push([a, b, coseno(v(a.id_noticia), v(b.id_noticia))]);
  }
  const pares = [...muestraCercana.map((p) => ({ p, origen: "cercano" })), ...aleatorios.map((p) => ({ p, origen: "aleatorio" }))]
    .sort(() => azar() - 0.5) // orden mezclado: el revisor no sabe de qué estrato viene cada par
    .map(({ p: [a, b, s], origen }, k) => ({
      id: `P-${String(k + 1).padStart(3, "0")}`,
      origen_muestra: origen,
      a: { id: a.id_noticia, titulo: a.titulo, medio: a.medio, fecha: a.fecha_publicacion ?? a.fecha_deteccion, descripcion: a.descripcion },
      b: { id: b.id_noticia, titulo: b.titulo, medio: b.medio, fecha: b.fecha_publicacion ?? b.fecha_deteccion, descripcion: b.descripcion },
      prediccion: {
        similitud_embeddings: +s.toFixed(4),
        jaccard: +jaccard(tok.get(a.id_noticia)!, tok.get(b.id_noticia)!).toFixed(4),
        mismo_evento_ia: (info.get(a.id_noticia) as { evento_ia: string }).evento_ia === (info.get(b.id_noticia) as { evento_ia: string }).evento_ia,
        mismo_grupo_baseline: (info.get(a.id_noticia) as { grupo_baseline: number }).grupo_baseline === (info.get(b.id_noticia) as { grupo_baseline: number }).grupo_baseline,
      },
    }));

  // Muestra de afirmaciones factuales (hecho/declaración) de los borradores generados.
  const fichas = await construirFichas();
  const todas = fichas.flatMap((f) =>
    f.afirmaciones
      .filter((a) => a.tipo === "hecho" || a.tipo === "declaracion")
      .map((a) => ({ id_caso: f.id_caso, titulo_evento: f.titulo_evento, ...a, citas: a.citas.map((c) => ({ ...c, texto_citado: f.citas.find((x) => x.id_evidencia === c.id_evidencia && x.campo === c.campo)?.texto_citado ?? null })) })),
  );
  const muestra = todas.sort(() => azar() - 0.5).slice(0, 30).map((a, k) => ({ id: `S-${String(k + 1).padStart(3, "0")}`, ...a }));

  await mkdir(join("data", "eval"), { recursive: true });
  await writeFile(join("data", "eval", "pares-agrupacion.jsonl"), pares.map((x) => JSON.stringify(x)).join("\n") + "\n");
  await writeFile(join("data", "eval", "afirmaciones-muestra.jsonl"), muestra.map((x) => JSON.stringify(x)).join("\n") + "\n");
  console.log(`pares: ${pares.length} (candidatos cercanos disponibles: ${cercanos.length}) · afirmaciones: ${muestra.length} de ${todas.length} factuales`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
