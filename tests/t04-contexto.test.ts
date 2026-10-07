// T04 · Cifra anual del Banco Mundial: mantener país, año y unidad; citar el dato y no describirlo como cifra de hoy.
// Etapa 3 · Si no existe relación sustentada, no forzarla.
import { describe, expect, it } from "vitest";
import { type Indicador, enlazarIndicadores, enlazarSismos } from "../src/lib/contextualizar";

const ind = (pais: string, anio: number, valor: number | null): Indicador => ({
  pais_iso3: pais, indicador_id: "FP.CPI.TOTL.ZG", indicador_nombre: "Inflation, consumer prices (annual %)",
  anio, valor, unidad: "% anual", fuente_url: "https://api.worldbank.org/v2/...",
});
const datos = [ind("PAN", 2023, 1.5), ind("PAN", 2024, null), ind("PAN", 2022, 2.9), ind("CRI", 2023, 0.5)];

describe("T04 · cifra anual del Banco Mundial", () => {
  const [e] = enlazarIndicadores(["Comerciantes advierten alza de precios e inflación en la canasta"], datos);

  it("usa el último año con valor (no rellena el nulo de 2024) y conserva país, año y unidad", () => {
    expect(e).toMatchObject({ pais_iso3: "PAN", anio: 2023, valor: 1.5, unidad: "% anual", id_evidencia: "BM:PAN:FP.CPI.TOTL.ZG:2023" });
  });

  it("declara que es un dato anual y no una medición actual", () => {
    expect(e.limitacion).toMatch(/Dato anual de 2023/);
    expect(e.limitacion).toMatch(/No es una medición actual/);
  });

  it("incluye la comparación regional del mismo año", () => {
    expect(e.comparacion).toEqual([{ pais_iso3: "CRI", valor: 0.5 }]);
  });
});

describe("No forzar relaciones", () => {
  it("un titular sin mención explícita no se enlaza a ningún indicador", () => {
    expect(enlazarIndicadores(["Aprehenden a exdirector de la CSS"], datos)).toEqual([]);
  });

  it("un sismo de 2026 no se respalda con el catálogo USGS de 2024", () => {
    const r = enlazarSismos(["Fuerte sismo sacude Chiriquí"], "2026-10-05T10:00:00Z", [
      { id: "us1", magnitude: 5, time: "2024-03-01T00:00:00Z", place: "x", url: "u" },
    ])!;
    expect(r.sismos).toHaveLength(0);
    expect(r.limitacion).toMatch(/verificación pendiente/);
  });
});
