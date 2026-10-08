import { type Conjunto, OPCIONES, guardarEtiqueta } from "@/lib/etiquetas";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const conjunto = b?.conjunto as Conjunto;
  const valor = String(b?.valor ?? "");
  const revisor = String(b?.revisor ?? "").trim().slice(0, 80);
  if (!(conjunto in OPCIONES) || !(OPCIONES[conjunto] as readonly string[]).includes(valor) || !b?.id || !revisor)
    return Response.json({ error: "Faltan conjunto, id, valor válido o persona revisora." }, { status: 400 });
  if (valor === "corregir" && !String(b?.nota ?? "").trim())
    return Response.json({ error: "Para “corregir”, escribe la respuesta esperada correcta en la nota." }, { status: 400 });
  const todas = await guardarEtiqueta(conjunto, String(b.id), {
    valor, nota: String(b?.nota ?? "").slice(0, 1000), revisor, fecha: new Date().toISOString(),
  });
  return Response.json({ total: Object.keys(todas[conjunto]).length });
}
