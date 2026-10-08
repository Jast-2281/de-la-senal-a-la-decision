import Link from "next/link";
import { CircleSlash, Search } from "lucide-react";
import { connection } from "next/server";
import { Suspense } from "react";
import { Afirmaciones } from "@/components/afirmaciones";
import { consultar } from "@/lib/consulta";
import { horaPanama } from "@/lib/datos";

const EJEMPLOS = [
  "¿Qué señales hay sobre la mina de cobre?",
  "¿Qué pasa con el desempleo en Panamá?",
  "¿Cuál es la inflación de Panamá en septiembre de 2026?",
  "¿Cuál fue el rating de TVN ayer?",
  "¿Cuántos goles marcó Messi en el Mundial de 1986?",
];

export default function Pagina({ searchParams }: PageProps<"/consulta">) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-7xl px-5 py-10 text-tinta-3">Buscando evidencia…</p>}>
      <Resultado searchParams={searchParams} />
    </Suspense>
  );
}

async function Resultado({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const q = String((await searchParams).q ?? "").trim().slice(0, 300);
  const r = q ? await consultar(q) : null;
  return (
    <>
      <section className="bg-indigo text-sobre-indigo">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 pb-8 pt-8">
          <div className="flex max-w-3xl flex-col gap-2">
            <h1 className="font-rotulo text-4xl font-black uppercase leading-[1.05] tracking-tight">Consultar el corpus</h1>
            <p className="text-lg text-sobre-indigo-2">
              Pregunta en español sobre las noticias de la ventana oficial. El sistema recupera la evidencia localmente y responde con
              una cita por afirmación, o <strong className="text-sobre-indigo">se abstiene</strong> y dice qué información haría falta.
            </p>
          </div>
          <form className="flex flex-col gap-2 sm:flex-row" action="/consulta">
            <label className="relative flex-1">
              <Search aria-hidden size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tinta-3" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Escribe una pregunta…"
                aria-label="Pregunta"
                className="w-full rounded-sm bg-superficie py-3 pl-12 pr-4 text-lg text-tinta placeholder:text-tinta-3"
              />
            </label>
            <button className="rounded-sm bg-amarillo px-6 py-3 font-rotulo text-base font-black uppercase text-indigo hover:bg-white">
              Consultar
            </button>
          </form>
          <div className="flex flex-wrap gap-2 text-sm">
            {EJEMPLOS.map((e) => (
              <Link
                key={e}
                href={`/consulta?q=${encodeURIComponent(e)}`}
                className={`rounded-sm px-3 py-1.5 font-semibold ${e === q ? "bg-amarillo text-indigo" : "bg-indigo-2 text-sobre-indigo-2 hover:bg-azul hover:text-sobre-indigo"}`}
              >
                {e}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {r && (
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-8">
          <div className="flex flex-col gap-4 rounded-sm border border-linea bg-superficie p-5">
            {r.metodo === "palabras_clave" && (
              <p role="status" className="rounded-sm bg-parcial-suave px-4 py-3 font-semibold text-parcial">
                {r.motivo_respaldo === "error_inesperado"
                  ? "La búsqueda semántica falló por un error inesperado (registrado en el servidor). Para no interrumpir, la evidencia se recuperó por coincidencia de palabras clave (menos precisa)."
                  : "Modo sin modelo local: el modelo de embeddings no está disponible en este equipo, así que la evidencia se recuperó por coincidencia de palabras clave (menos precisa). Las consultas pregrabadas y las fichas del snapshot siguen disponibles."}
              </p>
            )}
            {r.abstencion.abstiene ? (
              <div className="flex flex-col gap-2 rounded-sm bg-parcial-suave p-5 text-tinta">
                <h2 className="flex items-center gap-2 font-rotulo text-lg font-black uppercase text-parcial">
                  <CircleSlash aria-hidden size={20} />
                  El sistema se abstiene{r.modo === "abstencion_determinista" && " sin consultar al modelo de lenguaje"}
                </h2>
                <p>{r.abstencion.motivo}</p>
                {r.abstencion.informacion_necesaria.length > 0 && (
                  <>
                    <h3 className="mt-2 font-rotulo text-sm font-black uppercase tracking-wide text-indigo">Información necesaria</h3>
                    <ul className="list-disc pl-5">{r.abstencion.informacion_necesaria.map((x, k) => <li key={k}>{x}</li>)}</ul>
                  </>
                )}
              </div>
            ) : (
              <Afirmaciones titulo="Respuesta" afirmaciones={r.respuesta} evidencia={r.evidencia} problemas={r.problemas} />
            )}
            <p className="text-sm text-tinta-3">
              {r.metodo === "embeddings" ? "Similitud semántica" : "Coincidencia de palabras clave"} máxima {r.max_similitud.toFixed(3)} · umbral de pertinencia {r.meta.umbral}
              {r.meta.modelo && (
                <> · {r.meta.modelo} · {r.meta.desde_cache ? "respuesta recuperada de caché local" : "generada ahora"} · generada {horaPanama(r.meta.generado_en ?? null)} · US$ {r.meta.costo_usd?.toFixed(4)}</>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="font-rotulo text-lg font-black uppercase tracking-tight text-indigo">
              Evidencia recuperada · {r.metodo === "embeddings" ? "búsqueda semántica local" : "palabras clave (respaldo)"}
            </h2>
            <ol className="flex flex-col divide-y divide-linea overflow-hidden rounded-sm border border-linea bg-superficie">
              {r.recuperados.map((x) => {
                const fuera = x.similitud < r.meta.umbral;
                return (
                  <li key={x.id} className={`flex items-baseline gap-3 px-4 py-2.5 ${fuera ? "text-tinta-3" : ""}`}>
                    <span className={`shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-xs tabular-nums ${fuera ? "bg-papel" : "bg-amarillo text-indigo"}`}>
                      {x.similitud.toFixed(3)}
                    </span>
                    <span>
                      {x.id_evento ? <Link href={`/tema/${x.id_evento}`} className="font-semibold hover:underline">{x.titulo}</Link> : x.titulo}
                      <span className="text-sm text-tinta-3"> · {x.medio}</span>
                      {fuera && <span className="text-sm"> · bajo el umbral: no se usa como evidencia</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}
    </>
  );
}
