# 001 · Análisis del reto y estrategia propuesta

> Autor: Claude · Fecha: 2026-10-06 · Estado: **propuesta para auditoría de Codex**
> Fuente: `reto/hackIAthon - reto TVN Media.pdf` (12 págs.) y `reto/Importante, LEER - Mecánica redes sociales.pdf`.

## 1. Qué es realmente este reto

No es un reto creativo abierto: es un **pliego técnico muy especificado** con rúbrica, pruebas de aceptación (T01–T10), casos de uso (CU-01…CU-05), contrato de datos y requisitos de Notion. Gana quien **cumpla todo de forma verificable** y luego destaque en lo difícil.

La filosofía del jurado está escrita explícitamente (pág. 12):
> “La calidad de la decisión asistida, la trazabilidad en Notion y la capacidad de reconocer lo que no se sabe importan más que el volumen de texto generado.”

**Implicación:** el típico “chatbot que resume noticias” pierde. Lo que puntúa es: procedencia, abstención, contradicciones, honestidad temporal y métricas con numerador/denominador.

## 2. Rúbrica (100 pts) y dónde se gana

| Dimensión | Peso | Qué exige para 5/5 | Nuestra palanca |
|---|---|---|---|
| Utilidad TVN/banca | 20 | Usuario claro, flujo realista, impacto sin exagerar | Una sola persona usuaria (editor/a de TVN) y un recorrido impecable |
| Prototipo y flujo completo | 20 | Carga → consulta → priorización → ficha → borrador → revisión, con datos comunes | Las 7 etapas funcionando de punta a punta, offline |
| Uso efectivo de IA | 15 | NLP/ML sustantivo + **baseline** + mejora o limitación **medida** | Embeddings para agrupar/clasificar vs. baseline por palabras clave, con F1 |
| Evidencias y explicabilidad | 15 | Citas pertinentes, puntaje reproducible, contradicciones, abstención | Validador automático de citas + desglose del puntaje |
| Notion | 15 | Trabajo trazable **durante** el evento, catálogo, pruebas, pitch navegable | Registrar desde la hora 0; nuestras auditorías Codex↔Claude son evidencia real de decisiones |
| Calidad técnica | 10 | Reproducible, arquitectura proporcional, pruebas, métricas | Un comando para correr todo; tests T01–T10 automatizados |
| Seguridad/ética | 5 | Controles operativos, derechos, resistencia a abuso | Anti-inyección probado (T07), estados de revisión, sin PII |

**Puertas de admisión (sin ellas = 0):** Notion accesible al jurado, ≥8 tareas, ≥3 decisiones justificadas, catálogo de fuentes, ≥5 fichas (una sin evidencia suficiente), matriz T01–T10 con métricas, pitch de 10 min **desde Notion**, repo GitHub con README/instalación/`.env.example`/pruebas, demo sin fuente en vivo, cero secretos.

## 3. Decisión de modalidad

**Recomendación: solo TVN (editorial), con salidas principal + digital.**
- Es la modalidad recomendada por el pliego y TVN es el socio del reto (hashtag oficial `#AgenteTVNMedia`).
- El pliego dice que la bancaria **no** exige un segundo producto. Hacer ambas diluye el tiempo.
- La banca aparece solo como una diapositiva de “mismo núcleo, otro entregable” en próximos pasos, sin construirla.

## 4. Ángulo diferenciador (la tesis del pitch)

> **“No te decimos qué es verdad. Te decimos qué tan sustentado está, quién lo dice realmente y qué falta comprobar.”**

Tres capacidades que la mayoría de equipos hará mal y nosotros convertimos en el centro de la demo:
1. **Contador de procedencia independiente** (CU-03, T02): “12 titulares → 1 evento → 3 procedencias independientes”. Una agencia replicada cuenta como una sola fuente.
2. **Semáforo de evidencia separado de la prioridad** (T08): un tema puede ser *prioridad alta* con *evidencia insuficiente*; el sistema lo marca como “requiere investigación”, nunca habilita la publicación.
3. **Honestidad temporal y abstención** (CU-02, CU-04, T03, T04, T06): “PIB 2023 del Banco Mundial (anual), no es una medición de hoy”; “no tengo esa cifra en el corpus; para responder se necesita X”.

## 5. Arquitectura propuesta (proporcional a 3 días)

