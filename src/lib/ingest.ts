// Funciones puras de ingesta y validación (sección 7 del pliego).
// Se mantienen sin I/O para poder probarlas (T01).
import { createHash } from "node:crypto";

export type Noticia = {
  id_noticia: string;
  titulo: string;
  url: string;
  medio: string;
  idioma: string;
  fecha_publicacion: string | null; // ISO 8601 UTC; null si la fuente no la da (GDELT)
  fecha_deteccion: string | null; // seendate de GDELT; null para RSS
  fecha_extraccion: string;
  tema: string | null; // se asigna en la etapa 2 (organizar)
  origen: "tvn_rss" | "tvn_sitemap" | "gdelt_doc";
  alcance_texto: "titular" | "titular+descripcion";
  descripcion: string | null;
  palabras_clave: string[];
};

export type ErrorCalidad = { fila: number; id: string | null; campo: string; problema: string };

export function normalizarUrl(u: string): string {
  try {
    const url = new URL(u.trim());
    url.hash = "";
    url.search = "";
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    return u.trim();
  }
}

export function idNoticia(url: string): string {
  return "N-" + createHash("sha1").update(normalizarUrl(url)).digest("hex").slice(0, 10);
}

export function sha256(contenido: string | Buffer): string {
  return createHash("sha256").update(contenido).digest("hex");
}

/** GDELT seendate "20260907T071500Z" → ISO 8601. */
export function seendateAIso(s: string): string | null {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s ?? "");
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z` : null;
}

/** Fecha RFC 822 del RSS → ISO 8601 UTC, o null si es inválida. */
export function fechaAIso(s: string | null | undefined): string | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const OBLIGATORIOS = ["id_noticia", "titulo", "url", "medio", "fecha_extraccion", "origen"] as const;

/**
 * Valida cada registro sin bloquear la carga (T01): separa los registros con
 * errores, conserva los nulos permitidos y deduplica por URL normalizada.
 */
export function validarNoticias(filas: Partial<Noticia>[]) {
  const validas: Noticia[] = [];
  const errores: ErrorCalidad[] = [];
  const duplicadas: { id: string; url: string; origen: string }[] = [];
  const vistas = new Map<string, Noticia>();

  filas.forEach((f, i) => {
    const errs: ErrorCalidad[] = [];
    for (const c of OBLIGATORIOS) {
      const v = f[c];
      if (v === undefined || v === null || String(v).trim() === "")
        errs.push({ fila: i, id: f.id_noticia ?? null, campo: c, problema: "campo obligatorio vacío" });
    }
    if (f.url) {
      try {
        const u = new URL(f.url);
        if (!/^https?:$/.test(u.protocol)) throw new Error();
      } catch {
        errs.push({ fila: i, id: f.id_noticia ?? null, campo: "url", problema: "URL inválida" });
      }
    }
    for (const c of ["fecha_publicacion", "fecha_deteccion", "fecha_extraccion"] as const) {
      const v = f[c];
      if (v !== null && v !== undefined && Number.isNaN(new Date(v).getTime()))
        errs.push({ fila: i, id: f.id_noticia ?? null, campo: c, problema: `fecha inválida: ${v}` });
    }
    if (!f.fecha_publicacion && !f.fecha_deteccion)
      errs.push({ fila: i, id: f.id_noticia ?? null, campo: "fecha_publicacion", problema: "sin fecha de publicación ni de detección" });

    if (errs.length) {
      errores.push(...errs);
      return;
    }
    const n = f as Noticia;
    const clave = normalizarUrl(n.url);
    if (vistas.has(clave)) {
      duplicadas.push({ id: n.id_noticia, url: n.url, origen: n.origen });
      return;
    }
    vistas.set(clave, n);
    validas.push(n);
  });

  return { validas, errores, duplicadas };
}

/** Escapa una fila CSV (RFC 4180). Los nulos se escriben como celda vacía, nunca como 0. */
export function filaCsv(valores: (string | number | null | undefined)[]): string {
  return valores
    .map((v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(",");
}

/**
 * Ventana oficial de noticias (regla de la mediadora del reto, WhatsApp 2026-10-06 16:35):
 * desde 2025-10-02 hasta el último mes COMPLETO respecto de la fecha de extracción, en hora de Panamá (UTC−5).
 * Se calcula a partir de la fecha de extracción registrada → reproducible; si la demo ocurre en otro mes,
 * basta volver a ejecutar la ingesta para incluir el mes recién cerrado.
 */
export function ventanaOficial(extraccion: Date | string) {
  const d = new Date(new Date(extraccion).getTime() - 5 * 3_600_000); // hora de Panamá
  const fin = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 5)); // 1.º del mes actual, 00:00 Panamá
  return { inicio: "2025-10-02T05:00:00.000Z", fin: fin.toISOString() };
}
export const VENTANA = ventanaOficial("2026-10-06T22:50:00Z");

/** Separa los registros fuera de la ventana (se documentan como excluidos, no se borran del crudo). */
export function filtrarVentana(ns: Noticia[], v: { inicio: string; fin: string } = VENTANA) {
  const dentro: Noticia[] = [];
  const fuera: { id: string; url: string; fecha: string | null; motivo: string }[] = [];
  for (const n of ns) {
    const f = n.fecha_publicacion ?? n.fecha_deteccion;
    if (f && f >= v.inicio && f < v.fin) dentro.push(n);
    else fuera.push({ id: n.id_noticia, url: n.url, fecha: f, motivo: f ? (f < v.inicio ? "anterior a la ventana" : "posterior al último mes completo") : "sin fecha" });
  }
  return { dentro, fuera };
}

/** Decodifica entidades HTML comunes en titulares y descripciones (&#039;, &quot;, &#8220;, &amp;…). */
export function decodificarEntidades(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}
