# Plan y decisiones

## Backlog
| # | Tarea | Responsable | Estado |
|---|---|---|---|
| 1 | Analizar el pliego y elegir modalidad (TVN) | Julian + Claude | Hecho |
| 2 | Ingesta: RSS y sitemaps de TVN, GDELT, Banco Mundial, USGS; validación y reporte de calidad | Claude | Hecho |
| 3 | Organización: temas por reglas, agrupación con embeddings, procedencia independiente | Claude | Hecho |
| 4 | Contexto oficial, puntaje P y estado de evidencia | Claude | Hecho |
| 5 | Borradores con citas por afirmación y validador determinista | Claude | Hecho |
| 6 | Interfaz: agenda, ficha, consulta, revisión humana | Claude | Hecho |
| 7 | Prueba de inyección T07 de extremo a extremo | Claude | Hecho |
| 8 | Benchmark de 60 consultas (40 desarrollo + 20 reserva) | Claude (borrador) + Julian (validación) | Desarrollo validado; reserva pendiente |
| 9 | Etiquetado humano: 120 pares y 60 afirmaciones | Julian | Hecho |
| 10 | Métricas reproducibles (`npm run metricas`) | Claude | Hecho |
| 11 | Ensayo T10 en modo avión | Julian | Hecho (8 oct) |
| 12 | Repositorio en GitHub con acceso del jurado | Julian | Hecho (8 oct) |
| 13 | Notion completo y pitch | Julian + equipo | Hecho (8 oct) |

## Decisiones justificadas
1. **Modalidad editorial TVN y no banca:** es la recomendada por el pliego, y la bancaria no exige un segundo producto (`docs/001`).
2. **Ventana de datos 2025-10-02 → 2026-09-30 con datos propios por scraping:** regla de la mediadora del reto; no hay paquete común (`docs/004`, D7).
3. **Embeddings locales para agrupar** en lugar de reglas: en una muestra diagnóstica de 120 pares (no poblacional), F1 0.769 frente a 0.370 del baseline (`docs/resultados-evaluacion.md`).
4. **Claude Sonnet 5.5 para redactar:** medido frente a Haiku 4.5 (más barato, pero se abstuvo en un caso respondible); mediana de 9.9 s y US$ 0.0173 por borrador.
5. **Jev (TypeSafe) descartado:** no redacta texto, que es el 85 % del costo; además, dependencia remota y sin validación en español (`docs/003`, `docs/005`).
6. **Demo offline por defecto:** borradores y consultas en caché local; la generación en vivo queda fuera del pitch (auditoría Codex 002).
7. **Procedencia conservadora:** solo se fusionan el mismo medio y la agencia explícita; los titulares casi idénticos se marcan como “posible réplica” (auditoría Codex 003, R7).

## Proceso de revisión cruzada
Claude construye y Codex audita de forma independiente (`auditorias/001…010`). Cada hallazgo recibe un veredicto: aceptado, parcial o rechazado con justificación.

## Cronología (git)
- 06/10 22:26 · `abac2bb` · Prototipo "De la señal a la decisión" para el reto TVN Media (día 1)
- 07/10 22:17 · `290ae70` · Fallback offline en /consulta, README honesto, diccionario corregido y respuesta a Codex 009
- 07/10 22:34 · `084475a` · T07 de extremo a extremo contra el modelo real y redacción honesta de cifras distintas
- 07/10 22:36 · `5e52e31` · Benchmark de 60 consultas (borrador) y matriz T01-T10 con resultados reales
- 07/10 22:48 · `08d5868` · Página de validación humana /evaluacion y conjuntos para etiquetar
- 08/10 01:10 · `c9e480a` · Benchmark: corrige evidencia de B-004, B-010, B-030 y B-039 (detectado en la validación humana)
- 08/10 01:53 · `f39e112` · Aplica revisión Codex 007: reserva protegida, lint limpio, evaluación sincronizada
- 08/10 01:59 · `066c6ae` · Aplica verificación Codex 008: pruebas de regresión y etiquetas humanas versionadas
- 08/10 17:07 · `86ea1a9` · Pares de agrupación: corrige muestreo (P-081..P-120) tras etiquetado humano
- 08/10 17:35 · `5c80033` · Métricas reales con etiquetas humanas completas (npm run metricas)
- 08/10 17:39 · `6332c4f` · Corrige fallos 3-5 de la evaluación y prepara re-medición de sustento (v2)
- 08/10 18:03 · `a9594a7` · Sustento v2 medido (60 %) y prompt v6: fechas legibles, lugares en español, una idea por oración
- 08/10 18:03 · `8f84857` · metricas.ts: elimina variable sin uso (lint sin avisos)
- 08/10 18:05 · `153a086` · Páginas de Notion generadas desde los datos reales (npm run notion)
- 08/10 18:27 · `98ed7cd` · Revisión humana registrada en las 9 fichas (4 aprobadas como borrador, 5 requieren evidencia)
- 08/10 18:29 · `043fdda` · Aplica auditoría Codex 009: métricas consistentes y comunicación honesta
- 08/10 19:50 · `7d290ba` · Notion: genera las 3 páginas de entrega (funcional, técnica, pitch) pedidas por la organización
- 08/10 20:54 · `17f0392` · T10 aprobado: ensayo en modo avión (8 oct) registrado en matriz y Notion
- 08/10 20:59 · `3624822` · T10: capturas del ensayo en modo avión como evidencia versionada
- 08/10 21:03 · `697424c` · Matriz: conteo de pruebas actualizado (6 archivos, 44 pruebas)
- 08/10 21:18 · `7801960` · Nombre del equipo (Arijuma) en README y Notion
- 08/10 21:22 · `8254210` · Equipo Arijuma: Maria Alexandra Plata (pitch)
- 08/10 21:33 · `f3e6827` · Equipo: pitch a cargo de ambos integrantes
- 08/10 21:35 · `13ba401` · Notion: enlace al repositorio y backlog actualizado
- 08/10 21:51 · `993c8d8` · Responde auditoría Codex 012/013; guion del pitch usa botones de consulta (evita fallo en vivo)
