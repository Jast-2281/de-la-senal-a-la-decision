"use client";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Conjunto = "benchmark" | "pares" | "sustento";
type Etiqueta = { valor: string; nota: string; revisor: string; fecha: string };
type Noticia = { id: string; titulo: string; medio: string; fecha: string | null; descripcion: string | null };

export type CasoBenchmark = { id: string; split: string; tipo: string; consulta: string; respuesta_esperada: string; evidencia: { id: string; titulo: string; medio: string; descripcion: string | null }[]; sintetico: boolean };
export type CasoPar = { id: string; a: Noticia; b: Noticia };
export type CasoSustento = { id: string; titulo_evento: string; seccion: string; tipo: string; texto: string; citas: { id_evidencia: string; campo: string; texto_citado: string | null }[] };

const OPCIONES: Record<Conjunto, { valor: string; etiqueta: string; ayuda: string }[]> = {
  benchmark: [
    { valor: "correcta", etiqueta: "Correcta", ayuda: "La respuesta esperada es la adecuada según la evidencia" },
    { valor: "corregir", etiqueta: "Corregir", ayuda: "Escribe en la nota cuál debería ser la respuesta" },
    { valor: "descartar", etiqueta: "Descartar", ayuda: "La consulta no sirve (confusa o mal planteada)" },
  ],
  pares: [
    { valor: "mismo_evento", etiqueta: "Mismo evento", ayuda: "Los dos titulares hablan del mismo hecho" },
    { valor: "distinto_evento", etiqueta: "Distinto evento", ayuda: "Hechos distintos, aunque el tema se parezca" },
    { valor: "no_se", etiqueta: "No sé", ayuda: "No se puede decidir con el titular" },
  ],
  sustento: [
    { valor: "respaldada", etiqueta: "Respaldada", ayuda: "El texto citado dice lo que afirma la frase" },
    { valor: "parcialmente_respaldada", etiqueta: "Parcial", ayuda: "Lo respalda en parte; la frase agrega o exagera algo" },
    { valor: "no_respaldada", etiqueta: "No respaldada", ayuda: "El texto citado no dice eso" },
    { valor: "cita_correcta_alcance_insuficiente", etiqueta: "Alcance insuficiente", ayuda: "La cita es correcta, pero solo un titular no alcanza para afirmarlo" },
  ],
};

const TITULOS: Record<Conjunto, string> = { benchmark: "Benchmark", pares: "Pares de titulares", sustento: "Afirmaciones v2" };
const fecha = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-PA", { timeZone: "America/Panama", day: "numeric", month: "short", year: "numeric" }) : "sin fecha");

