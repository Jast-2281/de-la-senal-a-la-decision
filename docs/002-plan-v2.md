# 002 · Plan v2 (tras auditoría 001)

> Autor: Claude · Fecha: 2026-10-06 · Reemplaza las secciones 5, 7 y 8 de `001-analisis-y-estrategia.md`.
> Restricciones: **entrega el jueves 8 de octubre a las 23:59** (correo oficial: “a partir de hoy tienen 3 días”) · una persona construye · modalidad TVN · interfaz en Next.js.
> ⚠️ Corrección 2026-10-06 07:10: la versión anterior suponía un evento el 15–16 oct. El correo oficial confirma que la construcción **ya empezó**. Se elimina la “semana previa” y el riesgo de preparación anticipada deja de aplicar.

## Producto en una frase
**Cola de investigación editorial para TVN:** cada tema muestra *qué sabemos · cuántas procedencias independientes · qué falta o se contradice · siguiente acción*, y desde ahí se genera un paquete editorial citado que una persona aprueba como borrador o descarta.

## Stack (una sola tecnología, TypeScript de punta a punta)
- **Next.js** (App Router) para la interfaz y las rutas de API.
- **Embeddings locales con transformers.js** (`multilingual-e5-small` u otro similar), sin depender de la red. *Verificar esta semana que funcione en Node y que su latencia sea aceptable.*
- **Datos:** archivos del contrato (`noticias.csv`, `indicadores.csv`, `eventos.geojson`) → scripts de Node → JSON procesado. Sin base de datos. Ningún requisito del pliego la justifica.
- **LLM:** SDK oficial de Anthropic para TypeScript, con salida estructurada. Modelo elegido por medición (ver respuesta 001).
- **Pruebas:** Vitest para T01–T10.
- **Por qué no Python:** con una sola persona, dos lenguajes duplican herramientas, dependencias y puntos de fallo. *Riesgo:* si transformers.js falla en la verificación, el plan B es un script de Python solo para calcular embeddings y escribirlos en JSON.

## Pantallas (solo 3)
1. **Cola de investigación:** ranking con P (0–100) y desglose R/I/U/N/E, semáforo de evidencia separado, procedencias independientes, versión de las reglas.
2. **Ficha del tema:** titulares agrupados con su procedencia, indicadores relacionados (país, año, unidad, “dato anual, no actual”), vacíos y contradicciones, acción recomendada.
3. **Paquete editorial:** brief (≤250 palabras), título, enfoque, 3 preguntas, guion de 45–60 s y copy (≤80 palabras). Cada afirmación lleva el texto exacto de su evidencia; la etiqueta “basado únicamente en titular/metadatos” aparece cuando aplica. Botones de revisión con los 5 estados del pliego, y exportación a `fichas.jsonl`.

Las consultas en español entran como una caja de búsqueda sobre la cola, no como un chat aparte.

## Cronograma real (mar 6 → jue 8 oct, 23:59)
| Bloque | Entregable | Notion |
|---|---|---|
| **Mar 6 · mañana** | Notion con las 8 secciones y acceso del jurado; repo en GitHub; preguntas a la organización (WhatsApp/correo); Next.js inicializado; verificación de transformers.js | Inicio, plan (≥8 tareas), decisiones 001–003 |
| **Mar 6 · tarde/noche** | Ingesta propia rotulada como contingencia (RSS TVN + GDELT + Banco Mundial + USGS) con manifest y hash; reporte de calidad (T01) | Catálogo de datos |
| **Mié 7 · mañana** | Embeddings + agrupación de eventos + procedencia (T02, T03) frente a baseline; puntaje P + estado de evidencia (T08); contexto de indicadores (T04) | Diseño de solución |
| **Mié 7 · tarde/noche** | Pantallas 1 y 2; paquete editorial con citas + validador + abstención (T05, T06, T09) + anti-inyección (T07); estados de revisión; caché offline (T10) | Prompts y versiones; fichas |
| **Jue 8 · congelamiento 12:00** | No se construyen funciones nuevas | — |
| **Jue 8 · tarde** | T01–T10 y benchmark; métricas con numerador y denominador; comparación de modelos; ≥5 fichas (una insuficiente); una prueba fallida con su corrección | Matriz de pruebas, métricas |
| **Jue 8 · hasta 21:00** | Pitch en Notion; README y `.env.example`; verificar el acceso del jurado al repo y a Notion. **Margen de 3 h** antes de las 23:59 | Presentación al jurado |

Si a mitad del miércoles vamos atrasados, el primer recorte es la **comparación de 3 modelos** (se queda en uno, con su costo medido) y el segundo es el **guion de 45–60 s** (queda solo el brief + copy). El validador de citas, la abstención y Notion **no se recortan**.

## Fuera de alcance (confirmado)
Banca, SBP, fuentes en vivo, scraping de artículos, chat como pantalla principal, autenticación, base de datos, automatización de Notion y un clasificador de ML aparte (solo como extensión).
