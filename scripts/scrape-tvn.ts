// Scraping de metadatos de TVN (regla del mediador, 2026-10-06: "armar los datos con scraping",
// ventana 2025-10-02 → último mes completo, septiembre 2026).
// Respeta robots.txt (solo artículos; no /api, /buscador ni /tag), 1 solicitud por segundo, y guarda
// únicamente metadatos públicos: og:title, og:description y datePublished. No guarda cuerpos de artículos.
//   npm run scrape-tvn -- <dir_raw>
import { appendFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const MESES = ["2025_10", "2025_11", "2025_12", "2026_01", "2026_02", "2026_03", "2026_04", "2026_05", "2026_06", "2026_07", "2026_08", "2026_09"];
const SECCIONES = ["nacionales", "economia"];
const RECIENTES_SEPT = 200; // la demo debe usar información reciente
const POR_MES = 10; // contexto histórico de la ventana
const UA = "hackIAthon-TVN-equipo/1.0 (investigación académica; metadatos públicos)";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const desescapar = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();

async function main() {
  const dir = process.argv[2];
  if (!dir) throw new Error("Uso: npm run scrape-tvn -- <dir_raw>");
  const salida = join(dir, "tvn_articulos.jsonl");
  const hechos = new Set(
    (await readFile(salida, "utf8").catch(() => "")).split("\n").filter(Boolean).map((l) => JSON.parse(l).url),
  );

  const seleccion: { url: string; lastmod: string; sitemap: string }[] = [];
  for (const mes of MESES) {
    const sitemap = `https://www.tvn-2.com/tvn_sitemap_contents_${mes}.xml`;
    const xml = await (await fetch(sitemap, { headers: { "user-agent": UA } })).text();
    const urls = [...xml.matchAll(/<url>\s*<loc>(https:\/\/www\.tvn-2\.com\/([a-z-]+)\/[^<]*_1_\d+\.html)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)]
      .filter((m) => SECCIONES.includes(m[2]))
      .map((m) => ({ url: m[1], lastmod: m[3], sitemap }))
      .sort((a, b) => b.lastmod.localeCompare(a.lastmod));
    const n = mes === "2026_09" ? RECIENTES_SEPT : POR_MES;
    // Muestreo determinista: en meses de contexto, espaciado uniforme a lo largo del mes.
    const paso = mes === "2026_09" ? 1 : Math.max(1, Math.floor(urls.length / n));
    seleccion.push(...urls.filter((_, i) => i % paso === 0).slice(0, n));
    console.log(`${mes}: ${urls.length} URLs en ${SECCIONES.join("/")} → ${Math.min(n, urls.length)} seleccionadas`);
    await sleep(1000);
  }
  await writeFile(join(dir, "tvn_sitemap_seleccion.json"), JSON.stringify({ meses: MESES, secciones: SECCIONES, recientes_sept: RECIENTES_SEPT, por_mes: POR_MES, seleccion }, null, 1));

  let ok = 0, fallos = 0;
  for (const s of seleccion) {
    if (hechos.has(s.url)) continue;
    // Un timeout puede ocurrir también al leer el cuerpo: se registra como fallo y se continúa.
    let r: Response | null = null;
    let html = "";
    try {
      r = await fetch(s.url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(30_000) });
      html = r.ok ? await r.text() : "";
    } catch {
      html = "";
    }
    const meta = (p: RegExp) => desescapar(html.match(p)?.[1] ?? "") || null;
    const registro = {
      url: s.url,
      sitemap: s.sitemap,
      lastmod_sitemap: s.lastmod,
      og_title: meta(/property="og:title" content="([^"]*)"/),
      og_description: meta(/property="og:description" content="([^"]*)"/),
      // Algunas páginas de TVN traen og:description truncada ("La "); el JSON-LD conserva la completa.
      jsonld_description: meta(/"description":"((?:[^"\\]|\\.)*)"/),
      date_published: meta(/"datePublished":"([^"]+)"/),
      http_status: r?.status ?? null,
      fecha_scraping: new Date().toISOString(),
    };
    await appendFile(salida, JSON.stringify(registro) + "\n");
    if (registro.og_title) ok++;
    else fallos++;
    if ((ok + fallos) % 50 === 0) console.log(`  ${ok + fallos}/${seleccion.length}`);
    await sleep(1000);
  }
  console.log(`Listo: ${ok} con título, ${fallos} sin título.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
