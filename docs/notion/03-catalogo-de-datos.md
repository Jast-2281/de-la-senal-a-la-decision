# Catálogo de datos

**Snapshot:** `senales-evidencias-equipo-v2` · extracción 2026-10-06T22:50:47.899Z · corte de análisis 2026-10-01T05:00:00.000Z
**Ventana de noticias:** [2025-10-02T05:00:00.000Z, 2026-10-01T05:00:00.000Z) en UTC = 2025-10-02 hasta el último mes completo previo a la extracción, en hora de Panamá (regla de la mediadora del reto)

| Fuente | URL | Campos | Condiciones |
|---|---|---|---|
| TVN · feed RSS público | https://www.tvn-2.com/rss/ | titular, enlace, descripción, pubDate, palabras clave | Solo metadatos y descripción del RSS. Sin licencia abierta sobre artículos, imágenes o videos; no se redistribuyen cuerpos. |
| GDELT DOC 2.0 API | https://api.gdeltproject.org/api/v2/doc/doc | titular, URL, dominio, idioma, seendate | La API no transfiere derechos de los medios enlazados. seendate = detección, no publicación. Ventana máxima ≈3 meses. |
| Banco Mundial · Indicators API v2 | https://api.worldbank.org/v2 | país, indicador, año, valor | CC BY 4.0 con atribución, salvo excepciones de terceros por indicador. Datos anuales revisables. |
| USGS · catálogo sísmico FDSN | https://earthquake.usgs.gov/fdsnws/event/1/ | id, magnitud, tiempo, ubicación, profundidad, estado, URL | Dominio público de EE. UU.; confirmar condiciones de elementos de terceros. |
| TVN · sitemaps mensuales (scraping) | https://tvn-2.com/tvn_sitemap_index.xml | og:title, descripción, datePublished | Solo metadatos públicos; 1 solicitud/s; respeta robots.txt; sin cuerpos |

## Cobertura
- Noticias válidas: **591** (TVN RSS 51 · TVN sitemaps 309 · GDELT 231).
- Excluidas: 118 fuera de la ventana; 1 con error; 0 duplicadas; 231 sin fecha de publicación (GDELT solo da la detección).
- Banco Mundial: 540 celdas (6 países × 6 indicadores × 15 años), 0 nulos. Sismos USGS: 87.

## Transformaciones
- URLs normalizadas (sin query/fragmento, sin www) para ID estable y deduplicación
- id_noticia = 'N-' + sha1(url normalizada)[:10]
- Fechas convertidas a ISO 8601 UTC; seendate de GDELT va en fecha_deteccion, nunca en fecha_publicacion
- Registros con errores se separan en calidad.json sin bloquear la carga
- Ventana oficial [2025-10-02, 2026-09-30] (hora de Panamá): los registros fuera se listan en calidad.json (fuera_de_ventana)
- TVN: scraping de metadatos públicos (og:title, og:description, datePublished) de URLs de sitemaps mensuales, secciones nacionales/economía; 200 más recientes de sept. 2026 + 10 por mes (oct. 2025–ago. 2026); 1 solicitud/s; sin cuerpos de artículos
- Banco Mundial: cuadrícula completa 6×6×15 = 540 celdas; los faltantes se conservan como nulos (no cero)
- USGS: se conservan id, URL y campos del contrato; tiempos en ISO 8601 UTC

## Hashes SHA-256
- `calidad.json`: `85ca01469bb9ce0946bfb16b46a480656e956bcf7d076ad8912665ed2cfbf255`
- `cola.json`: `c1401b5c85bd0fb1db805806cd51413d99e7139a8305d681dbce8cb6271d71d2`
- `embeddings.json`: `af2a8ec204529fad9be3a359cb066dfa9f110608f37253f7648c73f142dceaf9`
- `eventos.geojson`: `496594632eb2a54dfe353ca36435df6c2aa13d70036c0748c9431c219e46237a`
- `fuentes.json`: `20d38343585fc0843b406e55a804cb11e388cfa3ab11fc415aee222a25579f12`
- `indicadores.csv`: `2e0a2cb150cb2256b1904babb7ca3288a73f60f6661ffa25ce1d721fe0d61a69`
- `indicadores.json`: `2425da9bedd1eecfd828b88d3b8f3291a02804bea37016b5b0098c6ec9328f8b`
- `noticias.csv`: `130a98ef2b7e0f5cdbcb443e6abba72ba639ee607389d9d869ce610f72a2d081`
- `noticias.json`: `bddbf86ac75a6c74ba9e50920116235e490b56c5c8e68f5402272572b91f8584`
- `organizado.json`: `8a32bf8e0a2683f9216a08c62d42f9d7011acdf31049e21b781f70e09d3b4fc0`

Diccionario completo: `data/processed/diccionario-datos.md` · manifest: `data/processed/manifest.json`.
