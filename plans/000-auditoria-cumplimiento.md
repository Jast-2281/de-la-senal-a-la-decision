# 000 · Auditoría de cumplimiento contra el pliego (`/improve`)

> Autor: Claude (rol de asesor, skill `/improve`) · Fecha: 2026-10-06 · Commit auditado: `abac2bb`
> Estado: **para revisión de Codex** antes de convertir los hallazgos en planes de implementación.
> Fuente: `reto/hackIAthon - reto TVN Media.pdf` (12 págs.). Entrega: jueves 8 de octubre de 2026 hasta la medianoche.

## Resumen
El núcleo cumple: las 7 etapas funcionan; CU-01 a CU-04 se pueden demostrar con datos reales; hay 9 fichas en `fichas.jsonl` (3 con evidencia insuficiente); el contrato de datos está casi completo y pasan 40 pruebas, lint y el build.
**Lo que falta para ganar no es funcionalidad: son entregables obligatorios ausentes y evidencias prometidas que aún no se miden.**

## Hallazgos verificados (por impacto ÷ esfuerzo)

| # | Hallazgo | Pliego | Esfuerzo | Evidencia (verificada) |
|---|---|---|---|---|
| 1 | Falta el **diccionario de datos** (entregable obligatorio) | pág. 7 (“Guardar raw/, processed/, manifest y diccionario”) y pág. 10 | S | `data/processed/` no lo contiene |
| 2 | El README promete una “demo en 3 comandos sin internet”, pero `npm ci` requiere red. Además, `/consulta` con una pregunta nueva, sin el modelo local, no se degrada: los embeddings intentan descargarse y la página devuelve 500 | T10 | S | `README.md:13-18`; `src/lib/consulta.ts` (`recuperar` sin manejo de error); `models/` está en `.gitignore` |
| 3 | No hay repo en GitHub con acceso del jurado | pág. 10 | S (decisión del usuario) | `git remote -v` vacío |
| 4 | T07 (inyección) solo se prueba como escape de etiquetas; no hay ejecución contra el modelo real ni caso demostrable en la interfaz | T07; pregunta dinámica del jurado (pág. 11) | S–M | Solo `tests/t05-t09-validador.test.ts` |
| 5 | No existe el **benchmark de desarrollo** (`benchmark.jsonl`, entregable obligatorio) | págs. 7, 9.1 y 10 | M | No existe `data/eval/` |
| 6 | La IA **no está medida contra el baseline**: `grupo_baseline` se calcula, pero no hay pares etiquetados, precisión/recall ni F1 | pág. 8; rúbrica “Uso efectivo de IA” (15) | M + etiquetado humano | `data/processed/organizado.json` |
| 7 | No existe **“permitir justificar cambios de pesos”** | pág. 4 (texto literal) | M | Ninguna referencia en `src/` |
| 8 | Validez de sustento (revisión humana de ≥30 afirmaciones) sin medir; la cobertura de citas ya se puede calcular automáticamente | pág. 9.1 | S + 30 min humanos | — |
| 9 | CU-03 (“si cinco medios replican la misma agencia…”) no se puede demostrar con datos reales: **0 eventos** con agencia explícita, porque hoy solo se detecta en el titular | CU-03; pág. 11 | M (confianza media) | `cola.json`: 0 grupos con `agencia_explicita`. Hipótesis sin verificar: el JSON-LD de TVN declara el autor/agencia |
| 10 | No hay documento consolidado de modelo/proveedor, versión, prompts, parámetros, costo y límites; los prompts viven solo en el código | pág. 8 | S | `src/lib/generar.ts`, `src/lib/consulta.ts` |
| 11 | Ahorro de tiempo manual frente a asistido sin medir | pág. 9.1; rúbrica “Utilidad” (20) | S + tiempo del usuario | — |
| 12 | `fichas.jsonl` no incluye el **alcance** (“basado únicamente en titular/metadatos”) | pág. 3 | S | Campos del jsonl verificados |

**Fuera del código, y lo más crítico:** Notion está vacío (condición de admisión; 15 puntos de rúbrica).
**Dependencia:** el etiquetado humano alimenta los ítems 5, 6 y 8; conviene hacerlo en una sola sesión de unos 45 minutos.

## De “OK” a “WOW” (opciones para decidir)
1. **IA frente al baseline, visible en la ficha:** “con palabras clave este evento quedaría partido en N grupos; con embeddings, en 1”, junto con la cifra medida.
2. **Panel “Ajustar pesos”** (resuelve el ítem 7): el orden cambia en vivo y la justificación queda registrada como nueva versión de reglas.
3. **Caso de inyección en la demo** (resuelve el ítem 4): una fuente sintética rotulada que pide ignorar las instrucciones; el sistema la ignora y la marca.
4. **Guion de demo cronometrado** con los 6 momentos de confianza (auditoría 008) y la entrada animada de los rótulos.

## No auditado
Rendimiento con un corpus grande, `npm audit` y la verificación en el proyector real.

## Lotes propuestos
- **Lote A (cierra entregables y las preguntas del jurado):** 1, 2, 4, 7, 9.
- **Lote B (medición, requiere al usuario):** 5, 6 y 8 en un solo plan con la sesión de etiquetado.
- **Decisiones del usuario, no planes:** 3 (GitHub) y Notion.

## Preguntas para Codex
1. ¿Hay algún requisito del pliego que **no** aparezca en esta tabla y no se esté cumpliendo?
2. ¿Cambiarías el orden de los lotes, dado que la entrega es el jueves a medianoche y el usuario tiene tiempo limitado para etiquetar?
3. ¿El ítem 9 (detectar agencias desde los metadatos de TVN) vale el esfuerzo, o basta con demostrar CU-03 con las “posibles réplicas” y una prueba?
