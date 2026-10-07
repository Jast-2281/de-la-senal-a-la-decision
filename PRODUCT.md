# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Editor/a o periodista de la mesa editorial de TVN Media (Panamá) durante su turno: necesita decidir qué temas investigar y preparar para la agenda, con rapidez y sin publicar nada sin verificar. El jurado del hackIAthon evalúa el producto poniéndose en ese lugar, durante un pitch presencial de 10 minutos.

## Product Purpose
Convertir noticias públicas e indicadores oficiales en una **cola de investigación priorizada**. Cada tema muestra cuánta atención merece, cuántas procedencias son realmente independientes, qué está respaldado por datos oficiales y qué falta comprobar, y produce un borrador editorial con cita por afirmación para revisión humana. Éxito: pasar de fuentes dispersas a un tema investigable con evidencia y un borrador responsable, reconociendo lo que no se sabe.

## Positioning
No dice qué es verdad: dice qué tan sustentado está, quién lo dice realmente (las réplicas de una misma agencia cuentan como una sola procedencia) y qué falta verificar. La prioridad y el estado de evidencia son independientes: una prioridad alta con evidencia insuficiente lleva a investigar, nunca a publicar. Cada cifra de un borrador se comprueba contra el campo citado.

## Operating Context
- Redacción de TVN en un turno; consultas en español.
- Pitch presencial del hackIAthon, presentado desde Notion, con demo en vivo **proyectada en pantalla grande** y sin depender de internet.
- Flujo: cola → ficha del tema → borrador con citas → revisión humana (nuevo / en revisión / requiere evidencia / aprobado como borrador / descartado) → consulta al corpus → exportación de `fichas.jsonl`.

## Capabilities and Constraints
- Next.js 16 (App Router), Tailwind v4, TypeScript. Demo **offline**: sin fuentes ni recursos remotos en tiempo de ejecución.
- Datos: ventana oficial del 2025-10-02 al 2026-09-30 (regla de la mediadora del reto); TVN (RSS + sitemaps), GDELT, Banco Mundial (anual, hasta 2024) y USGS.
- IA: embeddings locales para agrupar eventos y recuperar evidencia; Claude Sonnet 5.5 para borradores y consultas, con caché local; validador determinista de citas y cifras.
- El sistema nunca publica. Los textos de la interfaz que explican límites (“no indica que algo sea cierto”, “dato anual, no actual”, “basado únicamente en titular/metadatos”) son verdad del producto y se conservan.

## Brand Commitments
- **Fijo (confirmado por el usuario):** identidad visual de TVN Media, el cliente del reto.
  - Paleta de tvnmedia.com / tvn-2.com: índigo #110862, azul #0d306a, azul #0077c8, #00466f; acentos amarillo #fec53e y naranja #eb5e09.
  - Tipografía de marca: Museo Sans, Transat Text y Gotham Black. Son licencias de Adobe Fonts y no se pueden redistribuir ni cargar offline, así que se usan **equivalentes libres empaquetados localmente**.
- **Sin el logo oficial de TVN.** Rotular “Prototipo para TVN Media · hackIAthon”.

## Evidence on Hand
- Snapshot real: 591 noticias (`data/processed/`), 87 sismos y 540 celdas del Banco Mundial.
- 9 borradores en caché y 6 consultas en caché, con costo y latencia medidos.
- No hay testimonios, usuarios reales ni métricas de audiencia: no se inventan.

## Product Principles
1. La evidencia antes que la elocuencia: toda afirmación muestra su fuente exacta.
2. Repetir no es corroborar: contar procedencias, no titulares.
3. Prioridad ≠ verdad: el estado de evidencia siempre es visible y separado.
4. Reconocer lo que no se sabe: abstenerse y decir qué falta es una función, no un error.
5. La persona decide: el sistema prepara, nunca publica.

## Accessibility & Inclusion
Legible en proyector a distancia: alto contraste, tamaños de texto generosos y estados que no dependen solo del color (texto + color).
