# Reevaluación de comentarios

## Requerimiento original

El sitio debía permitir que visitantes dejaran comentarios sobre las publicaciones.

## Decisión actual

La versión vigente no implementa comentarios ni cuentas de usuario. La biblioteca documental no depende de esta decisión y funciona como contenido estático público.

## Giscus

Giscus integra discusiones de GitHub, pero requiere que cada visitante tenga una cuenta de GitHub y añade una dependencia externa, una superficie de privacidad y una obligación continua de moderación. Por eso no se restaura silenciosamente.

## Alternativa propia

Una futura implementación podría usar Cloudflare Pages Functions, D1, Turnstile y una cola o panel de moderación. Requeriría definir identidad o pseudónimo, retención, protección contra abuso, notificaciones, reglas de publicación, exportación y borrado.

## Implicaciones

Los comentarios permitirían retroalimentación, pero también podrían revelar datos financieros, experiencias identificables o solicitudes de asesoría personalizada. La alternativa propia implica mantenimiento, costos operativos, revisión de contenido y responsabilidad sobre datos personales. La decisión queda pendiente hasta que el proyecto tenga una necesidad sostenida y un responsable de moderación.
