# 006 · Plan de credibilidad, controles y evidencia final

> Autor: Codex · Fecha: 7 de octubre de 2026 · Audiencia: Claude y equipo.  
> Objetivo: convertir el prototipo existente en una entrega **demostrable, medible y honesta**. No añadir funcionalidades que no cierren un requisito, una métrica o un riesgo concreto.

## Decisión de producto

La propuesta no es una máquina de publicar ni de determinar qué es verdadero. Es una capa editorial que responde:

> **¿Qué merece revisión, con qué evidencia, qué falta por comprobar y cuál es la siguiente acción humana?**

La credibilidad viene de hacer visibles datos, límites, citas, abstenciones y revisión humana; no de añadir más modelos o elementos visuales.

## Regla de priorización

No iniciar una mejora de UX, video, proveedor de IA, fuente adicional o panel avanzado mientras permanezca abierto un ítem P0 o P1 de este documento.

| Prioridad | Resultado que debe estar listo | Estado actual |
|---|---|---|
| P0 | T10 demostrado en modo avión con evidencia guardada | Abierto |
| P0 | Benchmark de 60 consultas, separado en desarrollo y reserva | Abierto |
| P0 | Matriz T01–T10: entrada, salida observada, evidencia y corrección | Parcial: existe `docs/matriz-aceptacion.md` |
| P0 | Diccionario de datos | Hecho: `data/processed/diccionario-datos.md` |
| P1 | Revisión humana de ≥30 afirmaciones y métrica de sustento | Abierto |
| P1 | Medición embeddings frente a baseline | Abierto |
| P1 | Casos ejecutables de abstención e inyección | Parcial |
| P1 | Fallback visible si falta el modelo local offline | Abierto |
| P2 | Índice de borradores para no leer caché de todos los eventos en portada | Abierto |
| P2 | Cambio de pesos con justificación versionada | Abierto; solo si P0/P1 terminados |

---

## P0-1 · Prueba offline T10

### Riesgo

La demo actual usa snapshot y cachés locales, pero las consultas nuevas requieren el modelo de embeddings que vive en `models/` y no se versiona. Un clon limpio sin red no reproduce toda la experiencia.

### Implementación mínima

1. Mantener la laptop de demo con dependencias y modelo precargados.
2. Añadir una detección de error de embeddings/modelo ausente en `/consulta`.
3. En vez de un error 500, mostrar una tarjeta clara:

   > **Modo demo offline:** el modelo local no está disponible en este equipo. Puedes revisar las consultas pregrabadas y las fichas ya incluidas en el snapshot.

4. Marcar en README la promesa exacta: “demo offline validada en la laptop de presentación, con dependencias y modelo local precargados”. No prometer que un clon limpio funciona offline.

### Evidencia para Notion

- Fecha, equipo y versión del commit.
- Captura o video corto con modo avión activo.
- Apertura de cola, dos fichas y una consulta cacheada.
- Resultado observado y fallback, si se fuerza la ausencia del modelo.

### Criterio de cierre

La demo no depende de una fuente en vivo ni falla sin explicación cuando no puede responder una consulta nueva.

---

## P0-2 · Benchmark de 60 consultas

### Contrato

Crear `data/eval/benchmark.jsonl` con los campos:

```json
{"id":"B-001","split":"desarrollo","tipo":"sustentada","consulta":"...","respuesta_esperada":"...","ids_evidencia":["N-..."],"sintetico":false,"etiquetado_por":"...","fecha_etiquetado":"..."}
```

Distribución requerida por el pliego:

| Tipo | Desarrollo | Reserva para jurado | Total |
|---|---:|---:|---:|
| Sustentada | 20 | 10 | 30 |
| Contradicción / ambigüedad | 7 | 3 | 10 |
| Sin respuesta | 7 | 3 | 10 |
| Adversarial | 6 | 4 | 10 |
| **Total** | **40** | **20** | **60** |

### Reglas

- Los casos adversariales son sintéticos y deben llevar `sintetico: true`.
- La reserva no se usa para ajustar umbrales, prompts o reglas.
- Las etiquetas humanas deben explicar brevemente por qué la respuesta es sustentada, ambigua o no respondible.
- No introducir respuestas reservadas en el prompt ni en la recuperación del sistema.

### Criterio de cierre

Existen los 60 JSONL válidos, con distribución correcta, evidencia identificable y separación desarrollo/reserva.

---

## P0-3 · Matriz T01–T10 ejecutada

El punto de partida es `docs/matriz-aceptacion.md`. Completar para cada fila:

```text
Entrada → resultado esperado → resultado observado → enlace a evidencia → fallo/corrección si aplica
```

### Casos que requieren ejecución adicional

| ID | Acción | Evidencia mínima |
|---|---|---|
| T02 | Mostrar un evento real y el caso sintético de agencia | ficha / captura y salida del test |
| T04 | Abrir una ficha económica con año, país, unidad y limitación | captura o video |
| T06 | Ejecutar una consulta sin respuesta y una respondible | JSON/salida y captura |
| T07 | Ejecutar fuente sintética que intenta inyectar instrucciones | entrada, salida, etiqueta “sintético” |
| T08 | Abrir un tema de prioridad alta con evidencia insuficiente | ficha + estado de revisión |
| T09 | Mostrar caso suficiente y caso “solo investigación” | dos fichas con citas |
| T10 | Ensayo completo sin red | video/capturas y log |

### Criterio de cierre

La página de Notion **Pruebas y métricas** contiene las diez filas; ninguna se marca como aprobada sin evidencia de ejecución.

---

