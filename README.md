# De la señal a la decisión · Copiloto editorial para TVN Media

Prototipo del **Equipo Arijuma** para el reto **hackIAthon Panamá (4.ª edición) · TVN Media**. Convierte noticias públicas e indicadores oficiales en una **cola de investigación priorizada**. Cada tema muestra:
- cuánta atención merece;
- cuántas procedencias son realmente independientes;
- qué está respaldado y qué falta comprobar;
- un **borrador editorial con cita por afirmación**, que una persona revisa.

> Interfaz **inspirada en la identidad editorial de TVN Media** (fuentes libres equivalentes, sin logo oficial); no es un diseño oficial de TVN.

> El sistema **nunca publica**. La prioridad ordena el trabajo; no indica que algo sea cierto. “Aprobado como borrador” no significa publicado.

## Demo

Requisitos: Node.js ≥ 22 y npm.

**1. Preparación (una sola vez, con internet):**
```bash
npm ci                 # dependencias exactas de package-lock.json
npm run models         # descarga el modelo local de embeddings a ./models (para consultas nuevas)
npm run build          # Webpack; no descarga fuentes ni recursos remotos
```

**2. Demo (sin internet):**
```bash
npm start              # http://localhost:3000
```

**Qué funciona sin conexión** (T10; la validación en modo avión en la laptop de presentación se registra en `docs/matriz-aceptacion.md`):
- La cola, las fichas, las citas y la revisión humana leen el snapshot procesado (`data/processed/`).
- Los borradores leen la caché local (`data/cache/llm/`). Cada uno muestra su modelo, su fecha de generación y que viene de caché.
- Las consultas pregrabadas leen la caché local (`data/cache/consultas/`).
- Las **consultas nuevas** usan el modelo local de embeddings para recuperar evidencia. **Si el modelo no está en el equipo**, la página no falla: pasa a coincidencia de palabras clave, lo declara en pantalla y se abstiene de redactar si no hay respuesta en caché.

**Qué requiere conexión:** solo generar borradores o respuestas **nuevos** con el modelo de lenguaje (modo desarrollo; fuera del recorrido de la demo). Un clon recién descargado necesita internet para el paso 1.

Para desarrollo: `npm run dev`. Alternativa de build con Turbopack: `npm run build:turbo`. (Algunos entornos restringidos impiden los procesos de Turbopack; por eso Webpack es el predeterminado. Ambos se verificaron y generan el CSS completo.)

Recorrido de la demo: **Cola de investigación** (`/`) → **ficha** de un tema (`/tema/…`) → borrador con citas verificables → **revisión humana** → **Consultar el corpus** (`/consulta`), que incluye abstenciones → **Exportar fichas.jsonl** (`/api/fichas`).

## Reproducir el pipeline completo (con internet)

```bash
cp .env.example .env.local           # completar ANTHROPIC_API_KEY (nunca se sube al repo)
npm run models                       # descarga el modelo local de embeddings a ./models (una vez)
npm run ingest                       # etapa 1: descarga TVN RSS, GDELT, Banco Mundial y USGS → data/raw/<corte>/
npm run scrape-tvn -- data/raw/<corte>   # etapa 1: metadatos de TVN desde sus sitemaps mensuales
npm run ingest -- --raw data/raw/<corte> # reprocesa el crudo sin red (reproducible)
npm run organizar                    # etapa 2: temas, embeddings, agrupación de eventos, procedencia
npm run cola                         # etapas 3–4: contexto oficial, puntaje y estado de evidencia
npm run generar -- 0 1 2             # etapa 6: borradores para los eventos de esas posiciones (usa la API)
npm run consultar -- "¿pregunta?"    # consultas en español: recuperación local + respuesta citada o abstención
npm run fichas                       # exporta data/processed/fichas.jsonl (contrato de la pág. 7)
npm test                             # pruebas automatizadas
```

| Variable | Uso |
|---|---|
| `ANTHROPIC_API_KEY` | Solo para generar borradores nuevos. |
| `LLM_MODEL` | Modelo de redacción (por defecto `claude-sonnet-5-5`; ver `docs/`). |
| `MODELS_OFFLINE` | `1` = usa solo el modelo de embeddings local y la caché de borradores. |

## Flujo (siete etapas del pliego)

