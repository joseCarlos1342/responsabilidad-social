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
git switch main
pnpm deploy
```

No se elimina ni modifica ningún proyecto existente. El primer despliegue puede producir la URL `https://decisiones-que-si-suman.pages.dev`; después se actualiza `site` en `astro.config.ts`, se reconstruye y se vuelve a desplegar.

## Smoke test

Después de desplegar:

- `/`
- `/actividades/actividad-2-decisiones-que-si-suman/`
- `/actividades/actividad-4-del-diagnostico-a-la-accion/`
- `/actividades/actividad-6-de-la-informacion-a-la-accion/`
- `/plan-humanidades-digitales/`
- `/documentos/` y las cuatro fichas documentales
- `/404/` o una ruta inexistente
- `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`

Para el visor PDF se comprueba además el worker emitido por Astro, `Content-Type: application/pdf`, descargas, consola sin `fake worker`, ausencia de errores CSP y la presencia de `worker-src 'self'`. La CSP mantiene `object-src 'none'` y permite únicamente frames propios y `youtube-nocookie.com`, cargados bajo interacción.

La URL definitiva y los resultados se registrarán al final de esta implementación.

## Bloqueos

El despliegue requiere que `wrangler whoami` confirme una cuenta autenticada.
El script bloquea despliegues desde ramas de feature para no publicar accidentalmente una versión no fusionada.
