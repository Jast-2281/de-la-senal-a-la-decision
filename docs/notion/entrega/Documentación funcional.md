# Inicio del reto · De la señal a la decisión

**Equipo:** Julian Taylor (construcción, datos, evaluación y revisión humana) · [pitch: por confirmar]
**Modalidad:** TVN · editorial (principal + digital). Banca: fuera de alcance, mencionada solo como extensión del mismo núcleo.
**Prototipo:** Next.js, demo sin conexión · **Repositorio:** [enlace a GitHub, por completar]

## Problema
Un equipo editorial revisa fuentes dispersas, donde la circulación de una noticia no equivale a su confirmación: varios medios repiten un mismo origen. Hace falta decidir rápido qué investigar, con qué evidencia y qué falta comprobar.

## Usuario
Editor/a o periodista de la mesa de TVN durante su turno.

## Alcance
Las 7 etapas del pliego (cargar → organizar → contextualizar → priorizar → explicar → producir → revisar), las consultas en español y la exportación `fichas.jsonl`.
**Fuera de alcance:** publicar, detectar noticias falsas, audiencia/rating, datos personales y producción audiovisual.

## Criterios de éxito
- Pasar de 591 noticias dispersas a una agenda de 5 temas explicada.
- Cada afirmación factual cita su evidencia (campo exacto).
- Abstenerse cuando no hay evidencia.
- Toda decisión final es humana y queda registrada.

## Datos
Snapshot `senales-evidencias-equipo-v2`: ventana del 2025-10-02 al 2026-09-30 (regla de la mediadora del reto); extracción del 2026-10-06.

---

# Plan y decisiones

## Backlog
| # | Tarea | Responsable | Estado |
|---|---|---|---|
| 1 | Analizar el pliego y elegir modalidad (TVN) | Julian + Claude | Hecho |
| 2 | Ingesta: RSS y sitemaps de TVN, GDELT, Banco Mundial, USGS; validación y reporte de calidad | Claude | Hecho |
| 3 | Organización: temas por reglas, agrupación con embeddings, procedencia independiente | Claude | Hecho |
| 4 | Contexto oficial, puntaje P y estado de evidencia | Claude | Hecho |
| 5 | Borradores con citas por afirmación y validador determinista | Claude | Hecho |
| 6 | Interfaz: agenda, ficha, consulta, revisión humana | Claude | Hecho |
| 7 | Prueba de inyección T07 de extremo a extremo | Claude | Hecho |
| 8 | Benchmark de 60 consultas (40 desarrollo + 20 reserva) | Claude (borrador) + Julian (validación) | Desarrollo validado; reserva pendiente |
| 9 | Etiquetado humano: 120 pares y 60 afirmaciones | Julian | Hecho |
| 10 | Métricas reproducibles (`npm run metricas`) | Claude | Hecho |
| 11 | Ensayo T10 en modo avión | Julian | Hecho (8 oct) |
| 12 | Repositorio en GitHub con acceso del jurado | Julian | **Pendiente** |
| 13 | Notion completo y pitch | Julian + equipo | En curso |

## Decisiones justificadas
1. **Modalidad editorial TVN y no banca:** es la recomendada por el pliego, y la bancaria no exige un segundo producto (`docs/001`).
2. **Ventana de datos 2025-10-02 → 2026-09-30 con datos propios por scraping:** regla de la mediadora del reto; no hay paquete común (`docs/004`, D7).
3. **Embeddings locales para agrupar** en lugar de reglas: en una muestra diagnóstica de 120 pares (no poblacional), F1 0.769 frente a 0.370 del baseline (`docs/resultados-evaluacion.md`).
4. **Claude Sonnet 5.5 para redactar:** medido frente a Haiku 4.5 (más barato, pero se abstuvo en un caso respondible); mediana de 9.9 s y US$ 0.0173 por borrador.
5. **Jev (TypeSafe) descartado:** no redacta texto, que es el 85 % del costo; además, dependencia remota y sin validación en español (`docs/003`, `docs/005`).
6. **Demo offline por defecto:** borradores y consultas en caché local; la generación en vivo queda fuera del pitch (auditoría Codex 002).
7. **Procedencia conservadora:** solo se fusionan el mismo medio y la agencia explícita; los titulares casi idénticos se marcan como “posible réplica” (auditoría Codex 003, R7).

## Proceso de revisión cruzada
Claude construye y Codex audita de forma independiente (`auditorias/001…010`). Cada hallazgo recibe un veredicto: aceptado, parcial o rechazado con justificación.

