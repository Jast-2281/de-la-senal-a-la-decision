# 005 · Auditoría de gaps del MVP y entrega

> Auditor: Codex · Fecha: 2026-10-06 · Alcance: implementación actual, scripts, caché local, pruebas, build y documentación. Notion y accesos externos no pueden verificarse desde este repositorio.

## 1. Veredicto: **aprobar con cambios; ya hay MVP demostrable, pero aún no entrega cerrada**

Claude resolvió el bloqueo central de la auditoría 003: ya existe una cola, una ficha, evidencia legible, paquetes cacheados y revisión humana. El enfoque es correcto y debe mantenerse.

No está listo para declarar cumplimiento completo del reto. Los gaps restantes son concretos: el comando oficial de build sigue fallando en este entorno, no existe `fichas.jsonl`, falta una prueba/demo de contradicción y de consulta sin respuesta, y no hay evidencia local de benchmark/métricas ni de Notion.

## 2. Lo más fuerte

1. **Ruta de producto real.** La cola filtra y busca; la ficha expone puntaje, estado de evidencia, procedencias, vacíos, datos oficiales, borrador y revisión humana. Esto ya responde al flujo que pide el pliego, no es una maqueta.
2. **Offline en la ruta elegida.** La UI lee artefactos locales. Se verificaron seis cache hits para el modelo configurado por defecto; los seis pasan su validador. Incluyen cuatro briefs de investigación con evidencia insuficiente, un caso parcial y un caso apto para borrador: supera el mínimo de cinco fichas si se documentan como casos.
3. **Calidad técnica verificable.** `npm test` pasa con 34 pruebas, lint y TypeScript pasan. `npx next build --webpack` compiló y produjo las rutas de la aplicación correctamente. La dependencia de Google Fonts ya fue eliminada.

## 3. Riesgos críticos

### R1 · El comando que promete el README no es el que pasó

El README dice `npm run build`, pero ese script llama `next build` (Turbopack) y falla en esta máquina con un error interno al abrir un proceso/puerto. El build sí pasó con `npx next build --webpack`.

**Cambio:** hacer que el script `build` sea `next build --webpack` (o resolver y comprobar Turbopack). Repetir literalmente los tres comandos del README antes del pitch. No dejar una receta entregable que falla.

### R2 · Falta `fichas.jsonl`, un campo obligatorio del contrato de datos

El pliego pide `fichas.jsonl` con IDs, afirmaciones, citas, puntaje, componentes, estado de evidencia, borrador y estado de revisión. El proyecto guarda borradores en `data/cache/llm/*.json` y revisiones en un JSON separado, pero no exporta la ficha unificada.

**Cambio:** añadir exportación local de cada caso revisado a `data/processed/fichas.jsonl`, o un script reproducible que genere ese archivo desde cola + caché + revisiones. No debe ser una copia manual.

### R3 · CU-04/T06 no está demostrable en la interfaz

La caja actual solo filtra titulares. Si se busca una cifra o hecho inexistente, muestra “Ningún tema coincide”, pero no hay una consulta editorial que produzca una abstención explícita, explique la ausencia de evidencia y diga qué información hace falta. Los briefs de investigación con evidencia insuficiente no sustituyen el caso de “sin respuesta en el corpus”.

**Cambio:** añadir un caso de consulta no respondible, fijo y offline, por ejemplo “¿Cuál fue el rating de TVN ayer?”, con respuesta explícita: “No tengo esa información en este corpus; se necesitaría X”. Puede ser una tarjeta de demostración, no un chat abierto.

### R4 · T05/contradicción no está en datos ni en demo

El corpus actual tiene cero eventos con contradicciones detectadas. La función unitaria existe, pero el jurado verá un requisito mencionado, no una experiencia. Tampoco hay una ficha cacheada que exponga ambas versiones y una verificación pendiente.

**Cambio:** añadir un fixture sintético claramente rotulado al snapshot de pruebas, o una ficha de caso de prueba separada. Debe conservar las dos fuentes/cifras y bloquear la decisión hasta revisión. No inventarlo como noticia real.

### R5 · Las métricas siguen siendo diseño, no evidencia

`docs/evaluacion.md` es un buen diseño honesto, pero no se encontraron `data/eval/pares.jsonl`, `benchmark.jsonl`, resultados, numeradores/denominadores ni fallos guardados. No afirmar F1, cobertura semántica, abstención o Precision@5 todavía.

**Cambio:** si queda poco tiempo, medir menos pero de verdad: 20 consultas/pares etiquetados, una tabla con conteos, los fallos concretos y limitaciones. Precision@5 debe quedar exploratoria sin editor independiente.

### R6 · El validador aún flexibiliza el campo citado

Para validar una cifra, una afirmación que cita el campo `valor` puede pasar si el número aparece en **otro campo del mismo registro**, por ejemplo `anio`. Eso es útil para evitar falsos negativos, pero la UI presenta una cita por campo y el pliego exige que cada afirmación apunte al campo/pasaje que la respalda.

**Cambio:** exigir que el número aparezca en el campo citado, o exigir citas separadas para `valor`, `anio` y `unidad` cuando la frase usa los tres. Es mejor una validación estricta que una cita aparentemente precisa pero ambigua.

### R7 · Gaps externos de admisión no verificables

No hay en el repositorio prueba de: URL de Notion accesible al jurado, ocho tareas, tres decisiones, cinco fichas en Notion, matriz de pruebas, pitch navegable, permisos del repositorio, ni publicaciones de redes. Esos elementos pueden excluir la entrega independientemente de la calidad del MVP.

**Cambio:** usar una checklist de cierre con dueño, enlace y verificación desde una cuenta no propietaria. No asumir que existe porque está planeado.

## 4. Cambios priorizados

| Prioridad | Acción | Evidencia de terminado |
|---|---|---|
| P0 | Cambiar `npm run build` a la variante que compila y repetir la receta del README. | `npm ci && npm run build && npm start` funciona sin red. |
| P0 | Exportar `fichas.jsonl` desde los datos reales. | Cinco filas trazables, incluida una insuficiente, con borrador/revisión/citas. |
| P0 | Añadir una tarjeta offline de abstención T06 y un fixture sintético T05. | Dos clicks muestran ausencia de corpus y contradicción, sin LLM ni red. |
| P1 | Generar evaluación mínima y guardar resultados/fallos. | `data/eval/` y tabla con numerador/denominador. |
| P1 | Endurecer cita de cifra al campo exacto. | Pruebas que rechazan una cita a `valor` cuando la cifra usada solo aparece en `anio`. |
| P1 | Completar y verificar Notion/accesos/pitch/redes. | Checklist cerrada por enlaces funcionales. |

## 5. Qué no construir

- Más proveedores, modelos, fuentes o un chat libre.
- Métricas grandes sin etiquetado humano y fallos visibles.
- Una integración de Notion por API; el registro manual suficiente y trazable vale más.
- Más de seis casos cacheados hasta que los dos casos faltantes (T05/T06) y `fichas.jsonl` estén resueltos.

## 6. Prueba de jurado

> “Sin Wi-Fi, construyan, abran un tema alto con evidencia insuficiente, muéstrenme la ficha exportada, pidan un dato que no está en el corpus y luego enséñenme dos versiones contradictorias sin escoger una. ¿Dónde quedó registrada la decisión humana?”

**Estado actual:** pasa la primera mitad (build con Webpack, cola/ficha/caché/revisión) y falla o no puede demostrar con claridad `fichas.jsonl`, la abstención de consulta inexistente y la contradicción visible. Resolver esos tres puntos produce una demo creíble y completa.
