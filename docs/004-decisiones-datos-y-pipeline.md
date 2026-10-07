# 004 · Decisiones de datos y pipeline (día 1)

> Autor: Claude · Fecha: 2026-10-06 · Estado: **para auditoría de Codex** y registro en Notion (Plan y decisiones / Catálogo de datos)

## D1 · Snapshot de contingencia propio
- **Contexto:** la organización aún no entrega el paquete común (lo esperan para el fin del día).
- **Decisión:** construir un snapshot propio con el **mismo contrato de datos** (pág. 7), rotulado en `manifest.json` como *“Snapshot de CONTINGENCIA del equipo; no es el paquete común oficial”*.
- **Consecuencia:** si llega el paquete oficial, se reemplaza `data/processed/` y el resto del pipeline no cambia.

## D2 · Ventana de noticias: prevalecen los “30 días previos al corte” — **REEMPLAZADA por D7**
- **Conflicto del pliego:** la pág. 6 pide los 30 días previos a la extracción, y la pág. 7 pide excluir lo que esté fuera de `[2024-01-01, 2025-10-01)`.
- **Evidencia nueva:** GDELT DOC solo permite consultar unos 3 meses hacia atrás. Es técnicamente imposible obtener de esa API noticias de 2024 a sept. 2025, así que la regla de la pág. 7 no puede cumplirse para la fuente A.
- **Decisión:** 30 días para las noticias. Para el Banco Mundial (2010–2024) y USGS (2024) se usan los intervalos fijos que indica el pliego.
- **Pendiente:** confirmación escrita de la organización.

## D3 · GDELT bloqueado (HTTP 429): consulta previa + cortacircuito
- **Hecho:** durante la ingesta, GDELT respondió 429 de forma persistente (“limit requests to one every 5 seconds”), incluso con esperas de 20 a 320 s.
- **Decisión:**
  - se usa una consulta GDELT válida descargada a las 17:39 (250 artículos, `Panama sourcecountry:PM`, 30 días), con su URL exacta en el manifest;
  - las 15 consultas por tema y tramo que fallaron quedan registradas en `calidad.json` (`consultas_gdelt_fallidas`);
  - el descargador es reanudable y tiene un cortacircuito para no bloquear la carga (alineado con T01).
- **Limitación declarada:** la cobertura temática de GDELT depende de una sola consulta general. Se puede reintentar con `npm run ingest -- --resume <dir>`.

## D4 · Cuadrícula del Banco Mundial: 540 celdas, no 1.350
- **Cálculo:** 6 países × 6 indicadores × 15 años (2010–2024) = **540**. La cifra de 1.350 del pliego no corresponde a los parámetros que el mismo pliego define.
- **Decisión:** cuadrícula completa de 540 celdas, conservando los nulos explícitos (en este corte no hubo ninguno).

## D5 · `fecha_publicacion` nula para GDELT
- GDELT solo entrega `seendate`, que es la fecha de detección. Va en `fecha_deteccion`, y `fecha_publicacion` queda **nula** (250 registros). Nunca se rellena.

## D6 · Clasificación temática por reglas; agrupación de eventos con embeddings
- **Temas:** reglas transparentes y versionadas (`temas-reglas-v1`). La interfaz muestra las raíces que activaron cada tema. Sirven también de baseline.
- **IA sustantiva:** embeddings multilingües locales (`Xenova/multilingual-e5-small`, ONNX q8) y aglomeración por enlace promedio, con umbral de coseno 0,88 y una ventana de 96 h.
  - **Baseline:** Jaccard de tokens del titular, con umbral 0,4.
  - **Pendiente:** calibrar ambos umbrales con pares etiquetados por una persona.
- **Procedencia independiente:** cuentan como una sola procedencia:
  - las notas del mismo medio;
  - los titulares casi idénticos (coseno ≥ 0,97 o Jaccard ≥ 0,8);
  - las notas que citan la misma agencia.

## Resultado del corte `2026-10-06T2250`
| Métrica | Valor |
|---|---|
| Noticias válidas | 400 (TVN 150 · GDELT 250), 9 medios panameños |
| Con error / duplicadas | 0 / 0 |
| Sin fecha de publicación (GDELT) | 250 |
| Indicadores | 540 celdas, 0 nulos |
| Sismos USGS 2024 (caja regional) | 82 |
| Eventos (IA) / grupos baseline | ver `organizado.json` · baseline: 369 grupos |
| Tiempo de embeddings (400 titulares) | ≈2 s, local |

## D7 · Regla oficial de la mediadora: ventana 2025-10-02 → sept. 2026, datos propios por scraping
- **Fuente:** grupo oficial de WhatsApp del reto, 2026-10-06. Mediadora: **Isabel** (organización del reto). Respondió dos consultas:
  - **16:35:** *“Ustedes tienen que armar los datos con scraping y se debe excluir ese periodo de tiempo, tiene que ser desde 2025-10-02 hasta el último mes completo de este año (septiembre)”*.
  - **18:51**, respondiendo a Keneth (otro participante), que preguntaba por el Banco Mundial y USGS: *“Son solo ejemplos… la idea es que se haga un scraping general… para entrenar sus modelos pueden utilizar información de otras fechas… Sin embargo, para la demo presencial, sí debe utilizarse información reciente.”*
- **Interpretación:**
  1. **No hay paquete común.** Nuestro snapshot es el oficial del equipo (se elimina el rótulo de “contingencia”).
  2. **Noticias:** `[2025-10-02, 2026-09-30]` en hora de Panamá, es decir `[2025-10-02T05:00Z, 2026-10-01T05:00Z)`. Lo que queda fuera se lista en `calidad.json` con su motivo.
  3. **Corte de análisis** (urgencia y novedad) = cierre de la ventana, 2026-10-01T05:00Z. Es reproducible y no usa datos posteriores.
  4. **USGS:** se consulta la misma ventana (87 sismos M≥3 en la caja regional), para que los sismos recientes de las noticias tengan respaldo oficial.
  5. **Banco Mundial 2010–2024:** se mantiene como contexto anual, porque es el último año publicado y la mediadora permite otras fechas como referencia. Siempre se rotula “dato anual de AAAA, no actual”.
- **Nueva fuente A3, scraping de TVN:**
  - URLs tomadas de los sitemaps mensuales públicos (`tvn_sitemap_contents_AAAA_MM.xml`), secciones nacionales y economía.
  - Se guardan solo metadatos: `og:title`, la descripción (`og:description`, o el JSON-LD cuando la primera viene truncada) y `datePublished`.
  - Respeta robots.txt, hace 1 solicitud por segundo y no guarda cuerpos de artículos.
  - Muestreo determinista: las 200 más recientes de septiembre de 2026 (la demo debe ser reciente) + 10 por mes de oct. 2025 a ago. 2026 (contexto).

## Preguntas para Codex
1. ¿La decisión D2 está bien fundada o conviene pedir otra regla a la organización antes de seguir?
2. ¿Ves algún riesgo en contar como “misma procedencia” los titulares casi idénticos de medios distintos (falsos positivos de réplica)?
