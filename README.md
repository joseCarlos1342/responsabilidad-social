# Decisiones que sí suman

Blog académico sobre educación financiera, responsabilidad social y Humanidades Digitales.

- **Autor:** José Carlos Gómez
- **Asignatura:** Práctica en Responsabilidad Social
- **Territorio:** Neiva, Huila, Colombia
- **Estado:** ejecución principal completada; cierre y seguimiento en progreso

## Propósito

Este sitio documenta un proyecto educativo sobre presupuesto, ahorro, crédito responsable y prevención del fraude. No promociona empresas, marcas ni productos financieros y no constituye asesoría financiera personalizada.

El contenido diferencia entre requisitos de las guías, reflexión del estudiante, fuentes externas, actividades planeadas y evidencias reales. Si una actividad todavía no tiene soporte verificable, se muestra como **“Evidencia pendiente de incorporación”**.

## Requisitos

- Node.js `24.14.1` o compatible con Astro 7.
- pnpm `11.1.1`.
- Git.
- Chromium para E2E locales.
- GitHub CLI autenticado para publicar el repositorio.
- Wrangler autenticado para Cloudflare Pages.

## Instalación y desarrollo

```bash
pnpm install
pnpm dev
```

Abre `http://localhost:4321/`.

Si el servidor informa que inició en segundo plano, comprueba su estado con `pnpm exec astro dev status`, revisa sus mensajes con `pnpm exec astro dev logs` y detenlo con `pnpm exec astro dev stop`.

## Añadir una actividad

1. Crea `src/content/actividades/mi-nueva-actividad.md` o `.mdx`.
2. Completa el frontmatter según `src/content.config.ts`.
3. Usa un `order` nuevo y un estado real: `planeada`, `en-desarrollo`, `en-cierre`, `ejecutada` o `finalizada`.
4. Declara evidencias como `pendiente` hasta que existan y hayan sido revisadas.
5. Añade imágenes propias o con licencia compatible en `public/assets/` y documenta su fuente.
6. Ejecuta `pnpm validate`.
7. Actualiza la documentación/changelog y crea un commit.

## Comandos

| Comando              | Uso                                                   |
| -------------------- | ----------------------------------------------------- |
| `pnpm dev`           | Desarrollo local                                      |
| `pnpm data:generate` | Generar agregados desde el XLSX consolidado           |
| `pnpm build`         | Build estático en `dist/`                             |
| `pnpm preview`       | Previsualización de producción                        |
| `pnpm check`         | Astro check                                           |
| `pnpm lint`          | ESLint                                                |
| `pnpm format`        | Formatear                                             |
| `pnpm format:check`  | Verificar formato                                     |
| `pnpm test:unit`     | Vitest y cobertura                                    |
| `pnpm test:e2e`      | Playwright en Chromium                                |
| `pnpm test:a11y`     | Playwright + axe                                      |
| `pnpm test:links`    | Comprobación de enlaces internos generados            |
| `pnpm validate`      | Formato, lint, tipos, unitarias, build, enlaces y E2E |
| `pnpm deploy`        | Build y despliegue directo a Pages                    |

## Comentarios

No se habilitan comentarios ni cuentas de usuario en esta versión temporal. La decisión está documentada en [`docs/comments.md`](docs/comments.md).

## Documentos y entregas

La biblioteca pública está disponible en [`/documentos/`](https://decisiones-que-si-suman.pages.dev/documentos/). Reúne los documentos académicos autorizados de las actividades 2, 4 y 6 y el plan original.

Para generar y revisar las versiones públicas localmente:

```bash
pnpm documents:generate
pnpm documents:check
```

## Despliegue

El destino es Cloudflare Pages, proyecto `decisiones-que-si-suman`, con `dist/` como salida. Consulta [`docs/deployment.md`](docs/deployment.md).

## Estructura

```text
src/
├── components/       Componentes Astro reutilizables
├── content/          Actividades, plan y recursos Markdown/MDX
├── layouts/          Layout SEO y navegación global
├── lib/              Tipos y utilidades de contenido
├── pages/            Rutas estáticas
└── styles/           Tokens y estilos globales
tests/                Unitarias, E2E y accesibilidad
docs/                 Arquitectura, contenido, pruebas y ADRs
public/               SVG, headers y recursos estáticos
docs/fuentes-academicas/  Fuentes locales ignoradas por Git
```

## Estado actual de la materia

La actividad 2 conserva el contexto inicial; la Actividad 4 documenta 16 respuestas diagnósticas y las dos primeras acciones; la Actividad 6 cierra la ejecución con video, webinar y comparación descriptiva. Las seis publicaciones acumulan 746 visualizaciones y el webinar registra 236 visualizaciones, 2 asistentes en vivo y 69:01 de duración. La encuesta final está habilitada; satisfacción, aplicación y seguimiento continúan pendientes de respuestas consolidadas.
