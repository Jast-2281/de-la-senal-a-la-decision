// Exporta las fichas de caso al contrato de datos (pág. 7): fichas.jsonl con
// id_caso, modalidad, ids_fuente, afirmaciones, citas, puntaje, componentes, estado_evidencia, borrador, estado_revision.
import { type EventoUI, estadoActual, leerCola, leerRevisiones } from "./datos";
import { entradaDeEvento } from "./evidencia";
import { leerPaqueteCacheado } from "./generar";

export async function construirFichas() {
  const [cola, revisiones] = await Promise.all([leerCola(), leerRevisiones()]);
  const fichas = [];
  for (const [i, e] of cola.eventos.entries()) {
    const entrada = entradaDeEvento(e);
    const r = await leerPaqueteCacheado(entrada);
    if (!r) continue; // solo eventos con borrador generado (fichas trazables)
    const p = r.paquete;
    const secciones = { brief: p.brief, guion: p.guion, copy_digital: p.copy_digital } as const;
    const afirmaciones = Object.entries(secciones).flatMap(([seccion, xs]) =>
      xs.map((a, k) => ({ seccion, indice: k, tipo: a.tipo, texto: a.texto, citas: a.citas })),
    );
    const citas = [...new Map(
      afirmaciones.flatMap((a) => a.citas).map((c) => [
        `${c.id_evidencia}|${c.campo}`,
        { ...c, texto_citado: entrada.evidencia[c.id_evidencia]?.[c.campo] ?? null },
      ]),
    ).values()];
    fichas.push({
      id_caso: e.id_evento,
      modalidad: "TVN · editorial",
      posicion_en_cola: i + 1,
      titulo_evento: e.titulo,
      ids_fuente: Object.keys(entrada.evidencia),
      afirmaciones,
      citas,
      puntaje: e.puntaje.P,
      rango: e.puntaje.rango,
      componentes: Object.fromEntries(Object.entries(e.puntaje.componentes).map(([k, c]) => [k, { valor: +c.valor.toFixed(3), criterio: c.criterio }])),
      version_reglas: e.puntaje.version,
      estado_evidencia: e.evidencia.estado,
      motivo_estado_evidencia: e.evidencia.motivo,
      procedencias_independientes: e.procedencias_independientes,
      vacios: e.vacios,
      contradicciones: e.contradicciones,
      borrador: {
        tipo: entrada.solo_investigacion ? "brief de investigación" : "paquete editorial",
        abstencion: p.abstencion,
        titulo_propuesto: p.titulo_propuesto,
        enfoque_interes_publico: p.enfoque_interes_publico,
        preguntas_investigacion: p.preguntas_investigacion,
        verificaciones_pendientes: p.verificaciones_pendientes,
        validacion: r.validacion,
        generacion: r.meta,
      },
      estado_revision: estadoActual(revisiones[e.id_evento]),
      historial_revision: revisiones[e.id_evento] ?? [],
    });
  }
  return fichas;
}

export type Ficha = Awaited<ReturnType<typeof construirFichas>>[number];
export type { EventoUI };
