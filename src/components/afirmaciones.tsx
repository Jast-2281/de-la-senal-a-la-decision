"use client";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { Afirmacion, Evidencia, Problema } from "@/lib/validar";

const TIPO: Record<Afirmacion["tipo"], { etiqueta: string; estilo: string }> = {
  hecho: { etiqueta: "Hecho", estilo: "bg-suficiente-suave text-suficiente" },
  declaracion: { etiqueta: "Declaración", estilo: "bg-acento-suave text-azul" },
  inferencia: { etiqueta: "Inferencia", estilo: "bg-parcial-suave text-parcial" },
  hipotesis: { etiqueta: "Hipótesis", estilo: "bg-papel text-tinta-2" },
};

const origen = (id: string) => (id.startsWith("BM:") ? "Banco Mundial" : id.startsWith("USGS") ? "USGS" : "Noticia");

/** Afirmaciones con su tipo y citas verificables: cada cita despliega el texto exacto del campo citado. */
export function Afirmaciones({
  titulo, afirmaciones, evidencia, problemas, vacio,
}: {
  titulo: string;
  afirmaciones: Afirmacion[];
  evidencia: Evidencia;
  problemas: Problema[];
  vacio?: string;
}) {
  const [abierta, setAbierta] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="font-rotulo text-sm font-black uppercase tracking-wide text-indigo">{titulo}</h3>
      {afirmaciones.length === 0 && <p className="rounded-sm bg-papel px-3 py-2.5 text-tinta-2">{vacio ?? "Sin contenido."}</p>}
      <ol className="flex flex-col gap-2">
        {afirmaciones.map((a, i) => {
          const errores = problemas.filter((p) => p.indice === i);
          return (
            <li key={i} className={`rounded-sm px-3 py-2.5 ${errores.length ? "bg-insuficiente-suave ring-1 ring-insuficiente/40" : "bg-papel"}`}>
              <div className="flex items-start gap-2.5">
                <span className={`mt-0.5 shrink-0 rounded-sm px-1.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${TIPO[a.tipo].estilo}`}>
                  {TIPO[a.tipo].etiqueta}
                </span>
                <p className="leading-relaxed">
                  {a.texto}
                  {a.citas.map((c, k) => {
                    const clave = `${i}-${k}`;
                    const activa = abierta === clave;
                    return (
                      <button
                        key={k}
                        onClick={() => setAbierta(activa ? null : clave)}
                        aria-expanded={activa}
                        className={`ml-1.5 rounded-sm px-1 align-baseline text-[11px] font-extrabold transition-colors ${activa ? "bg-amarillo text-indigo" : "bg-acento-suave text-azul hover:bg-amarillo hover:text-indigo"}`}
                        title={`${c.id_evidencia} · ${c.campo}`}
                      >
                        {origen(c.id_evidencia)} · {c.campo}
                      </button>
                    );
                  })}
                  {a.citas.length === 0 && (a.tipo === "inferencia" || a.tipo === "hipotesis") && (
                    <span className="ml-1.5 text-xs text-tinta-3">(sin cita: {TIPO[a.tipo].etiqueta.toLowerCase()} del sistema)</span>
                  )}
                </p>
              </div>
              {a.citas.map((c, k) =>
                abierta === `${i}-${k}` ? (
                  <div key={k} className="rotulo-sube mt-2.5 flex overflow-hidden rounded-sm bg-indigo text-sobre-indigo">
                    <span className="flex shrink-0 items-center bg-amarillo px-2.5 text-[11px] font-extrabold uppercase tracking-wide text-indigo">
                      {origen(c.id_evidencia)}
                    </span>
                    <div className="px-3 py-2">
                      <div className="font-mono text-[11px] text-sobre-indigo-2">{c.id_evidencia} → {c.campo}</div>
                      <div className="font-semibold">{evidencia[c.id_evidencia]?.[c.campo] ?? <em className="text-amarillo">Evidencia no encontrada</em>}</div>
                    </div>
                  </div>
                ) : null,
              )}
              {errores.map((p, k) => (
                <p key={k} className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-insuficiente">
                  <TriangleAlert aria-hidden size={14} /> {p.problema}
                </p>
              ))}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
