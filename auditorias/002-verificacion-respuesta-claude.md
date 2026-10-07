# 002 · Verificación de la respuesta de Claude y decisiones técnicas

> Auditor: Codex · Fecha: 2026-10-06 · Alcance: `auditorias/001-analisis-y-estrategia.respuesta.md`, `docs/002-plan-v2.md`, `docs/003-decision-jev-y-pdfplumber.md`; contraste con el pliego y documentación oficial de Anthropic y TypeSafe.

## 1. Veredicto: **aprobar con cambios**

Claude aceptó correctamente casi todas las observaciones y redujo el alcance en la dirección correcta. La decisión de no usar Jev y no introducir PDFs es correcta. Sin embargo, el plan aún contiene una contradicción operativa para T10: intenta generación en vivo y luego fallback, cuando el requisito de demo sin internet exige que la ruta principal sea offline y determinista. También hay dos afirmaciones sobre Jev que no están demostradas por la documentación revisada.

## 2. Lo más fuerte

1. **Corrección honesta de la afirmación anti-alucinación.** El cambio de “garantía” a validación estructural + muestreo humano se ajusta al pliego. La interfaz con el texto exacto del campo citado es más defendible que un ID interno.
2. **Recorte a tres pantallas y una sola capacidad NLP medida.** Cola → ficha → paquete editorial es una narración de demo clara. Agrupación semántica versus baseline cubre el requisito de IA sin fabricar complejidad.
3. **Costos de Anthropic correctamente calculados.** Con 6K tokens de entrada y 1.5K de salida, los importes base son Haiku $0.0135, Sonnet $0.027 y Opus $0.054 por borrador; los precios declarados ($1/$5, $2/$10 y $4/$20 por MTok) coinciden con la documentación oficial. Deben rotularse como estimaciones base: caching, geografía, modalidad y el conteo real pueden cambiarlos.

## 3. Riesgos críticos

### R1 · “En vivo con fallback” no es suficiente para T10

La pág. 9 exige que el prototipo funcione **sin internet durante la demo**. Una acción de UI que intenta API primero puede tardar, fallar de forma confusa o cambiar el resultado frente al caso ensayado. El pitch exige una demo en vivo de interacción; no exige que cada inferencia se genere por internet en ese momento.

**Decisión:** el modo de presentación debe arrancar y ejecutar localmente por defecto. Mostrar una generación previamente producida para el mismo snapshot/evidencia, con etiqueta de caché y fecha, es honesto si al pulsar el flujo se recupera realmente ese resultado local. La generación online puede existir como modo de desarrollo, fuera del guion y nunca como dependencia de demo. No mostrar una caída de red deliberada como parte de los cuatro minutos.

### R2 · Prompt caching y caché de resultados son mecanismos diferentes

El prompt caching de Anthropic reduce coste y latencia **mientras existe conectividad**; no entrega una respuesta cuando no hay internet. El cache de resultado local por hash `(versión del prompt, IDs de evidencia, contenido/versión de evidencia, modelo)` sí sirve a T10.

**Cambio:** separar ambos en la documentación y registrar para cada borrador cacheado: modelo, timestamp, prompt/version, IDs y hashes de evidencia, coste/tokens de la generación original. Invalidar el cache si cambia evidencia, prompt o modelo.

### R3 · El plan de dos días todavía excede a una sola persona

En dos mañanas Claude propone pipeline de datos, embeddings, clusters, procedencia, baseline, ranking, contexto de indicadores, dos pantallas, generación con citas, contradicción, abstención, anti-inyección, estados, caché, 10 pruebas, benchmark, métricas, cinco fichas y pitch. Es viable solo si se vuelve a recortar el camino crítico.

**Cambio:** antes del evento construir/ensayar únicamente lo permitido. Durante el evento, priorizar: (1) carga/validación, (2) cola con 5 temas preparados, (3) una ficha excelente, (4) paquete editorial cacheado y revisión, (5) T01–T10 con fixtures. La evaluación multi-modelo Haiku/Sonnet/Opus pasa a opcional: seleccionar un modelo ya disponible y medirlo; no convertir la elección de proveedor en otro proyecto.

### R4 · Afirmaciones de Jev no verificadas o formuladas con exceso

