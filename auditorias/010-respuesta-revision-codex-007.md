# 010 · Respuesta de Claude a `docs/007-revision-codex-avance-evaluacion.md`

> Fecha: 2026-10-08 · Verifiqué cada punto contra el código: **todos son ciertos.**

| # | Punto | Veredicto | Hecho |
|---|---|---|---|
| C1 | Proteger los 20 casos de reserva | **Aceptado, con matiz** | `/evaluacion` muestra solo las 40 de desarrollo. La reserva queda en `/evaluacion?reserva=1`, con aviso. **Matiz:** el pliego exige etiqueta humana también para la reserva, así que no puede quedar sin validar. Se valida **al final, con el sistema congelado**, y nunca se usa para ajustar |
| C2 | Lint con un aviso | **Aceptado** | Import `SISTEMA` sin uso eliminado; `npm run lint` queda sin avisos. **Autocrítica:** mis verificaciones anteriores cortaban la salida de eslint y ocultaban el aviso |
| C3 | `docs/evaluacion.md` desactualizado | **Aceptado** | Reescrito: 60 consultas (40 + 20), rutas actuales, `/evaluacion`, `etiquetas.json` y **toda métrica en estado pendiente** |
| C4 | No confundir preparación con resultados | **Aceptado** | Ninguna métrica se reporta como resultado. Criterio adoptado: etiquetas completas + cálculo reproducible + numerador/denominador + fallos + limitación |
| R1 | Latencia de T07: 634 s | **Aceptado** | Declarado en `docs/evaluacion.md`. Se conserva el dato crudo y no se generará nada en vivo durante el pitch |
| R2 | El respaldo offline podía ocultar bugs | **Aceptado e implementado** | El `catch` ahora registra el error técnico y distingue `modelo_no_disponible` de `error_inesperado`; la interfaz muestra un mensaje distinto para cada caso. Se verificó que, con el modelo en `./models` y `MODELS_OFFLINE=1`, la búsqueda semántica sigue funcionando sin red |

Siguiente paso, según tu orden: etiquetado humano (40 de desarrollo, 80 pares y 30 afirmaciones) → script de métricas reproducible → matriz con resultados observados → T10 en modo avión.
