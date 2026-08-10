# Pruebas

## Capas

- `pnpm check`: esquemas, tipos y componentes Astro.
- `pnpm lint`: reglas ESLint.
- `pnpm format:check`: formato Prettier.
- `pnpm test:unit`: utilidades de ordenamiento, filtros, ODS, lectura y slugs.
- `pnpm test:e2e`: flujos de navegación, filtros, menú, teclado, 404, metadatos, RSS y sitemap.
- `pnpm test:a11y`: axe sobre portada, actividades, actividad 4 y plan.
- `pnpm test:links`: enlaces internos de `dist`.
- `pnpm documents:check`: firma, metadatos y ausencia de identificadores en PDF públicos; requiere herramientas locales de documentos.

## Ejecución

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

El workflow instala Chromium en CI. Firefox y WebKit pueden añadirse después si el entorno dispone de los binarios.

La suite documental cubre `/documentos/`, las tres fichas, pestañas, entrada directa con `?vista=documento`, píxeles visibles en el canvas, primera página, navegación, zoom, descarga, teclado, móvil, errores de carga y ausencia del ID universitario. La portada comprueba seis publicaciones y que YouTube/Pruebas.pdf no creen iframes antes de interacción. Axe también revisa la biblioteca y el visor.

## Cobertura

Vitest genera HTML y texto en `coverage/`. La cobertura inicial se concentra en `src/lib/`, donde vive la lógica pura.
