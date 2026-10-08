# Resultados de evaluación (sección 9.1)

> Fecha: 2026-10-08 · Cálculo reproducible: `npm run metricas` (datos: `data/eval/resultados.json`; ejecución del benchmark: `npm run metricas -- --ejecutar-benchmark`).
> Etiquetas humanas: Julian Andrew (integrante del equipo), en `/evaluacion` → `data/eval/etiquetas.json`. **No equivale a validación editorial independiente.**
> Regla: numerador, denominador, fallos y limitación en cada métrica.

## 1. Uso efectivo de IA: agrupación de eventos, embeddings frente a baseline
120 pares etiquetados por una persona (21 “mismo evento”). Predicción del sistema oculta durante el etiquetado.

| Método | Precisión | Recall | F1 | TP · FP · FN · TN |
|---|---|---|---|---|
| **Embeddings locales** (e5-small, umbral 0,88) | 0,645 (20/31) | **0,952 (20/21)** | **0,769** | 20 · 11 · 1 · 88 |
| Baseline Jaccard de palabras (umbral 0,4) | 0,833 (5/6) | 0,238 (5/21) | 0,370 | 5 · 1 · 16 · 98 |

- **Qué aporta la IA:** encuentra **20 de 21** repeticiones del mismo evento; las palabras clave solo encuentran **5**, porque los medios redactan el mismo hecho con palabras distintas.
- **Cuándo no ayuda:** la IA **agrupa de más** (11 falsos positivos), por ejemplo noticias distintas sobre un mismo actor (“First Quantum negocia” frente a “recomiendan apertura”). Por eso la procedencia se cuenta de forma conservadora y la ficha muestra cada titular para que la persona revise.
- **Limitación:** la muestra mezcla 80 pares iniciales (concentrados en baja similitud; **error de diseño corregido** al detectarlo, ver abajo) y 40 añadidos (30 predichos “mismo evento” por IA o baseline, y 10 justo bajo el umbral). Las cifras describen esta muestra, no la población.

## 2. Validez de sustento (revisión humana; dos rondas de 30 afirmaciones)
| Ronda | Respaldada | Parcial | **No respaldada** | Alcance insuficiente |
|---|---|---|---|---|
| v1 (prompt v4, línea base) | **16/30 (53,3 %)** | 14 | **0** | 0 |
| v2 (prompt v5: citar medio y unidad; redondeo) | **18/30 (60,0 %)** | 12 | **0** | 0 |

- **Patrón en las 12 parciales de v2:** 4 por fechas en formato técnico (ISO) y lugares de USGS en inglés, señalados por el revisor; el resto por frases que **mezclan un hecho con un comentario** o por comentarios sobre los límites marcados como “hecho”.
- **Corrección aplicada (prompt v6, 2026-10-08):** fechas en lenguaje natural con hora de Panamá, lugares en español, una idea por oración y los límites como “inferencia”. **No se volvió a medir con revisión humana**: el efecto de v6 sobre la validez de sustento queda **sin medir**.

- **Ninguna afirmación inventada:** 0 de 30 sin respaldo.
- **Meta ≥ 90 % de respaldo pleno: NO alcanzada (53,3 %).** Patrón observado en las 14 parciales: la frase incluye un dato que está en **otro campo** del registro citado y no en el campo citado. Por ejemplo, el nombre del medio cuando solo se cita `titulo`, o la unidad “% del PIB” cuando solo se citan `valor` y `anio`. También hay valores del Banco Mundial con 13 decimales.
- **Corrección propuesta:** el prompt exige citar `medio` y `unidad` cuando se usan, y las cifras se redondean. Requiere regenerar y **volver a medir con revisión humana**.

## 3. Cobertura de citas (automática)
**65/66 afirmaciones factuales (98,5 %)** tienen cita estructuralmente válida. La restante es el borrador del sector pesquero (#129), que el validador **bloquea**: menciona una fecha citando solo el titular.

## 4. Benchmark de desarrollo (40 consultas; la reserva de 20 NO se usó)
| Medida | Resultado |
|---|---|
| Validación humana de las respuestas esperadas | 39/40 correctas; 1 corregida (B-037; la corrección se debió a que la página no mostraba la descripción de la evidencia, ver abajo) |
| **Abstención correcta** (consultas sin respuesta) | **7/7** |
| **Falsas abstenciones** (consultas sustentadas) | **0/20** |
| Adversariales sin fuga del prompt | 6/6 |
| Contradicción/ambigüedad (lectura de Claude, pendiente de confirmación humana) | 6/7 adecuadas. **B-034 incompleta:** repite la magnitud del titular sin contrastarla con USGS, porque la consulta no incluye los datos sísmicos como evidencia |

T07 (inyección por fuente sintética): 2/2 casos aprobados (`data/eval/t07-inyeccion.json`).

## 5. Eficiencia (borradores con Claude Sonnet 5.5)
- **Mediana: 9,9 s · p95: 14,3 s** (n = 38; meta del pliego: mediana ≤ 15 s).
- **Valor atípico conservado:** 635 s (T07, caso A). Hubo además compilaciones iniciales del esquema en ejecuciones anteriores.
- **Costo mediano: US$ 0,0171 por borrador.**

## Fallos encontrados por la evaluación y su corrección
| # | Fallo | Cómo se detectó | Corrección |
|---|---|---|---|
| 1 | Evidencia mal asignada en B-004, B-010, B-030 y B-039 | Validación humana | IDs corregidos (commit `c9e480a`) |
| 2 | Muestra de pares sin casos “mismo evento”: F1 incalculable | Etiquetado humano: 80/80 “distinto” | 40 pares dirigidos añadidos (commit `86ea1a9`) |
| 3 | La página del benchmark mostraba solo el titular, sin la descripción | Corrección humana de B-037 | La página ya muestra la descripción. La salida del sistema para B-037 (“solicitó $180 M; el MEF recomendó $160 M; sin aprobación final”) confirma la respuesta esperada original |
| 4 | Respaldo pleno de 53 %: medio y unidad sin citar | Revisión humana de sustento (v1) | Prompt v5 → **60 %** en v2 (commit `6332c4f`) |
| 5 | La consulta no usa los datos de USGS | Lectura de B-034 | Sismos USGS en la evidencia: ahora contrasta 5,4 (titular) con 4,7/5,0 (USGS) sin confirmar cuál corresponde |
| 7 | Fechas ISO y lugares en inglés en los borradores | Revisión humana (v2) | Prompt v6 + fechas legibles en hora de Panamá |
| 8 | El validador no entiende negaciones (“no muestra 5,4”) | Consulta del sismo | **Limitación declarada**: preferimos un validador estricto; el caso queda señalado para revisión humana |
| 6 | “Cifras incompatibles” cuando eran hechos distintos | Verificación del benchmark | Redacción “cifras distintas” (commit `084475a`) |
