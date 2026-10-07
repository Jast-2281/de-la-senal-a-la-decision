// Validador determinista de borradores (etapa 6). No usa IA.
// Garantiza lo que se puede comprobar con código: que cada cita exista y apunte a un campo real, y que
// las cifras de una afirmación aparezcan en la evidencia citada. La PERTINENCIA de la cita (si el campo
// respalda la frase) no se puede garantizar aquí: se mide con revisión humana (auditoría 001, R1).
import { sinTildes } from "./organizar";

export type TipoAfirmacion = "hecho" | "declaracion" | "inferencia" | "hipotesis";
export type Cita = { id_evidencia: string; campo: string };
export type Afirmacion = { texto: string; tipo: TipoAfirmacion; citas: Cita[] };

/** Evidencia disponible: id → campo → texto exacto. Es lo que la interfaz muestra junto a cada afirmación. */
export type Evidencia = Record<string, Record<string, string>>;

// "bloqueante": impide aprobar el borrador (citas, cifras, límites máximos). "advertencia": se muestra al editor.
export type Problema = { seccion: string; indice: number; texto: string; problema: string; severidad?: "bloqueante" | "advertencia" };

const NUM = /\d+(?:[.,]\d+)*/g;
const normNum = (s: string) =>
  s.replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".").replace(/^0+(?=\d)/, ""); // "06" ≡ "6"

export function contarPalabras(afirmaciones: Afirmacion[]): number {
  return afirmaciones.map((a) => a.texto).join(" ").split(/\s+/).filter(Boolean).length;
}

export function validarAfirmaciones(seccion: string, afirmaciones: Afirmacion[], evidencia: Evidencia): Problema[] {
  const out: Problema[] = [];
  afirmaciones.forEach((a, i) => {
    const p = (problema: string) => out.push({ seccion, indice: i, texto: a.texto, problema });
    const requiereCita = a.tipo === "hecho" || a.tipo === "declaracion";
    if (requiereCita && a.citas.length === 0) p(`${a.tipo} sin cita`);
    // Estricto (auditoría 005, R6): una cifra debe estar en alguno de los CAMPOS citados, no en otro campo del
    // mismo registro. Si la frase usa valor y año, debe citar `valor` y `anio`.
    const textosCitados: string[] = [];
    for (const c of a.citas) {
      const campos = evidencia[c.id_evidencia];
      if (!campos) p(`cita a evidencia inexistente: ${c.id_evidencia}`);
      else if (!(c.campo in campos)) p(`campo inexistente "${c.campo}" en ${c.id_evidencia}`);
      else textosCitados.push(campos[c.campo]);
    }
    // Cifras: toda cifra, en cualquier tipo de afirmación (también inferencias e hipótesis), debe estar
    // literalmente en el texto citado. Sin cita válida, una afirmación no puede contener cifras.
    // Se ignoran dominios y URLs ("tvn-2.com" no es una cifra).
    const sinDominios = a.texto.replace(/\b(?:https?:\/\/)?[\w-]+(?:\.[\w-]+)*\.(?:com|pa|net|org|gob|gov)(?:\.[a-z]{2})?\b\S*/gi, " ");
    const cifras = sinDominios.replace(/(\d)\s+([.,])\s+(\d)/g, "$1$2$3").match(NUM) ?? [];
    if (cifras.length && !textosCitados.length && !requiereCita) p(`${a.tipo} con cifras sin cita`);
    if (cifras.length && textosCitados.length) {
      // GDELT separa la puntuación con espacios ("5 . 6 %"): se compactan solo para comparar, sin tocar el titular.
      const compacto = textosCitados.join(" ").replace(/(\d)\s+([.,])\s+(\d)/g, "$1$2$3");
      const disponibles = new Set(compacto.match(NUM)?.map(normNum) ?? []);
      // Marcas de tiempo ISO ("2026-09-12T01:59:50.123Z"): cada componente cuenta por separado (año, mes, día, h, min, s).
      for (const ts of compacto.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?/g) ?? [])
        for (const parte of ts.match(/\d+/g) ?? []) disponibles.add(normNum(parte));
      for (const n of cifras) if (!disponibles.has(normNum(n))) p(`cifra "${n}" no aparece en la evidencia citada`);
    }
  });
  return out;
}

export type PaqueteEditorial = {
  abstencion: { abstiene: boolean; motivo: string | null; informacion_necesaria: string[] };
  titulo_propuesto: string;
  enfoque_interes_publico: string;
  brief: Afirmacion[];
  preguntas_investigacion: string[];
  verificaciones_pendientes: string[];
  contradicciones: { descripcion: string; versiones: Afirmacion[] }[];
  guion: Afirmacion[];
  copy_digital: Afirmacion[];
};

