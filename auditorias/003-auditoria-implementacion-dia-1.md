# 003 · Auditoría de implementación del día 1

> Auditor: Codex · Fecha: 2026-10-06 · Alcance: código, datos procesados, pruebas y build existentes en el repositorio. No es una evaluación de Notion ni de permisos externos, que no están disponibles en el repositorio.

## 1. Veredicto: **rechazar como entrega actual; aprobar la base técnica para continuar**

Claude construyó una base de pipeline seria y verificable, pero el producto no está listo para mostrarse: la interfaz sigue siendo la plantilla de Next.js, el build de producción falla offline, no hay README y el modo offline no tiene ni modelo local ni paquetes editoriales cacheados. Hoy se puede enseñar código y datos; no se puede demostrar el flujo requerido al jurado.

## 2. Lo más fuerte

1. **Snapshot reproducible y trazable.** `manifest.json` declara explícitamente que es contingencia, registra consultas, hashes, licencias y transformaciones. La auditoría recalculó los hashes de todos los archivos procesados y coinciden. La cuadrícula Banco Mundial de 540 celdas es matemáticamente correcta (6 × 6 × 15), no 1.350.
2. **Núcleo de datos bien separado y probado.** Ingesta tolerante a errores, fechas GDELT separadas de publicación, agrupación, procedencia, priorización, estado de evidencia y validación de citas son módulos tipados. `npx tsc --noEmit`, `npm run lint` y `npm test` pasan; Vitest ejecuta 30 pruebas en 5 archivos.
3. **Decisiones de producto alineadas con el pliego.** No confundir prioridad con evidencia, etiquetar el snapshot de contingencia y mostrar el texto exacto de un campo citado son decisiones correctas y defendibles.

## 3. Riesgos críticos

### R1 · No existe interfaz de producto: P0 absoluto

`src/app/page.tsx` continúa siendo el starter de `create-next-app` (“To get started, edit the page.tsx”), con logos y enlaces de Vercel. No consume `organizado.json`, no hay cola, ficha, paquete editorial, estados de revisión ni búsqueda. El pipeline no equivale a prototipo demostrable.

**Acción:** reemplazar inmediatamente la página por la cola de investigación offline. Aunque sea con JSON estático, debe permitir abrir un tema y ver: puntaje, estado de evidencia, procedencias, fuentes, vacíos y siguiente acción. Después conectar ficha y paquete editorial.

### R2 · El build de producción falla sin internet, contradiciendo T10

`npm run build` falla porque `src/app/layout.tsx` usa `next/font/google` para descargar Geist y Geist Mono. La comprobación falla explícitamente sin acceso a Google Fonts. Una demo offline no puede depender de ese recurso en build o arranque.

**Acción:** quitar `next/font/google` y usar fuentes del sistema, o incluir archivos de fuente locales y `next/font/local`. Repetir `npm run build` y ejecutar la demo con red desconectada antes de declarar T10 aprobado.

### R3 · Modo offline incompleto: no hay modelo ni borradores locales

El código contempla `MODELS_OFFLINE=1`, pero el repositorio no contiene `models/` ni `data/cache/llm/`. En ese estado, embeddings no podrán descargarse y `generarPaquete()` lanzará “Modo offline y sin borrador en caché”. T10 no está implementado como experiencia de usuario ni cubierto por una prueba.

**Acción:** para la demo, no depender de generar embeddings ni textos en tiempo real. Incluir los JSON procesados y mínimo cinco paquetes editoriales cacheados, con hash de evidencia/prompt, modelo, fecha, tokens, costo y etiqueta visible “cacheado”. Añadir una prueba que ponga `MODELS_OFFLINE=1` y complete la ruta demo sin I/O de red.

### R4 · Entregable obligatorio faltante: README

El pliego exige repositorio con README, instalación, comando de ejecución, dependencias fijadas, `.env.example` y pruebas. Existe `.env.example`, lockfile y pruebas, pero no existe `README.md`. Tampoco hay instrucciones para regenerar datos, iniciar, activar modo offline, elegir snapshot o correr la verificación de T01–T10.

**Acción:** crear README antes de ampliar funcionalidades. Debe incluir una demo de tres comandos, requisitos, variables, origen/licencias de datos, limitaciones, cómo ejecutar offline y qué está cacheado versus calculado.

