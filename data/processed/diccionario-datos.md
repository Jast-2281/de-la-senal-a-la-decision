# Diccionario de datos · Panamá: Señales y Evidencias

> Versión del snapshot: `senales-evidencias-equipo-v2`. Redactado por Codex; corregido por Claude el 2026-10-07 tras verificarlo contra los datos (url, palabras_clave, unidad y columnas faltantes). Codificación UTF-8. Las fechas se guardan en ISO 8601 UTC y se muestran en hora de Panamá en la interfaz.

## `noticias.csv`

| Campo | Tipo | Nulos | Descripción / regla |
|---|---|---:|---|
| `id_noticia` | string | No | ID estable: `N-` + SHA-1 truncado de la URL normalizada. |
| `titulo` | string | No | Titular público de la fuente; no implica lectura del artículo completo. |
| `url` | URL | No | URL **original** de la fuente. La versión normalizada (sin `www`, fragmento ni parámetros) solo se usa internamente para calcular el ID y deduplicar. |
| `medio` | string | No | Dominio o medio de procedencia. |
| `idioma` | string | No | Idioma declarado/detectado de la entrada. |
| `fecha_publicacion` | datetime UTC | Sí | Fecha de publicación. Para GDELT se conserva `null` si no existe. |
| `fecha_deteccion` | datetime UTC | Sí | `seendate` de GDELT; no equivale a fecha de publicación. |
| `fecha_extraccion` | datetime UTC | No | Momento en que el equipo obtuvo el registro. |
| `tema` | string | Sí | Tema asignado en organización; `null` antes de clasificar. |
| `origen` | enum | No | `tvn_rss`, `tvn_sitemap` o `gdelt_doc`. |
| `alcance_texto` | enum | No | `titular` o `titular+descripcion`; limita todo borrador derivado. |
| `descripcion` | string | Sí | Descripción/metadato público cuando la fuente lo entrega. |
| `palabras_clave` | string | Sí (vacío) | Palabras clave **editoriales** del RSS de TVN (`media:keywords`), separadas por `\|`. Vacío para GDELT y el scraping de sitemaps. Se usan como señal para la clasificación temática por reglas. |

## `indicadores.csv`

| Campo | Tipo | Nulos | Descripción / regla |
|---|---|---:|---|
| `pais_iso3` | string | No | Código ISO-3 del país. |
| `indicador_id` | string | No | Código del indicador del Banco Mundial. |
| `indicador_nombre` | string | No | Nombre del indicador tal como lo entrega la API (en inglés). La interfaz muestra una traducción. |
| `anio` | integer | No | Año de referencia; los indicadores son anuales, no medición actual. |
| `valor` | number | Sí | Valor original; un faltante se conserva como nulo, nunca como cero. |
| `unidad` | string | No | **Asignada por el equipo** según la definición del indicador: la API del Banco Mundial devuelve el campo `unit` **vacío**. Ejemplo: `SL.UEM.TOTL.ZS` → “% de la fuerza laboral total (estimación OIT)”. La unidad original está implícita en `indicador_nombre`. |
| `fuente_url` | URL | No | Endpoint o referencia de la fuente. |
| `fecha_extraccion` | datetime UTC | No | Momento de extracción. |
| `licencia` | string | No | Condición de uso registrada para el indicador. |
| `ultima_actualizacion_bm` | date | Sí | Fecha `lastupdated` declarada por el Banco Mundial para la serie (los datos pueden revisarse). |

## `eventos.geojson`

| Campo | Tipo | Nulos | Descripción / regla |
|---|---|---:|---|
| `id` | string | No | Identificador del evento USGS. |
| `magnitude` | number | Sí | Magnitud reportada por USGS. |
| `time`, `updated` | datetime UTC | No | Momento del evento y última actualización. |
| `longitude`, `latitude`, `depth` | number | Sí | Coordenadas y profundidad del evento. |
| `place` | string | Sí | Descripción de ubicación de USGS. |
| `status` | string | Sí | Estado del registro USGS. |
| `url` | URL | No | URL pública del evento. |

## `fichas.jsonl`

| Campo | Tipo | Descripción |
|---|---|---|
| `id_caso`, `modalidad`, `titulo_evento`, `posicion_en_cola` | string/number | Identidad, modalidad y posición del evento en la cola. |
| `ids_fuente` | array | IDs de evidencia recuperada para la ficha. |
| `afirmaciones`, `citas` | array | Afirmación tipada y cita por ID de evidencia + campo exacto. |
| `puntaje`, `rango`, `componentes`, `version_reglas` | number/object | Priorización reproducible y versión de reglas. |
| `estado_evidencia`, `motivo_estado_evidencia` | string | Suficiencia de evidencia, independiente del puntaje. |
| `procedencias_independientes`, `vacios`, `contradicciones` | number/array | Límites de corroboración y verificación pendiente. |
| `borrador` | object | Paquete editorial, validación y metadatos de generación. |
| `estado_revision`, `historial_revision` | string/array | Decisión humana y su historial. |

## Artefactos de control

- `manifest.json`: corte, consultas, hashes SHA-256, licencias y transformaciones.
- `calidad.json`: errores, duplicados y registros excluidos; la carga no elimina silenciosamente esos casos.
- `fuentes.json`: catálogo de fuentes y campos extraídos.
- `organizado.json`, `cola.json`, `embeddings.json`: resultados intermedios reproducibles del pipeline.

## Límites de derechos y alcance

Para TVN y GDELT se almacenan metadatos públicos, no cuerpos de artículo, imágenes ni videos. Cuando una ficha utiliza solo titulares o metadatos, la salida debe declarar que está **basada únicamente en titular/metadatos**.
