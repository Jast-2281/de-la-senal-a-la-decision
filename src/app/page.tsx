import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ColaInteractiva, type FilaCola } from "@/components/cola-interactiva";
import { EvidenciaInsignia, Procedencias, PuntajeBarra, TemaInsignia } from "@/components/insignias";
import { estadoActual, horaPanama, leerCalidad, leerCola, leerRevisiones } from "@/lib/datos";
import { entradaDeEvento } from "@/lib/evidencia";
import { leerPaqueteCacheado } from "@/lib/generar";

export default function Pagina() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-7xl px-5 py-10 text-tinta-3">Cargando la agenda…</p>}>
      <Cola />
    </Suspense>
  );
}

const fechaCorta = new Intl.DateTimeFormat("es-PA", { timeZone: "America/Panama", day: "numeric", month: "long", year: "numeric" });

// Se lee en cada solicitud: las revisiones humanas cambian durante la sesión.
async function Cola() {
  await connection();
  const [cola, calidad, revisiones] = await Promise.all([leerCola(), leerCalidad(), leerRevisiones()]);
  const borradores = await Promise.all(cola.eventos.map((e) => leerPaqueteCacheado(entradaDeEvento(e)).then(Boolean)));

  const filas: FilaCola[] = cola.eventos.map((e, i) => ({
    id_evento: e.id_evento,
    posicion: i + 1,
    titulo: e.titulo,
    tema: e.tema,
    P: e.puntaje.P,
    rango: e.puntaje.rango,
    evidencia: e.evidencia.estado,
    procedencias: e.procedencias_independientes,
    procedencias_min: e.procedencias_si_se_confirman_replicas,
    replicas: e.posibles_replicas.length,
    n_registros: e.n_registros,
    medios: e.medios,
    ultima: horaPanama(e.ultima_fecha).replace(" (hora de Panamá)", ""),
    accion: e.accion,
    revision: estadoActual(revisiones[e.id_evento]),
    vacio_principal: e.vacios[0] ?? null,
    tiene_borrador: borradores[i],
    textos: e.noticias.map((n) => n.titulo).join(" "),
  }));
  const agenda = filas.filter((f) => f.tema !== "otros").slice(0, 5);
  // El corte es el inicio del día siguiente al último día de la ventana: se muestra el último día incluido.
  const ultimoDia = fechaCorta.format(new Date(new Date(cola.generado_desde.fecha_corte_UTC).getTime() - 1));
  const n = calidad.noticias;

  return (
    <>
      <section className="bg-indigo text-sobre-indigo">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 pb-10 pt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex max-w-3xl flex-col gap-2">
              <h1 className="font-rotulo text-3xl font-black uppercase leading-[1.05] tracking-tight break-words sm:text-4xl md:text-5xl">
                Agenda de investigación
              </h1>
              <p className="text-lg text-sobre-indigo-2">
                Los cinco temas que más atención merecen al cierre del {ultimoDia}. La prioridad ordena el trabajo;{" "}
                <strong className="text-sobre-indigo">no indica que algo sea cierto ni habilita su publicación.</strong>
              </p>
            </div>
            <p className="text-sm text-sobre-indigo-2">
              {n.validas} noticias · {cola.eventos.length} eventos · {n.por_origen.tvn_rss + n.por_origen.tvn_sitemap} de TVN
            </p>
          </div>

          <ol className="flex flex-col gap-2">
            {agenda.map((f) => (
              <li key={f.id_evento}>
                <Link
                  href={`/tema/${f.id_evento}`}
                  className="group grid grid-cols-[auto_minmax(0,1fr)] items-stretch gap-0 overflow-hidden rounded-sm bg-indigo-2 transition-colors hover:bg-azul md:grid-cols-[auto_minmax(0,1fr)_auto]"
                >
                  <PuntajeBarra P={f.P} rango={f.rango} grande />
                  <div className="flex min-w-0 flex-col justify-center gap-1 px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-rotulo text-sm font-black text-amarillo">#{f.posicion}</span>
                      <TemaInsignia tema={f.tema} sobreIndigo />
                      <EvidenciaInsignia estado={f.evidencia} />
                    </div>
                    <h2 className="text-lg font-bold leading-snug text-balance break-words group-hover:underline sm:text-xl">{f.titulo}</h2>
                  </div>
                  <div className="col-span-2 flex flex-col justify-center gap-0.5 border-t border-indigo px-5 py-3 text-sobre-indigo-2 md:col-span-1 md:w-80 md:border-l md:border-t-0">
                    <Procedencias n={f.procedencias} min={f.procedencias_min} replicas={f.replicas} sobreIndigo />
                    <span className="text-sm">{f.accion}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-rotulo text-2xl font-black uppercase tracking-tight text-indigo">Escaleta completa</h2>
          <p className="max-w-3xl text-sm text-tinta-3">
            Reglas {cola.reglas.puntaje} · {String(cola.reglas.organizar.reglas_tema)} · {String(cola.reglas.organizar.modelo_embeddings)} ·
            P = 30·Relevancia + 25·Impacto + 20·Urgencia + 15·Novedad + 10·Evidencia · Calidad: {n.con_error} con error, {n.duplicadas_por_url} duplicadas,{" "}
            {n.fuera_de_ventana ?? 0} fuera de la ventana, {n.sin_fecha_publicacion} sin fecha de publicación (GDELT: solo detección) · {cola.generado_desde.aviso}
          </p>
        </div>
        <ColaInteractiva filas={filas} />
      </section>
    </>
  );
}
