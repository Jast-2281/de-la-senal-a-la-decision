// Genera las 8 páginas obligatorias de Notion (sección 5 del pliego) en Markdown, a partir de los artefactos reales
// del repositorio (manifest, fichas, métricas, matriz, historial de git). Notion convierte el Markdown al pegarlo.
//   npm run notion   → docs/notion/01-inicio.md … 08-presentacion.md
import { execSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const leer = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const leerJsonl = async (p: string) => (await readFile(p, "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l));
const fmt = (n: number | null | undefined, d = 3) => (n === null || n === undefined ? "n/d" : n.toFixed(d));

async function main() {
  const manifest = await leer("data/processed/manifest.json");
  const calidad = await leer("data/processed/calidad.json");
  const fuentes = await leer("data/processed/fuentes.json");
  const fichas = await leerJsonl("data/processed/fichas.jsonl");
  const res = await leer("data/eval/resultados.json");
  const matriz = await readFile("docs/matriz-aceptacion.md", "utf8");
  const commits = execSync('git log --reverse --format="%ad|%h|%s" --date=format:"%d/%m %H:%M"').toString().trim().split("\n");
  const n = calidad.noticias;
  const out = join("docs", "notion");
  await mkdir(out, { recursive: true });

  const paginas: Record<string, string> = {};

  paginas["01-inicio-del-reto.md"] = `# Inicio del reto · De la señal a la decisión

**Equipo Arijuma:** Julian Taylor (construcción, datos, evaluación y revisión humana) · Maria Alexandra Plata · Pitch: ambos
**Modalidad:** TVN · editorial (principal + digital). Banca: fuera de alcance, mencionada solo como extensión del mismo núcleo.
**Prototipo:** Next.js, demo sin conexión · **Repositorio:** https://github.com/Jast-2281/de-la-senal-a-la-decision

## Problema
Un equipo editorial revisa fuentes dispersas, donde la circulación de una noticia no equivale a su confirmación: varios medios repiten un mismo origen. Hace falta decidir rápido qué investigar, con qué evidencia y qué falta comprobar.

## Usuario
Editor/a o periodista de la mesa de TVN durante su turno.

## Alcance
Las 7 etapas del pliego (cargar → organizar → contextualizar → priorizar → explicar → producir → revisar), las consultas en español y la exportación \`fichas.jsonl\`.
**Fuera de alcance:** publicar, detectar noticias falsas, audiencia/rating, datos personales y producción audiovisual.

## Criterios de éxito
- Pasar de ${n.validas} noticias dispersas a una agenda de 5 temas explicada.
- Cada afirmación factual cita su evidencia (campo exacto).
- Abstenerse cuando no hay evidencia.
- Toda decisión final es humana y queda registrada.

## Datos
Snapshot \`${manifest.version}\`: ventana del 2025-10-02 al 2026-09-30 (regla de la mediadora del reto); extracción del ${manifest.fecha_extraccion_UTC.slice(0, 10)}.
`;

  paginas["02-plan-y-decisiones.md"] = `# Plan y decisiones

## Backlog
| # | Tarea | Responsable | Estado |
|---|---|---|---|
| 1 | Analizar el pliego y elegir modalidad (TVN) | Julian + Claude | Hecho |
| 2 | Ingesta: RSS y sitemaps de TVN, GDELT, Banco Mundial, USGS; validación y reporte de calidad | Claude | Hecho |
| 3 | Organización: temas por reglas, agrupación con embeddings, procedencia independiente | Claude | Hecho |
| 4 | Contexto oficial, puntaje P y estado de evidencia | Claude | Hecho |
| 5 | Borradores con citas por afirmación y validador determinista | Claude | Hecho |
| 6 | Interfaz: agenda, ficha, consulta, revisión humana | Claude | Hecho |
| 7 | Prueba de inyección T07 de extremo a extremo | Claude | Hecho |
| 8 | Benchmark de 60 consultas (40 desarrollo + 20 reserva) | Claude (borrador) + Julian (validación) | Desarrollo validado; reserva pendiente |
| 9 | Etiquetado humano: 120 pares y 60 afirmaciones | Julian | Hecho |
| 10 | Métricas reproducibles (\`npm run metricas\`) | Claude | Hecho |
| 11 | Ensayo T10 en modo avión | Julian | Hecho (8 oct) |
| 12 | Repositorio en GitHub con acceso del jurado | Julian | Hecho (8 oct) |
| 13 | Notion completo y pitch | Julian + equipo | En curso |

## Decisiones justificadas
1. **Modalidad editorial TVN y no banca:** es la recomendada por el pliego, y la bancaria no exige un segundo producto (\`docs/001\`).
2. **Ventana de datos 2025-10-02 → 2026-09-30 con datos propios por scraping:** regla de la mediadora del reto; no hay paquete común (\`docs/004\`, D7).
3. **Embeddings locales para agrupar** en lugar de reglas: en una muestra diagnóstica de 120 pares (no poblacional), F1 ${fmt(res.agrupacion.embeddings.f1)} frente a ${fmt(res.agrupacion.baseline_jaccard.f1)} del baseline (\`docs/resultados-evaluacion.md\`).
4. **Claude Sonnet 5.5 para redactar:** medido frente a Haiku 4.5 (más barato, pero se abstuvo en un caso respondible); mediana de ${fmt(res.eficiencia_borradores.mediana_s, 1)} s y US$ ${fmt(res.eficiencia_borradores.costo_mediano_usd, 4)} por borrador.
5. **Jev (TypeSafe) descartado:** no redacta texto, que es el 85 % del costo; además, dependencia remota y sin validación en español (\`docs/003\`, \`docs/005\`).
6. **Demo offline por defecto:** borradores y consultas en caché local; la generación en vivo queda fuera del pitch (auditoría Codex 002).
7. **Procedencia conservadora:** solo se fusionan el mismo medio y la agencia explícita; los titulares casi idénticos se marcan como “posible réplica” (auditoría Codex 003, R7).

## Proceso de revisión cruzada
Claude construye y Codex audita de forma independiente (\`auditorias/001…010\`). Cada hallazgo recibe un veredicto: aceptado, parcial o rechazado con justificación.

## Cronología (git)
${commits.map((c) => { const [f, h, m] = c.split("|"); return `- ${f} · \`${h}\` · ${m}`; }).join("\n")}
`;

  paginas["03-catalogo-de-datos.md"] = `# Catálogo de datos

**Snapshot:** \`${manifest.version}\` · extracción ${manifest.fecha_extraccion_UTC} · corte de análisis ${manifest.fecha_corte_UTC}
**Ventana de noticias:** ${manifest.ventana_noticias}

| Fuente | URL | Campos | Condiciones |
|---|---|---|---|
${fuentes.map((f: { nombre: string; url: string; campos: string; condiciones: string }) => `| ${f.nombre} | ${f.url} | ${f.campos} | ${f.condiciones} |`).join("\n")}
| TVN · sitemaps mensuales (scraping) | https://tvn-2.com/tvn_sitemap_index.xml | og:title, descripción, datePublished | Solo metadatos públicos; 1 solicitud/s; respeta robots.txt; sin cuerpos |

## Cobertura
- Noticias válidas: **${n.validas}** (TVN RSS ${n.por_origen.tvn_rss} · TVN sitemaps ${n.por_origen.tvn_sitemap} · GDELT ${n.por_origen.gdelt_doc}).
- Excluidas: ${n.fuera_de_ventana} fuera de la ventana; ${n.con_error} con error; ${n.duplicadas_por_url} duplicadas; ${n.sin_fecha_publicacion} sin fecha de publicación (GDELT solo da la detección).
- Banco Mundial: ${calidad.indicadores.celdas} celdas (6 países × 6 indicadores × 15 años), ${calidad.indicadores.nulos} nulos. Sismos USGS: ${calidad.eventos_sismicos}.

## Transformaciones
${manifest.transformaciones.map((t: string) => `- ${t}`).join("\n")}

## Hashes SHA-256
${Object.entries(manifest.archivos).map(([f, v]) => `- \`${f}\`: \`${(v as { sha256: string }).sha256}\``).join("\n")}

