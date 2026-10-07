# 003 · Respuesta de Claude

> Fecha: 2026-10-06 · Responde a: `auditorias/003-auditoria-implementacion-dia-1.md`
> Verifiqué cada hallazgo contra el código. **Todos los comprobables son ciertos.**

| # | Hallazgo | Veredicto | Estado |
|---|---|---|---|
| R1 | No existe la interfaz de producto | **Aceptado · P0** | Siguiente tarea, sin más expansión del pipeline |
| R2 | El build falla offline por `next/font/google` | **Aceptado · verificado** | Se reemplaza por fuentes del sistema al construir la interfaz |
| R3 | El modo offline está incompleto (no hay modelo ni borradores locales) | **Aceptado** | Se generan y versionan ≥5 paquetes en `data/cache/llm/`; el modelo de embeddings se descarga con un comando documentado |
| R4 | Falta el README | **Aceptado · P0** | Se escribe junto con la interfaz |
| R5 | “T01–T10” estaba sobredeclarado | **Aceptado** | Mi mensaje asociaba etapas a pruebas T de una forma que sugería cobertura completa. La matriz honesta va abajo |
| R6 | Dos huecos del validador | **Aceptado · corregido** | Ver detalle |
| R7 | La procedencia podía subcontar fuentes independientes | **Aceptado · corregido** | Ver detalle |

## R6 · Corregido
- Se aplica el rango del guion: 110–160 palabras (≈45–60 s).
- Toda afirmación con cifras, **de cualquier tipo** (también inferencias e hipótesis), exige una cita válida y que la cifra aparezca literalmente en el texto citado.

## R7 · Corregido, y además destapó un error real
- **Consolidación automática** solo por `mismo_medio` o `agencia_explicita`.
- Los titulares casi idénticos de medios distintos **ya no se fusionan**. Quedan en `posibles_replicas` y se informa un rango: `procedencias_independientes` (estricto) y `procedencias_si_se_confirman_replicas` (cota inferior). La interfaz los mostrará como “posible réplica; revisar origen”.
- **Error encontrado:** la detección de agencias no reconocía “EFE:”, porque buscaba la palabra entre espacios. Tu recomendación lo dejó al descubierto; antes la fusión por similitud lo tapaba. Corregido con límites de palabra y con una prueba nueva.
- Pruebas: 31/31 pasan.

## R5 · Matriz honesta (estado al 2026-10-06, 19:00)
| Prueba | Automatizada hoy | Falta para darla por cumplida |
|---|---|---|
| T01 | Unidad: validación tolerante, nulos, deduplicación | Mostrar el reporte de calidad del snapshot en la interfaz |
| T02 | Unidad: agrupación, procedencia, posibles réplicas | Verla en un evento real en la ficha |
| T03 | Unidad: novedad 0 para una primera señal antigua | La interfaz debe mostrar la fecha original |
| T04 | Unidad: año, unidad y “no es actual” | Verlo en la ficha de un tema económico |
| T05 | Unidad: contradicción numérica | Mostrar las versiones en la ficha + benchmark con el modelo |
| T06 | Unidad: cifra inventada bloqueada; abstención sin contenido | Consulta real sin respuesta en el benchmark |
| T07 | Unidad: escape de etiquetas | Fuente maliciosa sintética contra el modelo real (benchmark) |
| T08 | Unidad: componentes, regla, prioridad alta con evidencia insuficiente | Verlo en la cola |
| T09 | Unidad: validación de citas y tipos | Paquete real generado y revisado por una persona |
| T10 | **No cubierta** | Build offline + paquetes en caché + ensayo con el Wi-Fi apagado |

No se describirá como “T01–T10 automatizados” hasta que cada fila esté completa.

## Orden de trabajo que acepto (P0 antes que nada)
1. Interfaz: cola → ficha → paquete, con los JSON existentes y fuentes locales.
2. README + comando de demo offline.
3. ≥5 paquetes cacheados (requiere la API key del usuario) y revisión humana.
4. Matriz T01–T10 completa y Notion.
