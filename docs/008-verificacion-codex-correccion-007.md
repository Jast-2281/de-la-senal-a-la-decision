# 008 · Verificación de Codex: corrección 007 aplicada

> Autor: Codex · Fecha: 8 de octubre de 2026, hora de Panamá.  
> Commit revisado: `f39e112`.

## Veredicto

**Aprobado.** La aplicación de la revisión 007 es correcta, proporcional y mejora de forma material la credibilidad de la entrega.

Verificaciones ejecutadas por Codex:

```text
npm test          → 40/40 pruebas aprobadas
npm run lint      → sin warnings
npx tsc --noEmit  → aprobado
npm run build     → producción compilada correctamente
```

## Correcciones verificadas

1. **Reserva protegida:** `data/eval/benchmark.jsonl` conserva 60 casos: 40 de desarrollo y 20 de reserva. `/evaluacion` muestra solo desarrollo por defecto; `/evaluacion?reserva=1` identifica explícitamente la reserva y advierte que solo se valida con el sistema congelado, sin usarla para iterar.
2. **Lint limpio:** se eliminó el import no usado de T07.
3. **Documentación sincronizada:** `docs/evaluacion.md` ahora declara benchmark de 60, pares de agrupación de 80, muestra de sustento de 30 y métricas pendientes; ya no conserva la narrativa antigua de 20 casos.
4. **Fallback offline más honesto:** la interfaz diferencia “modelo local no disponible” de un error inesperado; este último se registra para diagnóstico y no se presenta falsamente como simple ausencia del modelo.

## Pendientes que no deben presentarse como cerrados

| Evidencia | Estado al corte | Acción necesaria |
|---|---:|---|
| Benchmark de desarrollo etiquetado | 4/40 | Completar las 40 etiquetas antes de calcular abstención/corrección. |
| Pares para IA vs. baseline | 0/80 | Etiquetar los 80 pares antes de reportar precisión, recall o F1. |
| Sustento humano de citas | 0/30 | Revisar las 30 afirmaciones antes de reportar validez de sustento. |
| T10 real | Pendiente | Ensayo en modo avión en la laptop de presentación y evidencia guardada. |

No reportar F1, mejora de IA, ≥90 % de sustento, tasa de abstención ni ahorro de tiempo hasta guardar etiquetas, producir un cálculo reproducible y mostrar numerador, denominador, fallos y limitaciones.

## Dos acciones pequeñas antes de entrega

### A. Versionar las etiquetas humanas

`data/eval/etiquetas.json` contiene evidencia de revisión humana ya realizada y actualmente está sin seguimiento de Git. No contiene secretos; debe añadirse al repositorio cuando avance el etiquetado para que la evaluación sea reproducible para el jurado.

### B. Añadir dos pruebas de regresión si el tiempo lo permite

El build y los tests existentes pasan, pero las nuevas conductas no aumentaron el número de pruebas automatizadas. Añadir pruebas enfocadas para:

1. caída de embeddings → recuperación por palabras clave con aviso/fallback;
2. `/evaluacion` por defecto solo expone desarrollo, y la reserva se mantiene separada.

No bloquear el etiquetado humano por estas pruebas. El orden correcto es: completar desarrollo → pares → sustento → script de métricas → T10 modo avión.
