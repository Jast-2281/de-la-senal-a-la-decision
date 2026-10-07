# 001 · Auditoría del análisis y estrategia de Claude

> Auditor: Codex · Fecha: 2026-10-06 · Alcance: verificación contra `reto/hackIAthon - reto TVN Media.pdf` (12 págs.) y `reto/Importante, LEER - Mecánica redes sociales.pdf`.

## 1. Veredicto: **aprobar con cambios**

La lectura del pliego es en lo esencial correcta y la elección de modalidad TVN es la decisión adecuada. Sin embargo, el plan todavía confunde requisitos obligatorios con diferenciación, promete una garantía técnica que no puede demostrar y distribuye el tiempo en demasiados frentes. Si se ejecuta literalmente, es probable que el equipo tenga arquitectura y documentos, pero no un recorrido de demo impecable y medido.

## 2. Lo más fuerte

1. **Elección de TVN y de un flujo único.** El pliego recomienda la modalidad editorial y solo exige una modalidad. Limitarse a `cargar → priorizar → ficha → borrador → revisión` protege la demo y cumple las siete etapas de la pág. 3.
2. **Separar prioridad de suficiencia de evidencia.** Es literalmente una expectativa del reto (pág. 4) y permite resolver T08 de forma visible: tema alto, evidencia insuficiente, acción de investigación y publicación bloqueada.
3. **Procedencia independiente, temporalidad y abstención.** Responde directamente a CU-02, CU-03 y CU-04, a T02–T07 y a las preguntas dinámicas anunciadas en la pág. 11. Es el mejor núcleo narrativo disponible.

## 3. Riesgos críticos

### R1 · La "garantía" anti-alucinación no existe con el validador descrito

Un validador que comprueba `id_evidencia + campo` puede garantizar que una cita existe y tiene formato válido. No garantiza que la afirmación sea una interpretación fiel, que el campo respalde semánticamente la frase o que se hayan incluido todas las salvedades. El propio pliego exige validez de sustento por revisión humana (meta >=90% sobre al menos 30 afirmaciones), no una garantía automática.

**Cambio obligatorio:** decir: “el sistema bloquea borradores sin citas estructuralmente válidas; la pertinencia de la cita se evalúa con una muestra humana y se reportan fallos”. Mostrar la cita junto a cada afirmación y sus límites, no solo el ID interno.

### R2 · Diferenciación: el ángulo es correcto, no exclusivo

Procedencia, evidencia, abstención, contradicción y puntaje explicado están prescritos en las págs. 3–4 y 9. Equipos que lean el reto llegarán a ellos. La ventaja no será enunciar esos conceptos, sino hacerlos memorables y operativos.

**Cambio obligatorio:** convertirlo en una sola experiencia distintiva: **“cola de investigación / deuda de evidencia”**. Cada tema debe responder visualmente: *qué sabemos*, *cuántas procedencias independientes hay*, *qué contradice o falta* y *la siguiente acción editorial*. La acción, no el chat, es la pantalla principal.

### R3 · Sobrealcance técnico para tres días

Embeddings locales multilingües, clasificación, agrupación, procedencia, contextualización, LLM estructurado, validador, caché, interfaz, Notion, T01–T10, benchmark, etiquetas manuales y métricas no son un MVP pequeño. Además, “offline” requiere que modelos, dependencias, datos y salidas necesarias ya estén presentes antes del pitch; no basta declarar caché.

**Cambio obligatorio:** congelar un vertical slice de 5 casos trazables y 100+ noticias primero. Usar una sola capacidad ML/NLP sustantiva y demostrable: similitud semántica para agrupación de eventos. Clasificación temática puede ser reglas transparentes si se documenta; no hace falta que todo sea IA.

### R4 · Datos y fecha: la contradicción es real, pero el fallback propuesto es peligroso

La pág. 6 pide noticias de los 30 días previos a extracción (ampliable a 90), mientras la pág. 7 ordena excluir fuera de `[2024-01-01, 2025-10-01)`. Al 6 de octubre de 2026 son incompatibles. También la pág. 6 dice que la organización debe congelar un paquete común para todos.

**Cambio obligatorio:** preguntar por escrito qué regla prevalece y conservar respuesta en Notion. No presentar una ingesta propia como sustituto equivalente del paquete común. Si el snapshot no llega, preparar un snapshot de contingencia claramente rotulado, con manifest, licencia, hash, fecha de corte y receta; pedir confirmación a la organización antes de basar la entrega en él.

### R5 · Métricas no se pueden prometer sin diseño de evaluación

F1, Precision@5, cobertura, validez de sustento, abstención, latencia y costo no aparecen por implementar funcionalidades. Precision@5 exige selección independiente de un editor/analista; la validez de las citas exige revisión humana; y la pág. 7 separa 40 consultas de desarrollo y 20 reservadas. No afirmar resultados hasta tener numerador, denominador, etiquetas humanas y fallos registrados.

