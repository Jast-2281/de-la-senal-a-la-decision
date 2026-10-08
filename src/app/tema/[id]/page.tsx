import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Afirmaciones } from "@/components/afirmaciones";
import { EvidenciaInsignia, Procedencias, PuntajeBarra, TemaInsignia } from "@/components/insignias";
import { Revision } from "@/components/revision";
import { horaPanama, leerCola, leerRevisiones } from "@/lib/datos";
import { entradaDeEvento } from "@/lib/evidencia";
import { leerPaqueteCacheado } from "@/lib/generar";
import { PESOS } from "@/lib/priorizar";

const NOMBRE_COMPONENTE: Record<string, string> = { R: "Relevancia", I: "Impacto potencial", U: "Urgencia", N: "Novedad", E: "Evidencia disponible" };
// Nombres en español de los indicadores del Banco Mundial (la API los devuelve en inglés).
const INDICADOR_ES: Record<string, string> = {
  "NY.GDP.MKTP.KD.ZG": "Crecimiento del PIB (% anual)",
  "FP.CPI.TOTL.ZG": "Inflación, precios al consumidor (% anual)",
  "SL.UEM.TOTL.ZS": "Desempleo, total (% de la fuerza laboral; estimación modelada OIT)",
  "SP.POP.TOTL": "Población total",
  "IT.NET.USER.ZS": "Personas que usan internet (% de la población)",
  "NE.EXP.GNFS.ZS": "Exportaciones de bienes y servicios (% del PIB)",
};
const MOTIVO: Record<string, string> = { mismo_medio: "mismo medio", agencia_explicita: "misma agencia citada" };

export default function Pagina({ params }: PageProps<"/tema/[id]">) {
  return (
    <Suspense fallback={<p className="text-tinta-3">Cargando la ficha…</p>}>
      <Ficha params={params} />
    </Suspense>
  );
}

function Seccion({ titulo, children, oscuro = false }: { titulo: string; children: React.ReactNode; oscuro?: boolean }) {
  return (
    <section className={`flex flex-col gap-3 rounded-sm p-5 ${oscuro ? "bg-indigo text-sobre-indigo" : "border border-linea bg-superficie"}`}>
      <h2 className={`font-rotulo text-lg font-black uppercase tracking-tight ${oscuro ? "text-amarillo" : "text-indigo"}`}>{titulo}</h2>
      {children}
    </section>
  );
}