## Cronología (git)
- 06/10 22:26 · `abac2bb` · Prototipo "De la señal a la decisión" para el reto TVN Media (día 1)
- 07/10 22:17 · `290ae70` · Fallback offline en /consulta, README honesto, diccionario corregido y respuesta a Codex 009
- 07/10 22:34 · `084475a` · T07 de extremo a extremo contra el modelo real y redacción honesta de cifras distintas
- 07/10 22:36 · `5e52e31` · Benchmark de 60 consultas (borrador) y matriz T01-T10 con resultados reales
- 07/10 22:48 · `08d5868` · Página de validación humana /evaluacion y conjuntos para etiquetar
- 08/10 01:10 · `c9e480a` · Benchmark: corrige evidencia de B-004, B-010, B-030 y B-039 (detectado en la validación humana)
- 08/10 01:53 · `f39e112` · Aplica revisión Codex 007: reserva protegida, lint limpio, evaluación sincronizada
- 08/10 01:59 · `066c6ae` · Aplica verificación Codex 008: pruebas de regresión y etiquetas humanas versionadas
- 08/10 17:07 · `86ea1a9` · Pares de agrupación: corrige muestreo (P-081..P-120) tras etiquetado humano
- 08/10 17:35 · `5c80033` · Métricas reales con etiquetas humanas completas (npm run metricas)
- 08/10 17:39 · `6332c4f` · Corrige fallos 3-5 de la evaluación y prepara re-medición de sustento (v2)
- 08/10 18:03 · `a9594a7` · Sustento v2 medido (60 %) y prompt v6: fechas legibles, lugares en español, una idea por oración
- 08/10 18:03 · `8f84857` · metricas.ts: elimina variable sin uso (lint sin avisos)
- 08/10 18:05 · `153a086` · Páginas de Notion generadas desde los datos reales (npm run notion)
- 08/10 18:27 · `98ed7cd` · Revisión humana registrada en las 9 fichas (4 aprobadas como borrador, 5 requieren evidencia)
- 08/10 18:29 · `043fdda` · Aplica auditoría Codex 009: métricas consistentes y comunicación honesta
- 08/10 19:50 · `7d290ba` · Notion: genera las 3 páginas de entrega (funcional, técnica, pitch) pedidas por la organización
- 08/10 20:54 · `17f0392` · T10 aprobado: ensayo en modo avión (8 oct) registrado en matriz y Notion
- 08/10 20:59 · `3624822` · T10: capturas del ensayo en modo avión como evidencia versionada

---

# Casos y evidencias (9 fichas)

## E-9979983be4 · #1 · ¿ Debe reabrir Cobre Panamá ? Cámara Minera fija su posición sobre el futuro de la mina
- **Estado de evidencia:** parcial (≥2 procedencias, sin respaldo oficial) · **Procedencias independientes:** 5
- **Puntaje P = 90.3** (alto) · R 1 · I 0.9 · U 0.973 · N 0.819 · E 0.6 · reglas puntaje-v2
- **Fuentes:** N-095be98135, N-9df38f83b1, N-27ff5eda50, N-1683cae7ea, N-5f9575e0c0, N-9979983be4, N-5e971d1a54, N-1c0edc17ef, N-b6938d187f
- **Borrador:** paquete editorial · validador OK · claude-sonnet-5-5 · paquete-tvn-v6
- **Título propuesto:** Cobre Panamá: First Quantum abre el diálogo y la Cámara Minera pide definir los próximos pasos
- **Vacíos:** No hay dato oficial enlazado en el corpus para este tema.
- **Revisión humana:** aprobado como borrador · aprobado como borrador (Julian Taylor)

## E-e4a8ba965d · #3 · Metro de Panamá y Doppelmayr firman el contrato para la construcción del Teleférico de San Miguelito
- **Estado de evidencia:** parcial (≥2 procedencias, sin respaldo oficial) · **Procedencias independientes:** 4
- **Puntaje P = 86.1** (alto) · R 1 · I 0.95 · U 0.69 · N 0.836 · E 0.6 · reglas puntaje-v2
- **Fuentes:** N-cbb8a6d322, N-4da46e2d80, N-e4a8ba965d, N-7fa9a78028
- **Borrador:** paquete editorial · validador OK · claude-sonnet-5-5 · paquete-tvn-v6
- **Título propuesto:** Teleférico de San Miguelito: firman contrato y falta el refrendo de la Contraloría
- **Vacíos:** Revisar si 3 par(es) de titulares casi idénticos son réplicas de un mismo origen. · No hay dato oficial enlazado en el corpus para este tema.
- **Revisión humana:** aprobado como borrador · aprobado como borrador (Julian Taylor)

