# Changelog

Todos los cambios relevantes se registran aquí.

## Unreleased

### Added

- Actividad 6 con video de voz en off, presentación original, teoría del cambio y reflexión profesional.
- Webinar publicado con reproductor diferido y evaluación posterior de seis respuestas.
- Generación build-time de resultados agregados desde el XLSX consolidado de 22 respuestas.
- Comparación visual antes/después con nota metodológica para grupos no emparejados.
- Biblioteca `/documentos/` con colección tipada, fichas, relaciones web y versiones públicas sanitizadas.
- Visor PDF.js local con canvas, carga diferida, controles accesibles y worker same-origin.
- Auditoría de contenido académico, ADR documental y reevaluación de comentarios.

### Changed

- Portada, plan y cronología reflejan semanas 4–6 completadas y semana 7 en cierre.
- Actividad 4 conserva su publicación histórica y enlaza la evaluación posterior incorporada el 10/08/2026.
- Los reproductores de entrevista, webinar y voz en off crean el iframe únicamente tras interacción.
- Actividad 4 pasa a `COMPLETADA` con fecha de publicación histórica 27/07/2026 y actualización de resultados del 09/08/2026.
- Actividad 4 incorpora 16 respuestas diagnósticas, resultados agregados, evidencia PDF y publicación de presupuesto sin presentarlos como impacto.
- Actividad 4 incorpora una reflexión académica sustentada en el diagnóstico y diferencia sus aprendizajes del impacto aún no medido.
- La última página de la Actividad 4 enlaza blog, diagnóstico, instrumento, carrusel y plantilla editable, e incorpora fechas y alcance verificable.
- El video de YouTube ocupa un reproductor 16:9 completo y `Pruebas.pdf` se consulta en un visor modal de lectura amplia.
- Los documentos originales de las actividades 2 y 4 cargan de forma determinista al entrar directamente en la vista PDF y solo se declaran listos después de pintar contenido.
- La cronología de portada usa una fuente canónica de semanas 2 a 7.
- ODS y referencias muestran acciones, límites y fuentes diferenciadas.

## [0.1.0] - 2026-07-27

### Added

- Base Astro 7 estática con TypeScript estricto.
- Colecciones tipadas de actividades, plan y recursos.
- Actividad 2, actividad 4 y plan de Humanidades Digitales.
- Portada, actividades filtrables, ODS, territorio, referencias, privacidad, participación y 404.
- SEO, sitemap, RSS, robots.txt y headers de seguridad para Cloudflare Pages.
- Vitest, Playwright, axe, comprobador de enlaces y GitHub Actions.
- Sistema visual documentado en `DESIGN.md`.

### Pending

- Consolidación de asistentes, visualizaciones, satisfacción y seguimiento final.
