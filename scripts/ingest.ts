// Etapa 1 · Cargar. Descarga un snapshot de fuentes públicas y lo procesa al contrato de datos.
//   npm run ingest               → descarga a data/raw/<corte>/ y procesa
//   npm run ingest -- --raw <dir> → reprocesa un snapshot crudo existente (reproducible, sin red)
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { XMLParser } from "fast-xml-parser";
import {
  type Noticia,
  decodificarEntidades,
  fechaAIso,
  filaCsv,
  idNoticia,
  seendateAIso,
  filtrarVentana,
  ventanaOficial,
  sha256,
  validarNoticias,
} from "../src/lib/ingest";

const VERSION = "senales-evidencias-equipo-v2";
const DIAS_VENTANA = 30;

const GDELT_CONSULTAS = [
  "Panama",
  "(canal OR logística OR puerto)",
  "(turismo OR turistas)",
  "(economía OR inflación OR empleo OR PIB)",
  "(sismo OR inundación OR lluvias OR terremoto)",
].map((q) => `${q} sourcecountry:PM sourcelang:spanish`);

const PAISES = ["PAN", "CRI", "COL", "DOM", "MEX", "GTM"];
const INDICADORES: Record<string, string> = {
  "NY.GDP.MKTP.KD.ZG": "% anual",
  "FP.CPI.TOTL.ZG": "% anual",
  "SL.UEM.TOTL.ZS": "% de la fuerza laboral total (estimación OIT)",
  "SP.POP.TOTL": "personas",
  "IT.NET.USER.ZS": "% de la población",
  "NE.EXP.GNFS.ZS": "% del PIB",
};
const ANIOS = Array.from({ length: 15 }, (_, i) => 2010 + i);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const gdeltFecha = (d: Date) => d.toISOString().replace(/[-:T]/g, "").slice(0, 14);

async function descargar(dir: string, corte: Date) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "corte.txt"), corte.toISOString());
  const consultas: { fuente: string; url: string; archivo: string }[] = [];

  // Reanudable: si el archivo ya existe y es válido no se vuelve a pedir.
  // Ante 429 (límite de GDELT: 1 consulta cada 5 s) espera de forma creciente.
  const obtener = async (fuente: string, url: string, archivo: string, valido: (t: string) => boolean, intentos = 5) => {
    const ruta = join(dir, archivo);
    const previo = await readFile(ruta, "utf8").catch(() => "");
    if (valido(previo)) {
      consultas.push({ fuente, url, archivo });
      return console.log(`= ${archivo} (ya descargado)`);
    }
    for (let intento = 0, espera = 20_000; intento < intentos; intento++, espera *= 2) {
      const r = await fetch(url, { signal: AbortSignal.timeout(60_000) }).catch(() => null);
      const cuerpo = r?.ok ? await r.text() : "";
      if (valido(cuerpo)) {
        await writeFile(ruta, cuerpo);
        consultas.push({ fuente, url, archivo });
        return console.log(`✓ ${archivo}`);
      }
      console.log(`… ${archivo}: ${r?.status ?? "sin respuesta"}, reintento en ${espera / 1000}s`);
      await sleep(espera);
    }
    throw new Error(`No se pudo descargar ${archivo} tras 5 intentos`);
  };
  const esJson = (t: string) => t.trimStart().startsWith("{") || t.trimStart().startsWith("[");

  await obtener("tvn_rss", "https://www.tvn-2.com/rss/", "tvn_rss.xml", (t) => t.includes("<item>"));

  let gdeltBloqueado = false;
  const gdeltFallidas: string[] = [];
  // GDELT devuelve como máximo 250 artículos por consulta: se divide la ventana en tramos de 10 días.
  for (const [qi, q] of GDELT_CONSULTAS.entries()) {
    for (let t = 0; t < DIAS_VENTANA / 10; t++) {
      const fin = new Date(corte.getTime() - t * 10 * 86400_000);
      const ini = new Date(fin.getTime() - 10 * 86400_000);
      const url =
        "https://api.gdeltproject.org/api/v2/doc/doc?mode=ArtList&format=json&maxrecords=250" +
        `&query=${encodeURIComponent(q)}&startdatetime=${gdeltFecha(ini)}&enddatetime=${gdeltFecha(fin)}`;
      // GDELT es opcional: si bloquea (429), se registra la consulta fallida y se continúa (cortacircuito).
      if (gdeltBloqueado) {
        gdeltFallidas.push(url);
        continue;
      }
      try {
        await obtener("gdelt_doc", url, `gdelt_q${qi}_t${t}.json`, esJson, 2);
      } catch {
        gdeltBloqueado = true;
        gdeltFallidas.push(url);
      }
      await sleep(7000);
    }
  }

  for (const ind of Object.keys(INDICADORES)) {
    const url = `https://api.worldbank.org/v2/country/${PAISES.join(";")}/indicator/${ind}?date=2010:2024&format=json&per_page=1000`;
    await obtener("banco_mundial", url, `bm_${ind}.json`, esJson);
  }

  const usgs =
    "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-01-01&endtime=2024-12-31T23:59:59" +
    "&minlatitude=5&maxlatitude=12&minlongitude=-86&maxlongitude=-76&minmagnitude=3";
  await obtener("usgs", usgs, "usgs_2024.geojson", esJson);

  // Consultas GDELT descargadas previamente a mano (se documentan con su URL exacta).
  const previas = JSON.parse(await readFile(join(dir, "gdelt_previas.json"), "utf8").catch(() => "[]")) as { url: string; archivo: string }[];
  for (const p of previas) consultas.push({ fuente: "gdelt_doc", url: p.url, archivo: p.archivo });
  await writeFile(join(dir, "consultas.json"), JSON.stringify({ fecha_corte_UTC: corte.toISOString(), consultas, gdelt_fallidas: gdeltFallidas }, null, 2));
}

