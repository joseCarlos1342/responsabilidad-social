# ADR 0007: Estrategia de pruebas

## Estado

Aceptada

## Decisión

Combinar `astro check`, ESLint, Prettier, Vitest, Playwright, axe, build y comprobación de enlaces.

## Por qué

Las utilidades puras se verifican rápido con unitarias; los flujos de navegación y accesibilidad se prueban sobre la build real. La cobertura no reemplaza revisión editorial ni smoke test de producción.