| Etapa | Qué hace | Dónde |
|---|---|---|
| 1 · Cargar | Valida IDs, URLs, fechas, campos obligatorios y nulos sin bloquear la carga; aplica la ventana oficial; emite el reporte de calidad, el manifest con SHA-256 y el catálogo de fuentes | `scripts/ingest.ts`, `src/lib/ingest.ts` |
| 2 · Organizar | Tema por reglas transparentes y versionadas. **IA:** embeddings multilingües locales + agrupación aglomerativa de eventos, comparada con un baseline de palabras clave. Procedencia independiente | `scripts/organizar.ts`, `src/lib/organizar.ts`, `src/lib/embeddings.ts` |
| 3 · Contextualizar | Enlaza un indicador o sismo oficial **solo** si el titular lo menciona explícitamente; año, unidad y “dato anual, no actual” | `src/lib/contextualizar.ts` |
| 4 · Priorizar | `P = 30R + 25I + 20U + 15N + 10E` con desglose y versión de reglas; estado de evidencia independiente del puntaje | `src/lib/priorizar.ts` |
| 5 · Explicar | Ficha: qué se reporta, quién, qué está respaldado, qué falta y la acción recomendada | `src/app/tema/[id]/page.tsx` |
| 6 · Producir | Borrador TVN (brief ≤ 250 palabras, título, enfoque, 3 preguntas, guion de 45–60 s y copy ≤ 80 palabras) con tipo por afirmación (hecho, declaración, inferencia, hipótesis). Un **validador determinista** bloquea afirmaciones sin cita válida y cifras que no aparecen en la evidencia | `src/lib/generar.ts`, `src/lib/validar.ts` |
| Consultas | Recuperación semántica local; **abstención determinista** sin IA si nada supera el umbral de pertinencia; si no, respuesta citada o abstención del modelo (CU-04, T06) | `src/lib/consulta.ts`, `src/app/consulta/page.tsx` |
| 7 · Revisar | Estados “nuevo / en revisión / requiere evidencia / aprobado como borrador / descartado”, con responsable, nota e historial | `src/components/revision.tsx`, `data/revisiones/` |

## Uso de IA y controles

- **Embeddings locales:** `Xenova/multilingual-e5-small` (ONNX q8, vía transformers.js). Sin servicios externos en tiempo de ejecución.
- **Redacción:** Claude (Anthropic) con salida estructurada (Zod). Las instrucciones van separadas del contenido de las fuentes, que entra delimitado como **dato, no instrucción**: las etiquetas inyectadas se escapan (T07).
- **Anti-alucinación:**
  - toda cifra de una afirmación debe estar literalmente en el registro citado;
  - los hechos y las declaraciones exigen cita;
  - las abstenciones no pueden traer contenido;
  - con evidencia insuficiente solo se produce un **brief de investigación**: el guion y el copy quedan bloqueados.
- **Límites declarados:** el validador comprueba que la cita **existe** y contiene las cifras, pero no que la **respalde semánticamente**. Eso se mide con revisión humana.
- **Costo y latencia:** cada borrador registra tokens, costo en USD y latencia.

## Datos y condiciones de uso

Ventana oficial de noticias: **2025-10-02 a 2026-09-30** (hora de Panamá), según la regla de la mediadora del reto. Los detalles están en `docs/004-decisiones-datos-y-pipeline.md` (D7).

| Fuente | Contenido | Condiciones |
|---|---|---|
| TVN (RSS y sitemaps públicos) | Titular, descripción, fecha de publicación y URL | Solo metadatos públicos; no se redistribuyen cuerpos, imágenes ni videos. Scraping a 1 solicitud/s, respetando robots.txt |
| GDELT DOC 2.0 | Titular, URL, medio y fecha de **detección** | La API no transfiere derechos de los medios enlazados |
| Banco Mundial (Indicators API v2) | 6 países × 6 indicadores × 2010–2024 | CC BY 4.0 con atribución, salvo excepciones por indicador |
| USGS (FDSN) | Sismos M≥3 en la caja lat 5–12, lon −86 a −76 | Dominio público de EE. UU. La caja no equivale al territorio de Panamá |

`data/processed/manifest.json` contiene las consultas exactas, los hashes SHA-256, las licencias y las transformaciones. `data/processed/calidad.json` contiene los errores, duplicados y registros excluidos con su motivo.

## Estructura

```
src/lib/        lógica del pipeline (funciones puras, probadas)
src/app/        interfaz Next.js: cola (/) y ficha (/tema/[id])
scripts/        comandos del pipeline
tests/          pruebas Vitest (T01–T09 en su parte determinista)
data/           raw/ · processed/ · cache/llm/ (borradores) · revisiones/
docs/           decisiones y plan del equipo
auditorias/     auditorías independientes (Codex) y respuestas punto por punto
reto/           pliego oficial del reto
```
