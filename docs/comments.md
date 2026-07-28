# Comentarios con Giscus

## Diseño

Giscus mantiene el sitio estático y utiliza GitHub Discussions. El componente `src/components/Comments.astro` asocia por `pathname`, carga de forma diferida, usa español y cambia el tema cuando la configuración está completa.

Actualmente se muestra un aviso de configuración pendiente porque falta autorizar la aplicación Giscus. El repositorio y la categoría pública `General` ya tienen IDs documentados en `.env.example`.

## Activación

1. Activar Discussions en `joseCarlos1342/responsabilidad-social`.
2. Instalar y autorizar la aplicación Giscus en ese repositorio.
3. Usar la categoría pública `General` o crear una categoría específica si GitHub habilita esa opción.
4. Copiar los IDs de `.env.example` en `.env` localmente o en Pages, sin subir secretos.
5. Ejecutar `pnpm build` y comprobar que el iframe aparece solo en actividades y plan.

La autorización de la aplicación es el único paso potencialmente manual. No se implementará un sistema propio de comentarios.
