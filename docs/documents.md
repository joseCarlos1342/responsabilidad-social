# Documentos y entregas

La ruta `/documentos/` reúne las tres entregas actualmente disponibles: plan, actividad 2 y actividad 4.

## Colección

Cada entrada de `src/content/documents/` declara título, descripción, tipo, semana, estado, fechas, ruta web, número de páginas, versión, ODS, etiquetas, descarga, versión pública y revisión de privacidad. `src/lib/documents.ts` valida durante el build que:

- el estado y la estructura provengan del esquema Zod;
- la ruta web sea una página existente del proyecto;
- el PDF público exista bajo `public/documents/`;
- la ruta no salga del directorio documental;
- el original no se trate como asset público;
- la privacidad esté confirmada.

Los archivos originales viven en `docs/fuentes-academicas/` en el entorno local, permanecen ignorados por Git y no se copian al despliegue.

## Versiones públicas

Se generan con `pnpm documents:generate` desde los PDF locales. El script reconstruye cada documento a partir de texto extraído, elimina ID, nombres completos y metadatos personales, añade la indicación “Versión pública para consulta web” y deja los archivos bajo los patrones permitidos por `.gitignore`.

`pnpm documents:check` extrae de nuevo el texto y verifica firma PDF, leyenda pública y ausencia de datos bloqueados. Requiere las herramientas locales `mutool`, `exiftool` y Chromium.