async function procesar(rawDir: string, outDir: string) {
  await mkdir(outDir, { recursive: true });
  const { fecha_corte_UTC, consultas, gdelt_fallidas = [] } = JSON.parse(await readFile(join(rawDir, "consultas.json"), "utf8"));
  const extraccion = fecha_corte_UTC as string;
  const filas: Partial<Noticia>[] = [];

  // A1 · RSS de TVN (titular + descripción + palabras clave)
  const xml = new XMLParser({ ignoreAttributes: false });
  const rss = xml.parse(await readFile(join(rawDir, "tvn_rss.xml"), "utf8"));
  const items = [rss?.rss?.channel?.item ?? []].flat();
  for (const it of items) {
    const url = String(it.link ?? "").trim();
    const kw = it["media:keywords"];
    filas.push({
      id_noticia: url ? idNoticia(url) : undefined,
      titulo: decodificarEntidades(String(it.title ?? "").trim()),
      url,
      medio: "tvn-2.com",
      idioma: "es",
      fecha_publicacion: fechaAIso(it.pubDate) ?? (it.pubDate ? String(it.pubDate) : null),
      fecha_deteccion: null,
      fecha_extraccion: extraccion,
      tema: null,
      origen: "tvn_rss",
      alcance_texto: it.description ? "titular+descripcion" : "titular",
      descripcion: it.description ? decodificarEntidades(String(it.description).trim()) : null,
      palabras_clave: kw ? String(kw).split(",").map((s) => s.trim()).filter(Boolean) : [],
    });
  }

  // A2 · GDELT DOC 2.0 (solo titular y metadatos; seendate es detección, no publicación)
  const fallidas: string[] = [];
  for (const f of (await readdir(rawDir)).filter((f) => f.startsWith("gdelt_") && f !== "gdelt_previas.json").sort()) {
    const txt = await readFile(join(rawDir, f), "utf8");
    if (!txt.startsWith("{")) {
      fallidas.push(f);
      continue;
    }
    for (const a of JSON.parse(txt).articles ?? []) {
      filas.push({
        id_noticia: idNoticia(a.url),
        titulo: decodificarEntidades(String(a.title ?? "").trim()),
        url: a.url,
        medio: a.domain,
        idioma: a.language === "Spanish" ? "es" : a.language,
        fecha_publicacion: null,
        fecha_deteccion: seendateAIso(a.seendate),
        fecha_extraccion: extraccion,
        tema: null,
        origen: "gdelt_doc",
        alcance_texto: "titular",
        descripcion: null,
        palabras_clave: [],
      });
    }
  }

  // A3 · Scraping de metadatos de TVN (sitemaps mensuales + og:title/og:description/datePublished)
  const scrapeado = await readFile(join(rawDir, "tvn_articulos.jsonl"), "utf8").catch(() => "");
  for (const l of scrapeado.split("\n").filter(Boolean)) {
    const a = JSON.parse(l);
    filas.push({
      id_noticia: idNoticia(a.url),
      titulo: decodificarEntidades(a.og_title ?? ""),
      url: a.url,
      medio: "tvn-2.com",
      idioma: "es",
      fecha_publicacion: fechaAIso(a.date_published) ?? a.date_published,
      fecha_deteccion: null,
      fecha_extraccion: a.fecha_scraping,
      tema: null,
      origen: "tvn_sitemap",
      ...(() => {
        // Descripción: la más completa entre og:description y JSON-LD (TVN a veces trunca og:description).
        const d = [a.og_description, a.jsonld_description].map((x: string | null) => (x ? decodificarEntidades(x) : x)).filter((x: string | null): x is string => !!x && x.length > 20).sort((x: string, y: string) => y.length - x.length)[0] ?? null;
        return { alcance_texto: d ? ("titular+descripcion" as const) : ("titular" as const), descripcion: d };
      })(),
      palabras_clave: [],
    });
  }

  const validacion = validarNoticias(filas);
  const { errores, duplicadas } = validacion;
  const VENTANA = ventanaOficial(extraccion);
  const { dentro: validas, fuera: fueraDeVentana } = filtrarVentana(validacion.validas, VENTANA);
  const cols = [
    "id_noticia", "titulo", "url", "medio", "idioma", "fecha_publicacion", "fecha_deteccion",
    "fecha_extraccion", "tema", "origen", "alcance_texto", "descripcion", "palabras_clave",
  ] as const;
  const csvNoticias = [
    cols.join(","),
    ...validas.map((n) => filaCsv(cols.map((c) => (c === "palabras_clave" ? n.palabras_clave.join("|") : n[c])))),
  ].join("\n");
  await writeFile(join(outDir, "noticias.csv"), csvNoticias);
  await writeFile(join(outDir, "noticias.json"), JSON.stringify(validas, null, 1));

  // B · Banco Mundial: cuadrícula completa país × indicador × año, conservando nulos
  const indicadores: Record<string, unknown>[] = [];
  for (const [ind, unidad] of Object.entries(INDICADORES)) {
    const [meta, datos] = JSON.parse(await readFile(join(rawDir, `bm_${ind}.json`), "utf8"));
    const url = consultas.find((c: { archivo: string }) => c.archivo === `bm_${ind}.json`).url;
    const nombre = datos?.[0]?.indicator?.value ?? ind;
    for (const p of PAISES)
      for (const anio of ANIOS) {
        const obs = datos?.find((d: { countryiso3code: string; date: string }) => d.countryiso3code === p && d.date === String(anio));
        indicadores.push({
          pais_iso3: p, indicador_id: ind, indicador_nombre: nombre, anio,
          valor: obs?.value ?? null, unidad, fuente_url: url, fecha_extraccion: extraccion,
          licencia: "CC BY 4.0 (Banco Mundial), salvo excepciones en metadatos", ultima_actualizacion_bm: meta?.lastupdated ?? null,
        });
      }
  }
  const icols = Object.keys(indicadores[0]);
  await writeFile(join(outDir, "indicadores.csv"), [icols.join(","), ...indicadores.map((r) => filaCsv(icols.map((c) => r[c] as string)))].join("\n"));
  await writeFile(join(outDir, "indicadores.json"), JSON.stringify(indicadores, null, 1));

  // C · USGS: solo hechos sísmicos; la caja regional no equivale al territorio de Panamá
  // Preferir la consulta USGS de la ventana oficial; la de 2024 queda solo como respaldo.
  const archivoUsgs = (await readdir(rawDir)).includes("usgs_ventana.geojson") ? "usgs_ventana.geojson" : "usgs_2024.geojson";
  const usgs = JSON.parse(await readFile(join(rawDir, archivoUsgs), "utf8"));
  const eventos = {
    type: "FeatureCollection",
    nota: `Caja lat 5–12, lon −86 a −76, M≥3, ${archivoUsgs === "usgs_ventana.geojson" ? "2025-10-02 a 2026-09-30 (hora de Panamá)" : "2024"}. No equivale al territorio de Panamá. Solo evidencia sísmica.`,
    features: usgs.features.map((f: { id: string; geometry: { coordinates: number[] }; properties: Record<string, unknown> }) => ({
      type: "Feature",
      geometry: f.geometry,
      properties: {
        id: f.id, magnitude: f.properties.mag, time: new Date(f.properties.time as number).toISOString(),
        updated: new Date(f.properties.updated as number).toISOString(), longitude: f.geometry.coordinates[0],
        latitude: f.geometry.coordinates[1], depth: f.geometry.coordinates[2], place: f.properties.place,
        status: f.properties.status, url: f.properties.url,
      },
    })),
  };
  await writeFile(join(outDir, "eventos.geojson"), JSON.stringify(eventos, null, 1));

  const fuentes = [
    { id: "tvn_rss", nombre: "TVN · feed RSS público", url: "https://www.tvn-2.com/rss/", campos: "titular, enlace, descripción, pubDate, palabras clave",
      condiciones: "Solo metadatos y descripción del RSS. Sin licencia abierta sobre artículos, imágenes o videos; no se redistribuyen cuerpos." },
    { id: "gdelt_doc", nombre: "GDELT DOC 2.0 API", url: "https://api.gdeltproject.org/api/v2/doc/doc", campos: "titular, URL, dominio, idioma, seendate",
      condiciones: "La API no transfiere derechos de los medios enlazados. seendate = detección, no publicación. Ventana máxima ≈3 meses." },
    { id: "banco_mundial", nombre: "Banco Mundial · Indicators API v2", url: "https://api.worldbank.org/v2", campos: "país, indicador, año, valor",
      condiciones: "CC BY 4.0 con atribución, salvo excepciones de terceros por indicador. Datos anuales revisables." },
    { id: "usgs", nombre: "USGS · catálogo sísmico FDSN", url: "https://earthquake.usgs.gov/fdsnws/event/1/", campos: "id, magnitud, tiempo, ubicación, profundidad, estado, URL",
      condiciones: "Dominio público de EE. UU.; confirmar condiciones de elementos de terceros." },
  ];
  await writeFile(join(outDir, "fuentes.json"), JSON.stringify(fuentes, null, 2));

  const conteoOrigen = (o: string) => validas.filter((n) => n.origen === o).length;
  const calidad = {
    fecha_corte_UTC: extraccion,
    noticias: {
      leidas: filas.length, validas: validas.length, con_error: new Set(errores.map((e) => e.fila)).size,
      duplicadas_por_url: duplicadas.length, fuera_de_ventana: fueraDeVentana.length,
      fuera_de_ventana_por_motivo: Object.fromEntries(["anterior a la ventana", "posterior al último mes completo", "sin fecha"].map((m) => [m, fueraDeVentana.filter((x) => x.motivo === m).length])),
      por_origen: { tvn_rss: conteoOrigen("tvn_rss"), tvn_sitemap: conteoOrigen("tvn_sitemap"), gdelt_doc: conteoOrigen("gdelt_doc") },
      sin_fecha_publicacion: validas.filter((n) => !n.fecha_publicacion).length,
      consultas_gdelt_fallidas: [...fallidas, ...gdelt_fallidas],
    },
    indicadores: { celdas: indicadores.length, con_valor: indicadores.filter((r) => r.valor !== null).length, nulos: indicadores.filter((r) => r.valor === null).length },
    eventos_sismicos: eventos.features.length,
    errores,
    duplicadas,
    fuera_de_ventana: fueraDeVentana,
  };
  await writeFile(join(outDir, "calidad.json"), JSON.stringify(calidad, null, 2));

  const archivos: Record<string, { sha256: string; registros?: number }> = {};
  const registros: Record<string, number> = {
    "noticias.csv": validas.length, "indicadores.csv": indicadores.length, "eventos.geojson": eventos.features.length,
  };
  for (const f of (await readdir(outDir)).filter((f) => f !== "manifest.json").sort())
    archivos[f] = { sha256: sha256(await readFile(join(outDir, f))), registros: registros[f] };
  const crudos: Record<string, string> = {};
  for (const f of (await readdir(rawDir)).sort()) crudos[f] = sha256(await readFile(join(rawDir, f)));

  await writeFile(join(outDir, "manifest.json"), JSON.stringify({
    version: VERSION,
    aviso: "Snapshot armado por el equipo con scraping, según la regla de la mediadora del reto (2026-10-06): no hay paquete común.",
    fecha_extraccion_UTC: extraccion,
    // El análisis (urgencia/novedad) se calcula al cierre de la ventana: reproducible y sin datos posteriores.
    fecha_corte_UTC: VENTANA.fin,
    ventana_noticias: `[${VENTANA.inicio}, ${VENTANA.fin}) en UTC = 2025-10-02 hasta el último mes completo previo a la extracción, en hora de Panamá (regla de la mediadora del reto)`,
    consultas: [
      ...consultas,
      ...(scrapeado ? [{ fuente: "tvn_sitemap", url: "https://tvn-2.com/tvn_sitemap_index.xml → tvn_sitemap_contents_AAAA_MM.xml (oct 2025–sept 2026)", archivo: "tvn_articulos.jsonl" }] : []),
      ...(archivoUsgs === "usgs_ventana.geojson" ? [{ fuente: "usgs", url: "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2025-10-02T05:00:00&endtime=2026-10-01T05:00:00&minlatitude=5&maxlatitude=12&minlongitude=-86&maxlongitude=-76&minmagnitude=3", archivo: "usgs_ventana.geojson" }] : []),
    ],
    archivos, crudos,
    licencias: Object.fromEntries(fuentes.map((f) => [f.id, f.condiciones])),
    transformaciones: [
      "URLs normalizadas (sin query/fragmento, sin www) para ID estable y deduplicación",
      "id_noticia = 'N-' + sha1(url normalizada)[:10]",
      "Fechas convertidas a ISO 8601 UTC; seendate de GDELT va en fecha_deteccion, nunca en fecha_publicacion",
      "Registros con errores se separan en calidad.json sin bloquear la carga",
      "Ventana oficial [2025-10-02, 2026-09-30] (hora de Panamá): los registros fuera se listan en calidad.json (fuera_de_ventana)",
      "TVN: scraping de metadatos públicos (og:title, og:description, datePublished) de URLs de sitemaps mensuales, secciones nacionales/economía; 200 más recientes de sept. 2026 + 10 por mes (oct. 2025–ago. 2026); 1 solicitud/s; sin cuerpos de artículos",
      "Banco Mundial: cuadrícula completa 6×6×15 = 540 celdas; los faltantes se conservan como nulos (no cero)",
      "USGS: se conservan id, URL y campos del contrato; tiempos en ISO 8601 UTC",
    ],
  }, null, 2));

  console.log(JSON.stringify(calidad.noticias, null, 1), calidad.indicadores, "sismos:", calidad.eventos_sismicos);
}

async function main() {
  const args = process.argv.slice(2);
  const rawArg = args.indexOf("--raw");
  let rawDir: string;
  const resume = args.indexOf("--resume");
  if (rawArg >= 0) {
    rawDir = args[rawArg + 1];
  } else if (resume >= 0) {
    rawDir = args[resume + 1];
    await descargar(rawDir, new Date(await readFile(join(rawDir, "corte.txt"), "utf8").catch(() => rawDir.split("/").pop()!.replace(/T(\d\d)(\d\d)$/, "T$1:$2:00Z"))));
  } else {
    const corte = new Date();
    rawDir = join("data", "raw", corte.toISOString().slice(0, 16).replace(/[:]/g, ""));
    await descargar(rawDir, corte);
  }
  await procesar(rawDir, join("data", "processed"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