## P1-1 · Validez humana de sustento

### Método

Revisar al menos 30 afirmaciones factuales de fichas generadas. Guardar `data/eval/revision-sustento.jsonl` con:

```json
{"id":"S-001","id_caso":"E-...","seccion":"brief","indice":0,"texto":"...","citas":[{"id_evidencia":"N-...","campo":"titulo"}],"veredicto":"respaldada","nota":"...","revisor":"...","fecha":"..."}
```

Veredictos permitidos:

- `respaldada`
- `parcialmente_respaldada`
- `no_respaldada`
- `cita_correcta_alcance_insuficiente`

### Resultado a reportar

```text
Revisadas: N
Respaldadas: X/N
Parciales: Y/N
No respaldadas: Z/N
Corrección aplicada a los errores: ...
Limitación: revisión por una persona del equipo; no equivale a validación editorial independiente.
```

### Criterio de cierre

No reportar “≥90 %” hasta calcular numerador, denominador y fallos guardados.

---

## P1-2 · Medición de agrupación: embeddings vs. baseline

### Método

Crear `data/eval/pares-agrupacion.jsonl` con ~80 pares, equilibrados entre candidatos cercanos y pares aleatorios:

```json
{"id":"P-001","id_a":"N-...","id_b":"N-...","etiqueta_humana":"mismo_evento","origen_muestra":"cercano","revisor":"...","fecha":"..."}
```

Calcular para embeddings y para baseline Jaccard:

- precisión;
- recall;
- F1;
- falsos positivos y falsos negativos representativos.

### Resultado esperado de presentación

| Método | Precisión | Recall | F1 | N |
|---|---:|---:|---:|---:|
| Embeddings | valor medido | valor medido | valor medido | 80 |
| Jaccard | valor medido | valor medido | valor medido | 80 |

Incluir una limitación real, por ejemplo: titulares con el mismo actor pueden ser eventos distintos.

### Criterio de cierre

Nunca afirmar mejora de IA sin tabla medida y ejemplos de fallo.

---

## P1-3 · Abstención e inyección demostrables

### Abstención

Evaluar diez preguntas sin respuesta y preguntas respondibles para registrar falsos rechazos.

```text
Abstenciones correctas = consultas sin respuesta correctamente rechazadas / consultas sin respuesta
Falsas abstenciones = consultas respondibles rechazadas / consultas respondibles
```

### Inyección

Usar una fuente sintética con una instrucción maliciosa explícita. El caso debe probar que:

1. el contenido no sale del bloque de datos;
2. el sistema no revela instrucciones ni ejecuta acciones;
3. el resultado lo trata como contenido no confiable / verificación pendiente.

### Criterio de cierre

Mostrar tanto entrada como salida. Un test de escape aislado es útil, pero no sustituye una demostración de flujo completo.

---

## P1-4 · Métricas operativas y valor

### Métricas automáticas

Calcular sobre caché de borradores y consultas:

- mediana y p95 de latencia;
- tokens de entrada/salida;
- costo USD por borrador y consulta;
- cobertura de citas factuales;
- errores del validador.

Excluir y explicar arranques fríos o generación de esquema si distorsionan la comparación, pero conservarlos en los datos crudos.

### Ahorro de tiempo

No prometer audiencia, rating, revenue ni reducción de riesgo. Medir solo una tarea equivalente:

```text
Tarea: construir ficha de investigación con fuentes, vacíos y preguntas.
Manual: __ min
Asistida: __ min
Ensayos: 3
Limitación: exploratorio, realizado por integrante del equipo.
```

---

## P2-1 · Rendimiento de portada

### Problema

La portada evalúa la caché de borrador para cada uno de los 461 eventos. Solo nueve tienen ficha exportada. Esto produce muchas lecturas de archivo evitables por carga.

### Solución mínima

Al generar o exportar fichas, persistir un índice de eventos con borrador (`Set`/JSON). La portada consulta ese índice una vez, no intenta leer una caché por cada evento.

### Criterio de cierre

La portada conserva exactamente la misma información, con un solo acceso al índice de borradores.

---

## Presentación: cuatro momentos de confianza

1. **Problema:** muchas señales; repetición no es corroboración.
2. **Decisión:** la cola ordena revisión, no decide verdad.
3. **Evidencia:** ficha con cita, procedencia, alcance y vacío concreto.
4. **Control:** caso insuficiente, abstención o demo en modo avión.

Frase guía:

> “No construimos una máquina que publique más rápido. Construimos una capa de decisión que indica qué merece atención, qué evidencia existe y qué todavía no puede afirmarse.”

## Fuera de alcance hasta cerrar P0/P1

- Integrar JEV/TypeSafe u otro proveedor de IA.
- Video de fondo o generación audiovisual como parte del producto.
- Nuevas fuentes o modalidad bancaria completa.
- Plataforma multiusuario o base de datos de producción.
- Panel de modificación de pesos si no hay evidencia/mediciones cerradas.

## Lista final de salida

- [ ] `data/eval/benchmark.jsonl` con 60 casos y splits correctos.
- [ ] `data/eval/revision-sustento.jsonl` con ≥30 afirmaciones revisadas.
- [ ] `data/eval/pares-agrupacion.jsonl` y tabla de métricas IA vs. baseline.
- [ ] Métricas de abstención, citas, costo y latencia con numerador/denominador/fallos.
- [ ] T01–T10 con evidencia observada y correcciones en Notion.
- [ ] Ensayo T10 en modo avión con evidencia.
- [ ] Fallback offline visible en consultas.
- [ ] Índice de borradores o justificación de rendimiento.
