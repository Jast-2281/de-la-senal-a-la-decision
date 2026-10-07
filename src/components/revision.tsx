"use client";
import { useState } from "react";
import type { Revision as R } from "@/lib/datos";

const ESTADOS = ["nuevo", "en revisión", "requiere evidencia", "aprobado como borrador", "descartado"] as const;

/** Control humano (pág. 8): el sistema nunca publica. Aprobar un borrador NO significa publicarlo. */
export function Revision({ idEvento, historial: inicial, hayBorrador }: { idEvento: string; historial: R[]; hayBorrador: boolean }) {
  const [historial, setHistorial] = useState(inicial);
  const [revisor, setRevisor] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);
  const actual = historial.at(-1)?.estado ?? "nuevo";

  async function registrar(estado: (typeof ESTADOS)[number]) {
    setError(null);
    if (!revisor.trim()) return setError("Indica el nombre de la persona responsable.");
    if (estado === "aprobado como borrador" && !hayBorrador) return setError("No hay borrador que aprobar.");
    const r = await fetch("/api/revision", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id_evento: idEvento, estado, revisor, nota }),
    });
    if (!r.ok) return setError((await r.json()).error ?? "No se pudo registrar la revisión.");
    setHistorial((await r.json()).historial);
    setNota("");
  }

  return (
    <div className="flex flex-col gap-3">
      <p>
        Estado actual: <strong className="rounded-sm bg-indigo px-2 py-0.5 text-sm text-white">{actual}</strong>
        <span className="text-tinta-2"> · Aprobar un borrador no lo publica: la decisión editorial final es humana.</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <input value={revisor} onChange={(e) => setRevisor(e.target.value)} placeholder="Persona responsable" className="rounded-sm border border-linea bg-superficie px-3 py-2 placeholder:text-tinta-3" />
        <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Corrección o motivo (opcional)" className="min-w-64 flex-1 rounded-sm border border-linea bg-superficie px-3 py-2 placeholder:text-tinta-3" />
      </div>
      <div className="flex flex-wrap gap-2">
        {ESTADOS.filter((e) => e !== "nuevo").map((e) => (
          <button
            key={e}
            onClick={() => registrar(e)}
            className={`rounded-sm px-4 py-2 text-sm font-extrabold transition-colors ${e === "descartado" ? "bg-insuficiente-suave text-insuficiente hover:bg-insuficiente hover:text-white" : e === "aprobado como borrador" ? "bg-suficiente text-white hover:bg-indigo" : "bg-acento-suave text-azul hover:bg-azul hover:text-white"}`}
          >
            {e}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="font-semibold text-insuficiente">{error}</p>}
      {historial.length > 0 && (
        <ol className="flex flex-col gap-1 border-t border-linea pt-3 text-sm text-tinta-2">
          {historial.map((h, i) => (
            <li key={i}>
              {new Date(h.fecha).toLocaleString("es-PA", { timeZone: "America/Panama" })} · <strong>{h.estado}</strong> · {h.revisor}
              {h.nota && <> — {h.nota}</>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
