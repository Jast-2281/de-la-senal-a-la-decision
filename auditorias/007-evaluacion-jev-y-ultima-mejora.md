# 007 · Evaluación de Jev y de la última mejora de Claude

> Auditor: Codex · Fecha: 2026-10-06 · Alcance: implementación actual, `typesafe-ai.zip`, `SKILL.md`, `docs/005-costo-llm-jev-pdfplumber.md`, pliego y documentación oficial de TypeSafe.

## 1. Veredicto: **no integrar Jev en el MVP ni en la ruta de demo; permitir solo un experimento corto y cacheado si todas las puertas de admisión ya están cerradas**

La última mejora de Claude sí es buena: corrigió el build por defecto a Webpack, creó `fichas.jsonl`, añadió consultas en español con abstención y documentó costos. El proyecto ya está en fase de validación/ensayo, no de añadir dependencias críticas.

Jev **no está funcionando en este repositorio** hoy. Se añadió `typesafe-ai.zip`/`SKILL.md` y documentación de diseño, pero no existe `@typesafe-ai/sdk` en `package.json`/lockfile, `TYPESAFE_API_KEY` en `.env.example`, llamada a `api.typesafe.ai`, módulo TypeSafe, caché Jev ni benchmark. Por tanto, no hay evidencia de mejora de costo, rendimiento o calidad atribuible a Jev.

## 2. Lo más fuerte de la última mejora

1. **Cierre de P0 de entrega.** `package.json` usa Webpack por defecto; existe `fichas.jsonl`; README describe el recorrido y las consultas; hay ruta `/consulta` y exportación de fichas.
2. **Costo de Claude ya es bajo y medido.** Los metadatos existentes sostienen que el gasto principal es redactar salida libre. El proyecto ya cachea resultados y su modelo principal no debe cambiar por moda.
3. **Jev sí tiene un uso conceptualmente pertinente.** La documentación oficial propone usar `Choice` para decidir si el contexto de una cita apoya, contradice o no dice nada sobre una afirmación. Eso ataca exactamente el límite declarado del validador actual: este verifica estructura y cifras, no pertinencia semántica.

## 3. Riesgos críticos

### R1 · No confundir “la skill está en la carpeta” con “Jev funciona”

El ZIP contiene únicamente `SKILL.md`. No instala el SDK, no concede acceso a la API y no ejecuta ninguna inferencia. La documentación oficial exige Node 20+, `npm install @typesafe-ai/sdk` y `TYPESAFE_API_KEY`; ninguno está integrado/configurado aquí.

**Conclusión:** no hay prueba funcional, de latencia ni de costo en este proyecto. No decir al jurado que Jev es una capacidad actual.

### R2 · Jev no reduce el costo principal

Jev devuelve decisiones estructuradas; no genera el brief, guion o copy. La documentación oficial describe `Choice` como selección entre opciones definidas, con probabilidades y confianza. El costo principal medido del proyecto es la redacción de texto libre de Claude. Sustituir reglas/embeddings locales gratuitos por una llamada Jev remota aumenta dependencias y no ahorra materialmente.

**Conclusión:** no usar Jev para clasificación, agrupación, prioridad ni filtro de evidencia; esos pasos ya son locales, explicables y offline.

### R3 · La única excepción posible es calidad de citas, no performance

Un chequeo Jev por afirmación podría clasificar la relación `respalda / contradice / no dice nada` entre el claim y el campo de evidencia. Eso puede mejorar explicabilidad, pero no confirma la verdad del hecho. Además, los ejemplos oficiales usan ocho citas en inglés y requieren calibrar el umbral con los propios documentos; no hay evidencia aún en español ni en titulares/metadatos cortos.

**Regla de seguridad:** aun con confianza alta, Jev solo puede aportar una etiqueta auxiliar. Las decisiones editoriales y las citas bloqueadas/ambiguas continúan en revisión humana. Nunca presentar su confianza como verificación factual.

### R4 · Riesgo directo para T10 si se integra mal

Jev es una API. Una llamada en la ruta de demo rompería el requisito de operación sin internet. La única integración compatible sería: ejecutar/verificar previamente con red, persistir resultados junto al borrador y leerlos localmente durante la demo. Incluso así, aporta una dependencia y superficie de fallo adicional que no es necesaria para pasar el reto.

## 4. ¿El reto lo acepta?

**Sí, el pliego permite el stack libre y no prohíbe proveedores de IA externos.** Exige documentar proveedor, versión, prompts/parámetros, costo medido y limitaciones; mantener credenciales fuera del código/Notion; y demostrar una experiencia sin dependencia de internet durante el pitch. Jev sería aceptable solo si cumple estas condiciones.

No está “aceptado” por el reto como ventaja automática: una integración no medida, que requiera red o que prometa verificación de verdad debilitaría la puntuación de evidencias y T10.

## 5. Cambios priorizados

| Prioridad | Decisión | Criterio |
|---|---|---|
| P0 | No tocar el flujo demo actual por Jev. | La demo offline sigue siendo la ruta principal. |
| P1, solo si sobran 30–45 min y existe API key activa | Ejecutar experimento J1 sobre 20 afirmaciones españolas ya cacheadas. | Comparar con etiquetas humanas; guardar inputs, respuestas, costo, latencia y errores. |
| P1 | Adoptar solo si el experimento es seguro. | ≥90% de concordancia con humano y **cero** citas no sustentadas autoaceptadas; las inciertas van a revisión. |
| P2 | Si se adopta, cachear la etiqueta Jev. | Sin llamadas Jev durante demo; UI dice “chequeo semántico auxiliar, no verificación de verdad”. |
| P2 | Si no se adopta, registrar descarte. | Notion muestra hipótesis, prueba, resultado y trade-off. Eso suma trazabilidad. |

## 6. Qué no construir

- Jev para generar textos: no puede hacer ese trabajo.
- Jev para reemplazar reglas, embeddings locales o control humano.
- Llamadas online de Jev en `/consulta`, cola, ficha o pitch.
- Una integración sin benchmark español ni etiquetas humanas.

## 7. Prueba de jurado

> “¿Qué hace Jev que tu validador determinista no hace, cuántas afirmaciones en español evaluaste, en cuántas coincidió con el revisor humano y qué ocurre cuando tiene baja confianza o se va internet?”

La respuesta correcta hoy: “Lo evaluamos/lo consideramos como verificador semántico auxiliar; la demo no depende de él y la decisión es humana.” La respuesta incorrecta: “Jev verifica que las noticias sean verdad.”
