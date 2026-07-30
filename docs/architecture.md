# Arquitectura

## Decisión general

El sitio es un generador estático Astro 7. Las publicaciones viven en el repositorio como Markdown/MDX, se validan con esquemas Zod y se generan en build. No existe servidor de aplicación, base de datos ni CMS.

## Capas

- `src/content.config.ts`: contratos tipados para `activity`, `plan` y `recurso`.
- `src/content/`: fuente editorial versionada.
- `src/lib/content.ts`: ordenamiento, filtros, lectura, slugs y catálogo ODS.
- `src/components/`: navegación, estados, tarjetas y migas.
- `src/layouts/BaseLayout.astro`: HTML global, SEO, JSON-LD, tema y navegación.
- `src/pages/`: rutas estáticas y endpoints RSS/robots.
- `public/`: assets propios, SVG social y `_headers` de Pages.

## Flujo de publicación

```text
Markdown/MDX → schema Zod → getCollection/render → rutas estáticas → dist → Cloudflare Pages
```

## Rendimiento

El JavaScript inicial se limita a menú móvil, tema y filtros. No se usan frameworks UI, cuentas de usuario ni analítica.
