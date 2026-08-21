# Fuentes académicas locales

Esta carpeta separa los originales privados de los artefactos revisados que se publican en el sitio. Todo el contenido bajo `privadas/` está excluido por `.gitignore`; únicamente este inventario se versiona.

```text
privadas/
├── documentos/
│   ├── actividad-02-original.pdf
│   ├── actividad-04-original.pdf
│   ├── instrucciones-actividad-semana-07.pdf
│   └── plan-responsabilidad-social-original.pdf
├── datos/
│   ├── diagnostico/
│   │   ├── respuestas-iniciales.xlsx
│   │   └── respuestas-consolidadas.xlsx
│   └── cierre/
│       └── encuesta-cierre-respuestas.xlsx
├── audiovisual/
│   ├── entrevista/entrevista-educacion-financiera-original.mov
│   └── consentimiento/permiso-entrevista-original.mov
└── capturas/no-publicar/
    ├── encuesta-respuestas-abiertas-original.png
    ├── pruebas-completas-proyecto-con-datos-personales.pdf
    └── pruebas-evidencia-con-datos-personales.png
```

La hoja de cierre puede no estar presente en todos los equipos. En ese caso, el build conserva y valida `src/data/closure-survey.generated.json` sin intentar reconstruir respuestas individuales.

## Trazabilidad pública

- Los PDF sanitizados se generan en `public/documents/entregas/`.
- Los XLSX públicos agregados se generan en `public/documents/resultados/`.
- Las gráficas revisadas de encuesta viven en `public/assets/evidencias/encuesta-cierre/`.
- La captura `confirmacion-envio.jpeg`, añadida con la guía de semana 7, fue revisada y no muestra identidad ni contenido de respuestas.
- El PDF `pruebas-completas-proyecto-con-datos-personales.pdf` contiene nombres o comentarios individuales y nunca debe copiarse a `public/`.
- Los MOV originales permanecen privados; solo la copia MP4 autorizada vive en `public/media/video/`.

No se deben editar los originales para producir una versión pública. Cualquier sanitización genera un artefacto separado y verificable.
