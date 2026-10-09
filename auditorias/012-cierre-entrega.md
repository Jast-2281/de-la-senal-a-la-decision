# 012 · Auditoría de cierre antes de entrega

> Fecha: 2026-10-08 · Actualizada tras inspeccionar la exportación de Notion `3a55400f-7023-4783-bb8d-e7fcb882250c_ExportBlock-a473f92a-4b79-4b7a-8fa8-7136a02fb034.zip`. Alcance: revisión local, historial Git, exportación de Notion y Descargas. No se modificó código, datos ni configuración del producto.
>
> **Veredicto global: no aprobar aún el envío.** El producto y sus controles locales están en buen estado, pero Notion y el repositorio no contienen la misma versión de la entrega. Además, no hay evidencia del correo obligatorio. La exportación ya permite comparar y confirma los desajustes.

| Punto | Veredicto | Evidencia verificada | Cierre necesario |
|---|---|---|---|
| 1. Notion vs. repositorio | **No aprobado: desincronizado** | El ZIP contiene la página de equipo y las tres páginas requeridas. Las cifras principales coinciden (44 pruebas; F1 0.769 vs. 0.370; 52/52; v5 con 60 % y v6 sin medir). Pero la documentación funcional exportada todavía dice `Repositorio: [enlace a GitHub, por completar]`, mientras que el repositorio local ya contiene la URL. La exportación tampoco incluye los commits finales de la cronología. En riesgos funcionales, T10 figura como “ensayo en modo avión pendiente”; en la técnica figura aprobado. | Actualizar las páginas reales de Notion desde la versión actual del repositorio, verificar que el mismo estado de T10 aparezca en funcional y técnica, y exportar nuevamente para comprobar que no queden marcadores ni contradicciones. |
| 2. Requisitos de la organización (8 oct) | **Parcial** | La página de equipo de la exportación sí contiene los tres enlaces internos: documentación funcional, técnica y pitch day; identifica al equipo y enlaza GitHub. No hay archivos Canva/PPT versionados. `origin` ya apunta a `https://github.com/Jast-2281/de-la-senal-a-la-decision.git` y `git ls-remote` confirmó que `main` está publicado en `13ba401`, el commit local actual. La exportación no prueba que Notion sea público para el jurado, y no existe borrador ni comprobante del correo a `hackiathon@viamatica.com`. | Abrir la página en una ventana privada/sin sesión para comprobar acceso público; luego enviar el correo con URL pública del reto + las tres URLs de Notion y guardar evidencia de envío. |
| 3. Seguridad antes de hacer público el repo | **Aprobado con precaución operativa** | En `git ls-files` hay **0** `.env.local`, **0** `SKILL.md` y **0** `typesafe-ai.zip`. La búsqueda de patrones de claves no halló claves privadas, AWS ni claves de API de la aplicación; las coincidencias revisadas son URLs públicas del corpus. No aparecieron teléfonos ni correos personales en el contenido versionado. `npm test` pasó **44/44**; lint y `npx tsc --noEmit` pasaron. | Antes de ejecutar cualquier `git add`, retirar o mantener explícitamente sin versionar los dos archivos que hoy están en la raíz: `SKILL.md` y `typesafe-ai.zip`. No usar `git add -A` sin revisar `git status`. Repetir este chequeo justo antes del primer push público. |
| 4. T10 | **Parcial: evidencia funcional, pero contradicción documental y red sin prueba concluyente** | Los commits `17f0392` y `3624822` existen. El segundo versiona seis capturas en `docs/evidencia/t10/`; la matriz documenta el ensayo del 8 oct, 20:43–20:50. La exportación de Notion integra tres capturas (agenda, respuesta en caché y abstención Balboa) y describe el ensayo. | Sin embargo, la página funcional exportada todavía dice “ensayo en modo avión pendiente”. Además, las capturas no demuestran de forma inequívoca que Wi‑Fi estuviera apagado: el icono de estado de red no muestra una desconexión clara. Sincronizar Notion y, si queda tiempo, grabar un video corto continuo que muestre red desactivada, build de producción, agenda, ficha, abstención y respuesta cacheada. |

## Hallazgos de consistencia local

- Las fuentes locales vigentes sí coinciden en el conteo de pruebas: `6 archivos, 44 pruebas aprobadas (8 oct)` en la matriz, la página de pruebas de Notion y la documentación técnica.
- El contenido local declara honestamente que el benchmark de reserva sigue pendiente y que la versión v6 del prompt no está medida. No debe editarse ese límite para que parezca cerrado.
- La exportación de Notion tiene la página de equipo con sus tres enlaces y enlace al repositorio, pero la página funcional conserva un marcador de GitHub. Esta es una contradicción de entrega, no una diferencia cosmética.
- La exportación solo integra tres capturas de T10, mientras el repositorio tiene seis; no es un problema por sí mismo, pero los estados de T10 deben ser idénticos en todas las páginas.

## Secuencia mínima de cierre

1. Sincronizar las tres páginas de Notion con el estado actual del repositorio: URL de GitHub, cronología y estado T10.
2. Abrir la página de equipo en una ventana privada/sin sesión y verificar sus tres enlaces.
3. Enviar el correo a `hackiathon@viamatica.com` con: enlace público del reto, documentación funcional, documentación técnica y pitch day de Notion; conservar una evidencia del envío.
4. Descargar una exportación final y comparar de nuevo contra `docs/notion/entrega/` y `docs/matriz-aceptacion.md`.
5. Si queda tiempo, reforzar T10 con una grabación continua de 30–60 segundos que demuestre el estado sin red.

**Decisión de entrega:** no enviar todavía. La corrección más urgente no es técnica: es sincronizar Notion con el repositorio y después ejecutar el envío verificable del correo.
