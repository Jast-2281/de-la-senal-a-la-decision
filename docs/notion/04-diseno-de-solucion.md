# Diseño de solución

## Arquitectura
Snapshot (raw) → validación y normalización → `data/processed` → embeddings locales + agrupación + procedencia → contexto oficial → puntaje P + estado de evidencia → borrador con citas (LLM) → validador determinista → interfaz → revisión humana → `fichas.jsonl` → Notion.

## Modelos
| Uso | Modelo / versión | Parámetros | Dónde corre |
|---|---|---|---|
| Embeddings (agrupar, recuperar) | Xenova/multilingual-e5-small (ONNX q8) | coseno; umbral de agrupación 0,88; ventana de 96 h; umbral de consulta 0,82 | Local, sin red |
| Redacción de borradores | Claude Sonnet 5.5 (`claude-sonnet-5-5`) | salida estructurada (Zod), effort “low”, caché de prompt | API; resultados en caché local |
| Consultas | Claude Sonnet 5.5 | recuperación local → abstención determinista → respuesta citada | API; caché local |

## Reglas
- **Puntaje:** `P = 30R + 25I + 20U + 15N + 10E` (versión `puntaje-v2`). Rangos: bajo [0,40), medio [40,70), alto [70,100]. Empates: mayor urgencia y luego ID.
- **Estado de evidencia** (independiente de P): insuficiente / parcial / suficiente para el borrador.
- **Temas:** reglas transparentes versionadas (`temas-reglas-v2`); la ficha muestra las raíces que activaron el tema.
- **Validador:** bloquea hechos y declaraciones sin cita, cifras ausentes del campo citado y citas a campos inexistentes; exige límites de palabras.

## Prompts
Versión vigente: `paquete-tvn-v6` y `consulta-v4`. El texto completo está en `src/lib/generar.ts` (`SISTEMA`) y `src/lib/consulta.ts`. Las instrucciones van separadas del contenido de las fuentes, que entra delimitado como dato.

## Límites del sistema
- No determina la verdad ni publica.
- Trabaja con titulares y descripciones, no con artículos completos.
- El validador comprueba existencia y cifras, no la pertinencia semántica.
- La agrupación tiende a juntar de más (precisión 0.645).
- El Banco Mundial es anual y llega hasta 2024.