## E-c532d62722 · #8 · ¿ Cómo está el empleo en Panamá ? Presidente afirma que el desempleo baja y sector privado gana terreno
- **Estado de evidencia:** parcial (respaldo oficial, una sola procedencia) · **Procedencias independientes:** 1
- **Puntaje P = 81.6** (alto) · R 1 · I 0.525 · U 0.909 · N 0.955 · E 0.6 · reglas puntaje-v2
- **Fuentes:** N-c532d62722, BM:PAN:SL.UEM.TOTL.ZS:2024
- **Borrador:** paquete editorial · validador OK · claude-sonnet-5-5 · paquete-tvn-v6
- **Título propuesto:** Empleo en Panamá: el presidente afirma que el desempleo baja
- **Vacíos:** Falta una segunda procedencia independiente. · Solo hay titulares y metadatos: no se ha leído el cuerpo de ninguna nota.
- **Revisión humana:** requiere evidencia · requiere evidencia (Julian Taylor)

## E-f84223fbc5 · #9 · Fallece capitán de remolcador del Canal de Panamá mientras cumplía funciones
- **Estado de evidencia:** insuficiente (una sola procedencia y ninguna fuente oficial enlazada) · **Procedencias independientes:** 1
- **Puntaje P = 80.4** (alto) · R 1 · I 0.575 · U 0.964 · N 0.982 · E 0.2 · reglas puntaje-v2
- **Fuentes:** N-f84223fbc5
- **Borrador:** brief de investigación · validador OK · claude-sonnet-5-5 · paquete-tvn-v6
- **Título propuesto:** Fallece capitán de remolcador del Canal de Panamá: borrador de investigación
- **Vacíos:** Falta una segunda procedencia independiente. · No hay dato oficial enlazado en el corpus para este tema. · Solo hay titulares y metadatos: no se ha leído el cuerpo de ninguna nota.
- **Revisión humana:** requiere evidencia · requiere evidencia (Julian Taylor)

## E-ebdbce0f64 · #22 · Exportaciones caen este año $151.5 millones, el Mef lo atribuye a las exportaciones de remanentes de cobre del 2025
- **Estado de evidencia:** parcial (respaldo oficial, una sola procedencia) · **Procedencias independientes:** 1
- **Puntaje P = 78.3** (alto) · R 1 · I 0.525 · U 0.788 · N 0.894 · E 0.6 · reglas puntaje-v2
- **Fuentes:** N-ebdbce0f64, BM:PAN:NE.EXP.GNFS.ZS:2024
- **Borrador:** paquete editorial · validador OK · claude-sonnet-5-5 · paquete-tvn-v6
- **Título propuesto:** Exportaciones caen $151.5 millones: el MEF lo atribuye a remanentes de cobre de 2025
- **Vacíos:** Falta una segunda procedencia independiente.
- **Revisión humana:** aprobado como borrador · aprobado como borrador (Julian Taylor)

## E-dae83ef44c · #76 · Unachi: Comisión de Presupuesto aprueba traslado de partida por $7.7 millones para pago de planilla
- **Estado de evidencia:** insuficiente (una sola procedencia y ninguna fuente oficial enlazada) · **Procedencias independientes:** 1
- **Puntaje P = 66.4** (medio) · R 1 · I 0.525 · U 0.647 · N 0.552 · E 0.2 · reglas puntaje-v2
- **Fuentes:** N-dae83ef44c, N-45f7932d78, N-06046b1433
- **Borrador:** brief de investigación · validador OK · claude-sonnet-5-5 · paquete-tvn-v6
- **Título propuesto:** Unachi: traslado de partida para pagar la planilla y dudas por cifras distintas
- **Vacíos:** Falta una segunda procedencia independiente. · No hay dato oficial enlazado en el corpus para este tema. · Cifras distintas entre titulares (millone): verificar si se refieren al mismo hecho.
- **Revisión humana:** requiere evidencia · requiere evidencia (Julian Taylor), requiere evidencia (Julian Taylor)

