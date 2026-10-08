// Etapas 3 y 4 · Contextualizar + Priorizar → data/processed/cola.json (lo que consume la interfaz).
//   npm run cola
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Noticia } from "../src/lib/ingest";
import { type Indicador, type Sismo, enlazarIndicadores, enlazarSismos } from "../src/lib/contextualizar";
import { REGLAS_PUNTAJE_VERSION, PESOS, estadoEvidencia, ordenar, puntuar } from "../src/lib/priorizar";
import { contradiccionesNumericas } from "../src/lib/validar";
import type { Tema } from "../src/lib/organizar";

const DIR = join("data", "processed");

type EventoOrganizado = {
  id_evento: string; titulo: string; tema: Tema; ids_noticias: string[]; n_registros: number; medios: string[];
  procedencias_independientes: number; procedencias_si_se_confirman_replicas: number;
  posibles_replicas: { ids: [string, string]; medios: [string, string] }[];
  grupos_procedencia: { medios: string[]; ids: string[]; agencia: string | null; motivos: string[] }[];
  incluye_tvn: boolean; primera_fecha: string | null; ultima_fecha: string | null;
};

const seccionTvn = (url: string) => (url.includes("tvn-2.com") ? url.split("/")[3] ?? null : null);

async function main() {
  const noticias: Noticia[] = JSON.parse(await readFile(join(DIR, "noticias.json"), "utf8"));
  const org = JSON.parse(await readFile(join(DIR, "organizado.json"), "utf8"));
  const indicadores: Indicador[] = JSON.parse(await readFile(join(DIR, "indicadores.json"), "utf8"));
  const geo = JSON.parse(await readFile(join(DIR, "eventos.geojson"), "utf8"));
  const sismos: Sismo[] = geo.features.map((f: { properties: Sismo }) => f.properties);
  const manifest = JSON.parse(await readFile(join(DIR, "manifest.json"), "utf8"));
  const porId = new Map(noticias.map((n) => [n.id_noticia, n]));
  // La "hora actual" del análisis es el corte del snapshot: reproducible y coherente con los datos.
  const ahora = new Date(manifest.fecha_corte_UTC);

  const temas: Record<string, { tema: Tema; tema_evidencia: Record<string, string[]> }> = Object.fromEntries(
    org.noticias.map((n: { id_noticia: string; tema: Tema; tema_evidencia: Record<string, string[]> }) => [n.id_noticia, n]),
  );

  const items = (org.eventos as EventoOrganizado[]).map((e) => {
    const ns = e.ids_noticias.map((id) => porId.get(id)!);
    const titulos = ns.map((n) => n.titulo);
    const enlacesInd = enlazarIndicadores(titulos, indicadores);
    const enlaceSismo = enlazarSismos(titulos, e.ultima_fecha, sismos);
    const contradicciones = contradiccionesNumericas(ns.map((n) => ({ id: n.id_noticia, titulo: n.titulo })));
    const secciones = [...new Set(ns.map((n) => seccionTvn(n.url)).filter((s): s is string => !!s))];
    const base = {
      ...e,
      secciones,
      n_indicadores: enlacesInd.length,
      n_eventos_oficiales: enlaceSismo?.sismos.length ?? 0,
    };
    const puntaje = puntuar(base, ahora);
    const evidencia = estadoEvidencia(base, contradicciones.length > 0);
    const soloTitular = ns.every((n) => n.alcance_texto === "titular");
    const vacios: string[] = [];
    if (e.procedencias_independientes < 2) vacios.push("Falta una segunda procedencia independiente.");
    if (e.posibles_replicas.length) vacios.push(`Revisar si ${e.posibles_replicas.length} par(es) de titulares casi idénticos son réplicas de un mismo origen.`);
    if (!enlacesInd.length && !enlaceSismo) vacios.push("No hay dato oficial enlazado en el corpus para este tema.");
    if (enlaceSismo && !enlaceSismo.sismos.length) vacios.push(enlaceSismo.limitacion);
    if (contradicciones.length) vacios.push(`Cifras distintas entre titulares (${contradicciones.map((c) => c.sustantivo).join(", ")}): verificar si se refieren al mismo hecho.`);
    if (soloTitular) vacios.push("Solo hay titulares y metadatos: no se ha leído el cuerpo de ninguna nota.");
    const accion =
      evidencia.estado === "insuficiente" ? "Investigar: buscar una segunda fuente o un dato oficial antes de redactar."
      : evidencia.estado === "parcial" ? "Verificar los vacíos antes de aprobar un borrador."
      : "Preparar borrador para revisión editorial.";
    return {
      ...base,
      noticias: ns.map((n) => ({
        id_noticia: n.id_noticia, titulo: n.titulo, url: n.url, medio: n.medio, descripcion: n.descripcion,
        fecha_publicacion: n.fecha_publicacion, fecha_deteccion: n.fecha_deteccion, origen: n.origen,
        alcance_texto: n.alcance_texto, tema: temas[n.id_noticia]?.tema, tema_evidencia: temas[n.id_noticia]?.tema_evidencia,
        palabras_clave: n.palabras_clave, seccion: seccionTvn(n.url),
      })),
      indicadores: enlacesInd,
      sismo: enlaceSismo,
      contradicciones,
      alcance: soloTitular ? "basado únicamente en titular/metadatos" : "titular + descripción del RSS/metadatos",
      puntaje,
      evidencia,
      vacios,
      accion,
    };
  });

  const cola = ordenar(items);
  await writeFile(join(DIR, "cola.json"), JSON.stringify({
    generado_desde: { snapshot: manifest.version, fecha_corte_UTC: manifest.fecha_corte_UTC, aviso: manifest.aviso },
    reglas: { puntaje: REGLAS_PUNTAJE_VERSION, pesos: PESOS, organizar: org.version },
    eventos: cola,
  }, null, 1));

  for (const e of cola.slice(0, 12))
    console.log(`${e.puntaje.P.toFixed(1).padStart(5)} ${e.puntaje.rango.padEnd(5)} · ${e.evidencia.estado.padEnd(12)} · ${e.procedencias_independientes}p · ${e.tema} · ${e.titulo.slice(0, 80)}`);
  console.log(Object.fromEntries(["alto", "medio", "bajo"].map((r) => [r, cola.filter((e) => e.puntaje.rango === r).length])));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