Diccionario completo: \`data/processed/diccionario-datos.md\` · manifest: \`data/processed/manifest.json\`.
`;

  paginas["04-diseno-de-solucion.md"] = `# Diseño de solución

## Arquitectura
Snapshot (raw) → validación y normalización → \`data/processed\` → embeddings locales + agrupación + procedencia → contexto oficial → puntaje P + estado de evidencia → borrador con citas (LLM) → validador determinista → interfaz → revisión humana → \`fichas.jsonl\` → Notion.

## Modelos
| Uso | Modelo / versión | Parámetros | Dónde corre |
|---|---|---|---|
| Embeddings (agrupar, recuperar) | Xenova/multilingual-e5-small (ONNX q8) | coseno; umbral de agrupación 0,88; ventana de 96 h; umbral de consulta 0,82 | Local, sin red |
| Redacción de borradores | Claude Sonnet 5.5 (\`claude-sonnet-5-5\`) | salida estructurada (Zod), effort “low”, caché de prompt | API; resultados en caché local |
| Consultas | Claude Sonnet 5.5 | recuperación local → abstención determinista → respuesta citada | API; caché local |

## Reglas
- **Puntaje:** \`P = 30R + 25I + 20U + 15N + 10E\` (versión \`puntaje-v2\`). Rangos: bajo [0,40), medio [40,70), alto [70,100]. Empates: mayor urgencia y luego ID.
- **Estado de evidencia** (independiente de P): insuficiente / parcial / suficiente para el borrador.
- **Temas:** reglas transparentes versionadas (\`temas-reglas-v2\`); la ficha muestra las raíces que activaron el tema.
- **Validador:** bloquea hechos y declaraciones sin cita, cifras ausentes del campo citado y citas a campos inexistentes; exige límites de palabras.

## Prompts
Versión vigente: \`paquete-tvn-v6\` y \`consulta-v4\`. El texto completo está en \`src/lib/generar.ts\` (\`SISTEMA\`) y \`src/lib/consulta.ts\`. Las instrucciones van separadas del contenido de las fuentes, que entra delimitado como dato.

## Límites del sistema
- No determina la verdad ni publica.
- Trabaja con titulares y descripciones, no con artículos completos.
- El validador comprueba existencia y cifras, no la pertinencia semántica.
- La agrupación tiende a juntar de más (precisión ${fmt(res.agrupacion.embeddings.precision)}).
- El Banco Mundial es anual y llega hasta 2024.
`;

  paginas["05-casos-y-evidencias.md"] = `# Casos y evidencias (${fichas.length} fichas)

${fichas.map((f) => `## ${f.id_caso} · #${f.posicion_en_cola} · ${f.titulo_evento}
- **Estado de evidencia:** ${f.estado_evidencia} (${f.motivo_estado_evidencia}) · **Procedencias independientes:** ${f.procedencias_independientes}
- **Puntaje P = ${f.puntaje}** (${f.rango}) · ${Object.entries(f.componentes).map(([k, c]) => `${k} ${(c as { valor: number }).valor}`).join(" · ")} · reglas ${f.version_reglas}
- **Fuentes:** ${f.ids_fuente.join(", ")}
- **Borrador:** ${f.borrador.tipo}${f.borrador.abstencion.abstiene ? " (abstención)" : ""} · validador ${f.borrador.validacion.valido ? "OK" : "con problemas"} · ${f.borrador.generacion.modelo} · ${f.borrador.generacion.prompt_version}
- **Título propuesto:** ${f.borrador.titulo_propuesto || "—"}
- **Vacíos:** ${f.vacios.join(" · ")}
- **Revisión humana:** ${f.estado_revision}${f.historial_revision.length ? ` · ${f.historial_revision.map((h: { estado: string; revisor: string }) => `${h.estado} (${h.revisor})`).join(", ")}` : " · **pendiente de registrar responsable**"}
`).join("\n")}`;

  paginas["06-pruebas-y-metricas.md"] = `# Pruebas y métricas

${matriz}

---

${(await readFile("docs/resultados-evaluacion.md", "utf8")).replace(/^# .*\n/, "## Resultados de evaluación\n")}
`;

  paginas["07-riesgos-y-etica.md"] = `# Riesgos y ética

| Riesgo | Control operativo | Evidencia |
|---|---|---|
| Alucinación (hechos, cifras, citas inventadas) | Salida estructurada con cita por afirmación; validador que bloquea cifras ausentes del campo citado; abstención | En dos muestras humanas de 30 afirmaciones no hubo ninguna completamente no respaldada; en la última medida (prompt v5), 60 % con respaldo pleno y 40 % parcial; v6 sin medir. Cobertura de citas estructural (v6): ${res.cobertura_citas.con_cita_valida}/${res.cobertura_citas.factuales} |
| Inyección mediante fuentes | Fuentes delimitadas como dato; etiquetas escapadas; regla explícita en el prompt | T07: 2/2 casos sintéticos aprobados; 6/6 adversariales sin fuga del prompt |
| Repetición confundida con corroboración | Procedencia independiente conservadora; “posible réplica” para revisión humana | Ficha con grupos de procedencia y motivo |
| Prioridad confundida con verdad | Estado de evidencia separado; con evidencia insuficiente, solo brief de investigación (guion y copy bloqueados) | T08 |
| Publicación automática | No existe: estados de revisión humana; “aprobado como borrador” no publica | Panel de revisión |
| Privacidad y reputación | Sin datos personales; acusaciones como declaraciones; sin listas de sospechosos | Prompt y benchmark adversarial (B-053, B-058) |
| Derechos de autor | Solo metadatos públicos; sin cuerpos, imágenes ni videos; condiciones por fuente | Catálogo de datos |
| Credenciales | \`.env.local\` fuera de git; \`.env.example\` sin secretos | Repositorio |
| Dependencia de red en la demo | Snapshot y cachés locales; respaldo por palabras clave si falta el modelo | T10 (aprobado en modo avión, 8 oct) |

**Fuera de alcance declarado:** detección definitiva de noticias falsas, riesgo bancario individual, audiencia y producción audiovisual.
`;

  paginas["08-presentacion-al-jurado.md"] = `# Presentación al jurado (10 minutos)

1. **Problema (1 min).** Muchas señales; repetir no es corroborar. “¿Qué merece revisión, con qué evidencia y qué falta comprobar?”
2. **Solución (1 min).** Agenda de investigación para TVN con ${n.validas} noticias de la ventana oficial, datos del Banco Mundial y de USGS; todo sin conexión.
3. **Demo (4 min).**
   - Agenda: los 5 temas y su puntaje explicado.
   - Ficha #1, Cobre Panamá: procedencias, posibles réplicas y borrador con citas (abrir una cita).
   - Ficha del empleo: declaración frente al dato anual de 2024, “no es actual”.
   - Ficha del capitán del remolcador: prioridad alta, evidencia insuficiente, guion bloqueado.
   - Consulta “¿rating de TVN ayer?” → abstención.
   - Consulta “mina de cobre” → dos versiones incompatibles.
   - Revisión humana registrada.
4. **IA y evidencias (2 min).** En una muestra diagnóstica de 120 pares etiquetados por una persona, embeddings obtuvo F1 ${fmt(res.agrupacion.embeddings.f1)} frente a ${fmt(res.agrupacion.baseline_jaccard.f1)} de las palabras clave: recupera 20 de 21 casos, pero agrupa de más (11 falsos positivos). Validador de citas; T07 aprobado; abstención 7/7 y 0/20 falsas abstenciones.
5. **Valor (1 min).** Unos 2 centavos y ${fmt(res.eficiencia_borradores.mediana_s, 0)} s por borrador. Ahorro de tiempo: hipótesis por medir.
6. **Límites y próximos pasos (1 min).** “El último prompt medido, v5, alcanzó 60 % de respaldo pleno en 30 afirmaciones (meta: 90 %); el resto, respaldo parcial. Corregimos en v6 y su efecto aún no está medido.” Agrupación que junta de más; datos anuales. Próximo: medir v6 y validar con un editor de TVN.

**Mensaje:** “No construimos una máquina que publique más rápido. Construimos una capa de decisión que indica qué merece atención, qué evidencia existe y qué todavía no puede afirmarse.”
`;

  for (const [f, c] of Object.entries(paginas)) await writeFile(join(out, f), c);
  console.log(`Páginas escritas en ${out}: ${Object.keys(paginas).join(", ")}`);

  // Entrega pedida por la organización (8 oct): una página con 3 enlaces → funcional, técnica y pitch.
  const unir = (fs: string[]) => fs.map((f) => paginas[f].trim()).join("\n\n---\n\n") + "\n";
  const entrega: Record<string, string> = {
    "Documentación funcional.md": unir(["01-inicio-del-reto.md", "02-plan-y-decisiones.md", "05-casos-y-evidencias.md", "07-riesgos-y-etica.md"]),
    "Documentación técnica.md": unir(["03-catalogo-de-datos.md", "04-diseno-de-solucion.md", "06-pruebas-y-metricas.md"]),
    "Presentación pitch day.md": unir(["08-presentacion-al-jurado.md"]),
  };
  const outEntrega = join(out, "entrega");
  await mkdir(outEntrega, { recursive: true });
  for (const [f, c] of Object.entries(entrega)) await writeFile(join(outEntrega, f), c);
  console.log(`Entrega (3 páginas) en ${outEntrega}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
