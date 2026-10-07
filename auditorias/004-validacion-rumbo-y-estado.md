# 004 · Validación del rumbo y estado posterior a auditoría 003

> Auditor: Codex · Fecha: 2026-10-06 · Alcance: estado actual del repositorio frente a la auditoría 003 y evaluación del rumbo estratégico.

## 1. Veredicto: **el rumbo de producto es correcto; la secuencia actual debe corregirse antes de continuar**

La apuesta correcta es una cola editorial TVN, offline, trazable y centrada en evidencia/procedencia/abstención. No recomiendo cambiar de problema, modalidad ni arquitectura base.

Pero no recomiendo seguir ampliando pipeline, IA ni fuentes ahora. No hay evidencia de que Claude haya atendido la auditoría 003: no existe respuesta `003-...respuesta.md`; no existe README, caché LLM, modelos locales, UI de producto ni pruebas adicionales. La secuencia debe pasar inmediatamente de infraestructura a experiencia demostrable.

## 2. Lo más fuerte

1. **Problema, usuario y flujo correctos:** editor/a de TVN que necesita decidir qué investigar, no un chatbot genérico.
2. **Mecanismo de confianza correcto:** evidencia visible, procedencias independientes, límites temporales y estado de evidencia separado de prioridad.
3. **Arquitectura proporcional si se congela aquí:** JSON procesado + Next.js + una capacidad de agrupación semántica local es suficiente para el hackathon.

## 3. Riesgos críticos

- El producto no es demostrable hasta sustituir la pantalla starter por la cola editorial.
- El build no pasa sin internet por Google Fonts; T10 no es una promesa que el código actual pueda sostener.
- La generación offline no existe sin archivos cacheados. El código de fallback no equivale a un fallback disponible.
- No hay README, por lo que el entregable obligatorio de repo no está completo.
- Continuar con embeddings, modelos, más fuentes o comparativas de costo antes de resolver lo anterior reduce, no aumenta, las probabilidades de ganar.

## 4. Cambios priorizados

1. **Detener expansión técnica.** No añadir fuentes, modelos, endpoints ni pantallas extra.
2. **Crear la cola offline real.** Usar `organizado.json`; mostrar un tema prioritario, su puntaje, procedencias, estado, vacío y acción editorial.
3. **Crear una ficha excelente.** Debe abrir fuentes/campos exactos, contexto anual correctamente fechado y contradicción/limitación si aplica.
4. **Resolver offline de verdad.** Quitar fuentes remotas; añadir cinco resultados cacheados y ejecutar el guion con Wi-Fi apagado.
5. **Completar entrega.** README, estados de revisión, `fichas.jsonl`, matriz honesta T01–T10 y enlace/estructura Notion.

## 5. Qué no construir

- Chat, banca, login, base de datos, automatización Notion, nuevos proveedores IA y comparativa multi-modelo.
- Más de una ficha “wow” antes de que exista una ruta de demo estable.
- Cualquier reclamo de IA o métricas que no tenga numerador, denominador, fallos y evidencia guardada.

## 6. Prueba de jurado

> “En menos de un minuto, explícame qué tema debe investigar un editor, por qué importa, cuántas procedencias son realmente independientes, qué no sabes todavía y qué cambió cuando el editor revisó el borrador.”

El camino correcto gana si esta secuencia funciona offline, es visual y está respaldada en Notion. El camino falla si el jurado ve la plantilla de Next.js, una arquitectura explicada y promesas de funciones futuras.
