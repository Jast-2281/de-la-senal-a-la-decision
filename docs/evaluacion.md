# Evaluación (sección 9.1 del pliego)

> Estado al 2026-10-08: **instrumentos listos, métricas pendientes.** Ningún número de este documento es una métrica de calidad hasta que exista su etiqueta humana completa, un cálculo reproducible, numerador, denominador, fallos representativos y la limitación declarada (criterio acordado con Codex, `docs/007`).
> Regla del pliego: “Reportar numerador, denominador y fallos; no esconder errores tras un promedio”.

## Instrumentos
| Archivo | Contenido | Tamaño |
|---|---|---|
| `data/eval/benchmark.jsonl` | Consultas con respuesta esperada e IDs de evidencia validados contra el corpus | **60** = 30 sustentadas, 10 de contradicción/ambigüedad, 10 sin respuesta y 10 adversariales (sintéticas) · **40 de desarrollo + 20 de reserva** |
| `data/eval/pares-agrupacion.jsonl` | Pares de titulares para medir la agrupación (embeddings frente a Jaccard); las predicciones van en el archivo, pero no se muestran al revisor | **80** = 40 cercanos al umbral (muestreo estratificado por similitud) + 40 aleatorios · semilla fija |
| `data/eval/afirmaciones-muestra.jsonl` | Afirmaciones factuales (hecho/declaración) de borradores reales con su texto citado | **30** de 66 |
| `data/eval/etiquetas.json` | Registro de etiquetas humanas (valor, nota, persona revisora y fecha) | — |
| `data/eval/t07-inyeccion.json` | T07 de extremo a extremo con el modelo real (entrada, salida y verificaciones) | 2 casos (sintéticos) |

**Interfaz de revisión humana:** `/evaluacion` (etiquetado a ciegas; atajos de teclado).
**Reserva protegida:** los 20 casos de reserva no aparecen en la vista normal. Solo se validan al final, con el sistema congelado, en `/evaluacion?reserva=1`, y **no se usan para ajustar prompts, umbrales ni reglas.**

## Métricas
| Métrica | Conjunto | Fórmula | Estado | Limitación |
|---|---|---|---|---|
| Cobertura de citas | Afirmaciones factuales de todos los borradores | con cita válida / total factuales (validador automático) | Pendiente de cálculo | Comprueba que la cita existe y contiene las cifras; no que sea pertinente |
| Validez de sustento | `afirmaciones-muestra.jsonl` | respaldadas / revisadas (+ parciales, no respaldadas y de alcance insuficiente) | **Pendiente**: requiere 30 etiquetas | Un solo revisor del equipo; no equivale a validación editorial independiente |
| Abstención correcta | Benchmark “sin respuesta” | abstenciones correctas / consultas sin respuesta | **Pendiente** | Se reportan también las **falsas abstenciones** en consultas respondibles |
| Agrupación: embeddings frente a Jaccard | `pares-agrupacion.jsonl` | precisión, recall y F1 por par, para cada método | **Pendiente**: requiere 80 etiquetas | Un revisor; los titulares sobre un mismo actor pueden ser eventos distintos |
| Clasificación temática | — | macro-F1 de las reglas v2 | **No planificada** con el tiempo disponible; las reglas se ajustaron tras revisar el top-12 (se declara) | — |
| Utilidad del ranking | Top-5 de la agenda | Precision@5 | **Exploratoria** si no hay un editor independiente (pág. 9) | — |
| Eficiencia | Metadatos de `data/cache/llm/*.json` y `data/cache/consultas/*.json` | mediana y p95 de latencia; tokens y USD por borrador o consulta | **Pendiente de cálculo final** | Se conservan los valores atípicos en los datos crudos: primera compilación del esquema (≈173 s y ≈430 s) y **T07 caso A: 634 s**. Si se presenta una métrica sin ellos, se muestran ambos valores |
| Ahorro de tiempo | Tarea equivalente manual frente a asistida | minutos | **Pendiente** (≥3 ensayos) | Exploratoria, realizada por un integrante del equipo; no se infiere audiencia ni rentabilidad |

## Resultados ya observados (no son métricas agregadas)
- **T07:** 2/2 casos sintéticos aprobados (`data/eval/t07-inyeccion.json`).
- **Validación humana en curso:** el revisor detectó 3 consultas del benchmark con evidencia mal asignada (B-004, B-010 y B-030); se corrigieron en el commit `c9e480a`.
