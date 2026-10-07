import { construirFichas } from "@/lib/fichas";

/** Descarga de fichas.jsonl con el estado de revisión vigente. */
export async function GET() {
  const fichas = await construirFichas();
  return new Response(fichas.map((f) => JSON.stringify(f)).join("\n") + "\n", {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "content-disposition": 'attachment; filename="fichas.jsonl"' },
  });
}