**Cambio obligatorio:** crear hoy una tabla de evaluación: métrica, conjunto, responsable humano, tamaño, fórmula, resultado, fallos y limitación. Si no hay editor independiente, marcar Precision@5 como exploratoria, exactamente como ordena la pág. 9.

### R6 · El mayor requisito de admisión no es código: Notion

Sin Notion accesible, ocho tareas, tres decisiones justificadas, catálogo, cinco fichas incluyendo una insuficiente, matriz T01–T10 y pitch de 10 minutos desde Notion, la entrega no entra a evaluación final (pág. 5). La estrategia lo reconoce, pero su plan lo trata como acompañamiento en vez de puerta de admisión.

**Cambio obligatorio:** en la primera hora crear las ocho bases/páginas, comprobar acceso del jurado y capturar tareas/decisiones reales. No dejar la documentación para el cierre.

### R7 · La mecánica de redes es una obligación de cumplimiento no incluida en el plan

El documento de redes pide avances diarios en LinkedIn como canal principal, Instagram o Facebook y al menos tres marcas etiquetadas por publicación, además de hashtags oficiales. Aunque no forma parte de la rúbrica técnica, ignorarlo añade riesgo evitable con la organización.

**Cambio obligatorio:** asignar propietario y recordatorio diario; usar solo hashtags y cuentas verificadas en la plantilla oficial. No publicar capturas con claves, datos no permitidos o afirmaciones de resultados no medidos.

## 4. Cambios priorizados

| Prioridad | Acción concreta | Evidencia de terminado |
|---|---|---|
| P0, primera hora | Montar las 8 secciones obligatorias de Notion, 8+ tareas, 3 decisiones y permisos del jurado. | URL probada desde una sesión no propietaria; Notion navegable. |
| P0, primera hora | Resolver por escrito el conflicto de fechas y disponibilidad del snapshot. | Respuesta o riesgo abierto registrado; manifest de contingencia si aplica. |
| P0, día 1 | Construir una sola demo con 5 fichas, entre ellas una de evidencia insuficiente, un caso de contradicción y uno de abstención. | El recorrido funciona sin internet con el snapshot local. |
| P1, día 1–2 | Implementar agrupación semántica vs. baseline de palabras clave y medir sobre clusters etiquetados. | Tabla de precision/recall o macro-F1 con tamaño, fallos y método. |
| P1, día 2 | Hacer visible la “deuda de evidencia”: procedencias independientes, estado, vacíos y siguiente acción. | Una pantalla de bandeja y ficha entendible en 20 segundos. |
| P1, día 2–3 | Validar citas estructuralmente, revisar una muestra humana y registrar numerador/denominador. | Matriz T01–T10 y métrica de sustento con fallos. |
| P2, diario | Publicar avance de redes conforme a la guía. | Enlace/captura en Notion, sin secretos. |

## 5. Qué no construir

- Modalidad bancaria, SBP o segundo producto.
- Chat abierto como experiencia principal.
- Clasificador ML separado si la agrupación semántica ya satisface el requisito de IA; reglas temáticas auditables son suficientes para el resto.
- Automatización de Notion, autenticación, roles, monitoreo continuo o scraping de cuerpos de artículos.
- Generación en vivo durante el pitch. Usar salidas cacheadas o plantillas deterministas solo si se etiqueta honestamente qué ocurrió en vivo y qué ya estaba preparado.
- Etiquetar unas 150 noticias manualmente sin un plan de muestreo. Etiquetar primero lo mínimo para evaluar los clusters y el ranking; ampliar solo si queda tiempo.

## 6. Prueba de jurado

> “Muéstrame cómo sabes que este tema tiene tres procedencias independientes y que la frase del borrador está respaldada por esa evidencia, no solo que contiene un ID de cita. ¿Qué cambió frente a ordenar por fecha o palabras clave, y en cuántos casos falló?”

Hoy el diseño tiene una respuesta conceptual, no una demostración medida. Debe poder abrir el registro de fuentes/propiedades, la comparación contra baseline, los fallos y la revisión humana desde Notion en menos de un minuto.

## Respuestas a las tres preguntas de Claude

1. **¿Es suficientemente diferenciador?** Como tesis es fuerte, pero no suficiente por sí sola: está ampliamente requerido por el pliego. Diferenciar mediante la cola de investigación accionable y evidencia visible por afirmación.
2. **¿Qué eliminar?** Todo salvo el recorrido TVN, 5 fichas y una capacidad semántica medida. En particular: clasificación ML adicional, automatización Notion, banca, fuentes en vivo y generación en vivo.
3. **¿Qué pregunta deja peor parado al equipo?** La de la pág. 11 sobre mostrar una decisión, prueba fallida y corrección en Notion. Sin datos etiquetados y revisión humana también fallaría la pregunta sobre mejora frente al baseline.
