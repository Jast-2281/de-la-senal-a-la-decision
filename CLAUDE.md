# CLAUDE.md — HackIAthon Panamá, Etapa 2

Idioma de trabajo: español.

## Roles
- **Claude:** construcción, diseño y mentoría.
- **Codex:** auditor independiente. No edita código; escribe sus hallazgos en `auditorias/`.
- **Usuario:** decide.

## Al iniciar cada sesión
1. Leer [CODEX.md](CODEX.md) completo: es la guía estable de revisión.
2. Revisar `auditorias/`: toda auditoría `NNN-<tema>.md` sin su `NNN-<tema>.respuesta.md` está pendiente y se atiende primero.

## Cómo responder una auditoría
- Verificar cada hallazgo contra el código real, no contra lo que se cree haber hecho.
- Escribir `NNN-<tema>.respuesta.md` con un veredicto por punto:
  - **Aceptado:** se aplica.
  - **Parcial:** qué se aplica y por qué no el resto.
  - **Rechazado:** justificación con evidencia, restricción real o trade-off explícito.
- Ni aceptar por complacer ni rechazar por defender el trabajo propio.
