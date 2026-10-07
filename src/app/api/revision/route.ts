import { ESTADOS_REVISION, type EstadoRevision, agregarRevision, leerCola } from "@/lib/datos";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const estado = b?.estado as EstadoRevision;
  const revisor = String(b?.revisor ?? "").trim().slice(0, 80);
  if (!b?.id_evento || !ESTADOS_REVISION.includes(estado) || !revisor)
    return Response.json({ error: "Faltan id_evento, estado válido o persona responsable." }, { status: 400 });
  const cola = await leerCola();
  if (!cola.eventos.some((e) => e.id_evento === b.id_evento)) return Response.json({ error: "Evento inexistente." }, { status: 404 });
  const historial = await agregarRevision(b.id_evento, {
    estado, revisor, nota: String(b?.nota ?? "").slice(0, 500), fecha: new Date().toISOString(),
  });
  return Response.json({ historial });
}
