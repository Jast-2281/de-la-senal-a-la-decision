---
name: De la señal a la decisión
description: Agenda de investigación para la mesa editorial de TVN Media, con la gramática de los rótulos al aire de TVN.
colors:
  indigo: "#110862"
  indigo-2: "#1c1480"
  azul: "#0d306a"
  amarillo: "#fec53e"
  papel: "#f3f4f9"
  superficie: "#ffffff"
  tinta: "#0e1030"
  tinta-2: "#3a3d5c"
  tinta-3: "#5d6180"
  linea: "#dde0ec"
  sobre-indigo: "#ffffff"
  sobre-indigo-2: "#c9c7ee"
  acento-suave: "#e6ebf6"
  insuficiente: "#b14200"
  insuficiente-suave: "#fdeee3"
  parcial: "#7a5400"
  parcial-suave: "#fff3d1"
  suficiente: "#17663f"
  suficiente-suave: "#e3f4ea"
typography:
  display:
    fontFamily: "Montserrat, Mulish, ui-sans-serif, sans-serif"
    fontSize: "3rem"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Montserrat, Mulish, ui-sans-serif, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  title-panel:
    fontFamily: "Montserrat, Mulish, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 900
    lineHeight: 1.55
    letterSpacing: "-0.025em"
  headline-tema:
    fontFamily: "Mulish, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.25
  title-rotulo:
    fontFamily: "Mulish, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.375
  title-fila:
    fontFamily: "Mulish, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.375
  body:
    fontFamily: "Mulish, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
  body-sm:
    fontFamily: "Mulish, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Montserrat, Mulish, ui-sans-serif, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 900
    lineHeight: 1.43
    letterSpacing: "0.025em"
  label-chip:
    fontFamily: "Mulish, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1.33
    letterSpacing: "0.025em"
  numeral:
    fontFamily: "Montserrat, Mulish, ui-sans-serif, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1
    fontFeature: "\"tnum\" 1"
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  sm: "0.25rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.25rem"
  xl: "2rem"
  gutter: "1.25rem"
components:
  franja-indigo:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.sobre-indigo}"
    padding: "2rem 1.25rem 2.5rem"
  nav-enlace:
    textColor: "{colors.sobre-indigo-2}"
    rounded: "{rounded.sm}"
    padding: "0.375rem 0.75rem"
  nav-enlace-hover:
    backgroundColor: "{colors.indigo-2}"
    textColor: "{colors.sobre-indigo}"
  rotulo-agenda:
    backgroundColor: "{colors.indigo-2}"
    textColor: "{colors.sobre-indigo}"
    typography: "{typography.title-rotulo}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
  rotulo-agenda-hover:
    backgroundColor: "{colors.azul}"
  pestana-puntaje:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.indigo}"
    typography: "{typography.numeral}"
    rounded: "{rounded.sm}"
    width: "5rem"
    height: "4rem"
  pestana-puntaje-fila:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.indigo}"
    rounded: "{rounded.sm}"
    width: "4rem"
    height: "3rem"
  insignia-insuficiente:
    backgroundColor: "{colors.insuficiente-suave}"
    textColor: "{colors.insuficiente}"
    rounded: "{rounded.sm}"
    padding: "0.125rem 0.5rem"
  insignia-parcial:
    backgroundColor: "{colors.parcial-suave}"
    textColor: "{colors.parcial}"
    rounded: "{rounded.sm}"
    padding: "0.125rem 0.5rem"
  insignia-suficiente:
    backgroundColor: "{colors.suficiente-suave}"
    textColor: "{colors.suficiente}"
    rounded: "{rounded.sm}"
    padding: "0.125rem 0.5rem"
  insignia-revision:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.sobre-indigo}"
    rounded: "{rounded.sm}"
    padding: "0.125rem 0.375rem"
  fila-escaleta:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    padding: "0.875rem 1rem"
  fila-escaleta-hover:
    backgroundColor: "{colors.acento-suave}"
  filtro-segmento:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.azul}"
    padding: "0.375rem 0.75rem"
  filtro-segmento-activo:
    backgroundColor: "{colors.azul}"
    textColor: "{colors.superficie}"
  boton-primario:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.indigo}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.5rem"
  boton-primario-hover:
    backgroundColor: "{colors.superficie}"
  boton-revision:
    backgroundColor: "{colors.acento-suave}"
    textColor: "{colors.azul}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  boton-revision-hover:
    backgroundColor: "{colors.azul}"
    textColor: "{colors.superficie}"
  boton-aprobar:
    backgroundColor: "{colors.suficiente}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  boton-aprobar-hover:
    backgroundColor: "{colors.indigo}"
  boton-descartar:
    backgroundColor: "{colors.insuficiente-suave}"
    textColor: "{colors.insuficiente}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  boton-descartar-hover:
    backgroundColor: "{colors.insuficiente}"
    textColor: "{colors.superficie}"
  cita:
    backgroundColor: "{colors.acento-suave}"
    textColor: "{colors.azul}"
    rounded: "{rounded.sm}"
    padding: "0 0.25rem"
  cita-activa:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.indigo}"
  cita-desplegada:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.sobre-indigo}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  campo:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  panel:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.sm}"
    padding: "1.25rem"
  panel-oscuro:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.sobre-indigo}"
    rounded: "{rounded.sm}"
    padding: "1.25rem"
  bloque-evidencia:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.sm}"
    padding: "0.75rem"
  barra-accion:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.indigo}"
    rounded: "{rounded.sm}"
    padding: "1rem 1.25rem"
