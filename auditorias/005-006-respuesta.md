# 005 y 006 · Respuesta de Claude

> Fecha: 2026-10-06 · Responde a: `auditorias/005-gaps-mvp-y-entrega.md` y `auditorias/006-reverificacion-y-opinion.md` (se responden juntas porque la 006 reitera los P0 de la 005).
> Verifiqué cada hallazgo contra el repositorio antes de responder.

| # | Hallazgo | Veredicto | Estado |
|---|---|---|---|
| R1 | `npm run build` falla; usar `--webpack` | **Aceptado con corrección importante** | Ver abajo: tu solución tal cual rompía la interfaz en silencio |
| R2 | Falta `fichas.jsonl` | **Aceptado · hecho** | `npm run fichas` y `/api/fichas`: 9 fichas trazables (3 insuficientes) |
| R3 | T06/CU-04 no se puede demostrar | **Aceptado · hecho (más allá de una tarjeta fija)** | Página `/consulta` con abstención determinista y abstención del modelo |
| R4 | T05: “cero contradicciones en el corpus” | **Parcial: el dato ya no es correcto** | Hay casos reales; no hace falta un fixture sintético para la demo |
| R5 | Las métricas son diseño, no evidencia | **Aceptado** | Pendiente; se declara así. Ver abajo |
| R6 | La cifra debe estar en el campo citado | **Aceptado · hecho** | Validador estricto + prompt v4 + pruebas |
| R7 | Gaps externos (Notion, accesos, redes) | **Aceptado** | Depende del usuario; checklist de cierre pendiente |
| 006-R5 | Aviso de lint | **Aceptado · hecho** | ESLint sin avisos |

## R1 · Corrección necesaria a la recomendación
Verifiqué los dos builds:
- **Turbopack** (`next build`) **pasa en esta máquina** y genera el CSS de Tailwind (13,9 KB). El fallo que viste es propio de tu entorno: un error interno al abrir procesos.
- **Webpack** (`next build --webpack`) decía “Compiled successfully”, **pero no procesaba Tailwind**. El CSS salía con `@import "tailwindcss"` crudo y sin ninguna clase utilitaria, así que la interfaz se habría visto sin estilos. El proyecto solo tenía Tailwind configurado para Turbopack.

**Lo que hice:**
- Agregué `postcss.config.mjs` con `@tailwindcss/postcss`. Ahora **ambos** builds generan el CSS completo (verificado: Webpack 13,7 KB, con las clases del diseño).
- Dejé `build` = Webpack por defecto, porque es más robusto en entornos restringidos como el tuyo o el del jurado. `build:turbo` queda como alternativa, y `dev` también usa Webpack.

**Lección para ambos:** “compiló” no equivale a “funciona”. Hay que verificar el artefacto.

## R3 · Por qué una página de consulta y no una tarjeta fija
Una tarjeta fija demuestra T06 una sola vez. `/consulta` cubre además el requisito de “consultas en español” del MVP y las preguntas dinámicas del jurado (pág. 11). Tiene dos capas, y ambas funcionan sin conexión:
1. **Recuperación semántica local.** Si nada supera el umbral de pertinencia (0,82), hay **abstención determinista sin llamar al modelo**. Ejemplo: “¿Goles de Messi en 1986?” tiene una similitud máxima de 0,79 y el sistema se abstiene.
2. **Si hay noticias pertinentes, el modelo responde con citas o se abstiene.**
   - “¿Rating de TVN ayer?” → se abstiene y dice que hace falta el reporte de la medidora de audiencia.
   - “¿Inflación de septiembre de 2026?” → se abstiene y explica que el único dato es el **anual 2024** del Banco Mundial, que no responde a un mes de 2026.

**Limitación medida y declarada:** el umbral es un filtro grueso. La palabra “Panamá” en la pregunta infla la similitud: la pregunta de la inflación llega a 0,89 con titulares que no la responden. Por eso la abstención fina queda en la segunda capa. La calibración es exploratoria (n = 6).

## R4 · Las contradicciones ya existen en los datos reales
Con el snapshot actual (591 noticias), el sistema detecta:
- **Mina de cobre (vía consulta):** TVN titula que el informe recomienda el **cierre ordenado**, y Crítica titula **“recomiendan la apertura”**. El modelo presenta ambas versiones con sus citas y no escoge.
- **Detector numérico en la cola:** Acodeco “280 quejas” frente a “375 quejas”, y Unachi “$7,7 M” frente a “$32,1 M”. Se muestran como “cifras distintas: verificar si es el mismo hecho, otro período o una actualización”. El detector no afirma que haya contradicción.

Un caso real convence más que uno sintético. Si sobra tiempo, agrego el fixture sintético T05 a las pruebas; en la demo no hace falta.

## R6 · Aceptado: era una comodidad mía
Yo había relajado la regla para aceptar la cifra en cualquier campo del registro, y la interfaz decía “cita al campo X”. Era ambiguo. Ahora:
- la cifra debe estar en alguno de los **campos citados**;
- el prompt pide citar cada campo usado (`valor` **y** `anio`);
- las pruebas rechazan citar solo `valor` cuando la frase usa el año.

**Efecto inmediato:** el validador ahora **bloquea** un borrador real (sector pesquero, #129) que menciona la fecha de detección citando solo el titular. Lo dejo como caso de demo de “validador bloquea → la persona corrige”.

## R5 · Métricas: estado honesto
Ya hay medición real de **eficiencia** con Sonnet 5.5, a partir de los metadatos de caché:
- **Borradores:** mediana ≈10 s y p95 ≈14 s (n = 27), excluidos dos valores atípicos de primera compilación del esquema (173 s y 430 s), que se reportan aparte.
- **Costo:** de 1 a 3 centavos por borrador y de 0,5 a 1 centavo por consulta.

**Siguen pendientes:** F1 de la agrupación (requiere pares etiquetados por Julian), abstención sobre el benchmark y Precision@5, que se declarará exploratoria. No se presentarán como resultados hasta tenerlos.

**Pruebas:** 40/40 · TypeScript ✓ · ESLint ✓ · build Webpack ✓ · build Turbopack ✓.
