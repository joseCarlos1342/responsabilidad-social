# Guía editorial

## Antes de publicar

- Verifica la fuente o marca el dato como reflexión propia.
- Separa guía académica, contenido del estudiante, fuente externa y evidencia.
- No generalices resultados nacionales a Neiva.
- No publiques nombres, IDs, saldos, documentos, teléfonos, correos privados ni historias identificables.
- No promociones empresas, entidades ni productos.
- Usa `planeada` o `en-desarrollo` mientras la actividad no tenga evidencia.
- Relaciona cada actividad o plan con un `documentSlug` cuando exista una edición pública.
- No marques un documento como descargable sin `privacyReviewed: true` y un PDF bajo `public/documents/`.

## Frontmatter mínimo

```yaml
title: 'Título'
description: 'Descripción breve'
activityNumber: 5
week: 'Semana 5'
date: 2026-08-01
updatedDate: 2026-08-01
status: planeada
category: acción
contentType: actividad
ods: [4]
objectives: ['Objetivo verificable']
territory: 'Neiva, Huila, Colombia'
evidence:
  - label: 'Captura autorizada'
    status: pendiente
draft: false
featured: false
order: 3
references: []
```

## Evidencias

Usa `pendiente` para placeholders. Cuando exista una evidencia, revisa metadatos, datos personales, consentimiento, licencia y autorización. No subas el documento original del plan ni los PDF fuente.

## Documentos públicos

Los PDF públicos deben tener nombres `*-publico.pdf` o `*-publica.pdf`, una leyenda de versión pública y una revisión explícita de ID, metadatos, firmas, terceros, imágenes y datos de clientes. Ejecuta `pnpm documents:check` antes de incorporarlos. El plan académico es una excepción explícita: conserva el PDF original a solicitud del autor y debe anunciarse como original, no como edición sanitizada.

Las evidencias de publicaciones sociales son una excepción controlada: `public/documents/publi1.pdf` a `public/documents/publi4.pdf` conservan los nombres proporcionados para mantener sus rutas oficiales. Cada una debe conservar su miniatura, su enlace directo al PDF y su enlace exacto de Facebook en `src/lib/publications.ts`. No se deben añadir métricas, fechas ni resultados que no aparezcan en la pieza visual.