---

# Design System: De la señal a la decisión

## Overview

**Creative North Star: "La escaleta al aire"**

La interfaz se lee como la pauta de un noticiero de TVN, no como un tablero de control. Franjas índigo a todo el ancho enmarcan la página (cabecera, banda superior de cada vista y pie) igual que el grafismo de la cadena; sobre ellas, cada tema es un rótulo: una barra índigo con una pestaña amarilla que lleva la cifra. Debajo, sobre papel gris azulado, la escaleta completa continúa como una lista numerada de filas blancas separadas por filetes finos.

El sistema es denso pero legible a distancia: la raíz tipográfica es de 17px porque la demo se proyecta en pantalla grande, las cifras van siempre en numerales tabulares y todos los estados de evidencia combinan texto, icono y color. La voz gráfica de TVN (Montserrat negra en mayúsculas, sustituto libre de Gotham Black) queda reservada a los rótulos; todo lo que se lee de corrido va en Mulish (sustituto de Museo Sans). Ambas fuentes están empaquetadas localmente y no se carga nada remoto.

No hay sombras, degradados ni ilustraciones. La profundidad la dan las bandas tonales (índigo, papel, blanco) y un único radio casi recto. El logotipo oficial de TVN no aparece; en su lugar, una etiqueta amarilla “Prototipo para TVN Media · hackIAthon” en la cabecera.

**Key Characteristics:**
- Franjas índigo a todo el ancho sobre fondo papel; contenido centrado en 80rem.
- Rótulos índigo con pestaña amarilla para la cifra de prioridad.
- Escaleta: filas numeradas en una sola lista, nunca una cuadrícula de tarjetas.
- Montserrat 900 en mayúsculas solo para rótulos; Mulish para todo lo demás.
- Estado de evidencia siempre como texto + icono + color, separado de la prioridad.
- Plano: sin sombras; un solo radio de 0.25rem.

## Colors

Paleta de marca TVN reducida a tres voces: índigo para el marco, amarillo para lo que se lee primero y una tríada semántica para el estado de la evidencia.

### Primary
- **Índigo TVN** (indigo): el color de las franjas a todo el ancho (cabecera, banda superior, pie), del rótulo de cita desplegada y de los títulos de sección sobre papel. Es el marco de toda la interfaz.
- **Índigo de rótulo** (indigo-2): el cuerpo de cada rótulo de la agenda sobre la franja índigo, los botones de ejemplo de la consulta y el fondo hover de la navegación. Un escalón más claro que la franja para que el rótulo se despegue sin sombra.
- **Azul pauta** (azul): el color de interacción sobre fondo claro. Borde y estado activo del filtro segmentado, texto de citas, de etiquetas de tema y de los botones de revisión; hover del rótulo de agenda; barra de desplazamiento.

### Secondary
- **Amarillo pestaña** (amarillo): la pestaña de puntaje, la cita activa, el botón primario de la consulta, la barra de acción recomendada de la ficha, la etiqueta de prototipo, la selección de texto y el anillo de foco. Siempre con texto índigo encima.

### Tertiary
Tríada semántica del estado de evidencia; cada tono fuerte va sobre su versión suave:
- **Óxido insuficiente** (insuficiente, sobre insuficiente-suave): evidencia insuficiente, errores de validación, contradicciones y el botón “descartado”. Es la versión oscurecida del naranja de marca de TVN, para que el texto sea legible sobre blanco.
- **Ocre parcial** (parcial, sobre parcial-suave): evidencia parcial, posibles réplicas, limitaciones de un dato oficial (“dato anual, no actual”) y el estado de abstención.
- **Verde suficiente** (suficiente, sobre suficiente-suave): evidencia suficiente para el borrador, validación correcta y el botón “aprobado como borrador”.

