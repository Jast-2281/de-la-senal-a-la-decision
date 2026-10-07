import { CircleAlert, CircleCheck, CircleDashed } from "lucide-react";
import type { EstadoEvidencia } from "@/lib/priorizar";
import { ETIQUETA_TEMA, type Tema } from "@/lib/organizar";

const EVIDENCIA: Record<EstadoEvidencia, { estilo: string; Icono: typeof CircleAlert; corto: string }> = {
  insuficiente: { estilo: "bg-insuficiente-suave text-insuficiente", Icono: CircleAlert, corto: "Evidencia insuficiente" },
  parcial: { estilo: "bg-parcial-suave text-parcial", Icono: CircleDashed, corto: "Evidencia parcial" },
  "suficiente para el borrador": { estilo: "bg-suficiente-suave text-suficiente", Icono: CircleCheck, corto: "Suficiente para el borrador" },
};

/** Estado de evidencia: texto + icono + color (no depende solo del color). Independiente de la prioridad. */
export function EvidenciaInsignia({ estado, grande = false }: { estado: EstadoEvidencia; grande?: boolean }) {
  const { estilo, Icono, corto } = EVIDENCIA[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm font-bold ${estilo} ${grande ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-xs"}`}>
      <Icono aria-hidden size={grande ? 16 : 13} strokeWidth={2.4} />
      {corto}
    </span>
  );
}

export function TemaInsignia({ tema, sobreIndigo = false }: { tema: Tema; sobreIndigo?: boolean }) {
  return (
    <span className={`text-xs font-extrabold uppercase tracking-wide ${sobreIndigo ? "text-sobre-indigo-2" : "text-azul"}`}>
      {ETIQUETA_TEMA[tema]}
    </span>
  );
}

/** Pestaña de rótulo con el puntaje de atención (ordena el trabajo; no mide veracidad). */
export function PuntajeBarra({ P, rango, grande = false }: { P: number; rango: string; grande?: boolean }) {
  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-center rounded-sm bg-amarillo text-indigo ${grande ? "h-16 w-20" : "h-12 w-16"}`}
      title="Puntaje de atención 0–100: ordena qué revisar primero; no mide veracidad"
    >
      <span className={`font-rotulo font-black leading-none tabular-nums ${grande ? "text-3xl" : "text-xl"}`}>{P.toFixed(0)}</span>
      <span className="text-[10px] font-extrabold uppercase tracking-wider">{rango}</span>
    </div>
  );
}

export function Procedencias({ n, min, replicas, sobreIndigo = false }: { n: number; min: number; replicas: number; sobreIndigo?: boolean }) {
  return (
    <span className="text-sm">
      <strong className="font-rotulo text-base font-black tabular-nums">{n}</strong> procedencia{n === 1 ? "" : "s"} independiente{n === 1 ? "" : "s"}
      {replicas > 0 && (
        <span className={sobreIndigo ? "text-amarillo" : "text-parcial"} title="Titulares casi idénticos en medios distintos: revisar si comparten origen">
          {" "}· {min} si se confirman {replicas} posible{replicas === 1 ? "" : "s"} réplica{replicas === 1 ? "" : "s"}
        </span>
      )}
    </span>
  );
}
