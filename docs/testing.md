# Pruebas

## Capas

- `pnpm check`: esquemas, tipos y componentes Astro.
- `pnpm lint`: reglas ESLint.
- `pnpm format:check`: formato Prettier.
- `pnpm test:unit`: utilidades de contenido, métricas, encuesta y herramientas financieras educativas.
- `pnpm test:e2e`: navegación, dashboard, encuesta, calculadora local, recursos, privacidad y biblioteca documental.
- `pnpm test:a11y`: axe sobre portada, actividades, plan, encuesta, recursos, privacidad y documentos.
- `pnpm test:links`: enlaces internos de `dist`.
- `pnpm documents:check`: firma, metadatos y ausencia de identificadores en PDF públicos; requiere herramientas locales de documentos.

## Ejecución

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

El workflow instala Chromium en CI. Firefox y WebKit pueden añadirse después si el entorno dispone de los binarios.

La suite documental cubre `/documentos/`, las cuatro fichas, pestañas, entrada directa con `?vista=documento`, píxeles visibles en el canvas, primera página, navegación, zoom, descarga, teclado, móvil, errores de carga y ausencia del ID universitario. La portada comprueba seis publicaciones, métricas agregadas, consentimiento audiovisual y carga diferida de YouTube. También verifica que `Pruebas.pdf`, el soporte privado de Teams y el MOV fuente no estén publicados. Actividad 6 valida el informe final, la miniatura local, la presentación, la comparación y la metodología.

## Cobertura

Vitest genera HTML y texto en `coverage/`. La cobertura inicial se concentra en `src/lib/`, donde vive la lógica pura.
