# 009 · Auditoría Codex: métricas, narrativa y cierre antes del jurado

> Autor: Codex · Fecha: 8 de octubre de 2026, hora de Panamá.  
> Corte auditado: commits hasta `153a086`.

## Veredicto

El avance es fuerte: el prototipo ya tiene benchmark ejecutado, etiquetas humanas, script reproducible de métricas, fallos registrados, contenido generado para las ocho páginas requeridas y controles técnicos verificados. La entrega pasó de “prototipo con promesas” a “prototipo con evidencia y límites declarados”.

Verificado por Codex en el corte:

```text
npm test          → aprobado
npm run lint      → aprobado
npx tsc --noEmit  → aprobado
npm run build     → aprobado
```

No añadir nuevas funciones antes de resolver los seis puntos de este documento.

---

## Fortalezas verificadas

- Evaluación reproducible mediante `npm run metricas` y `data/eval/resultados.json`.
- 120 pares etiquetados para evaluar agrupación frente al baseline.
- 60 afirmaciones revisadas por humano en dos rondas de 30.
- 40 consultas de desarrollo ejecutadas; los 20 casos de reserva no se usaron para iterar.
- F1 de embeddings de 0,769 frente a 0,370 de Jaccard **en la muestra diagnóstica descrita abajo**.
- Validación de sustento honesta: v1 = 16/30 (53,3 %) y v2/prompt v5 = 18/30 (60 %); ninguna afirmación fue clasificada como completamente no respaldada en esas dos muestras.
- T07 de extremo a extremo, con casos sintéticos rotulados y resultados almacenados.
- Fallback de consultas offline documentado.
- Fallos de evaluación encontrados y corregidos, en vez de ocultados.

---

## Seis acciones obligatorias antes de entrega

### 1. No atribuir a v6 la métrica medida en v5

**Hecho:** el producto y las fichas actuales usan `paquete-tvn-v6`. La última revisión humana de sustento (18/30 = 60 %) evaluó `paquete-tvn-v5`. El efecto de v6 sigue sin medir.

**Regla de comunicación:** no decir “el sistema actual alcanza 60 % de respaldo pleno”.

**Texto correcto para Notion y pitch:**

> “El último prompt medido, v5, alcanzó 60 % de respaldo pleno en una muestra humana de 30 afirmaciones. Aplicamos correcciones en v6 según los fallos observados; su efecto aún no se ha medido.”

Si hay tiempo, hacer una nueva muestra humana de v6. Si no, mantener el límite explícito.

### 2. Sincronizar la cobertura de citas

Hay una inconsistencia verificable:

| Fuente | Valor actual |
|---|---:|
| `data/eval/resultados.json` | 52/52 citas factuales estructuralmente válidas |
| `docs/resultados-evaluacion.md` | 65/66 |
| `docs/notion/06-pruebas-y-metricas.md` | 52/52 |

**Acción:** actualizar `docs/resultados-evaluacion.md` al valor actual o explicar que 65/66 es una versión anterior, con fecha, prompt y snapshot. No dejar dos números distintos para el mismo indicador.

### 3. Presentar F1 como muestra diagnóstica, no como estimación poblacional

La muestra de 120 pares mezcla:

- 80 pares iniciales concentrados en baja similitud;
- 30 pares que IA o baseline predijeron como “mismo evento”;
- 10 pares en el borde inferior del umbral.

Sirve para comparar comportamientos y detectar fallos, pero no representa una muestra aleatoria de todo el corpus.

**Texto correcto para pitch:**

> “En una muestra diagnóstica de 120 pares etiquetados por una persona, embeddings obtuvo F1 0,769 frente a 0,370 de Jaccard. La muestra incluyó deliberadamente casos de mismo evento y casos cercanos al umbral; no es una estimación de toda la población.”

Mantener también la limitación: embeddings recuperan 20 de 21 casos humanos, pero agrupan de más en 11 falsos positivos.

### 4. No confundir “0 no respaldadas” con “100 % correctas”

La frase “0/60 afirmaciones no respaldadas” es técnicamente correcta según las etiquetas, pero puede inducir a pensar que todas tenían respaldo pleno. No es así: la última muestra medida tuvo 60 % pleno y 40 % parcial.

**Reemplazo requerido en riesgos/ética y pitch:**

> “En dos muestras de 30 afirmaciones no hubo afirmaciones completamente no respaldadas. En la última muestra medida, 60 % tuvo respaldo pleno y 40 % respaldo parcial. El prompt v6 aún requiere medición.”

### 5. Cerrar T10 con evidencia física en la laptop del pitch

El fallback y la documentación no reemplazan la prueba solicitada de demo sin internet.

Pasos:

1. Abrir el build final en la laptop que se usará en el pitch.
2. Activar modo avión o desconectar Wi‑Fi.
3. Abrir la cola y dos fichas.
4. Ejecutar una consulta cacheada.
5. Ejecutar una consulta nueva para mostrar el fallback de palabras clave.
6. Grabar video o tomar capturas con hora visible.
7. Guardar equipo, commit, fecha, pasos y resultado en Notion/matriz T10.

Hasta entonces T10 debe figurar como **parcial**, no ejecutado.

### 6. Pasar las páginas generadas a Notion real

`docs/notion/` contiene las ocho páginas requeridas y es una excelente fuente para importarlas, pero Markdown local no cumple por sí solo el requisito de Notion.

Antes del cierre:

- importar/copiar las ocho páginas a Notion;
- revisar que el jurado pueda acceder a la URL;
- enlazar GitHub y demo;
- confirmar que tareas, decisiones, catálogo, casos, métricas, riesgos y pitch sean visibles;
- realizar el pitch desde Notion, no desde Markdown local.

Esto sigue siendo una condición de admisión.

---

## Orden de cierre recomendado

1. Corregir la inconsistencia 52/52 vs. 65/66.
2. Ajustar los textos de sustento en riesgos, métricas y pitch.
3. Añadir la limitación de muestra diagnóstica junto al F1 en la presentación.
4. Ejecutar y registrar T10 en modo avión.
5. Crear y compartir Notion real.
6. Publicar GitHub con artefactos de evaluación ya versionados.
7. Solo si sobra tiempo: re-medir v6 con revisión humana.

## Mensaje recomendado para el jurado

> “No afirmamos que la IA sea infalible. Separamos lo que el sistema puede validar automáticamente —citas, campos y cifras— de lo que una persona debe juzgar —pertinencia, alcance y contexto—. Por eso guardamos errores, etiquetas humanas, límites y métricas reproducibles junto a cada decisión.”
