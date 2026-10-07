// Exporta data/processed/fichas.jsonl desde la cola, los borradores en caché y las revisiones humanas.
//   npm run fichas
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { construirFichas } from "../src/lib/fichas";

construirFichas().then(async (fichas) => {
  await writeFile(join("data", "processed", "fichas.jsonl"), fichas.map((f) => JSON.stringify(f)).join("\n") + "\n");
  console.log(`${fichas.length} fichas exportadas a data/processed/fichas.jsonl`);
  for (const f of fichas) console.log(`  #${f.posicion_en_cola} ${f.id_caso} · ${f.estado_evidencia} · ${f.borrador.tipo} · válida: ${f.borrador.validacion.valido} · revisión: ${f.estado_revision}`);
}, (e) => { console.error(e); process.exit(1); });
