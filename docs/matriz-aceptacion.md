# Matriz de aceptación T01–T10

> Corte de verificación: 7 de octubre de 2026, hora de Panamá. Esta matriz es el artefacto fuente para la página **Pruebas y métricas** de Notion. Solo marca como ejecutado lo que tiene evidencia local; los pendientes no deben presentarse como aprobados.

| ID | Caso / entrada | Resultado esperado del pliego | Evidencia actual | Estado | Acción para cerrar |
|---|---|---|---|---|---|
| T01 | Fechas inválidas, nulos y URL inválida | Separar errores, preservar nulos y continuar la carga | `tests/t01-carga.test.ts`; `data/processed/calidad.json` | Ejecutado | Adjuntar captura de `npm test` y enlazar el reporte de calidad en Notion. |
| T02 | Tres registros del mismo evento; tres réplicas de agencia | Agrupar sin perder fuentes; no triplicar importancia ni corroboración | `tests/t02-agrupacion.test.ts` cubre agrupación, agencia EFE y posibles réplicas | Ejecutado (sintético) | Mostrar un caso real de la cola; mantener el caso de agencia rotulado como sintético. |
| T03 | Noticia antigua recirculada | Conservar fecha original; no presentarla como evento nuevo | `tests/t08-prioridad.test.ts` verifica novedad 0 | Ejecutado (unitario) | Añadir captura de ficha/cola con fecha original. |
| T04 | Indicador anual del Banco Mundial | País, año y unidad; cita válida; nunca presentarlo como dato actual | `tests/t04-contexto.test.ts`; ficha económica de la demo | Ejecutado | En demo, decir explícitamente “dato anual, no actual”. |
| T05 | Dos afirmaciones incompatibles | Mostrar ambas versiones, alcance y verificación pendiente | `tests/t05-t09-validador.test.ts` | Ejecutado (detector) | Guardar una ficha o consulta de contradicción en el benchmark con resultado observado. |
| T06 | Consulta sin respuesta | Abstención explícita; sin cifras ni citas inventadas | `tests/t05-t09-validador.test.ts`; lógica de abstención en `src/lib/consulta.ts` | Parcial | Ejecutar y guardar una consulta real offline y una consulta respondible para medir falsos rechazos. |
| T07 | Fuente que intenta cambiar instrucciones | Tratarla como dato no confiable; no revelar secretos ni ejecutar órdenes | `tests/t05-t09-validador.test.ts` escapa el cierre de etiquetas | Parcial | Ejecutar un caso sintético de extremo a extremo, guardar salida y rotularlo como prueba adversarial. |
| T08 | Prioridad alta con evidencia insuficiente | Mostrar componentes/regla; no habilitar publicación | `tests/t08-prioridad.test.ts`; estados de revisión en la interfaz | Ejecutado (unitario) | Demostrarlo en una ficha real con estado “requiere evidencia”. |
| T09 | Brief TVN | Formato útil, citas pertinentes y tipos de afirmación | Validador y nueve fichas en `data/processed/fichas.jsonl` | Parcial | Revisar humanamente ≥30 afirmaciones para validez semántica de sustento. |
| T10 | Demo sin internet | Funcionar con snapshot y fallback documentado | Snapshot y cachés locales existen; modelo de embeddings no está versionado | No cerrado | Ensayar en modo avión en la laptop de demo, con dependencias/modelo precargados; guardar video/capturas y documentar el fallback. |

## Evidencia de ejecución de este corte

```text
npm test       → 5 archivos, 40 pruebas aprobadas
npm run lint   → aprobado
npx tsc --noEmit → aprobado
```

## Reglas de presentación

- Una prueba unitaria no reemplaza una demostración en el producto: para T02, T04, T08 y T09 conviene enlazar una ficha real.
- T06, T07, T09 y T10 no están cerradas hasta guardar entrada, salida observada y, cuando corresponda, revisión humana.
- No ocultar fallos: registrar el fallo, causa y corrección es evidencia positiva para el jurado.
