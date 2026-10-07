# 005 · ¿Se puede bajar el costo de IA? (Jev, pdfplumber y otras palancas)

> Autor: Claude · Fecha: 2026-10-06 · Estado: **para opinión de Codex**
> Origen: el usuario pregunta si Jev (TypeSafe) o pdfplumber podrían bajar el costo. Complementa `docs/003` con datos medidos.

## 1. En qué se va el dinero hoy (medido, no estimado)
Fuente: metadatos de `data/cache/llm/*.json` y `data/cache/consultas/*.json`.

| Uso | n | Total | Mediana por unidad | Desglose |
|---|---|---|---|---|
| Borradores editoriales (Sonnet 5.5) | 37 | US$ 0,604 | **US$ 0,0169** | **85 % tokens de salida** (redacción) · 13 % entrada · 2 % lectura de caché |
| Consultas al corpus | 10 | US$ 0,078 | US$ 0,0078 | — |

- Los ~US$ 0,68 del día son sobre todo **iteración de desarrollo**: regeneramos los mismos temas varias veces al cambiar el prompt. No reflejan el costo operativo.
- **Proyección operativa (estimación, no medición):** 50 temas redactados por día × US$ 0,017 ≈ **US$ 0,85 al día, unos US$ 25 al mes**.

## 2. ¿Jev reduce ese costo? No en este flujo
- El 85 % del costo es **redacción de texto libre** (brief, guion, copy). Jev, por diseño, **no genera texto libre**: solo devuelve valores estructurados (clasificar, puntuar, decidir). No puede reemplazar el paso que cuesta.
- Los pasos donde Jev sí encajaría (clasificación temática, “mismo evento sí/no”, estado de evidencia) **ya cuestan US$ 0**: se resuelven con reglas y embeddings locales, sin conexión.
- **El único punto posible** es un filtro previo, “¿vale la pena redactar este tema?”, o “¿la evidencia responde la consulta?”. Pero ya existe gratis: el estado de evidencia y la abstención determinista por umbral evitan llamar al modelo cuando no corresponde.
- **Costos de integrarlo:** una dependencia en la nube (choca con T10, la demo sin internet), acceso anticipado sin garantía, ningún resultado probado en español y una métrica más que validar con 2 días por delante.
- **Conclusión:** el ahorro posible es cercano a 0, porque lo que Jev haría ya es gratis. **Se mantiene como hipótesis para la escala**, en la diapositiva de próximos pasos.

## 3. ¿pdfplumber reduce el costo? No
pdfplumber **extrae texto de PDFs**: no es un modelo y no cambia cuántos tokens generamos. Ninguna fuente de la ventana oficial es un PDF. Solo tendría sentido si se agregara una fuente oficial en PDF (por ejemplo, informes del INEC o de la SBP), y como **extractor de datos**, no como ahorro.

## 4. Palancas que SÍ bajan el costo (ordenadas por impacto)
| # | Palanca | Ahorro esperado | Esfuerzo | Riesgo |
|---|---|---|---|---|
| A | **Guion y copy bajo demanda:** generar primero solo el brief y las preguntas; el guion y el copy, solo cuando la persona revisora apruebe el brief | ~40–50 % de los tokens de salida por tema; además no se redactan piezas de emisión para temas que se descartan | Bajo: el esquema ya separa las secciones | Bajo; mejora la lógica editorial (alineado con T08) |
| B | **Batch API (−50 %)** para pregenerar los borradores del día en lote, porque no son interactivos | 50 % del costo de pregeneración | Bajo | Latencia de minutos u horas: solo para el lote nocturno, no para la demo |
| C | Haiku 4.5 para consultas cortas | Hasta −50 % en consultas | Medio: requiere medir | **Medido:** Haiku se abstuvo incorrectamente en el caso del empleo (n = 1). No se adopta sin evidencia |
| D | Caché de prompt + caché de resultados | Ya aplicado | — | — |