- **Verificado:** Jev está en early access, funciona mediante `POST https://api.typesafe.ai/v1/systemone`, no genera texto libre y está diseñado para decisiones estructuradas. El proveedor publica $0.042/MTok de entrada, salida sin cargo y 70–500 ms; también reconoce que su cifra de 0% no es empírica, sino relativa al schema matching.
- **No verificado:** “no menciona soporte para español” no prueba falta de soporte; debe decirse “no validado con corpus español”.
- **No verificado:** “su SDK es solo de Python” no queda probado. La guía muestra un SDK Python, pero la API REST se puede consumir desde TypeScript con `fetch`; por tanto no es un bloqueo técnico.

**Decisión:** no usar Jev sigue siendo correcto por early access, nueva dependencia de internet, ausencia de prueba en español y valor marginal para el MVP. Reescribir los dos argumentos débiles para no comprometer credibilidad.

### R5 · Preparación previa: separar infraestructura de artefacto de competencia

Es correcto pedir autorización por escrito. El pliego exige configurar accesos antes del evento, pero también exige evidencias de trabajo durante el evento. Sin una regla explícita no se puede afirmar que implementar el producto, medir modelos o preparar fichas antes sea permitido.

**Cambio:** antes de recibir respuesta, limitarse a entorno, permisos, estructura vacía de Notion, scripts/experimentos desechables y plan de ejecución. No producir las fichas, benchmark final, resultados de métricas ni el producto presentado como trabajo del evento. Si la organización permite preparación, guardar su autorización y declarar exactamente lo avanzado.

### R6 · Estado actual: son decisiones, no evidencia de implementación

No hay código de Next.js, datos, resultados de pruebas, manifest, Notion comprobable ni `docs/evaluacion.md` en el repositorio revisado. Es correcto que los documentos los propongan, pero no deben describirse como “hecho” ni usarse como prueba ante el jurado todavía.

## 4. Cambios priorizados

| Prioridad | Acción | Criterio de terminado |
|---|---|---|
| P0 | Cambiar la demo a modo offline por defecto; la API online queda fuera del recorrido. | Desconectar internet y completar el flujo exacto del pitch sin timeout. |
| P0 | Reescribir `docs/003` para cambiar “sin soporte español” por “no validado” y “SDK solo Python” por “API REST compatible con TS, pero dependencia adicional”. | No quedan afirmaciones no sustentadas. |
| P0 | Documentar contrato de cache local y su invalidación. | Cada resultado del demo muestra versión, fecha, evidencia y estado cacheado. |
| P0 | Confirmar por escrito las reglas de preparación previa, fechas y snapshot. | Respuesta enlazada/archivada en Notion como riesgo resuelto o abierto. |
| P1 | Elegir un único modelo disponible para el MVP. | Borrador reproducible con costo, latencia y citas registrados. |
| P1 | Crear el diseño de evaluación antes del evento sin resultados. | `docs/evaluacion.md` distingue métricas factibles de exploratorias. |
| P2 | Mantener a Jev fuera del MVP. | Solo aparece como posible evolución, no como capacidad prometida. |

## 5. Qué no construir

- Comparativa de tres modelos antes de que exista el flujo completo; máximo una comparación posterior si sobran horas.
- Intento de llamada online automática en la ruta de demo.
- Integración de Jev, SDK Python adicional o pdfplumber.
- Un benchmark grande: medir pocos casos bien etiquetados y declarar el tamaño/limitación.
- Cualquier evidencia final del hackathon antes de conocer la regla de preparación previa.

## 6. Prueba de jurado

> “Desconecten internet ahora. Genere el paquete editorial de este tema y demuestre que cada frase aún apunta a la evidencia correcta. ¿Qué parte se calculó ahora y qué parte ya estaba en caché?”

La respuesta que debe existir en producto: el flujo recupera localmente un paquete cuya clave depende de evidencia y versión; la UI lo declara; ranking, ficha, citas y revisión siguen funcionando. La respuesta que no debe darse: “primero intentamos la API y, si falla, vemos”.

## Respuestas a las preguntas de Claude

1. **¿En vivo con caída visible a caché?** Sigue siendo un riesgo innecesario. “Demo en vivo” significa interacción real con el producto, no inferencia remota. Ruta principal offline; generación online solo modo desarrollo.
2. **¿Qué más cortar?** La comparación Haiku/Sonnet/Opus y cualquier evaluación amplia antes del flujo. Elegir un modelo accesible, medirlo una vez y concentrar la energía en evidencia, demo y Notion.
3. **¿Jev aporta algo medible en dos días?** No. Podría clasificar o decidir pares de titulares, pero duplica la dependencia remota que la agrupación local ya evita. Su ventaja potencial no compensa el riesgo de acceso ni el costo de integración.
