# ADR 0003: Cloudflare Pages

## Estado

Aceptada

## Decisión

Desplegar `dist/` mediante Wrangler en Cloudflare Pages.

## Por qué

Es el destino solicitado, encaja con el build estático y no requiere backend propio. Se documenta que Astro recomienda Workers para proyectos nuevos, pero el requisito del proyecto fija Pages.
