// Regresión (auditoría Codex 008): respaldo de recuperación sin modelo local (T10) y separación de la reserva del benchmark.
import { mkdtempSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { casosVisibles } from "../src/lib/etiquetas";

describe("T10 · sin modelo local, la consulta se degrada y lo declara", () => {
  it("recupera por palabras clave con motivo 'modelo_no_disponible' y no lanza error", async () => {
    // Variables de entorno antes de importar: el módulo de embeddings las lee al cargarse.
    process.env.MODELS_OFFLINE = "1";
    process.env.MODELS_DIR = mkdtempSync(join(tmpdir(), "sin-modelos-"));
    const { recuperarConMetodo, UMBRAL_PALABRAS } = await import("../src/lib/consulta");
    const r = await recuperarConMetodo("¿Qué se sabe del teleférico de San Miguelito?");
    expect(r.metodo).toBe("palabras_clave");
    expect(r.motivo_respaldo).toBe("modelo_no_disponible");
    expect(r.umbral).toBe(UMBRAL_PALABRAS);
    expect(r.items[0].titulo.toLowerCase()).toContain("teleférico");
  }, 60_000);
});

describe("Reserva del benchmark protegida", () => {
  const bench = readFileSync(join("data", "eval", "benchmark.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

  it("el archivo conserva 60 casos: 40 de desarrollo y 20 de reserva", () => {
    expect(bench).toHaveLength(60);
    expect(bench.filter((b: { split: string }) => b.split === "desarrollo")).toHaveLength(40);
  });

  it("la vista normal no expone ningún caso de reserva", () => {
    const visibles = casosVisibles(bench, false);
    expect(visibles).toHaveLength(40);
    expect(visibles.every((b: { split: string }) => b.split === "desarrollo")).toBe(true);
  });

  it("la vista de reserva muestra solo los 20 reservados", () => {
    const reserva = casosVisibles(bench, true);
    expect(reserva).toHaveLength(20);
    expect(reserva.every((b: { split: string }) => b.split === "reserva")).toBe(true);
  });
});
