// Genera (o recupera de caché) paquetes editoriales para eventos de la cola.
//   npm run generar -- 21            → evento en la posición 21 de la cola
//   npm run generar -- E-xxxx        → por id de evento
//   npm run generar -- 21 --modelo claude-haiku-4-5 --forzar
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { generarPaquete } from "../src/lib/generar";
import { type EventoCola, entradaDeEvento } from "../src/lib/evidencia";

async function main() {
  const args = process.argv.slice(2);
  const cola: EventoCola[] = JSON.parse(await readFile(join("data", "processed", "cola.json"), "utf8")).eventos;
  const modelo = args.includes("--modelo") ? args[args.indexOf("--modelo") + 1] : undefined;
  const forzar = args.includes("--forzar");
  const objetivos = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--modelo");
  for (const o of objetivos) {
    const e = /^\d+$/.test(o) ? cola[Number(o)] : cola.find((x) => x.id_evento === o);
    if (!e) throw new Error(`No existe el evento ${o}`);
    const r = await generarPaquete(entradaDeEvento(e), { modelo, forzar });
    const m = r.meta;
    console.log(`\n=== ${e.id_evento} · ${e.titulo}`);
    console.log(`${m.modelo} · ${m.desde_cache ? "caché" : `${m.latencia_ms} ms`} · tokens ${m.tokens.entrada}+${m.tokens.salida} (caché lect. ${m.tokens.cache_lectura}) · US$ ${m.costo_usd?.toFixed(4)}`);
    console.log(`Validación: ${r.validacion.valido ? "OK" : "CON PROBLEMAS"} · palabras ${JSON.stringify(r.validacion.palabras)}`);
    for (const p of r.validacion.problemas) console.log(`  ✗ [${p.seccion}#${p.indice}] ${p.problema} — ${p.texto}`);
    console.log(JSON.stringify(r.paquete, null, 1));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
