// Construye el paquete de evidencia citable de un evento de la cola (id → campo → texto exacto).
// Lo usan el generador y la interfaz (que muestra el texto exacto junto a cada afirmación).
import type { EnlaceIndicador } from "./contextualizar";
import type { EntradaGeneracion } from "./generar";
import type { Evidencia } from "./validar";

export type EventoCola = {
  id_evento: string;
  titulo: string;
  alcance: string;
  procedencias_independientes: number;
  procedencias_si_se_confirman_replicas: number;
  posibles_replicas: { ids: [string, string] }[];
  grupos_procedencia: { medios: string[]; ids: string[]; agencia: string | null; motivos: string[] }[];
  noticias: {
    id_noticia: string; titulo: string; medio: string; descripcion: string | null; url: string;
    fecha_publicacion: string | null; fecha_deteccion: string | null; alcance_texto: string;
  }[];
  indicadores: EnlaceIndicador[];
  sismo: { id_evidencia: string; limitacion: string; sismos: { id: string; magnitude: number; time: string; place: string; url: string }[] } | null;
  contradicciones: { sustantivo: string; versiones: { valor: string; ids: string[] }[] }[];
  evidencia: { estado: string; motivo: string };
  vacios: string[];
};

export const MAX_NOTICIAS = 12;

export function evidenciaDeEvento(e: EventoCola): Evidencia {
  const ev: Evidencia = {};
  for (const n of e.noticias.slice(0, MAX_NOTICIAS)) {
    ev[n.id_noticia] = {
      titulo: n.titulo,
      medio: n.medio,
      fecha: n.fecha_publicacion ? `publicada ${n.fecha_publicacion}` : `detectada por GDELT ${n.fecha_deteccion} (fecha de publicación desconocida)`,
      alcance: n.alcance_texto === "titular" ? "solo titular" : "titular y descripción del RSS",
      ...(n.descripcion ? { descripcion: n.descripcion } : {}),
    };
  }
  for (const i of e.indicadores)
    ev[i.id_evidencia] = {
      indicador: i.indicador_nombre, pais: i.pais_iso3, anio: String(i.anio), valor: String(i.valor), unidad: i.unidad,
      limitacion: i.limitacion,
    };
  if (e.sismo && !e.sismo.sismos.length)
    ev["USGS:sin-coincidencia"] = { limitacion: e.sismo.limitacion };
  if (e.sismo)
    for (const s of e.sismo.sismos)
      ev[`USGS:${s.id}`] = { magnitud: String(s.magnitude), fecha: s.time, lugar: s.place, limitacion: e.sismo.limitacion };
  return ev;
}

export function entradaDeEvento(e: EventoCola, consulta = "Prepara el paquete editorial de este tema para la agenda de TVN."): EntradaGeneracion {
  const contexto = [
    `Estado de evidencia: ${e.evidencia.estado} (${e.evidencia.motivo}).`,
    `Procedencias independientes: ${e.procedencias_independientes}` +
      (e.posibles_replicas.length ? ` (${e.procedencias_si_se_confirman_replicas} si se confirman ${e.posibles_replicas.length} posible(s) réplica(s)).` : "."),
    ...e.grupos_procedencia.filter((g) => g.ids.length > 1).map((g) => `Misma procedencia (${g.motivos.join(", ")}): ${g.ids.join(", ")}.`),
    ...e.contradicciones.map((c) => `Cifras distintas sobre "${c.sustantivo}" (no se sabe si se refieren al mismo hecho): ${c.versiones.map((v) => `${v.valor} en ${v.ids.join(", ")}`).join(" vs ")}.`),
    ...e.vacios.map((v) => `Vacío: ${v}`),
  ].join("\n");
  return {
    id_evento: e.id_evento, consulta, alcance: e.alcance, evidencia: evidenciaDeEvento(e), contexto,
    solo_investigacion: e.evidencia.estado === "insuficiente",
  };
}
