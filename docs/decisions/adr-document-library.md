# ADR: biblioteca documental pública

- **Estado:** aceptado
- **Fecha:** 30 de julio de 2026

## Contexto

El proyecto necesita relacionar la lectura web con entregas académicas descargables. Los originales locales contienen ID universitario, nombres completos, metadatos, historial y elementos cuya autorización no está documentada.

## Decisión

Se crea una colección `document` con relación explícita a la ruta web. La biblioteca publica solo PDF reconstruidos y sanitizados bajo `public/documents/`, valida su existencia durante el build y exige `privacyReviewed: true`. Las páginas web siguen siendo la experiencia principal; PDF.js es una mejora progresiva cargada solo en la pestaña documental.

## Alternativas descartadas

- Publicar los originales: contradice la política de privacidad.
- Usar `iframe`, `embed` u `object`: contradice la CSP y ofrece peor control accesible.
- Crear una página duplicada por documento: separaría la evidencia de su lectura web.
- Procesar originales durante CI: no son parte del repositorio y no deben llegar al despliegue.

## Consecuencias

La biblioteca exige mantener un PDF público y su ficha sincronizados. A cambio, ofrece trazabilidad, descarga convencional, compatibilidad con CSP estricta y una alternativa HTML accesible.
