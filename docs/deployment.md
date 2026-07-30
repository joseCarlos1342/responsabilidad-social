# Despliegue

## Cloudflare Pages

- Proyecto objetivo: `decisiones-que-si-suman`
- Repositorio: `https://github.com/joseCarlos1342/responsabilidad-social`
- Build: `pnpm build`
- Salida: `dist/`
- Rama de producción: `main`

Comandos:

```bash
pnpm exec wrangler whoami
pnpm exec wrangler pages project list --json
pnpm build
pnpm exec wrangler pages deploy dist --project-name decisiones-que-si-suman --branch main
```

No se elimina ni modifica ningún proyecto existente. El primer despliegue puede producir la URL `https://decisiones-que-si-suman.pages.dev`; después se actualiza `site` en `astro.config.ts`, se reconstruye y se vuelve a desplegar.

## Smoke test

Después de desplegar:

- `/`
- `/actividades/actividad-2-decisiones-que-si-suman/`
- `/actividades/actividad-4-del-diagnostico-a-la-accion/`
- `/plan-humanidades-digitales/`
- `/404/` o una ruta inexistente
- `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`

La URL definitiva y los resultados se registrarán al final de esta implementación.

## Bloqueos

El despliegue requiere que `wrangler whoami` confirme una cuenta autenticada.
