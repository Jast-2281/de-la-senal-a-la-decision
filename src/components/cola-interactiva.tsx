"use client";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { EstadoEvidencia } from "@/lib/priorizar";
import { ETIQUETA_TEMA, type Tema } from "@/lib/organizar";
import { EvidenciaInsignia, PuntajeBarra, Procedencias, TemaInsignia } from "./insignias";

export type FilaCola = {
  id_evento: string;
  posicion: number;
  titulo: string;
  tema: Tema;
  P: number;
  rango: string;
  evidencia: EstadoEvidencia;
  procedencias: number;
  procedencias_min: number;
  replicas: number;
  n_registros: number;
  medios: string[];
  ultima: string;
  accion: string;
  revision: string;
  vacio_principal: string | null;
  tiene_borrador: boolean;
  textos: string; // titulares del evento, para la búsqueda
};

const FILTROS: { id: string; etiqueta: string; f: (x: FilaCola) => boolean }[] = [
  { id: "todos", etiqueta: "Todos", f: () => true },
  { id: "investigar", etiqueta: "Para investigar", f: (x) => x.evidencia === "insuficiente" },
  { id: "verificar", etiqueta: "Para verificar", f: (x) => x.evidencia === "parcial" },
  { id: "borrador", etiqueta: "Listos para borrador", f: (x) => x.evidencia === "suficiente para el borrador" },
];

const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ColaInteractiva({ filas }: { filas: FilaCola[] }) {
  const [filtro, setFiltro] = useState("todos");
  const [tema, setTema] = useState<Tema | "todos">("todos");
  const [q, setQ] = useState("");
  const [soloModalidad, setSoloModalidad] = useState(true);

  const visibles = useMemo(() => {
    const f = FILTROS.find((x) => x.id === filtro)!.f;
    const qs = sinTildes(q.trim());
    return filas.filter(
      (x) =>
        f(x) &&
        (tema === "todos" || x.tema === tema) &&
        (!soloModalidad || x.tema !== "otros") &&
        (!qs || sinTildes(x.textos).includes(qs)),
    );
  }, [filas, filtro, tema, q, soloModalidad]);

  const conteo = (id: string) => filas.filter((x) => FILTROS.find((f) => f.id === id)!.f(x) && (!soloModalidad || x.tema !== "otros")).length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Filtrar por estado de evidencia" className="flex max-w-full flex-wrap overflow-hidden rounded-sm border border-azul">
          {FILTROS.map((x) => (
            <button
              key={x.id}
              onClick={() => setFiltro(x.id)}
              aria-pressed={filtro === x.id}
              className={`grow border-r border-azul px-3 py-1.5 text-sm font-bold last:border-r-0 ${filtro === x.id ? "bg-azul text-white" : "bg-superficie text-azul hover:bg-acento-suave"}`}
            >
              {x.etiqueta} <span className="tabular-nums opacity-75">{conteo(x.id)}</span>
            </button>
          ))}
        </div>
        <select
          value={tema}
          onChange={(e) => setTema(e.target.value as Tema | "todos")}
          className="rounded-sm border border-linea bg-superficie px-2 py-1.5 text-sm font-semibold"
          aria-label="Filtrar por tema"
        >
          <option value="todos">Todos los temas</option>
          {(Object.keys(ETIQUETA_TEMA) as Tema[]).map((t) => (
            <option key={t} value={t}>{ETIQUETA_TEMA[t]}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm font-semibold text-tinta-2">
          <input type="checkbox" checked={soloModalidad} onChange={(e) => setSoloModalidad(e.target.checked)} className="size-4 accent-azul" />
          Solo temas de la modalidad
        </label>
        <label className="relative ml-auto w-full sm:w-80">
          <Search aria-hidden size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tinta-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar en titulares (empleo, Canal, CSS…)"
            aria-label="Buscar en titulares"
            className="w-full rounded-sm border border-linea bg-superficie py-1.5 pl-9 pr-3 text-sm placeholder:text-tinta-3"
          />
        </label>
      </div>

      <ol className="flex flex-col divide-y divide-linea overflow-hidden rounded-sm border border-linea bg-superficie">
        {visibles.length === 0 && <li className="p-6 text-tinta-3">Ningún tema coincide con los filtros.</li>}
        {visibles.map((x) => (
          <li key={x.id_evento}>
            <Link
              href={`/tema/${x.id_evento}`}
              className="grid grid-cols-[4rem_1fr] items-start gap-x-4 gap-y-2 px-4 py-3.5 sm:grid-cols-[2.5rem_4rem_1fr] hover:bg-acento-suave lg:grid-cols-[2.5rem_4rem_1fr_20rem]"
            >
              <span className="hidden pt-3 font-rotulo text-base font-black tabular-nums text-tinta-3 sm:block">{x.posicion}</span>
              <PuntajeBarra P={x.P} rango={x.rango} />
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <TemaInsignia tema={x.tema} />
                  <EvidenciaInsignia estado={x.evidencia} />
                  {x.tiene_borrador && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-azul">
                      <FileText aria-hidden size={13} /> Borrador listo
                    </span>
                  )}
                  {x.revision !== "nuevo" && <span className="rounded-sm bg-indigo px-1.5 py-0.5 text-xs font-bold text-white">{x.revision}</span>}
                </div>
                <h3 className="text-[1.05rem] font-bold leading-snug text-balance">{x.titulo}</h3>
                <p className="text-sm text-tinta-3">
                  {x.n_registros} registro{x.n_registros === 1 ? "" : "s"} · {x.medios.join(", ")} · última señal {x.ultima}
                </p>
                {x.vacio_principal && <p className="text-sm text-tinta-2">Falta: {x.vacio_principal}</p>}
              </div>
              <div className="col-span-2 flex flex-col gap-1 border-t border-linea pt-2 sm:col-span-3 lg:col-span-1 lg:border-0 lg:pt-0">
                <Procedencias n={x.procedencias} min={x.procedencias_min} replicas={x.replicas} />
                <span className="text-sm text-tinta-2">{x.accion}</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
