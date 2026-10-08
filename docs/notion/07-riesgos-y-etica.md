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
| Dependencia de red en la demo | Snapshot y cachés locales; respaldo por palabras clave si falta el modelo | T10 (ensayo en modo avión pendiente) |

**Fuera de alcance declarado:** detección definitiva de noticias falsas, riesgo bancario individual, audiencia y producción audiovisual.
