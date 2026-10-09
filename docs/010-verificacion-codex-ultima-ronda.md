# 010 · Verificación Codex: última ronda y cierre de entrega

> Autor: Codex · Fecha: 8 de octubre de 2026, hora de Panamá.  
> Commit auditado: `043fdda`.

## Veredicto

**La última ronda está aprobada técnicamente.** Claude mejoró la coherencia de métricas, la narrativa para jurado, la revisión humana de fichas y las páginas preparadas para Notion.

Verificaciones ejecutadas por Codex:

```text
npm test          → 6 archivos, 44/44 pruebas aprobadas
npm run lint      → aprobado, sin warnings
npx tsc --noEmit  → aprobado
npm run build     → producción compilada correctamente
```

No se recomienda añadir funcionalidades nuevas. Los pendientes son operativos, de trazabilidad y de admisión.

## Correcto en esta ronda

1. La comunicación del F1 ahora declara que la muestra de 120 pares es diagnóstica, no una estimación de toda la población.
2. Las páginas de Notion se regeneran desde datos actuales, fichas y métricas reales.
3. Las nueve fichas tienen revisión humana registrada: 4 aprobadas como borrador y 5 requieren evidencia.
4. Las limitaciones de sustento, v5/v6, errores de agrupación, T07 y datos anuales se presentan con mayor honestidad.
5. La cobertura estructural actual de citas debe comunicarse como **52/52** en el snapshot actual.

---

## Pendientes obligatorios de cierre

### C1 · Ejecutar T10 físicamente en la laptop del pitch

El fallback offline y la caché están implementados, pero T10 no se cierra sin un ensayo real.

Pasos:

1. Abrir el build final en la laptop de presentación.
2. Activar modo avión o desconectar Wi‑Fi.
3. Abrir cola y dos fichas.
4. Ejecutar una consulta cacheada.
5. Ejecutar una consulta nueva para demostrar el fallback por palabras clave.
6. Guardar video o capturas con hora visible.
7. Registrar fecha, equipo, commit, pasos y resultado en la matriz T10 y Notion.

Hasta completar esta evidencia, T10 se mantiene como **parcial**.

### C2 · Convertir `docs/notion/` en Notion real y accesible

Las ocho páginas Markdown son preparación excelente, pero no sustituyen el requisito de Notion Business accesible al jurado.

Antes de entregar:

- copiar/importar las ocho páginas a Notion;
- confirmar URL y permisos de jurado;
- enlazar demo y GitHub;
- verificar que tareas, decisiones, catálogo, casos, pruebas, métricas, riesgos y pitch estén visibles;
- ensayar la presentación de 10 minutos desde Notion.

Esto es condición de admisión, no una mejora opcional.

### C3 · Publicar GitHub y verificar acceso externo

El contenido del repositorio está listo, pero sigue faltando evidencia de un remoto accesible al jurado.

- crear/subir al repositorio GitHub;
- incluir README, lockfile, `.env.example`, tests, datos permitidos, benchmark y resultados;
- abrir el enlace desde incógnito u otra cuenta para confirmar acceso;
- registrar URL en Inicio del reto y en Notion.

### C4 · Confirmar identidad del revisor sin reescribir la trazabilidad sin explicación

La última ronda reemplazó “Julian Andrew” por “Julian Taylor” en las etiquetas históricas de `data/eval/etiquetas.json`.

Confirmar cuál es el nombre real que se debe presentar. Si el cambio fue una corrección legítima de identidad, añadir una nota de decisión:

> “Se corrigió el nombre del revisor para reflejar su identidad real; no se modificaron veredictos, fechas ni resultados.”

No modificar de nuevo etiquetas históricas salvo para corregir una identificación errónea documentada. La trazabilidad importa tanto como el número final.

### C5 · Sincronizar `docs/evaluacion.md`

Ese archivo aún contiene narrativa de “métricas pendientes”, mientras los resultados actuales están en:

- `data/eval/resultados.json`;
- `docs/resultados-evaluacion.md`;
- `docs/notion/06-pruebas-y-metricas.md`.

Solución mínima: convertir `docs/evaluacion.md` en un índice de metodología que enlace los resultados finales y declare claramente qué sigue pendiente: medir el efecto de v6 y realizar T10 en modo avión.

---

## Lenguaje aprobado para el pitch

### Agrupación

> “En una muestra diagnóstica de 120 pares etiquetados por una persona, embeddings obtuvo F1 0,769 frente a 0,370 de Jaccard. La muestra incluyó deliberadamente casos de mismo evento y casos cercanos al umbral; no es una estimación de toda la población. Los embeddings recuperan más repeticiones, pero agrupan de más en 11 casos.”

### Sustento

> “En dos muestras de 30 afirmaciones no hubo afirmaciones completamente no respaldadas. En la última muestra medida, con prompt v5, 60 % tuvo respaldo pleno y 40 % respaldo parcial. El prompt v6 corrige fallos observados, pero su efecto todavía no fue medido.”

### Propuesta de valor

> “No construimos una máquina que publique más rápido. Construimos una capa de decisión que indica qué merece atención, qué evidencia existe y qué todavía no puede afirmarse.”

## Orden final

1. C1: evidencia T10 en modo avión.
2. C2: Notion real, URL y permisos.
3. C3: GitHub público/compartido y verificado.
4. C4: confirmar identidad del revisor y documentar cualquier corrección.
5. C5: sincronizar `docs/evaluacion.md`.
6. Ensayar pitch de 10 minutos desde Notion.

Después de eso, congelar alcance: no integrar nuevas fuentes, modelos, video ni funcionalidades adicionales.
