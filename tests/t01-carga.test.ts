// T01 · Archivo con fechas inválidas y nulos: validar, separar errores y conservar nulos; no bloquear la carga.
import { describe, expect, it } from "vitest";
import { type Noticia, filaCsv, filtrarVentana, idNoticia, seendateAIso, validarNoticias } from "../src/lib/ingest";

const base = (over: Partial<Noticia>): Partial<Noticia> => ({
  id_noticia: idNoticia(over.url ?? "https://ejemplo.pa/a"),
  titulo: "Titular",
  url: "https://ejemplo.pa/a",
  medio: "ejemplo.pa",
  idioma: "es",
  fecha_publicacion: "2026-10-01T12:00:00.000Z",
  fecha_deteccion: null,
  fecha_extraccion: "2026-10-06T12:00:00.000Z",
  tema: null,
  origen: "tvn_rss",
  alcance_texto: "titular",
  descripcion: null,
  palabras_clave: [],
  ...over,
});

describe("T01 · carga tolerante", () => {
  const filas = [
    base({ url: "https://ejemplo.pa/ok" }),
    base({ url: "https://ejemplo.pa/fecha-mala", fecha_publicacion: "31/02/2026" }),
    base({ url: "https://ejemplo.pa/sin-titulo", titulo: "" }),
    base({ url: "no-es-url" }),
    base({ url: "https://ejemplo.pa/gdelt", origen: "gdelt_doc", fecha_publicacion: null, fecha_deteccion: "2026-10-05T07:15:00Z" }),
    base({ url: "https://www.ejemplo.pa/ok/?utm=x" }), // duplicado de /ok tras normalizar
  ];
  const r = validarNoticias(filas);

  it("no bloquea: conserva los registros válidos", () => {
    expect(r.validas.map((n) => n.url)).toEqual(["https://ejemplo.pa/ok", "https://ejemplo.pa/gdelt"]);
  });

  it("separa cada error con fila, campo y motivo", () => {
    expect(r.errores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fila: 1, campo: "fecha_publicacion" }),
        expect.objectContaining({ fila: 2, campo: "titulo" }),
        expect.objectContaining({ fila: 3, campo: "url" }),
      ]),
    );
  });

  it("conserva el nulo de fecha_publicacion de GDELT, sin rellenarlo con la detección", () => {
    const g = r.validas.find((n) => n.origen === "gdelt_doc")!;
    expect(g.fecha_publicacion).toBeNull();
    expect(g.fecha_deteccion).toBe("2026-10-05T07:15:00Z");
  });

  it("deduplica por URL normalizada", () => {
    expect(r.duplicadas).toHaveLength(1);
  });

  it("escribe nulos como celda vacía, nunca como 0", () => {
    expect(filaCsv(["PAN", null, 2024])).toBe("PAN,,2024");
    expect(filaCsv(['dice "hola", ya'])).toBe('"dice ""hola"", ya"');
  });

  it("convierte seendate de GDELT y rechaza formatos inválidos", () => {
    expect(seendateAIso("20260907T071500Z")).toBe("2026-09-07T07:15:00Z");
    expect(seendateAIso("ayer")).toBeNull();
  });
});

describe("Ventana oficial [2025-10-02, 2026-09-30] en hora de Panamá", () => {
  const mk = (url: string, fecha: string | null): Noticia => base({ url, fecha_publicacion: fecha }) as Noticia;
  const r = filtrarVentana([
    mk("https://a.pa/1", "2025-10-02T04:59:00.000Z"), // 1 oct 23:59 en Panamá → fuera
    mk("https://a.pa/2", "2025-10-02T05:00:00.000Z"), // 2 oct 00:00 en Panamá → dentro
    mk("https://a.pa/3", "2026-10-01T04:59:00.000Z"), // 30 sept 23:59 en Panamá → dentro
    mk("https://a.pa/4", "2026-10-01T05:00:00.000Z"), // 1 oct → fuera (mes incompleto)
  ]);
  it("respeta los bordes en hora de Panamá y documenta el motivo de exclusión", () => {
    expect(r.dentro.map((n) => n.url)).toEqual(["https://a.pa/2", "https://a.pa/3"]);
    expect(r.fuera.map((x) => x.motivo)).toEqual(["anterior a la ventana", "posterior al último mes completo"]);
  });
});

describe("Ventana automática: último mes completo según la fecha de extracción", () => {
  it("extracción el 6 de octubre → cierra el 30 de septiembre; el 15 de noviembre → cierra el 31 de octubre", async () => {
    const { ventanaOficial } = await import("../src/lib/ingest");
    expect(ventanaOficial("2026-10-06T22:50:00Z").fin).toBe("2026-10-01T05:00:00.000Z");
    expect(ventanaOficial("2026-11-15T12:00:00Z").fin).toBe("2026-11-01T05:00:00.000Z");
    expect(ventanaOficial("2026-11-01T03:00:00Z").fin).toBe("2026-10-01T05:00:00.000Z"); // aún 31 oct en Panamá
  });
});
