// Ejecuta (y guarda en caché) consultas en español sobre el corpus.
//   npm run consultar -- "¿Cuál fue el rating de TVN ayer?" "¿Qué se sabe del teleférico?"
//   npm run consultar -- --solo-recuperar "pregunta"   → muestra similitudes (calibración del umbral)
import { consultar, recuperar } from "../src/lib/consulta";

async function main() {
  const args = process.argv.slice(2);
  const soloRecuperar = args.includes("--solo-recuperar");
  for (const q of args.filter((a) => !a.startsWith("--"))) {
    console.log(`\n=== ${q}`);
    if (soloRecuperar) {
      for (const r of await recuperar(q, 5)) console.log(`  ${r.similitud.toFixed(3)} · ${r.titulo.slice(0, 90)}`);
      continue;
    }
    const r = await consultar(q, { permitirLLM: true });
    console.log(`modo: ${r.modo} · máx. similitud ${r.max_similitud} · abstiene: ${r.abstencion.abstiene} ${r.meta.costo_usd ? `· US$ ${r.meta.costo_usd.toFixed(4)} · ${r.meta.latencia_ms} ms` : ""}`);
    if (r.abstencion.abstiene) console.log(`  motivo: ${r.abstencion.motivo}\n  necesita: ${r.abstencion.informacion_necesaria.join(" | ")}`);
    for (const a of r.respuesta) console.log(`  [${a.tipo}] ${a.texto} ${a.citas.map((c) => `{${c.id_evidencia}·${c.campo}}`).join("")}`);
    for (const p of r.problemas) console.log(`  ✗ ${p.problema}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
