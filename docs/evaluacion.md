# Diseño de evaluación (sección 9.1 del pliego)

> Estado: **diseño**. Los resultados se llenan solo con numerador, denominador y fallos guardados en `data/eval/`. Ningún número de esta tabla es una promesa.
> Regla del pliego: “Reportar numerador, denominador y fallos; no esconder errores tras un promedio”.

| Métrica | Conjunto | Responsable humano | Tamaño | Fórmula | Resultado | Fallos | Limitación |
|---|---|---|---|---|---|---|---|
| Cobertura de citas | Afirmaciones factuales (hecho/declaración) de los borradores generados | Automático (validador) | Todas las emitidas | con cita válida / total factuales | — | — | Comprueba que la cita existe y que contiene las cifras; no comprueba pertinencia |
| Validez de sustento | Muestra de afirmaciones factuales | Julian (revisor) | ≥30 si se producen | respaldadas / revisadas | — | — | Un solo revisor del equipo, que no es independiente |
| Abstención correcta | Consultas sin respuesta en el corpus (CU-04, T06) | Julian etiqueta qué consultas no tienen respuesta | ≥10 | abstenciones correctas / consultas sin respuesta | — | — | También se registran las **abstenciones incorrectas** en consultas respondibles (ya hay un caso medido: Haiku 4.5 se abstuvo en el evento del empleo) |
| Agrupación de eventos (IA vs. baseline) | Pares de titulares “mismo evento / distinto evento” | Julian etiqueta los pares | ~80 pares (40 candidatos cercanos + 40 aleatorios) | precisión, recall y F1 por par para embeddings y para Jaccard | — | — | Etiquetado por una sola persona; muestreo explicado en `data/eval/pares.jsonl` |
| Clasificación temática | Titulares etiquetados por tema | Julian | ~60 | macro-F1 de las reglas v2 | — | — | Las reglas se ajustaron tras revisar el top-12: se declara |
| Utilidad del ranking | Top-5 de la cola | Persona editorial independiente | 5 | Precision@5 | — | — | **Exploratoria** si no hay un editor independiente (pág. 9) |
| Eficiencia | Generaciones de borradores | Automático | Todas | mediana y p95 de latencia; tokens y USD por borrador | ver `data/cache/llm/*.json` | — | Primera llamada ≈173 s por la compilación del esquema; se reporta aparte |
| Ahorro de tiempo | Tarea equivalente manual vs. asistida | Julian | ≥3 tareas | minutos manual vs. asistido | — | — | Hipótesis de valor si n es pequeño; no se infiere audiencia ni rentabilidad |

## Benchmark de consultas (pág. 7)
- Formato `data/eval/benchmark.jsonl`: `{id, tipo: sustentada|contradiccion|sin_respuesta|adversarial, consulta, respuesta_esperada, sintetico: bool}`.
- Tamaño realista para una sola persona en el tiempo disponible: **20 consultas** (10 sustentadas, 3 de contradicción, 4 sin respuesta y 3 adversariales). Se declara la diferencia con las 60 del pliego.
- Los casos adversariales (T07) son **sintéticos** y se rotulan como tales.
