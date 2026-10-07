# 008 · Evaluación de identidad TVN Media y video para el pitch

> Auditor: Codex · Fecha: 2026-10-06 · Alcance: código visual, build, sitio público de TVN, pliego y evaluación estratégica de Seedance 2.5/Higgsfield.

## 1. Veredicto: **aprobar la actualización visual; no integrar video de fondo en la aplicación**

La aplicación ya tiene una identidad editorial coherente con TVN Media: índigo dominante, amarillo de señalización, azul editorial, rótulos compactos, jerarquía de escaleta y tipografía robusta. El cambio aumenta la credibilidad de que es una herramienta para una redacción, sin fingir ser el sitio oficial de TVN.

El video generativo no debe ser un fondo ni una funcionalidad del sitio. Puede funcionar como una apertura de 6–8 segundos del **pitch**, reproducida localmente antes de abrir el prototipo. Solo aporta valor si comprime la historia “ruido → decisión sustentada”; si es decorativo, distrae de la evidencia y arriesga la demo.

## 2. Lo más fuerte

1. **Sistema visual consistente y offline.** `Montserrat` para rótulos y `Mulish` para lectura son sustitutos libres locales de los tipos corporativos identificados; no hay descarga de Google Fonts. `npm test` (40), lint y el build Webpack pasan.
2. **Uso funcional de la paleta.** Índigo organiza la interfaz, amarillo marca puntaje/llamados y los semáforos de evidencia conservan significado propio con texto e icono. Es mejor que usar color solo como decoración.
3. **Decisión de marca prudente.** No se usa el logo oficial; se declara “Prototipo para TVN Media · hackIAthon”. Evita sugerir afiliación o una interfaz oficial ya aprobada.

## 3. Riesgos críticos

### R1 · No afirmar que es una reproducción exacta de la marca

La web pública de TVN confirma un producto noticioso de navegación densa y categorías editoriales, pero no se cuenta con un manual de marca/licencia de tipografías. Las fuentes corporativas declaradas no se deben redistribuir; los equivalentes locales son la decisión correcta.

**Acción:** describirlo como “interfaz inspirada en la identidad editorial de TVN Media”, nunca como diseño oficial. Mantener la ausencia de logo y de nombres de programas/locutores en material generado.

### R2 · Video de fondo reduciría, no aumentaría, el valor del producto

Una herramienta de decisión necesita lectura rápida, contraste, cero distracción y carga fiable. Video de fondo añade peso, movimiento que compite con textos críticos y un riesgo de reproducción/audio durante la demo. Además, el pliego excluye la producción audiovisual automática del alcance del MVP: no conviene que el jurado crea que el producto pretende generar piezas televisivas.

**Decisión:** no colocar video detrás de la cola, ficha, consulta ni borrador.

### R3 · Un video solo vale si no altera la promesa del producto

Seedance 2.5 puede generar clips de 4–30 segundos, con audio sincronizado y referencias visuales. Eso puede producir una apertura pulida, pero no prueba que el producto sea mejor. El video debe ser local y no inventar una noticia, reportero, entrevista, audiencia o hecho de Panamá.

**Acción:** si se usa, rotular al final “Visual conceptual generado con IA para la presentación; no representa una noticia real ni es una función del prototipo”.

## 4. Recomendación de alto impacto

### Opción recomendada: apertura de pitch, no elemento web

Crear un clip de **6–8 segundos**, 16:9, 720p/1080p, sin voz y con audio apagable:

1. Titulares abstractos/superpuestos y señales de datos fluyen rápidamente sobre un mapa abstracto de Panamá, sin textos legibles ni marcas reales.
2. Se ordenan en tres tarjetas: **EVIDENCIA**, **VACÍOS**, **SIGUIENTE ACCIÓN**.
3. Corte directo al dashboard real con la frase del pitch: “No decidimos qué es verdad. Mostramos qué está sustentado y qué falta comprobar.”

Prompt de dirección sugerido:

> Cinematic 16:9 editorial motion graphic, no real people, no logos, no readable headlines. Abstract blue and deep indigo data signals flowing across a subtle Panama map silhouette, fragmented neutral news cards reorganize into three clear glowing labels: EVIDENCE, GAPS, NEXT ACTION. TV newsroom mood, refined yellow signal accents, restrained, trustworthy, high contrast, slow push-in camera, 7 seconds, no spoken voice, minimal ambient sound.

Primero generar un draft corto/720p y revisar legibilidad/composición; solo después renderizar el final. Guardar el MP4 localmente y tener como fallback una diapositiva estática con el mismo mensaje.

### Mejor inversión si solo queda tiempo para una cosa

No generar video. Ensayar el momento de producto que crea más confianza:

1. Un tema alto con evidencia insuficiente.
2. Una cifra oficial con año y límite temporal visibles.
3. Dos versiones incompatibles sin escoger una.
4. Una pregunta fuera del corpus con abstención clara.
5. La decisión humana registrada.

Eso puntúa directamente; el video solo enmarca la historia.

## 5. Qué no construir

- Hero de video en autoplay, video de fondo, música automática o avatar presentador.
- Video que parezca cobertura real de TVN, atribuya hechos o simule reportajes.
- Video como “salida generada por el producto”; la funcionalidad del MVP es inteligencia editorial, no producción audiovisual.
- Integración de Higgsfield/API en la aplicación: usar un archivo renderizado local si se decide producirlo.

## 6. Prueba de jurado

> “¿Este video fue producido por el prototipo y representa hechos reales? ¿Qué evidencia respalda esas imágenes?”

Respuesta correcta: “No. Es una visual conceptual de la presentación. El prototipo no genera audiovisuales ni publica; su valor está en la ficha de evidencia que abrimos ahora.”