## 5. Recomendación
- **Para la demo:** no tocar nada. El costo actual (≈US$ 0,017 por borrador) ya es defendible.
- **Para el pitch:** presentar el costo como un **argumento a favor**: “≈2 centavos por borrador; unos US$ 25 al mes para 50 temas diarios (estimación)”, frente a una hora de trabajo de un periodista.
- **Si sobra tiempo después de los P0:** implementar la palanca A, que reduce costo y además mejora el flujo editorial.

## Preguntas para Codex
1. ¿Coincides en que Jev no tiene dónde aportar ahorro medible en este flujo, o ves un punto que estoy pasando por alto?
2. ¿La palanca A (guion y copy bajo demanda) justifica tocar el producto ahora, o la dejamos como próximo paso por el congelamiento?

---

## 6. Actualización tras leer la skill oficial `typesafe-ai` y la documentación en vivo (2026-10-06, 21:10)
Fuentes: `SKILL.md` de la skill del usuario; https://docs.typesafe.ai/cookbooks/citation_check.md; https://docs.typesafe.ai/sdk/javascript.md.

**Datos nuevos que corrigen o precisan lo anterior:**
- Hay **SDK de JavaScript/TypeScript** (`@typesafe-ai/sdk`, Node ≥ 20, variable `TYPESAFE_API_KEY`). Integrarlo es técnicamente sencillo en nuestro stack.
- Jev ofrece tres primitivas: `Choice` (una opción entre varias), `Noul` (probabilidad de sí/no) y `Score` (grado). **No genera texto**: la conclusión de costo de la sección 2 se mantiene.
- **Cookbook “citation check”:** un `Choice` sobre `{claim, section}` con las opciones `supports / contradicts / says_nothing`. Umbral sugerido de autoaceptación: 0,8; por debajo, revisión humana. Latencia reportada de 0,15–0,30 s. Es una prueba sobre un documento en inglés (RFC 7519, 8 citas). **No hay datos sobre español.**

**Revisión de la postura:** Jev **no baja el costo de redacción**, pero puede **subir la calidad** en dos puntos donde hoy tenemos un hueco declarado:

| # | Uso | Hueco que cubre | Primitiva | Valor para la rúbrica |
|---|---|---|---|---|
| J1 | **Verificador semántico de citas:** cada afirmación con su campo citado → respalda / contradice / no dice nada | Nuestro validador solo comprueba existencia y cifras; la pertinencia queda para revisión humana (auditoría 001, R1) | `Choice` | Evidencias y explicabilidad (15) + Uso efectivo de IA (15): una segunda capacidad medible frente a la revisión humana |
| J2 | **Filtro de respuesta en consultas:** “¿esta evidencia responde la consulta?” antes de llamar a Sonnet | El umbral de coseno se infla con “Panamá” (0,89 con titulares irrelevantes) | `Noul` por noticia recuperada | Abstención más precisa + ahorro marginal en las abstenciones |

**Condiciones para adoptarlo (todas necesarias):**
1. El usuario tiene una API key de TypeSafe activa (no lista de espera).
2. **Prueba de 30 min en español** con nuestros datos: los veredictos J1 sobre 20 afirmaciones de los borradores en caché, frente al etiquetado humano de Julian. Se adopta solo si la concordancia es razonable, reportada con numerador y denominador.
3. Los veredictos se calculan al generar y **se guardan en caché**, igual que los borradores. La demo sigue sin depender de la red (T10).
4. Se hace **después** de las puertas de admisión (Notion, entrega, commits).

Si falla cualquiera de las condiciones, se documenta como **probado y descartado**, lo que también es evidencia válida para Notion.

## Pregunta adicional para Codex
3. Dado el congelamiento de alcance que pediste, ¿J1 (verificador semántico de citas) justifica una excepción condicionada a la prueba de 30 min, o lo dejamos para próximos pasos?

## 7. Decisión final (2026-10-06, 21:35): J1 descartado
El usuario decide **no integrar Jev (J1)**: el beneficio (etiqueta semántica auxiliar) no compensa el costo de integración, la dependencia remota y la validación en español con el tiempo restante. Coincide con la auditoría 007 de Codex. Queda como hipótesis de escala en “próximos pasos”. **No se presenta al jurado como capacidad actual.**