## E-ba49afd7fb · #85 · Acodeco registra 280 quejas contra inmobiliarias por más de $13.2 millones
- **Estado de evidencia:** insuficiente (una sola procedencia y ninguna fuente oficial enlazada) · **Procedencias independientes:** 1
- **Puntaje P = 63.2** (medio) · R 1 · I 0.475 · U 0.508 · N 0.613 · E 0.2 · reglas puntaje-v2
- **Fuentes:** N-410bc2416f, N-ba49afd7fb
- **Borrador:** brief de investigación · validador OK · claude-sonnet-5-5 · paquete-tvn-v6
- **Título propuesto:** Acodeco: quejas por beneficios a jubilados e inmobiliarias, pendientes de verificar
- **Vacíos:** Falta una segunda procedencia independiente. · No hay dato oficial enlazado en el corpus para este tema. · Cifras distintas entre titulares (queja): verificar si se refieren al mismo hecho.
- **Revisión humana:** requiere evidencia · requiere evidencia (Julian Taylor)

## E-1cbd644225 · #129 · El sector pesquero panameño se consolida como el principal motor de exportación
- **Estado de evidencia:** suficiente para el borrador (≥2 procedencias independientes y respaldo oficial) · **Procedencias independientes:** 2
- **Puntaje P = 54.3** (medio) · R 1 · I 0.65 · U 0 · N 0 · E 0.8 · reglas puntaje-v2
- **Fuentes:** N-1cbd644225, N-e167994445, N-5ac056fa29, BM:PAN:NE.EXP.GNFS.ZS:2024
- **Borrador:** paquete editorial · validador OK · claude-sonnet-5-5 · paquete-tvn-v6
- **Título propuesto:** Exportaciones panameñas: pesca y servicios en los titulares
- **Vacíos:** Solo hay titulares y metadatos: no se ha leído el cuerpo de ninguna nota.
- **Revisión humana:** aprobado como borrador · aprobado como borrador (Julian Taylor)

## E-72b68d5114 · #168 · Sismo de magnitud 5 . 4 sacude la frontera entre Panamá y Costa Rica
- **Estado de evidencia:** parcial (respaldo oficial, una sola procedencia) · **Procedencias independientes:** 1
- **Puntaje P = 49.1** (medio) · R 1 · I 0.525 · U 0 · N 0 · E 0.6 · reglas puntaje-v2
- **Fuentes:** N-72b68d5114, USGS:us7000tgw1, USGS:us7000tget, USGS:us7000tg98
- **Borrador:** paquete editorial · validador OK · claude-sonnet-5-5 · paquete-tvn-v6
- **Título propuesto:** Sismo en la frontera entre Panamá y Costa Rica: qué se reporta y qué falta confirmar
- **Vacíos:** Falta una segunda procedencia independiente. · Solo hay titulares y metadatos: no se ha leído el cuerpo de ninguna nota.
- **Revisión humana:** requiere evidencia · requiere evidencia (Julian Taylor), requiere evidencia (Julian Taylor)

---

# Riesgos y ética

| Riesgo | Control operativo | Evidencia |
|---|---|---|
| Alucinación (hechos, cifras, citas inventadas) | Salida estructurada con cita por afirmación; validador que bloquea cifras ausentes del campo citado; abstención | En dos muestras humanas de 30 afirmaciones no hubo ninguna completamente no respaldada; en la última medida (prompt v5), 60 % con respaldo pleno y 40 % parcial; v6 sin medir. Cobertura de citas estructural (v6): 52/52 |
| Inyección mediante fuentes | Fuentes delimitadas como dato; etiquetas escapadas; regla explícita en el prompt | T07: 2/2 casos sintéticos aprobados; 6/6 adversariales sin fuga del prompt |
| Repetición confundida con corroboración | Procedencia independiente conservadora; “posible réplica” para revisión humana | Ficha con grupos de procedencia y motivo |
| Prioridad confundida con verdad | Estado de evidencia separado; con evidencia insuficiente, solo brief de investigación (guion y copy bloqueados) | T08 |
| Publicación automática | No existe: estados de revisión humana; “aprobado como borrador” no publica | Panel de revisión |
| Privacidad y reputación | Sin datos personales; acusaciones como declaraciones; sin listas de sospechosos | Prompt y benchmark adversarial (B-053, B-058) |
| Derechos de autor | Solo metadatos públicos; sin cuerpos, imágenes ni videos; condiciones por fuente | Catálogo de datos |
| Credenciales | `.env.local` fuera de git; `.env.example` sin secretos | Repositorio |
| Dependencia de red en la demo | Snapshot y cachés locales; respaldo por palabras clave si falta el modelo | T10 (aprobado en modo avión, 8 oct) |

**Fuera de alcance declarado:** detección definitiva de noticias falsas, riesgo bancario individual, audiencia y producción audiovisual.