### Neutral
- **Papel** (papel): fondo de página bajo la escaleta y fondo de los bloques de evidencia dentro de un panel.
- **Superficie** (superficie): filas de la escaleta, paneles de la ficha, campos de texto.
- **Tinta** (tinta): texto principal. **Tinta 2** (tinta-2) para texto secundario y notas; **Tinta 3** (tinta-3) para metadatos, marcas de agua y placeholders.
- **Filete** (linea): bordes de 1px de paneles, campos y separadores entre filas.
- **Sobre índigo** (sobre-indigo) y **Sobre índigo 2** (sobre-indigo-2): texto principal y secundario sobre las franjas índigo.

### Named Rules
**La Regla de la Franja.** El índigo ocupa bandas a todo el ancho (cabecera, cabeza de cada vista, pie) o rótulos dentro de ellas; el resto del contenido vive sobre papel y superficie blanca.

**La Regla de la Pestaña Amarilla.** El amarillo señala lo que se lee o se pulsa primero (cifra de prioridad, cita activa, acción recomendada, acción primaria, foco) y siempre lleva texto índigo. No se usa como relleno decorativo.

**La Regla del Naranja Legible.** El naranja de marca (#eb5e09) solo existe en el sistema a través de su derivado oscuro `insuficiente`, y solo para alertas de evidencia insuficiente, error o descarte.

## Typography

**Display Font:** Montserrat 800/900 (con Mulish como respaldo), sustituto libre de Gotham Black.
**Body Font:** Mulish 400/600/700/800 (con ui-sans-serif, system-ui), sustituto libre de Museo Sans.
**Label/Mono Font:** ui-monospace (SF Mono, Menlo, Consolas) solo para identificadores de evidencia.

**Character:** Montserrat negra, en mayúsculas y con tracking cerrado, es la voz del grafismo al aire; Mulish es la voz de la redacción, clara y redonda, que carga los titulares y las explicaciones. La raíz es 17px, así que cada rem rinde un 6% más que en la web habitual.

### Hierarchy
- **Display** (Montserrat 900, 1.875rem en móvil → 2.25rem → 3rem desde 768px, interlineado 1.05, mayúsculas): el nombre de la vista sobre la franja índigo (“Agenda de investigación”, “Consultar el corpus”).
- **Headline** (Montserrat 900, 1.5rem, mayúsculas, índigo): encabezado de bloque sobre papel (“Escaleta completa”).
- **Title de panel** (Montserrat 900, 1.125rem, mayúsculas): título de cada panel de la ficha; amarillo en el panel oscuro, índigo en el claro.
- **Headline de tema** (Mulish 800, 1.5rem → 2.25rem, interlineado 1.25): el titular del tema en la cabecera de la ficha. Es texto de terceros, por eso no va en mayúsculas.
- **Title de rótulo** (Mulish 700, 1.125rem → 1.25rem, interlineado 1.375, `text-wrap: balance`): titular dentro de un rótulo de la agenda.
- **Title de fila** (Mulish 700, 1.05rem, interlineado 1.375): titular en una fila de la escaleta.
- **Body** (Mulish 400, 1rem, interlineado 1.5): texto corriente; las afirmaciones del borrador usan interlineado 1.625. La entradilla sobre la franja sube a 1.125rem en sobre-indigo-2.
- **Body sm** (Mulish 400, 0.875rem): metadatos, acción recomendada en filas, procedencias, notas.
- **Label** (Montserrat 900, 0.875rem, tracking 0.025em, mayúsculas, índigo): subtítulos dentro de un panel (“Título propuesto”, “Verificaciones pendientes”, “Información necesaria”) y la barra de acción recomendada.
- **Label chip** (Mulish 800, 0.75rem; 11px en tipo de afirmación y citas; mayúsculas con tracking 0.025em para tema y tipo): insignias, etiquetas de tema, citas.
- **Numeral** (Montserrat 900, 1.875rem en pestaña grande, 1.25rem en fila, interlineado 1, tabular): la cifra de prioridad, los valores de indicadores oficiales (1.875rem en índigo) y el número de procedencias (1rem).
- **Mono** (ui-monospace, 11–12px): identificadores de evidencia y de noticia, la ruta “id → campo” dentro de la cita desplegada.

### Named Rules
**La Regla del Rótulo.** Montserrat 900 en mayúsculas es exclusiva de rótulos: nombre de vista, encabezado de bloque o panel, cifras y la acción primaria. Los titulares de noticias y los borradores van siempre en Mulish con su caja original.

**La Regla de la Cifra Tabular.** Todo el cuerpo lleva `tnum` y `lnum`; las cifras se alinean en columna en tablas, pestañas y conteos.

## Layout

Contenedor centrado de 80rem con gutter lateral de 1.25rem. Cada vista abre con una franja índigo a todo el ancho (padding superior 2rem, inferior 2–2.5rem) que contiene el nombre de la vista, la entradilla y, en la agenda, los cinco rótulos principales apilados con 0.5rem entre sí. Debajo, sobre papel, el contenido sigue con padding vertical de 2rem.

Ritmo de espaciado: 0.5rem entre elementos hermanos de una lista, 0.75rem dentro de grupos de controles, 1.25rem entre paneles y como padding de panel, 0.75rem de padding en bloques de evidencia internos.

La escaleta es una sola lista ordenada dentro de un contenedor con borde, con filas separadas por filetes. Cada fila es una rejilla: número (2.5rem), pestaña (4rem), contenido flexible y, desde 1024px, una columna de 20rem para procedencias y acción. La ficha usa dos columnas iguales desde 1024px, con el borrador a todo el ancho debajo.

Responsive (breakpoints de Tailwind: 640, 768, 1024px): en móvil desaparece la columna del número, la columna de procedencias baja bajo el contenido separada por un filete, el rótulo de agenda apila su bloque de procedencias bajo el titular, la navegación se envuelve en dos líneas y el buscador ocupa todo el ancho. Validado a 390px.

**La Regla de la Escaleta.** Las colecciones de temas son filas numeradas en una lista, leídas de arriba abajo como una pauta. No se presentan como cuadrícula de tarjetas ni con KPIs sueltos.

## Elevation & Depth

Sistema completamente plano: no hay `box-shadow` en ningún componente. La profundidad se construye con tres planos tonales (franja índigo, papel, superficie blanca), el escalón índigo → índigo-2 para separar un rótulo de su franja, y filetes de 1px en color linea. El único relieve dinámico es el anillo de foco: contorno amarillo de 3px con 2px de separación.

**La Regla Plana.** Un elemento se separa de su fondo por cambio de tono o por filete, nunca por sombra.

## Shapes

Un único radio casi recto de 0.25rem (`rounded.sm`) en todo: rótulos, pestañas, insignias, botones, campos, paneles y bloques. Las formas son rectángulos de borde vivo, como las barras del grafismo al aire. No hay píldoras, círculos ni esquinas generosas. El rótulo de agenda recorta su contenido (`overflow: hidden`) para que la pestaña amarilla quede encajada en el borde izquierdo de la barra.

## Components

### Rótulo de agenda (componente insignia)
Barra índigo-2 sobre la franja índigo, con la pestaña de puntaje grande encajada a la izquierda. Contenido: número de posición en amarillo (Montserrat 900), etiqueta de tema en sobre-indigo-2, insignia de evidencia y titular en Mulish 700. A la derecha (desde 768px) un bloque de 20rem separado por un filete índigo con procedencias y acción. Hover: el fondo pasa a azul y el titular se subraya, con transición de color.

### Pestaña de puntaje
Rectángulo amarillo con la cifra en Montserrat 900 tabular y, debajo, el rango en 10px Mulish 800 mayúsculas. Dos tallas: 5rem × 4rem en rótulos y en la cabecera de la ficha, 4rem × 3rem en filas. Lleva un `title` que aclara que ordena el trabajo y no mide veracidad.

### Fila de escaleta
Fila blanca con padding 0.875rem × 1rem dentro de una lista con borde linea y separadores. Número de posición en Montserrat 900 tinta-3, pestaña pequeña, línea de insignias (tema, evidencia, “Borrador listo” con icono, estado de revisión en índigo), titular, metadatos en tinta-3 y “Falta: …” en tinta-2. Hover: fondo acento-suave. Toda la fila es un enlace.

### Chips e insignias
- **Insignia de evidencia:** icono de trazo (lucide, 13–16px, trazo 2.4) + texto Mulish 700 en el tono fuerte sobre el suave; talla normal 0.75rem, talla grande 0.875rem en la ficha.
- **Etiqueta de tema:** solo texto, Mulish 800 0.75rem mayúsculas, azul sobre claro y sobre-indigo-2 sobre índigo.
- **Estado de revisión:** fondo índigo, texto blanco, Mulish 700.
- **Tipo de afirmación:** 11px Mulish 800 mayúsculas; hecho en verde, declaración en azul, inferencia en ocre, hipótesis en tinta-2 sobre papel.

### Botones
- **Shape:** radio de 0.25rem en todos.
- **Primario:** amarillo con texto índigo en Montserrat 900 mayúsculas, padding 0.75rem × 1.5rem (botón “Buscar” de la consulta). Hover: fondo blanco.
- **Revisión:** acento-suave con texto azul, Mulish 800 0.875rem, padding 0.5rem × 1rem; hover azul con texto blanco. “Aprobado como borrador” va en verde lleno (hover índigo) y “descartado” en óxido sobre suave (hover óxido lleno).
- **Sugerencias de consulta:** índigo-2 con texto sobre-indigo-2 sobre la franja; la activa en amarillo con texto índigo.
- **Hover / Focus:** transición de color; foco con contorno amarillo de 3px y separación de 2px.

### Filtro segmentado
Grupo de botones unidos dentro de un borde azul de 1px, separados por filetes azules. Inactivo: blanco con texto azul (hover acento-suave). Activo: azul con texto blanco, marcado con `aria-pressed`. Cada segmento muestra su conteo tabular al 75% de opacidad.

### Cards / Containers
- **Panel claro:** superficie blanca, borde linea de 1px, radio 0.25rem, padding 1.25rem, título de panel índigo.
- **Panel oscuro:** índigo con texto sobre-indigo y título amarillo, para el borrador con citas.
- **Bloque de evidencia:** papel dentro de un panel, padding 0.75rem; con fondo insuficiente-suave cuando hay contradicción.
- **Barra de acción recomendada:** amarillo a todo el ancho de la cabecera de la ficha, texto índigo, título en Montserrat 900 mayúsculas.
- **Shadow Strategy:** ninguna (ver Elevation & Depth).

### Inputs / Fields
- **Style:** superficie blanca, borde linea de 1px, radio 0.25rem, padding 0.375–0.5rem × 0.75rem, placeholder en tinta-3. El buscador lleva un icono de lupa de 16px en tinta-3 a la izquierda.
- **Campo de consulta:** sobre la franja índigo, sin borde, 1.125rem, padding 0.75rem con lupa de 20px.
- **Focus:** anillo amarillo global.
- **Error:** mensaje en óxido, Mulish 600, con `role="alert"`.

### Navigation
Cabecera índigo: nombre del producto en Montserrat 900 mayúsculas 1.125rem y etiqueta amarilla de prototipo; enlaces Mulish 600 0.875rem en sobre-indigo-2 con padding 0.375rem × 0.75rem, hover con fondo índigo-2 y texto blanco. En móvil se envuelven bajo el nombre. Pie índigo centrado con el recordatorio de que el sistema nunca publica.

### Cita que sube (firma)
Cada cita es un botón en línea de 11px (acento-suave con texto azul; hover y activa en amarillo con texto índigo). Al pulsarla se despliega bajo la afirmación un mini rótulo: barra índigo con pestaña amarilla que nombra el origen (Banco Mundial, USGS, Noticia), la ruta “id → campo” en mono sobre-indigo-2 y el texto exacto del campo en Mulish 600. Entra con la animación `rotulo-sube` (260ms, desliza 6px y se revela de abajo arriba con `clip-path`), que se desactiva con `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** abrir cada vista con una franja índigo a todo el ancho: nombre de la vista en Montserrat 900 mayúsculas, o el titular del tema en Mulish en la ficha.
- **Do** presentar los temas como rótulos o filas numeradas con la pestaña amarilla de puntaje a la izquierda.
- **Do** mostrar el estado de evidencia siempre con texto + icono + color, y siempre separado de la pestaña de prioridad.
- **Do** poner texto índigo sobre amarillo y texto blanco o sobre-indigo-2 sobre índigo.
- **Do** usar un único radio de 0.25rem y filetes de 1px en color linea para separar.
- **Do** mantener las cifras en numerales tabulares.
- **Do** empaquetar localmente cualquier fuente nueva; la demo funciona sin conexión.
- **Do** rotular la autoría como “Prototipo para TVN Media · hackIAthon”.

### Don't:
- **Don't** usar el logotipo oficial de TVN.
- **Don't** usar sombras, degradados ni elevación para separar elementos.
- **Don't** convertir la escaleta en una cuadrícula de tarjetas con KPIs.
- **Don't** usar el naranja de marca #eb5e09 como color de texto ni para algo que no sea una alerta de evidencia; usar `insuficiente`.
- **Don't** escribir titulares de noticias o borradores en Montserrat o en mayúsculas.
- **Don't** usar el amarillo como fondo decorativo ni con texto blanco.
- **Don't** usar píldoras ni radios mayores de 0.25rem.
- **Don't** cargar fuentes o recursos remotos en tiempo de ejecución.