export const LIMITES = { brief: 250, copy_digital: 80, guion_min: 110, guion_max: 160 } as const; // guion ≈ 45–60 s a ~2,5 palabras/s

/** `soloInvestigacion`: evidencia insuficiente → guion y copy deben quedar vacíos (T08: prioridad no habilita emisión). */
export function validarPaquete(p: PaqueteEditorial, evidencia: Evidencia, soloInvestigacion = false) {
  if (p.abstencion.abstiene) {
    const conContenido = p.brief.length + p.guion.length + p.copy_digital.length > 0;
    return {
      valido: !conContenido,
      problemas: conContenido ? [{ seccion: "abstencion", indice: 0, texto: "", problema: "se abstiene pero incluye contenido" }] : [],
      palabras: { brief: 0, guion: 0, copy_digital: 0 },
    };
  }
  const problemas = [
    ...validarAfirmaciones("brief", p.brief, evidencia),
    ...validarAfirmaciones("guion", p.guion, evidencia),
    ...validarAfirmaciones("copy_digital", p.copy_digital, evidencia),
    ...p.contradicciones.flatMap((c, k) => validarAfirmaciones(`contradiccion_${k}`, c.versiones, evidencia)),
  ];
  const palabras = { brief: contarPalabras(p.brief), guion: contarPalabras(p.guion), copy_digital: contarPalabras(p.copy_digital) };
  if (palabras.brief > LIMITES.brief) problemas.push({ seccion: "brief", indice: -1, texto: "", problema: `brief de ${palabras.brief} palabras (máx. ${LIMITES.brief})` });
  if (soloInvestigacion && palabras.guion + palabras.copy_digital > 0)
    problemas.push({ seccion: "guion", indice: -1, texto: "", problema: "evidencia insuficiente: no se deben preparar guion ni copy para emisión" });
  // Un guion corto con poca evidencia es preferible a uno rellenado: el mínimo es advertencia; el máximo bloquea.
  if (palabras.guion > LIMITES.guion_max)
    problemas.push({ seccion: "guion", indice: -1, texto: "", problema: `guion de ${palabras.guion} palabras (máx. ${LIMITES.guion_max} ≈ 60 s)` });
  else if (!soloInvestigacion && palabras.guion < LIMITES.guion_min)
    problemas.push({ seccion: "guion", indice: -1, texto: "", severidad: "advertencia", problema: `guion de ${palabras.guion} palabras: dura menos de 45 s (mín. ${LIMITES.guion_min}); no se rellena sin evidencia` });
  if (palabras.copy_digital > LIMITES.copy_digital) problemas.push({ seccion: "copy_digital", indice: -1, texto: "", problema: `copy de ${palabras.copy_digital} palabras (máx. ${LIMITES.copy_digital})` });
  if (p.preguntas_investigacion.length !== 3) problemas.push({ seccion: "preguntas", indice: -1, texto: "", problema: `se esperaban 3 preguntas, hay ${p.preguntas_investigacion.length}` });
  for (const x of problemas) x.severidad ??= "bloqueante";
  return { valido: problemas.every((x) => x.severidad === "advertencia"), problemas, palabras };
}

/**
 * Contradicciones numéricas simples entre titulares de un mismo evento (T05): mismo sustantivo
 * acompañado de cifras distintas (p. ej. "3 muertos" vs. "5 muertos"). Explicable y sin IA.
 */
export function contradiccionesNumericas(items: { id: string; titulo: string }[]) {
  const patron = /(\d+(?:[.,]\d+)?)\s+(?:de\s+)?([a-záéíóúñ]{4,})/gi;
  const porSustantivo = new Map<string, Map<string, string[]>>();
  for (const it of items)
    for (const m of it.titulo.matchAll(patron)) {
      const sust = sinTildes(m[2]).replace(/s$/, "");
      const valores = porSustantivo.get(sust) ?? new Map<string, string[]>();
      valores.set(normNum(m[1]), [...(valores.get(normNum(m[1])) ?? []), it.id]);
      porSustantivo.set(sust, valores);
    }
  return [...porSustantivo.entries()]
    .filter(([, v]) => v.size > 1)
    .map(([sustantivo, v]) => ({ sustantivo, versiones: [...v.entries()].map(([valor, ids]) => ({ valor, ids })) }));
}
