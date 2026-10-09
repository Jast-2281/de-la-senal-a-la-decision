# Cierre final de entrega · instrucciones para Claude

> Fecha: 2026-10-08 · **Codex ya revisó** el repositorio, la exportación real de Notion y el remoto de GitHub. Auditoría de respaldo: `auditorias/012-cierre-entrega.md`.

## Estado confirmado

- GitHub está sincronizado: `origin/main` responde y apunta al commit actual `13ba401`.
- El repositorio pasa las verificaciones: **6 archivos / 44 pruebas**, lint y `npx tsc --noEmit` correctos.
- La página de equipo en la exportación de Notion existe, identifica a Arijuma y contiene los tres enlaces internos requeridos: documentación funcional, documentación técnica y presentación pitch day.
- No hay Canva/PPT versionados ni `.env.local`, `SKILL.md` o `typesafe-ai.zip` en `git ls-files`.
- T10 cuenta con evidencia real: seis capturas versionadas en `docs/evidencia/t10/`, y tres de ellas están incorporadas en la exportación de Notion.

## Bloqueador de entrega: Notion y repositorio no están sincronizados

La exportación de Notion revisada no refleja los últimos cambios que ya están en GitHub. No es un problema de código; es una inconsistencia visible para el jurado.

| Hallazgo | En la exportación de Notion | Estado correcto en el repositorio | Acción necesaria en Notion |
|---|---|---|---|
| Enlace GitHub | En documentación funcional aparece `Repositorio: [enlace a GitHub, por completar]`. | URL real: `https://github.com/Jast-2281/de-la-senal-a-la-decision` | Reemplazar el marcador por el enlace real. |
| T10 en riesgos funcionales | Dice: “T10 (ensayo en modo avión pendiente)”. | La matriz registra el ensayo del 8 oct y las seis capturas están versionadas. | Cambiarlo por un estado consistente y enlazar/mencionar la evidencia. |
| T10 entre páginas | Técnica lo marca aprobado; funcional lo marca pendiente. | La matriz es la fuente actual de estado. | Unificar el texto en las tres páginas; no debe haber dos estados para el mismo test. |
| Cronología | La exportación no muestra los commits finales de entrega. | GitHub llega a `13ba401`. | Actualizar si la cronología se presentará al jurado; si no, eliminarla de la documentación funcional para no exponer un estado desactualizado. |

## Acciones de cierre, en este orden

1. Actualizar las tres páginas reales de Notion desde los documentos vigentes de `docs/notion/entrega/`.
2. Revisar manualmente que funcional, técnica y pitch no contengan “por completar”, “pendiente” incorrecto ni cifras distintas.
3. Abrir la página de equipo en una ventana privada/sin sesión de Notion y comprobar que se ve y que los tres enlaces funcionan. Esta prueba es necesaria: un ZIP no demuestra que el jurado pueda acceder.
4. Enviar el correo a `hackiathon@viamatica.com` con:
   - enlace público del reto / repositorio;
   - enlace de Documentación funcional en Notion;
   - enlace de Documentación técnica en Notion;
   - enlace de Presentación pitch day en Notion.
5. Guardar una captura o copia del correo enviado como evidencia de envío.
6. Exportar Notion nuevamente después de editarlo y comparar esa exportación con `docs/notion/entrega/` y `docs/matriz-aceptacion.md`.

## Recomendación opcional pero valiosa: T10

La evidencia actual es funcional y mucho más fuerte que una declaración textual. Sin embargo, las capturas no muestran de manera concluyente la desconexión de red. Si queda tiempo, grabar un único video de 30–60 segundos que muestre:

1. Wi‑Fi o modo avión desactivado;
2. build de producción iniciado;
3. agenda y ficha cargando;
4. una consulta sin caché que se abstiene;
5. la consulta cacheada que devuelve citas.

No hace falta rehacer el producto ni alterar métricas. Tampoco se debe presentar como medido lo que sigue pendiente: el benchmark de reserva y la medición humana del prompt v6 permanecen abiertos y están correctamente declarados como tales.

## Criterio de salida

La entrega queda lista cuando la página de equipo sea accesible sin sesión, los tres enlaces funcionen, Notion y GitHub digan lo mismo sobre GitHub/T10, y exista evidencia del correo enviado. Después de eso, el proyecto está en condiciones sólidas de ser presentado.
