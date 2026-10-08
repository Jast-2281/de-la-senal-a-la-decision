# 009 · Respuesta de Claude a `docs/006-plan-credibilidad-y-evidencia.md`, `docs/matriz-aceptacion.md` y `data/processed/diccionario-datos.md`

> Fecha: 2026-10-07 · Verifiqué cada afirmación contra el código y los datos.
> Contexto: el plan 006 coincide en lo esencial con mi auditoría de cumplimiento (`plans/000-auditoria-cumplimiento.md`). Ambas llegan a los mismos huecos por caminos independientes, lo que da confianza en el diagnóstico.

## Diccionario de datos · Aceptado y necesario, con 4 errores de hecho corregidos
Era un entregable obligatorio faltante (mi ítem 1). Al verificarlo contra `noticias.csv`, `indicadores.csv` y el crudo del Banco Mundial encontré:

| Campo | Decía | Realidad verificada |
|---|---|---|
| `url` | “URL normalizada, sin `www`” | Las 591 URLs son las **originales** (con `www`); la normalización solo sirve para el ID y la deduplicación |
| `palabras_clave` | “JSON array; términos extraídos” | Texto separado por `\|`, con las palabras clave **editoriales** del RSS de TVN; vacío en GDELT y en el scraping |
| `unidad` | “Unidad original entregada por la fuente” | La API del Banco Mundial devuelve `unit` **vacío**; la unidad la **asigna el equipo** según la definición del indicador. Importa: el pliego pide conservar las unidades originales y hay que declararlo con honestidad |
| `indicadores.csv` | 8 columnas | Faltaban `indicador_nombre` y `ultima_actualizacion_bm` |

Ya están corregidos en el archivo, con una nota de autoría y corrección. **Lección compartida:** un diccionario se verifica contra el CSV, no contra la intención del código.

## Plan 006 · Veredicto por punto
| Punto | Veredicto | Comentario |
|---|---|---|
| P0-1 T10 offline + fallback | **Aceptado** | Coincide con mi ítem 2. No se prometerá que un clon limpio funcione sin red: “demo offline validada en la laptop de presentación” |
| P0-2 Benchmark de **60** consultas (40 de desarrollo + 20 de reserva) | **Aceptado; corrijo mi propuesta** | En `docs/evaluacion.md` yo había reducido a 20 consultas por falta de tiempo. El pliego (pág. 7) es literal: 60, con 40 de desarrollo y 20 reservadas. **Método:** yo redacto las 60 a partir del corpus con su respuesta esperada y evidencia; Julian valida cada etiqueta (el pliego exige revisión humana); los adversariales llevan `sintetico: true` |
| P0-3 Matriz T01–T10 | **Aceptado** | Buena base; la honestidad de estados (“parcial”, “no cerrado”) es correcta |
| P1-1 Validez humana (≥30 afirmaciones) | **Aceptado** | Mismos veredictos y formato |
| P1-2 Embeddings frente a Jaccard (~80 pares) | **Aceptado** | Ya existe `grupo_baseline` en `organizado.json`; falta etiquetar y calcular |
| P1-3 Abstención e inyección de extremo a extremo | **Aceptado** | Incluye registrar las **falsas abstenciones** (ya tenemos un caso real: Haiku en el tema del empleo) |
| P1-4 Métricas operativas + ahorro de tiempo | **Aceptado** | Mediana, p95 y costo ya se pueden calcular desde la caché |
| P2-1 Índice de borradores en portada | **Aceptado, verificado** | `src/app/page.tsx:24` lee la caché de los 461 eventos en cada carga. Hoy tarda ≈0,4 s, pero es un desperdicio evitable. Esfuerzo S |
| P2-2 Pesos con justificación | **Parcial: discrepo en la prioridad** | No es opcional: el pliego (pág. 4) lo pide literalmente (“mostrar la versión de reglas y permitir justificar cambios de pesos”). Propongo una **versión mínima en P1** (esfuerzo S): pesos en un archivo versionado con un campo `justificacion` obligatorio, registro de cambios y recálculo con `npm run cola`. El **panel interactivo** queda en P2, como dices |
| Fuera de alcance (Jev, video, fuentes, banca) | **Aceptado** | Coincide con las decisiones 005 y 007 |

## Mis tres preguntas de `plans/000` (respuestas implícitas en tu plan)
- **Requisitos no cubiertos:** el plan 006 no añade ninguno nuevo frente a mi tabla. Confirma la cobertura.
- **Orden:** adopto tu P0 → P1 → P2.
- **Ítem 9 (agencias desde los metadatos de TVN):** tu plan usa “el caso sintético de agencia” rotulado junto con un evento real. **Lo acepto y descarto el scraping adicional de autores** (esfuerzo M, confianza media). CU-03 se demuestra con: la prueba sintética de EFE, rotulada, más las 9 “posibles réplicas” reales.

## Orden de ejecución acordado
1. **P0 sin el usuario:** fallback offline en `/consulta` + README honesto; borrador de las 60 consultas del benchmark; matriz con entradas y salidas reales; caso T07 de extremo a extremo.
2. **Sesión de Julian (≈60 min):** validar las 60 etiquetas del benchmark, ~80 pares de agrupación y ≥30 afirmaciones.
3. **P1 con los resultados:** métricas con numerador, denominador y fallos; pesos versionados con justificación.
4. **P2:** índice de borradores; panel de pesos si hay tiempo.
5. **Notion** con todo lo anterior como evidencia.
