export const projectStatus = {
  currentWeek: 'Semana 7',
  status: 'en-cierre' as const,
  currentStage:
    'Ejecución completada · evaluación final en cierre. La encuesta de satisfacción y seguimiento todavía no tiene respuestas.',
} as const;

export const projectWeeks = [
  {
    week: 'Semana 2',
    status: 'completada' as const,
    label: 'COMPLETADA',
    summary: 'Contexto, problemática, territorio y propósito documentados.',
  },
  {
    week: 'Semana 3',
    status: 'completada' as const,
    label: 'COMPLETADA',
    summary: 'Instrumento diagnóstico y criterios de privacidad preparados.',
  },
  {
    week: 'Semana 4',
    status: 'completada' as const,
    label: 'COMPLETADA',
    summary: 'Página activa, publicaciones 1 y 2, diagnóstico y 16 respuestas.',
  },
  {
    week: 'Semana 5',
    status: 'completada' as const,
    label: 'EJECUTADA · 1 META ESPECÍFICA NO ALCANZADA',
    summary:
      'Publicaciones 3 y 4, interacción y entrevista autorizada; duración 7:20 frente a meta de 15 minutos.',
  },
  {
    week: 'Semana 6',
    status: 'completada' as const,
    label: 'COMPLETADA EN EJECUCIÓN',
    summary:
      'Publicaciones 5 y 6, webinar de 69:01, evaluación posterior y meta de visualizaciones superada.',
  },
  {
    week: 'Semana 7',
    status: 'en-cierre' as const,
    label: 'EN CIERRE',
    summary:
      'Alcance y reflexión consolidados; satisfacción, acción financiera y seguimiento esperan la encuesta final.',
  },
] as const;

export const projectTimeline = [
  {
    week: 'Semana 2',
    title: 'Contexto y problemática',
    detail: 'Delimitar Neiva, la comunidad cercana y la pregunta de trabajo.',
  },
  {
    week: 'Semana 3',
    title: 'Preparación del diagnóstico',
    detail: 'Diseñar preguntas anónimas y definir el cuidado de los datos.',
  },
  {
    week: 'Semana 4',
    title: 'Diagnóstico y presupuesto',
    detail: 'Página activa, publicaciones 1 y 2 y diagnóstico completado con 16 respuestas.',
  },
  {
    week: 'Semana 5',
    title: 'Ahorro y entrevista',
    detail: 'Publicaciones 3 y 4, comentarios y edición de entrevista con autorización verificada.',
  },
  {
    week: 'Semana 6',
    title: 'Crédito, fraude y webinar',
    detail:
      'Publicaciones 5 y 6, webinar de 69:01, seis respuestas posteriores y más de 20 visualizaciones.',
  },
  {
    week: 'Semana 7',
    title: 'Resultados, evaluación y reflexión',
    detail:
      'Comparación, alcance y video de reflexión disponibles; encuesta final y seguimiento en cierre.',
  },
] as const;