### R5 · “T01–T10” está sobredeclarado: cobertura real parcial

Hay pruebas muy buenas de partes deterministas, pero no una matriz de aceptación completa.

| Prueba | Estado observado | Falta |
|---|---|---|
| T01, T02, T04, T08 | Parcialmente cubierta | Integración contra snapshot/UI. |
| T03 | Parcial | Verificar que UI muestre fecha original, no solo N=0. |
| T05 | Parcial | Mostrar versiones y revisión pendiente en ficha. |
| T06 | Parcial | Falta consulta sin respuesta real y abstención explícita en producto. |
| T07 | Parcial | Escape de etiqueta probado; falta ejecución con fuente maliciosa y salida segura. |
| T09 | Parcial | Falta paquete generado/cacheado completo y revisión de formato/citas. |
| T10 | No cubierta | Build y demo offline fallan/son incompletos. |

No describir las 30 pruebas como “T01–T10 automatizados”; eso sería engañoso ante el jurado.

### R6 · Dos huecos del validador reducen la protección declarada

- Define límites de guion de 110–160 palabras pero `validarPaquete()` nunca los aplica.
- Solo verifica números de hechos/declaraciones. Una inferencia o hipótesis puede introducir una cifra sin evidencia y aún pasar. El prompt lo prohíbe, pero el validador no lo impide.

**Acción:** aplicar el rango de palabras del guion. Para toda afirmación que contenga cifras, exigir cita y coincidencia literal, o bloquear cifras en inferencias/hipótesis. Mantener la revisión humana de pertinencia.

### R7 · El método de procedencia puede subcontar fuentes independientes

Unir medios distintos por similitud alta de titulares puede identificar réplicas, pero no prueba que compartan agencia/origen. Puede fusionar reportes independientes sobre el mismo hecho y disminuir erróneamente la corroboración. El pliego pide distinguir repetición de corroboración; no pide presuponer réplica.

**Acción:** etiquetar el motivo de agrupación de procedencia: `mismo_medio`, `agencia_explícita`, `titular_similar (posible réplica)`. En UI, presentar los últimos como “posible réplica; revisar origen” y no como certeza. Solo agencia explícita o mismo medio deben consolidar automáticamente para la métrica fuerte.

## 4. Cambios priorizados

| Prioridad | Cambio | Criterio de terminado |
|---|---|---|
| P0 | Sustituir la página starter por cola + ficha offline con el JSON existente. | En 20 segundos se entiende y se abre un tema sin red. |
| P0 | Eliminar la dependencia remota de fuentes y lograr build. | `npm run build` pasa con red desconectada. |
| P0 | Crear README y comando de demo offline. | Una persona nueva reproduce la demo desde cero. |
| P0 | Preparar 5 paquetes cacheados y sus metadatos. | `MODELS_OFFLINE=1` permite completar el guion del pitch. |
| P1 | Implementar revisión, búsqueda, ficha y exportación `fichas.jsonl`. | Una decisión humana cambia estado y queda persistida. |
| P1 | Corregir límites de guion/cifras y añadir las pruebas faltantes. | Matriz T01–T10 dice qué prueba es automatizada, manual o pendiente. |
| P1 | Hacer conservadora y explicable la procedencia. | Cada consolidación muestra motivo y posibilidad de revisión. |
| P2 | Calibrar umbrales de embeddings/baseline con pares humanos. | Métrica con tamaño, método, fallos y limitación. |

## 5. Qué no construir

- Llamada online de LLM en el flujo principal.
- Comparativa de tres modelos antes de que pase el build y exista UI.
- Nuevas capacidades IA, autenticación, base de datos o automatización de Notion.
- Más fuentes GDELT mientras la experiencia de los 400 registros ya descargados no se pueda demostrar.
- Un “chat”; la búsqueda sobre cola es suficiente.

## 6. Prueba de jurado

> “Apaga Wi-Fi. Abre el repositorio desde cero, corre el comando documentado y muéstrame un tema con su puntaje, una posible réplica, una cifra anual correctamente fechada, una abstención y la decisión humana final.”

**Resultado hoy:** no pasa. El build necesita Google Fonts y la pantalla es la plantilla de Next.js. La base de datos y la lógica sí dan un punto de partida sólido para que pase tras resolver P0.
