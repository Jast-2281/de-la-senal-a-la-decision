// T02 · Tres registros del mismo evento: agrupar sin perder fuentes; no triplicar importancia ni corroboración.
// CU-03 · Una agencia replicada cuenta como una sola procedencia.
import { describe, expect, it } from "vitest";
import { agrupar, clasificarPorReglas, jaccard, procedencias, tokens } from "../src/lib/organizar";

describe("T02 · agrupación de eventos", () => {
  // Matriz de similitud sintética: 0,1,2 son el mismo evento; 3 es otro.
  const M = [
    [1, 0.93, 0.91, 0.7],
    [0.93, 1, 0.92, 0.72],
    [0.91, 0.92, 1, 0.71],
    [0.7, 0.72, 0.71, 1],
  ];
  const g = agrupar(4, (i, j) => M[i][j], 0.88, [0, 2, 5, 1]);

  it("agrupa los tres registros sin perder ninguno", () => {
    expect(g[0]).toBe(g[1]);
    expect(g[1]).toBe(g[2]);
    expect(g[3]).not.toBe(g[0]);
    expect(g.every((x) => x >= 0)).toBe(true);
  });

  it("no agrupa registros similares fuera de la ventana temporal", () => {
    const lejos = agrupar(2, () => 0.95, 0.88, [0, 24 * 30]);
    expect(lejos[0]).not.toBe(lejos[1]);
  });
});

describe("CU-03 · procedencia independiente", () => {
  const items = [
    { id: "a", medio: "prensa.com", titulo: "EFE: Canal de Panamá amplía calado por lluvias" },
    { id: "b", medio: "laestrella.com.pa", titulo: "Canal de Panamá amplía calado por lluvias, según EFE" },
    { id: "c", medio: "critica.com.pa", titulo: "EFE | Canal de Panamá amplía el calado" },
    { id: "d", medio: "tvn-2.com", titulo: "ACP confirma a TVN nuevo calado máximo tras lluvias" },
    { id: "e", medio: "tvn-2.com", titulo: "Administrador de la ACP explica el nuevo calado" },
  ];
  const casi = (a: number, b: number) => jaccard(tokens(items[a].titulo), tokens(items[b].titulo)) >= 0.8;
  const r = procedencias(items, casi);

  it("cinco notas → dos procedencias: la agencia replicada y TVN", () => {
    expect(r.independientes).toBe(2);
    const efe = r.grupos.find((g) => g.agencia === "efe")!;
    expect(efe.ids.sort()).toEqual(["a", "b", "c"]);
    expect(efe.replica).toBe(true);
    expect(efe.motivos).toContain("agencia_explicita");
  });

  it("titulares casi idénticos de medios distintos NO se fusionan: quedan como posible réplica", () => {
    const xs = [
      { id: "x", medio: "prensa.com", titulo: "Gobierno anuncia aumento del salario mínimo" },
      { id: "y", medio: "telemetro.com", titulo: "Gobierno anuncia aumento del salario mínimo" },
    ];
    const r2 = procedencias(xs, () => true);
    expect(r2.independientes).toBe(2);
    expect(r2.independientes_si_se_confirman_replicas).toBe(1);
    expect(r2.posibles_replicas).toEqual([{ ids: ["x", "y"], medios: ["prensa.com", "telemetro.com"] }]);
  });
});

describe("Clasificación temática por reglas (baseline explicable)", () => {
  it("explica qué raíces activaron el tema", () => {
    const r = clasificarPorReglas("Sinaproc alerta por lluvias e inundaciones en Chiriquí");
    expect(r.tema).toBe("eventos_naturales");
    expect(r.puntos.eventos_naturales).toEqual(expect.arrayContaining(["lluvia", "inundaci", "sinaproc"]));
  });
  it("sin coincidencias → otros", () => {
    expect(clasificarPorReglas("Final del campeonato de fútbol").tema).toBe("otros");
  });
});

describe("Reglas temáticas v2 · falsos positivos corregidos", () => {
  it("'kilómetros' no activa 'metro' y 'Puerto Rico' no activa logística", () => {
    expect(clasificarPorReglas("Obispos recorren 300 kilómetros hasta Roma").tema).toBe("otros");
    expect(clasificarPorReglas("Miss Panamá viaja a Puerto Rico").tema).toBe("otros");
    expect(clasificarPorReglas("Nuevo puerto en Colón amplía capacidad").tema).toBe("logistica_canal");
  });
});

describe("Reglas temáticas v2 · palabras completas", () => {
  it("'metropolitana' no activa 'metro' y 'logística electoral' no es logística", () => {
    expect(clasificarPorReglas("Arquidiócesis metropolitana anuncia visita").tema).toBe("otros");
    expect(clasificarPorReglas("Tribunal Electoral coordina la logística electoral").tema).toBe("regulacion");
    expect(clasificarPorReglas("Nueva línea del metro de Panamá").tema).toBe("servicios_publicos");
  });
});