```
reto/ (pliego)    data/raw/ → [1 Cargar: validar + reporte de calidad] → data/processed/
                                     ↓
           [2 Organizar] embeddings multilingües (locales) → clasificación temática + agrupación de eventos
                                     ↓              + detección de procedencia (agencias replicadas)
           [3 Contextualizar] tabla explícita tema → indicador BM / sismo USGS (período, unidad, límites)
                                     ↓
           [4 Priorizar] P = 30R+25I+20U+15N+10E, reglas versionadas en YAML + estado de evidencia aparte
                                     ↓
           [5 Explicar] ficha: qué se reporta, quién, qué está respaldado, qué falta, acción sugerida
                                     ↓
           [6 Producir] LLM con salida JSON estructurada: cada afirmación → id_evidencia + campo
                        → VALIDADOR determinista rechaza afirmaciones sin cita válida → abstención
                                     ↓
           [7 Revisar] estados: nuevo / en revisión / requiere evidencia / aprobado como borrador / descartado
                        → fichas.jsonl → Notion (manual u opcionalmente por API)
```

Decisiones de diseño clave:
- **Offline por diseño (T10):** embeddings con un modelo local; resultados del LLM cacheados por hash de (prompt + evidencia). La demo corre sin internet y lo declara.
- **El LLM nunca es la fuente de verdad:** solo redacta sobre la evidencia recuperada; un validador en código verifica que cada cita apunte a un ID y campo existentes. Esto convierte la anti-alucinación en una garantía comprobable, no en una promesa.
- **Anti-inyección (T07):** el texto de las fuentes va delimitado como dato; prueba automatizada con una fuente sintética maliciosa marcada como tal.
- **Baseline obligatorio:** clasificación por palabras clave y ranking por fecha frente a la versión con embeddings; se reporta dónde la IA mejora y dónde **no**.

## 6. Contradicciones y vacíos detectados en el pliego (preguntar a la organización)

1. **Conflicto de fechas:** las noticias se piden de “los 30 días previos a la extracción” (≈ sept. 2026), pero las normas de extracción dicen “excluir registros fuera de [2024-01-01, 2025-10-01)”. Ambas reglas no pueden cumplirse a la vez. **Preguntar cuál prevalece.**
2. **¿Quién entrega el snapshot?** La pág. 6 dice que la organización congela un paquete común, pero el evento parece haber empezado. Si no llega a tiempo, construimos nuestra propia ingesta **respetando el contrato de datos de la sección 7**, para poder cambiarla por el paquete oficial sin tocar el resto.
3. **Benchmark de 60 consultas:** no queda claro si lo prepara la organización o el equipo. Si es del equipo, necesitamos etiquetado humano (40 de desarrollo).
4. **Precision@5** requiere una selección independiente de un editor. El pliego dice que la organización designará a una persona editorial: hay que pedir acceso temprano. Sin ella, la métrica se declara “exploratoria”.
5. **GDELT no da fecha de publicación**, solo `seendate` (detección). `fecha_publicacion` será nula en esos registros y debe mostrarse así, no rellenarse.

## 7. Qué NO construir

- Modalidad bancaria completa, ingesta de la SBP (D), monitoreo continuo o fuentes en vivo.
- Lectura de artículos completos o scraping: solo titulares, descripciones del RSS y metadatos, con la etiqueta “basado únicamente en titular/metadatos”.
- Chat libre como pantalla principal. Las consultas en español sí, pero dentro del flujo bandeja → ficha → borrador.
- Autenticación, multiusuario, despliegue sofisticado.

## 8. Plan de 3 días (alineado con el pliego)

| Tramo | Entregable verificable | Registro en Notion |
|---|---|---|
| Día 1 AM | Notion con las 8 secciones obligatorias; repo con README; snapshot cargado + reporte de calidad (T01) | Inicio del reto, catálogo de datos, primeras decisiones |
| Día 1 PM | Embeddings, clasificación, agrupación de eventos y procedencia; ~150 titulares etiquetados a mano | Diseño de solución, baseline acordado |
| Día 2 | Puntaje + estado de evidencia, ficha, generación con validador de citas, interfaz, estados de revisión | Fichas de casos (≥5), prompts y versiones |
| Día 3 AM | T01–T10 automatizados, benchmark, métricas (F1, abstención, citas, P@5, latencia, costo) | Matriz de pruebas, una prueba fallida y su corrección |
| Día 3 PM | Pitch en Notion, ensayo de demo offline, verificación de accesos del jurado | Presentación al jurado |

## 9. Decisiones pendientes del equipo (bloquean el arranque)

- Fechas y horario exactos del evento; tamaño y habilidades del equipo.
- ¿La organización ya entregó el snapshot común? ¿Acceso a Notion Business confirmado?
- Proveedor de LLM y presupuesto (el pliego exige documentar el costo medido).
- Stack de la interfaz: Python + Streamlit (más rápido) o Next.js + API en Python (más pulido, dos stacks).

## 10. Preguntas para Codex

1. ¿El ángulo “procedencia + evidencia + abstención” es suficientemente diferenciador o todos los equipos llegarán a lo mismo leyendo el pliego?
2. ¿Qué eliminarías de la sección 5 para que la demo sea sólida en 3 días?
3. ¿Qué pregunta del jurado (pág. 11) nos haría quedar peor hoy con este diseño?
