// Nueva muestra de 30 afirmaciones (S2-001…S2-030) tras la corrección del prompt v5, para volver a medir la validez de
// sustento con revisión humana. La muestra v1 (S-001…S-030) y sus etiquetas se conservan como línea base.
//   npm run muestra-sustento-v2
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { construirFichas } from "../src/lib/fichas";

let semilla = 20261009;
const azar = () => ((semilla = (semilla * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);

construirFichas().then(async (fichas) => {
  const todas = fichas.flatMap((f) =>
    f.afirmaciones
      .filter((a) => a.tipo === "hecho" || a.tipo === "declaracion")
      .map((a) => ({
        id_caso: f.id_caso, titulo_evento: f.titulo_evento, prompt_version: f.borrador.generacion.prompt_version, ...a,
        citas: a.citas.map((c) => ({ ...c, texto_citado: f.citas.find((x) => x.id_evidencia === c.id_evidencia && x.campo === c.campo)?.texto_citado ?? null })),
      })),
  );
  const muestra = todas.map((x) => ({ x, k: azar() })).sort((a, b) => a.k - b.k).slice(0, 30).map(({ x }, i) => ({ id: `S2-${String(i + 1).padStart(3, "0")}`, ...x }));
  await writeFile(join("data", "eval", "afirmaciones-muestra-v2.jsonl"), muestra.map((x) => JSON.stringify(x)).join("\n") + "\n");
  console.log(`muestra v2: ${muestra.length} de ${todas.length} afirmaciones factuales (prompt ${muestra[0]?.prompt_version})`);
});
