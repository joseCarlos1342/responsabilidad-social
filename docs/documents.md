# Documentos y entregas

La ruta `/documentos/` reúne cuatro entregas: plan y actividades 2, 4 y 6.

## Colección

Cada entrada de `src/content/documents/` declara título, descripción, tipo, semana, estado, fechas, ruta web, número de páginas, versión, ODS, etiquetas, descarga, asset documental y revisión de privacidad. `src/lib/documents.ts` valida durante el build que:

- el estado y la estructura provengan del esquema Zod;
- la ruta web sea una página existente del proyecto;
- el PDF documental exista bajo `public/documents/`;
- la ruta no salga del directorio documental;
- la fuente privada permanezca separada de la edición pública;
- la privacidad esté confirmada.

Las actividades 2 y 4 y el plan enlazan ediciones públicas reconstruidas sin identificador universitario, nombre completo ni metadatos de las fuentes. Las fuentes académicas de trabajo permanecen en `docs/fuentes-academicas/` y siguen ignoradas por Git. El material original de la Actividad 6 fue revisado y no contiene esos identificadores.

## Verificación documental

`pnpm documents:check` valida que los PDF públicos existan, sean válidos, conserven el número esperado de páginas y no contengan los identificadores bloqueados. Las evidencias sociales (`publi1.pdf` a `publi6.pdf`) mantienen sus rutas independientes.

Requiere la herramienta local `mutool`.
