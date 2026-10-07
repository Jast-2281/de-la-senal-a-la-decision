// T08 · Caso de prioridad alta: exponer componentes y regla; la prioridad no habilita publicación.
// T03 · Noticia antigua recirculada: no presentarla como evento nuevo.
import { describe, expect, it } from "vitest";
import { type EventoParaPuntaje, PESOS, estadoEvidencia, ordenar, puntuar } from "../src/lib/priorizar";

const ahora = new Date("2026-10-06T18:00:00Z");
const ev = (over: Partial<EventoParaPuntaje>): EventoParaPuntaje => ({
  id_evento: "E-x", tema: "servicios_publicos", n_registros: 6, procedencias_independientes: 1, incluye_tvn: true,
  medios: ["tvn-2.com"], ultima_fecha: "2026-10-06T16:00:00Z", primera_fecha: "2026-10-06T10:00:00Z",
  n_indicadores: 0, n_eventos_oficiales: 0, secciones: ["nacionales"], ...over,
});

describe("T08 · prioridad alta con evidencia insuficiente", () => {
  const e = ev({});
  const p = puntuar(e, ahora);

  it("es prioridad alta y expone cada componente con su criterio y la versión de reglas", () => {
    expect(p.rango).toBe("alto");
    for (const k of Object.keys(PESOS)) expect(p.componentes[k as keyof typeof PESOS].criterio).toBeTruthy();
    expect(p.version).toBe("puntaje-v2");
  });

  it("P es reproducible: suma ponderada de los componentes", () => {
    const suma = (Object.keys(PESOS) as (keyof typeof PESOS)[]).reduce((s, k) => s + PESOS[k] * p.componentes[k].valor, 0);
    expect(p.P).toBeCloseTo(suma, 0);
  });

  it("la evidencia es insuficiente aunque la prioridad sea alta", () => {
    expect(estadoEvidencia(e).estado).toBe("insuficiente");
  });

  it("seis registros de un mismo medio no inflan la evidencia (repetición ≠ corroboración)", () => {
    expect(p.componentes.E.valor).toBeCloseTo(ev({ n_registros: 1 }) && puntuar(ev({ n_registros: 1 }), ahora).componentes.E.valor);
  });
});

describe("T03 · noticia antigua recirculada", () => {
  it("una primera señal de hace un año tiene novedad 0", () => {
    const p = puntuar(ev({ primera_fecha: "2025-10-01T00:00:00Z" }), ahora);
    expect(p.componentes.N.valor).toBe(0);
  });
});

describe("Orden y desempates", () => {
  it("empates por mayor urgencia y luego por ID", () => {
    const mk = (id: string, P: number, U: number) => ({ id_evento: id, puntaje: { P, componentes: { U: { valor: U } } } }) as never;
    const r = ordenar([mk("B", 50, 0.5), mk("A", 50, 0.5), mk("C", 50, 0.9), mk("D", 80, 0)]);
    expect(r.map((x: { id_evento: string }) => x.id_evento)).toEqual(["D", "C", "A", "B"]);
  });
});
