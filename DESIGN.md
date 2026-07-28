# Design system — Decisiones que sí suman

<!-- impeccable:design-contract -->

## THESIS

Una decisión financiera se entiende mejor cuando se puede ver el camino completo: ingreso, gasto, margen y siguiente paso. El sitio evita el hero genérico de “conoce nuestro blog” y abre como una mesa editorial de trabajo.

## OWN-WORLD

La interfaz mezcla cuaderno de campo, recibo de presupuesto y señalética territorial: fondo marfil, tinta carbón, verde petróleo para orientación, terracota para decisiones y dorado para hallazgos. Las líneas cortas, las cifras y las etiquetas funcionan como anotaciones de una bitácora, no como decoración financiera.

## STORY

La persona entiende en segundos qué se investiga, dónde ocurre y en qué estado está. Luego puede elegir entre leer una actividad, revisar el plan o consultar una herramienta. La interfaz muestra límites y evidencias pendientes con la misma claridad que los resultados.

## FIRST VIEWPORT

La portada coloca el título a la izquierda y, a la derecha, un tablero editorial con cuatro movimientos: observar, ordenar, comparar y decidir. Debajo aparece el estado real del proyecto y dos accesos directos a las actividades 2 y 4. El CTA principal es “Explorar actividades”.

## FORM

Dirección: `Cuaderno de decisiones`, modo `Read`, staging editorial asimétrico. Firma: una “línea de saldo” terracota que atraviesa el tablero y se transforma en divisores, estados y una pequeña visualización de presupuesto. No se usarán gradientes, iconos financieros de banco ni tarjetas anidadas.

## Tokens

- Marfil papel: `#F7F1E7`
- Tinta carbón: `#1F2928`
- Verde petróleo: `#164B4A`
- Verde niebla: `#DDE8DF`
- Terracota: `#C65D43`
- Dorado moderado: `#B68A3A`
- Arena de línea: `#D7CABC`
- Display: `Georgia, 'Times New Roman', serif` en titulares editoriales.
- Texto: `ui-sans-serif, system-ui, sans-serif` para lectura y controles.
- Datos: `ui-monospace, SFMono-Regular, Consolas, monospace` solo para estados y cifras.

## Motion

Una única entrada suave de la línea de saldo en portada; contenido siempre visible sin depender de animación. `prefers-reduced-motion` elimina transformaciones y transiciones.
