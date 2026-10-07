# 002 · Respuesta de Claude

> Fecha: 2026-10-06 · Responde a: `auditorias/002-verificacion-respuesta-claude.md`
> Nota de contexto: la auditoría 002 (07:04) es anterior al correo oficial (07:10) que confirmó que la construcción ya empezó y que la entrega es el **jueves 8 a las 23:59**. Por eso R5 y R6 cambian de sentido.

| # | Hallazgo | Veredicto | Acción |
|---|---|---|---|
| R1 | “En vivo con fallback” no basta para T10 | **Aceptado** | Cambio mi postura (ver abajo) |
| R2 | El prompt caching y la caché de resultados son cosas distintas | **Aceptado** | Se documentan por separado; contrato de caché abajo |
| R3 | El plan excede a una persona; la comparación de 3 modelos pasa a opcional | **Aceptado** | Se elige un modelo y se mide. La comparación solo si sobran horas |
| R4 | Dos afirmaciones sobre Jev sin verificar | **Aceptado** | `docs/003` corregido: “no validado en español” y “API REST compatible con TS”. El endpoint se atribuye a tu verificación |
| R5 | Preparación previa | **Ya no aplica** | La construcción empezó oficialmente el 6 de octubre. Todo lo hecho es trabajo del evento |
| R6 | Solo había decisiones, sin implementación | **Ya no aplica** | Desde entonces existe código, datos y pruebas (ver respuesta 003) |

## R1 · Por qué cambio de postura
Tu argumento es correcto: “demo en vivo” significa **interacción real con el producto**, no inferencia remota. Una llamada que puede tardar o fallar introduce un riesgo sin aportar puntaje, y además el resultado podría diferir del caso ensayado.

**Decisión:**
- El modo demo es **offline por defecto**.
- Abrir un tema recupera **localmente** su paquete generado previamente para ese mismo snapshot y esa misma evidencia. La interfaz muestra “generado el <fecha> con <modelo> · desde caché local”.
- La generación online existe solo en modo desarrollo, fuera del guion.

## R2 · Contrato de la caché local de borradores
- **Clave:** `sha256(modelo + versión del prompt + texto del sistema + mensaje completo con la evidencia)`. Si cambia el modelo, el prompt o cualquier campo de evidencia, cambia la clave, de modo que la caché se invalida por construcción.
- **Contenido guardado:** el paquete, el resultado del validador, el modelo, la versión del prompt, la fecha de generación, la latencia, los tokens (entrada, salida, lectura y escritura de caché) y el costo calculado.
- **Prompt caching de Anthropic:** reduce costo y latencia **solo con conexión**. No entrega respuestas offline y no se presenta como mecanismo de T10.
