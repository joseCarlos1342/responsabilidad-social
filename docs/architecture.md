# Arquitectura

## Decisión general

El sitio es un generador estático Astro 7. Las publicaciones viven en el repositorio como Markdown/MDX, se validan con esquemas Zod y se generan en build. No existe servidor de aplicación, base de datos ni CMS.

## Capas

- `src/content.config.ts`: contratos tipados para `activity`, `plan`, `recurso` y `document`.
- `src/content/`: fuente editorial versionada.
- `src/lib/content.ts`: ordenamiento, filtros, lectura, slugs y catálogo ODS.
- `src/components/`: navegación, estados, tarjetas y migas.
- `src/layouts/BaseLayout.astro`: HTML global, SEO, JSON-LD, tema y navegación.
- `src/pages/`: rutas estáticas y endpoints RSS/robots.
- `public/`: assets propios, SVG social y `_headers` de Pages.
- `src/components/documents/`: pestañas documentales y visor PDF.js progresivo.
- `src/lib/publications.ts` y `src/components/PublicationCard.astro`: catálogo y presentación de las seis evidencias de publicaciones sociales.
- `scripts/generate-results-data.mjs`: procesa el XLSX consolidado durante el build y valida la división 16 + 6.
- `src/data/financial-results.generated.json`: consolidado liviano generado, sin respuestas individuales, edades ni marcas temporales.
- `src/data/diagnostic.ts`: interfaz tipada para consumir el diagnóstico y la comparación.
- `src/components/YouTubeLite.astro` y `src/components/EvidencePdfCard.astro`: medios diferidos que no cargan iframe ni PDF antes de interacción.

Los XLSX con filas individuales permanecen ignorados bajo `docs/fuentes-academicas/`. El generador publica únicamente JSON y reportes XLSX agregados; si las fuentes privadas no están disponibles en un clon, valida y conserva los artefactos agregados versionados.

## Flujo de publicación

```text
Markdown/MDX → schema Zod → getCollection/render → rutas estáticas → dist → Cloudflare Pages
```

La colección `document` relaciona una edición pública o un original académico autorizado con su ruta web. La validación build-time comprueba que el PDF exista bajo `public/documents/`, que la ruta sea conocida y que la revisión declarada corresponda a su origen. Las actividades 2, 4 y 6 y el plan conservan sus PDFs originales autorizados.

Las seis evidencias sociales se conservan con sus nombres originales (`publi1.pdf` a `publi6.pdf`) bajo `public/documents/` y sus miniaturas de primera página bajo `public/assets/publicaciones/`. Las publicaciones 5 y 6 no tienen URL individual verificable en el repositorio, por lo que remiten a su PDF y al consolidado de pruebas sin inventar enlaces.

## Rendimiento

El JavaScript inicial se limita a menú móvil, tema, filtros y activadores ligeros. PDF.js se importa dinámicamente y los iframes de YouTube o PDF se crean después de interacción. Los gráficos son HTML/CSS generado en servidor; el navegador no procesa el XLSX. El MOV original queda fuera de `public/`; no se usan frameworks UI, cuentas de usuario ni analítica.
