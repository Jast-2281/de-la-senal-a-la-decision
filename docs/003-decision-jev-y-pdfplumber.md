# 003 · Decisión: TypeSafe Jev (System One) y pdfplumber

> Autor: Claude · Fecha: 2026-10-06 · Estado: **propuesta para auditoría de Codex**
> Origen: el usuario preguntó si estas dos herramientas podrían reducir el costo o servir para leer PDFs.
> Corregido el 2026-10-06 tras la auditoría 002 de Codex (R4): se reformularon dos argumentos no verificados del motivo 5.
> Fuente revisada: https://typesafe.ai/blog/introducing-system-one-models-and-jev (consultada el 2026-10-06).

## Decisión 1 · TypeSafe Jev: **no se usa en el MVP; se menciona como próximo paso**

### Qué es, según el propio proveedor
- Un modelo "System One" que no genera texto libre. Devuelve valores estructurados con tipos garantizados y una confianza calibrada.
- Tareas que admite: clasificación, enrutamiento, extracción, puntuación y juicio.
- Cifras que publica: latencia de 70 a 500 ms; precio de $0,042 por millón de tokens de entrada, con la salida "gratis".

### Motivos del rechazo para el MVP
| # | Motivo | Evidencia |
|---|---|---|
| 1 | No ataca nuestro costo principal | El único gasto en IA es la **redacción** de los borradores, y Jev no genera texto libre. La clasificación (reglas) y la agrupación (embeddings locales) ya cuestan $0 |
| 2 | Disponibilidad incierta | Está en "early access" con lista de espera. No hay garantía de acceso antes de la entrega del 8 de octubre |
| 3 | Choca con T10 (demo sin internet) | Es solo una API en la nube. Sería un punto de fallo más en la demo |
| 4 | Sus afirmaciones no son verificables | El propio artículo dice que el 0 % de alucinación "no es empírico" y reconoce un posible sesgo en sus evaluaciones. El jurado pregunta "¿de dónde sale este dato?" |
| 5 | Encaje no validado | Sin validación en corpus en español (la documentación revisada no lo aborda; eso no prueba que no lo soporte). Se consume por API REST (`POST https://api.typesafe.ai/v1/systemone`, según la verificación de Codex en la auditoría 002), así que es compatible con TypeScript vía `fetch`, pero agrega una dependencia remota más |

### Dónde sí podría tener valor (diapositiva de próximos pasos, como hipótesis)
En producción, con miles de noticias al día, un modelo de este tipo podría abaratar y acelerar:
- la clasificación temática;
- el juicio de "mismo evento: sí/no" entre pares de titulares.

Se presenta como **hipótesis por validar**: requiere acceso, una prueba en español y una comparación contra nuestro baseline. No es un resultado.

## Decisión 2 · pdfplumber: **no se necesita**

| # | Motivo |
|---|---|
| 1 | Las fuentes obligatorias (A: RSS de TVN + GDELT; B: Banco Mundial; C: USGS) son CSV, JSON o GeoJSON. Ninguna es un PDF |
| 2 | Los PDFs solo aparecen en la fuente D (informes de la SBP), que pertenece a la extensión bancaria y está fuera de alcance |
| 3 | pdfplumber es una biblioteca de Python y el stack es TypeScript |

**Si en el futuro hiciera falta leer PDFs** (por ejemplo, si se activara la modalidad bancaria), las opciones en TypeScript serían `unpdf` o `pdfjs-dist`, conservando el número de página como cita, tal como exige el pliego en la pág. 7.

## Palancas de costo que sí se aplican
1. **Elegir el modelo por medición:** el más barato que cumpla sustento ≥90 %, abstención ≥80 % y mediana ≤15 s (ver `auditorias/001-…respuesta.md`).
2. **Prompt caching:** las instrucciones fijas y el esquema de salida se repiten en cada borrador y se cachean.
3. **Caché de borradores:** el mismo par (prompt + evidencia) no se paga dos veces. También sirve de respaldo offline (T10).
4. **El LLM solo redacta:** el puntaje, la agrupación, la procedencia, el contexto y la validación de citas se hacen con código o con cómputo local.
5. **Costo medido y reportado:** tokens y costo por borrador, con mediana y p95, tal como pide el pliego (pág. 8 y 9).

## Pregunta para Codex
¿Hay algún punto del flujo donde un modelo de salida estructurada barata (tipo Jev u otro) aportaría valor **medible dentro de los 2 días**, y que yo esté subestimando?
