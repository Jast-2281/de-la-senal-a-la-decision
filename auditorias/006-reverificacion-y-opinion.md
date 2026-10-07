# 006 · Reverificación y opinión de preparación

> Auditor: Codex · Fecha: 2026-10-06 · Alcance: estado actual posterior a auditoría 005, incluyendo datos recientes, comandos y pruebas.

## 1. Veredicto: **aprobar el rumbo; no aprobar todavía el cierre de entrega**

El producto avanza correctamente: el snapshot procesado ya usa la regla confirmada por la mediadora, contiene 591 noticias recientes y el MVP conserva su foco editorial. No recomiendo cambiar de estrategia ni ampliar alcance.

Sin embargo, no recomiendo pasar aún a “solo pitch”. Hay tres huecos de cumplimiento que siguen sin resolverse desde la auditoría 005: el comando de build prometido no funciona, falta `fichas.jsonl` y faltan demostraciones visibles de T05/T06. Son tareas pequeñas comparadas con lo que ya existe, pero pueden costar credibilidad y puntos de admisión.

## 2. Lo más fuerte

1. **Datos recientes y decisión documental corregida.** El `manifest` actual es `senales-evidencias-equipo-v2`, declara la regla oficial del equipo y no el antiguo snapshot de contingencia. Se verificaron 591 noticias procesadas: 309 de sitemap TVN, 51 RSS TVN y 231 GDELT; la fecha máxima cae dentro del corte de septiembre/1 de octubre definido.
2. **Base técnica en mejor estado.** Vitest pasa 37 pruebas; TypeScript pasa y ESLint solo emite una advertencia no bloqueante en el scraper. La compilación con Webpack vuelve a pasar.
3. **Producto y caché mantienen la tesis correcta.** Cola → ficha → evidencia → borrador cacheado → revisión humana sigue siendo el recorrido correcto. No agregar chat ni más modelos.

## 3. Riesgos críticos

### R1 · `npm run build` sigue fallando aunque Webpack funcione

El README prescribe `npm run build`; `package.json` aún lo define como `next build`, que usa Turbopack y falla en esta máquina con `TurbopackInternalError`. La verificación anterior mostró que `npx next build --webpack` sí compila.

**Acción:** cambiar el script oficial a `next build --webpack` y ejecutar la receta exacta del README. Este es un problema de entrega, no de funcionalidad.

### R2 · Falta `fichas.jsonl`

Aunque el manifest ya lista `cola.json`, no existe `data/processed/fichas.jsonl`. Tampoco existe un exportador desde caché/revisión hacia el contrato requerido. El proyecto no debe confiar en que los jueces reconstruyan mentalmente una ficha desde tres archivos.

**Acción:** generar cinco líneas JSONL con: `id_caso`, modalidad, fuentes, afirmaciones/citas, puntaje/componentes, estado de evidencia, borrador y estado de revisión. Puede ser un script único y local.

### R3 · T05 y T06 siguen ausentes de la ruta de demo

- El corpus procesado no aporta eventos con contradicción numérica detectable; no hay fixture ni ficha visual de contradicción.
- La búsqueda de la cola no es una consulta con abstención explícita; no explica qué información falta.

**Acción:** crear dos tarjetas/casos de prueba locales y claramente sintéticos: contradicción de cifras con ambas fuentes visibles (T05) y una consulta fuera del corpus con la abstención y dato requerido (T06). No hace falta un chat libre.

### R4 · Métricas: diseño sin resultados

`docs/evaluacion.md` está bien, pero no se encontraron pares etiquetados, benchmark, resultados ni fallos en `data/eval/`. Presentar una evaluación planificada como resultado sería un error de credibilidad.

**Acción:** medir un mínimo honesto o declarar explícitamente “pendiente”, priorizando primero las puertas de admisión.

### R5 · Pequeña deuda de calidad

ESLint emite una advertencia en `scripts/scrape-tvn.ts` por una expresión sin efecto. No bloquea el producto, pero se debe corregir antes de congelar para evitar ruido y mostrar disciplina técnica.

## 4. Cambios priorizados

1. Cambiar y validar el script `build` con Webpack.
2. Producir `fichas.jsonl` desde los artefactos existentes.
3. Añadir casos offline T05 y T06 a la ruta de demo.
4. Corregir la advertencia de lint.
5. Completar Notion, enlaces, matriz y ensayo sin Wi-Fi.
6. Solo si sobra tiempo: evaluación mínima con resultados y fallos reales.

## 5. Qué no construir

- Más scraping o fuentes: 591 noticias son suficientes para demostrar el flujo.
- Más paquetes cacheados antes de cubrir T05/T06 y fichas exportadas.
- Comparaciones de modelos, despliegue o automatización Notion.

## 6. Prueba de jurado

> “Ejecuta los tres comandos del README sin internet; abre una ficha exportada, muéstrame una contradicción y pregúntale por un dato que no existe. ¿Qué hizo el revisor y dónde quedó guardado?”

**Opinión:** el producto ya tiene una base más creíble que la mayoría de prototipos de hackathon porque su valor es verificable y no depende de conversación genérica. Cierren los tres huecos P0 y pasen a ensayo/pitch; no expandan el producto.