async function Ficha({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [cola, revisiones] = await Promise.all([leerCola(), leerRevisiones()]);
  const posicion = cola.eventos.findIndex((x) => x.id_evento === id);
  if (posicion < 0) notFound();
  const e = cola.eventos[posicion];
  const entrada = entradaDeEvento(e);
  const borrador = await leerPaqueteCacheado(entrada);
  const replicas = new Set(e.posibles_replicas.flatMap((p) => p.ids));
  const porId = new Map(e.noticias.map((n) => [n.id_noticia, n]));

  return (
    <div className="flex flex-col">
      <header className="bg-indigo text-sobre-indigo">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 pb-8 pt-5">
          <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-sobre-indigo-2 hover:text-sobre-indigo">
            <ArrowLeft aria-hidden size={16} /> Volver a la agenda
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
            <PuntajeBarra P={e.puntaje.P} rango={e.puntaje.rango} grande />
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-rotulo text-sm font-black text-amarillo">#{posicion + 1} en la escaleta</span>
                <TemaInsignia tema={e.tema} sobreIndigo />
                <EvidenciaInsignia estado={e.evidencia.estado} grande />
              </div>
              <h1 className="text-2xl font-extrabold leading-tight text-balance break-words sm:text-3xl md:text-4xl">{e.titulo}</h1>
              <Procedencias n={e.procedencias_independientes} min={e.procedencias_si_se_confirman_replicas} replicas={e.posibles_replicas.length} sobreIndigo />
            </div>
          </div>
          <div className="flex flex-col gap-1 rounded-sm bg-amarillo px-5 py-4 text-indigo">
            <h2 className="font-rotulo text-sm font-black uppercase tracking-wide">Acción recomendada: {e.accion}</h2>
            <p className="text-sm font-semibold">
              Motivo del estado de evidencia: {e.evidencia.motivo}. {e.alcance === "basado únicamente en titular/metadatos" && "Basado únicamente en titular/metadatos."}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-8">
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Seccion titulo="Qué se reporta y quién lo reporta">
          <p className="text-sm text-tinta-2">
            {e.n_registros} registro{e.n_registros === 1 ? "" : "s"} agrupado{e.n_registros === 1 ? "" : "s"} en {e.procedencias_independientes} procedencia{e.procedencias_independientes === 1 ? "" : "s"} independiente{e.procedencias_independientes === 1 ? "" : "s"}. Repetir no es corroborar.
          </p>
          <ol className="flex flex-col gap-3">
            {e.grupos_procedencia.map((g, k) => (
              <li key={k} className="rounded-sm bg-papel p-3">
                <p className="mb-2 text-xs text-tinta-3">
                  Procedencia {k + 1}: {g.medios.join(", ")}
                  {g.motivos.length > 0 && ` · agrupadas por ${g.motivos.map((m) => MOTIVO[m] ?? m).join(" y ")}`}
                  {g.agencia && ` · agencia: ${g.agencia.toUpperCase()}`}
                </p>
                <ul className="flex flex-col gap-2">
                  {g.ids.map((nid) => {
                    const n = porId.get(nid)!;
                    return (
                      <li key={nid} className="text-sm">
                        <a href={n.url} target="_blank" rel="noreferrer" className="font-bold leading-snug hover:underline">{n.titulo}</a>
                        {replicas.has(nid) && <span className="ml-2 rounded-sm bg-parcial-suave px-1.5 py-0.5 text-[11px] font-extrabold text-parcial">posible réplica: revisar origen</span>}
                        <div className="text-xs text-tinta-3">
                          {n.medio} · {n.fecha_publicacion ? `publicada ${horaPanama(n.fecha_publicacion)}` : `detectada ${horaPanama(n.fecha_deteccion)} · fecha de publicación desconocida`} · {n.alcance_texto === "titular" ? "solo titular" : "titular + descripción"} · <span className="font-mono">{nid}</span>
                        </div>
                        {n.descripcion && <p className="mt-1 text-xs text-tinta-2">{n.descripcion}</p>}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </Seccion>

        <div className="flex flex-col gap-5">
          <Seccion titulo="Qué está respaldado por datos oficiales">
            {e.indicadores.length === 0 && !e.sismo && (
              <p className="text-sm text-tinta-2">No hay indicador ni evento oficial relacionado de forma sustentada. No se fuerza una relación.</p>
            )}
            {e.indicadores.map((i) => (
              <div key={i.id_evidencia} className="rounded-sm bg-papel p-3 text-sm">
                <p className="font-bold">{INDICADOR_ES[i.indicador_id] ?? i.indicador_nombre} · Banco Mundial</p>
                <p className="mt-1 font-rotulo text-3xl font-black tabular-nums text-indigo">{i.valor.toLocaleString("es-PA", { maximumFractionDigits: 2 })} <span className="text-sm font-normal text-tinta-2">{i.unidad} · {i.pais_iso3} · año {i.anio}</span></p>
                <p className="mt-1 text-xs text-parcial">{i.limitacion}</p>
                <p className="mt-2 text-xs text-tinta-3">Comparación {i.anio}: {i.comparacion.map((c) => `${c.pais_iso3} ${c.valor === null ? "sin dato" : c.valor.toLocaleString("es-PA", { maximumFractionDigits: 1 })}`).join(" · ")}</p>
                <p className="mt-1 font-mono text-[11px] text-tinta-3">{i.id_evidencia} · motivo del enlace: {i.motivo}</p>
              </div>
            ))}
            {e.sismo && (
              <div className="rounded-sm bg-papel p-3 text-sm">
                <p className="font-medium">Catálogo sísmico USGS</p>
                {e.sismo.sismos.map((s) => (
                  <p key={s.id}><a href={s.url} className="text-acento hover:underline">M{s.magnitude} · {s.place}</a> · {horaPanama(s.time)}</p>
                ))}
                <p className="mt-1 text-xs text-parcial">{e.sismo.limitacion}</p>
              </div>
            )}
          </Seccion>

          <Seccion titulo="Qué falta comprobar">
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
              {e.vacios.map((v, k) => <li key={k}>{v}</li>)}
            </ul>
            {e.contradicciones.map((c, k) => (
              <div key={k} className="rounded-sm bg-insuficiente-suave p-3 text-sm">
                <p className="font-bold text-insuficiente">Cifras distintas sobre “{c.sustantivo}”: verificar si se refieren al mismo hecho, a otro período o a una actualización</p>
                {c.versiones.map((v) => <p key={v.valor}>{v.valor}: {v.ids.map((x) => porId.get(x)?.medio).join(", ")}</p>)}
              </div>
            ))}
          </Seccion>

          <Seccion titulo="Por qué está en esta posición">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-tinta-3">
                <tr><th className="py-1">Componente</th><th>Valor 0–1</th><th>Peso</th><th>Aporte</th></tr>
              </thead>
              <tbody>
                {(Object.keys(PESOS) as (keyof typeof PESOS)[]).map((k) => {
                  const c = e.puntaje.componentes[k];
                  return (
                    <tr key={k} className="border-t border-linea align-top">
                      <td className="py-1.5">{NOMBRE_COMPONENTE[k]}<div className="text-xs text-tinta-3">{c.criterio}</div></td>
                      <td className="tabular-nums">{c.valor.toFixed(2)}</td>
                      <td className="tabular-nums">{PESOS[k]}</td>
                      <td className="tabular-nums">{(PESOS[k] * c.valor).toFixed(1)}</td>
                    </tr>
                  );
                })}
                <tr className="border-t border-tinta font-semibold"><td className="py-1.5">P ({e.puntaje.version})</td><td /><td /><td className="tabular-nums">{e.puntaje.P.toFixed(1)}</td></tr>
              </tbody>
            </table>
            <p className="text-xs text-tinta-3">Herramienta de ordenamiento: no es probabilidad de verdad. Empates: mayor urgencia y luego ID.</p>
          </Seccion>
        </div>
      </div>

      <Seccion titulo={entrada.solo_investigacion ? "Brief de investigación (borrador)" : "Paquete editorial (borrador)"}>
        {!borrador && (
          <p className="text-sm text-tinta-2">
            No hay borrador en caché local para esta evidencia. Se genera en modo desarrollo con <code className="font-mono">npm run generar -- {e.id_evento}</code>; la demo no depende de conexión.
          </p>
        )}
        {borrador && (
          <>
            <p className="text-xs text-tinta-3">
              Generado el {horaPanama(borrador.meta.generado_en)} con {borrador.meta.modelo} · prompt {borrador.meta.prompt_version} · {borrador.meta.desde_cache ? "recuperado de caché local (sin conexión)" : "generado ahora"} ·{" "}
              {borrador.meta.tokens.entrada + borrador.meta.tokens.cache_lectura}+{borrador.meta.tokens.salida} tokens · US$ {borrador.meta.costo_usd?.toFixed(4)} · {(borrador.meta.latencia_ms / 1000).toFixed(1)} s en su generación
            </p>
            <div className={`rounded-sm p-3 text-sm ${borrador.validacion.valido ? "bg-suficiente-suave" : "bg-insuficiente-suave"}`}>
              <strong>Validador automático:</strong>{" "}
              {borrador.validacion.valido ? "toda afirmación factual cita evidencia existente y sus cifras aparecen en ella." : "hay problemas bloqueantes; no se puede aprobar sin corregir."}{" "}
              <span className="text-tinta-2">La pertinencia de cada cita la confirma la persona revisora.</span>
              {borrador.validacion.problemas.filter((p) => p.indice < 0).map((p, k) => (
                <p key={k} className={`flex items-center gap-1.5 font-semibold ${p.severidad === "advertencia" ? "text-parcial" : "text-insuficiente"}`}><TriangleAlert aria-hidden size={14} /> {p.problema}</p>
              ))}
            </div>
            {borrador.paquete.abstencion.abstiene ? (
              <div className="rounded-sm bg-papel p-4">
                <p className="font-medium">El sistema se abstiene de redactar</p>
                <p className="mt-1 text-sm">{borrador.paquete.abstencion.motivo}</p>
                <h3 className="mt-3 font-rotulo text-sm font-black uppercase tracking-wide text-indigo">Información necesaria</h3>
                <ul className="list-disc pl-5 text-sm">{borrador.paquete.abstencion.informacion_necesaria.map((x, k) => <li key={k}>{x}</li>)}</ul>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="font-rotulo text-sm font-black uppercase tracking-wide text-indigo">Título propuesto</h3>
                  <p className="text-2xl font-extrabold leading-snug text-balance">{borrador.paquete.titulo_propuesto}</p>
                  <p className="mt-1 text-sm text-tinta-2"><strong>Enfoque de interés público:</strong> {borrador.paquete.enfoque_interes_publico}</p>
                </div>
                <Afirmaciones titulo={`Brief (${borrador.validacion.palabras.brief} palabras · máx. 250)`} afirmaciones={borrador.paquete.brief} evidencia={entrada.evidencia} problemas={borrador.validacion.problemas.filter((p) => p.seccion === "brief")} />
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <h3 className="font-rotulo text-sm font-black uppercase tracking-wide text-indigo">3 preguntas de investigación</h3>
                    <ol className="mt-2 list-decimal pl-5 text-sm">{borrador.paquete.preguntas_investigacion.map((x, k) => <li key={k} className="mb-1">{x}</li>)}</ol>
                  </div>
                  <div>
                    <h3 className="font-rotulo text-sm font-black uppercase tracking-wide text-indigo">Verificaciones pendientes</h3>
                    <ul className="mt-2 list-disc pl-5 text-sm">{borrador.paquete.verificaciones_pendientes.map((x, k) => <li key={k} className="mb-1">{x}</li>)}</ul>
                  </div>
                </div>
                {borrador.paquete.contradicciones.length > 0 && (
                  <Afirmaciones titulo="Contradicciones" afirmaciones={borrador.paquete.contradicciones.flatMap((c) => c.versiones)} evidencia={entrada.evidencia} problemas={[]} />
                )}
                <div className="grid gap-5 md:grid-cols-2">
                  <Afirmaciones titulo={`Guion 45–60 s (${borrador.validacion.palabras.guion} palabras)`} afirmaciones={borrador.paquete.guion} evidencia={entrada.evidencia} problemas={borrador.validacion.problemas.filter((p) => p.seccion === "guion" && p.indice >= 0)} vacio="Bloqueado: con evidencia insuficiente no se preparan piezas para emisión hasta verificar." />
                  <Afirmaciones titulo={`Copy digital (${borrador.validacion.palabras.copy_digital} palabras · máx. 80)`} afirmaciones={borrador.paquete.copy_digital} evidencia={entrada.evidencia} problemas={borrador.validacion.problemas.filter((p) => p.seccion === "copy_digital" && p.indice >= 0)} vacio="Bloqueado: con evidencia insuficiente no se preparan piezas para emisión hasta verificar." />
                </div>
              </div>
            )}
          </>
        )}
      </Seccion>

      <Seccion titulo="Revisión humana">
        <Revision idEvento={e.id_evento} historial={revisiones[e.id_evento] ?? []} hayBorrador={!!borrador} />
      </Seccion>
      </div>
    </div>
  );
}
