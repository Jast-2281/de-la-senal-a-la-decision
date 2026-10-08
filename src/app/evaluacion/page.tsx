import { connection } from "next/server";
import { Suspense } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { type CasoBenchmark, type CasoPar, type CasoSustento, Validador } from "@/components/validador";
import { casosVisibles, leerEtiquetas, leerJsonl } from "@/lib/etiquetas";
import type { Noticia } from "@/lib/ingest";

export default function Pagina({ searchParams }: PageProps<"/evaluacion">) {
  return (
    <>
      <section className="bg-indigo text-sobre-indigo">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8">
          <h1 className="font-rotulo text-4xl font-black uppercase tracking-tight">Validación humana</h1>
          <p className="max-w-3xl text-lg text-sobre-indigo-2">
            Las métricas del pliego (sección 9.1) se calculan sobre etiquetas humanas. Revisa cada caso sin ver la predicción del
            sistema; las comparaciones se calculan después.
          </p>
        </div>
      </section>
      <div className="mx-auto w-full max-w-7xl px-5 py-8">
        <Suspense fallback={<p className="text-tinta-3">Cargando casos…</p>}>
          <Contenido searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

// Auditoría Codex 007, C1: los 20 casos de reserva no se muestran en la vista normal. Solo se validan al final,
// con el sistema congelado, desde /evaluacion?reserva=1; nunca se usan para ajustar prompts, umbrales ni reglas.
async function Contenido({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const reserva = (await searchParams).reserva === "1";
  const noticias: Noticia[] = JSON.parse(await readFile(join(process.cwd(), "data", "processed", "noticias.json"), "utf8"));
  const porId = new Map(noticias.map((n) => [n.id_noticia, n]));
  const [bench, pares, sustento, etiquetas] = await Promise.all([
    leerJsonl<{ id: string; split: string; tipo: string; consulta: string; respuesta_esperada: string; ids_evidencia: string[]; sintetico: boolean }>("benchmark.jsonl"),
    leerJsonl<CasoPar>("pares-agrupacion.jsonl"),
    leerJsonl<CasoSustento>("afirmaciones-muestra.jsonl"),
    leerEtiquetas(),
  ]);
  const benchmark: CasoBenchmark[] = casosVisibles(bench, reserva).map((b) => ({
    id: b.id, split: b.split, tipo: b.tipo, consulta: b.consulta, respuesta_esperada: b.respuesta_esperada, sintetico: b.sintetico,
    evidencia: b.ids_evidencia.map((id) => ({ id, titulo: porId.get(id)?.titulo ?? "(no encontrada)", medio: porId.get(id)?.medio ?? "" })),
  }));
  // Las predicciones del sistema NO se envían al navegador: el etiquetado es a ciegas.
  const paresCiegos: CasoPar[] = pares.map((p) => ({ id: p.id, a: p.a, b: p.b }));
  return (
    <>
      {reserva && (
        <p role="status" className="mb-5 rounded-sm bg-parcial-suave px-4 py-3 font-semibold text-parcial">
          Vista de RESERVA (20 consultas para el jurado). Valídalas solo con el sistema ya congelado: estas respuestas no se usan
          para ajustar prompts, umbrales ni reglas.
        </p>
      )}
      <Validador benchmark={benchmark} pares={paresCiegos} sustento={sustento} iniciales={etiquetas} etiquetaBenchmark={reserva ? "Benchmark · reserva" : "Benchmark · desarrollo"} />
    </>
  );
}
