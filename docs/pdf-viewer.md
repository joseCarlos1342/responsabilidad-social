# Visor PDF

`src/components/documents/PdfViewer.astro` usa PDF.js local, sin CDN, iframe, embed ni object.

## Funcionamiento

- PDF.js se importa dinámicamente al activar “Documento original” o al entrar directamente con `?vista=documento`.
- El worker se resuelve mediante Vite y se sirve desde el mismo origen.
- Solo se renderiza una página en canvas.
- El visor se declara listo únicamente después de completar el primer render visible.
- La tarea anterior se cancela antes de renderizar otra página.
- El PDF conserva enlaces convencionales para abrir y descargar.
- La versión web y el texto de la ficha siguen siendo la alternativa accesible principal.

## Controles

Página anterior, página siguiente, página actual, total, acercar, alejar, ajustar al ancho, restablecer, descargar y abrir en otra pestaña. Las flechas izquierda/derecha, `+`, `-` y `0` funcionan cuando el visor tiene el foco o el puntero dentro.

## Seguridad y despliegue

La CSP mantiene `object-src 'none'` y `frame-src 'none'`, y declara `worker-src 'self'`. El PDF y el worker son same-origin. Después de desplegar se debe verificar que la consola no muestre `fake worker`, que el worker tenga MIME JavaScript y que no haya violaciones CSP.

## Limitaciones

Canvas no sustituye una estructura semántica PDF. Por eso la lectura HTML es principal, existe enlace de descarga y cada documento incluye una ficha pública. Un futuro trabajo puede añadir text layer y annotation layer si los documentos requieren selección o enlaces internos.