export function Validador({
  benchmark, pares, sustento, iniciales, etiquetaBenchmark,
}: {
  etiquetaBenchmark: string;
  benchmark: CasoBenchmark[];
  pares: CasoPar[];
  sustento: CasoSustento[];
  iniciales: Record<Conjunto, Record<string, Etiqueta>>;
}) {
  const [conjunto, setConjunto] = useState<Conjunto>("benchmark");
  const [etiquetas, setEtiquetas] = useState(iniciales);
  const [indice, setIndice] = useState<Record<Conjunto, number>>({ benchmark: 0, pares: 0, sustento: 0 });
  // El nombre del revisor se recuerda en este navegador (conveniencia; las etiquetas se guardan en el servidor).
  const [revisor, setRevisor] = useState(() => {
    try {
      return typeof window === "undefined" ? "" : (localStorage.getItem("revisor-eval") ?? "");
    } catch {
      return "";
    }
  });
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const casos = useMemo(() => ({ benchmark, pares, sustento }), [benchmark, pares, sustento]);
  const lista = casos[conjunto];
  const i = Math.min(indice[conjunto], lista.length - 1);
  const caso = lista[i];
  const actual = caso ? etiquetas[conjunto][caso.id] : undefined;
  const claveNota = caso ? `${conjunto}:${caso.id}` : "";
  const nota = notas[claveNota] ?? actual?.nota ?? "";
  const setNota = (v: string) => setNotas((n) => ({ ...n, [claveNota]: v }));

  const mover = useCallback((d: number) => setIndice((x) => ({ ...x, [conjunto]: Math.max(0, Math.min(lista.length - 1, x[conjunto] + d)) })), [conjunto, lista.length]);
  const siguientePendiente = () => {
    const k = lista.findIndex((c, j) => j > i && !etiquetas[conjunto][c.id]);
    const desdeInicio = lista.findIndex((c) => !etiquetas[conjunto][c.id]);
    setIndice((x) => ({ ...x, [conjunto]: k >= 0 ? k : desdeInicio >= 0 ? desdeInicio : x[conjunto] }));
  };

  const responder = useCallback(async (valor: string) => {
    setError(null);
    if (!revisor.trim()) return setError("Escribe tu nombre arriba (persona revisora) antes de responder.");
    try {
      localStorage.setItem("revisor-eval", revisor);
    } catch {}
    const r = await fetch("/api/eval", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conjunto, id: caso.id, valor, nota, revisor }),
    });
    if (!r.ok) return setError((await r.json()).error ?? "No se pudo guardar.");
    setEtiquetas((e) => ({ ...e, [conjunto]: { ...e[conjunto], [caso.id]: { valor, nota, revisor, fecha: new Date().toISOString() } } }));
    if (valor !== "corregir" || nota.trim()) mover(1);
  }, [revisor, conjunto, caso, nota, mover]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      const n = Number(e.key);
      if (n >= 1 && n <= OPCIONES[conjunto].length) responder(OPCIONES[conjunto][n - 1].valor);
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [conjunto, responder, mover]);

  // Solo cuenta las etiquetas de los casos visibles en esta vista (desarrollo o reserva).
  const hechosVisibles = (c: Conjunto) => casos[c].filter((x) => etiquetas[c][x.id]).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" className="flex flex-wrap overflow-hidden rounded-sm border border-azul">
          {(Object.keys(TITULOS) as Conjunto[]).map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={conjunto === c}
              onClick={() => setConjunto(c)}
              className={`border-r border-azul px-4 py-2 text-sm font-bold last:border-r-0 ${conjunto === c ? "bg-azul text-white" : "bg-superficie text-azul hover:bg-acento-suave"}`}
            >
              {c === "benchmark" ? etiquetaBenchmark : TITULOS[c]} <span className="tabular-nums opacity-80">· {hechosVisibles(c)}/{casos[c].length}</span>
            </button>
          ))}
        </div>
        <input
          value={revisor}
          onChange={(e) => setRevisor(e.target.value)}
          placeholder="Tu nombre (persona revisora)"
          aria-label="Persona revisora"
          suppressHydrationWarning
          className="ml-auto rounded-sm border border-linea bg-superficie px-3 py-2"
        />
      </div>

      <div className="h-2 overflow-hidden rounded-sm bg-linea" aria-label={`Progreso ${hechosVisibles(conjunto)} de ${lista.length}`}>
        <div className="h-full bg-amarillo" style={{ width: `${(hechosVisibles(conjunto) / lista.length) * 100}%` }} />
      </div>

      {caso && (
        <section className="flex flex-col gap-4 rounded-sm border border-linea bg-superficie p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-tinta-3">
            <span className="font-rotulo font-black text-indigo">{caso.id} · {i + 1} de {lista.length}</span>
            {actual && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-suficiente-suave px-2 py-0.5 font-bold text-suficiente">
                <Check aria-hidden size={14} /> Guardado: {actual.valor.replaceAll("_", " ")}
              </span>
            )}
          </div>

          {conjunto === "benchmark" && (() => {
            const c = caso as CasoBenchmark;
            return (
              <>
                <p className="text-sm font-bold uppercase tracking-wide text-azul">
                  {c.tipo.replaceAll("_", " ")} · {c.split}{c.sintetico && " · sintético (adversarial)"}
                </p>
                <h2 className="text-2xl font-extrabold leading-snug">{c.consulta}</h2>
                <div className="rounded-sm bg-papel p-4">
                  <h3 className="font-rotulo text-sm font-black uppercase text-indigo">Respuesta esperada (borrador de Claude)</h3>
                  <p className="mt-1 text-lg">{c.respuesta_esperada}</p>
                </div>
                {c.evidencia.length > 0 && (
                  <div>
                    <h3 className="font-rotulo text-sm font-black uppercase text-indigo">Evidencia del corpus</h3>
                    <ul className="mt-1 flex flex-col gap-1">
                      {c.evidencia.map((e) => (
                        <li key={e.id}>
                          <span className="font-mono text-xs text-tinta-3">{e.id}</span> · {e.titulo} <span className="text-sm text-tinta-3">· {e.medio}</span>
                          {e.descripcion && <p className="mt-0.5 text-sm text-tinta-2">Descripción: {e.descripcion}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            );
          })()}

          {conjunto === "pares" && (() => {
            const c = caso as CasoPar;
            return (
              <>
                <h2 className="text-xl font-extrabold">¿Estos dos titulares hablan del mismo hecho?</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {[c.a, c.b].map((n, k) => (
                    <div key={k} className="flex flex-col gap-1 rounded-sm bg-papel p-4">
                      <span className="font-rotulo text-sm font-black text-indigo">{k === 0 ? "A" : "B"}</span>
                      <p className="text-lg font-bold leading-snug">{n.titulo}</p>
                      <p className="text-sm text-tinta-3">{n.medio} · {fecha(n.fecha)}</p>
                      {n.descripcion && <p className="text-sm text-tinta-2">{n.descripcion}</p>}
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          {conjunto === "sustento" && (() => {
            const c = caso as CasoSustento;
            return (
              <>
                <p className="text-sm text-tinta-3">Tema: {c.titulo_evento} · {c.seccion} · {c.tipo}</p>
                <h2 className="text-xl font-extrabold leading-snug">“{c.texto}”</h2>
                <div className="flex flex-col gap-2">
                  <h3 className="font-rotulo text-sm font-black uppercase text-indigo">¿El texto citado respalda la frase?</h3>
                  {c.citas.map((ct, k) => (
                    <div key={k} className="flex overflow-hidden rounded-sm bg-indigo text-sobre-indigo">
                      <span className="flex shrink-0 items-center bg-amarillo px-2.5 text-[11px] font-extrabold uppercase text-indigo">{ct.campo}</span>
                      <div className="px-3 py-2">
                        <div className="font-mono text-[11px] text-sobre-indigo-2">{ct.id_evidencia}</div>
                        <div className="font-semibold">{ct.texto_citado ?? "Texto no disponible"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={2}
            placeholder={conjunto === "benchmark" ? "Nota (obligatoria si eliges “Corregir”: escribe la respuesta correcta)" : "Nota opcional"}
            className="rounded-sm border border-linea bg-superficie px-3 py-2"
          />

          <div className="flex flex-wrap gap-2">
            {OPCIONES[conjunto].map((o, k) => (
              <button
                key={o.valor}
                onClick={() => responder(o.valor)}
                title={o.ayuda}
                className={`flex flex-col items-start rounded-sm px-4 py-2.5 text-left transition-colors ${actual?.valor === o.valor ? "bg-indigo text-white" : "bg-acento-suave text-azul hover:bg-azul hover:text-white"}`}
              >
                <span className="font-extrabold"><kbd className="mr-1.5 rounded-sm bg-amarillo px-1.5 font-mono text-xs text-indigo">{k + 1}</kbd>{o.etiqueta}</span>
                <span className="text-xs opacity-80">{o.ayuda}</span>
              </button>
            ))}
          </div>
          {error && <p role="alert" className="font-semibold text-insuficiente">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-linea pt-3 text-sm">
            <button onClick={() => mover(-1)} className="inline-flex items-center gap-1 font-bold text-azul hover:underline"><ArrowLeft aria-hidden size={16} /> Anterior</button>
            <button onClick={siguientePendiente} className="rounded-sm bg-amarillo px-3 py-1.5 font-extrabold text-indigo hover:bg-indigo hover:text-white">Ir al siguiente pendiente</button>
            <button onClick={() => mover(1)} className="inline-flex items-center gap-1 font-bold text-azul hover:underline">Siguiente <ArrowRight aria-hidden size={16} /></button>
          </div>
        </section>
      )}
      <p className="text-sm text-tinta-3">Atajos: teclas 1–{OPCIONES[conjunto].length} para responder · flechas ← → para moverte. Todo se guarda al instante en data/eval/etiquetas.json.</p>
    </div>
  );
}
