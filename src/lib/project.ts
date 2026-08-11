export const projectStatus = {
  currentWeek: 'Semana 7',
  currentStage:
    'La ejecución principal está completada; el proyecto se encuentra en cierre y consolidación de métricas de alcance y seguimiento.',
} as const;

export const projectWeeks = [
  {
    week: 'Semana 4',
    status: 'completada' as const,
    summary: 'Página activa, publicaciones 1 y 2, diagnóstico y 16 respuestas.',
  },
  {
    week: 'Semana 5',
    status: 'completada' as const,
    summary:
      'Publicaciones 3 y 4, interacción y entrevista publicada; la duración objetivo no se cumplió.',
  },
  {
    week: 'Semana 6',
    status: 'completada' as const,
    summary:
      'Publicaciones 5 y 6, webinar de 69 minutos y evaluación posterior; alcance por consolidar.',
  },
  {
    week: 'Semana 7',
    status: 'en-progreso' as const,
    summary:
      'Comparación descriptiva y reflexión final disponibles; métricas y seguimiento en cierre.',
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
    detail:
      'Publicaciones 3 y 4, comentarios y entrevista publicada; la duración mínima prevista no se cumplió.',
  },
  {
    week: 'Semana 6',
    title: 'Crédito, fraude y webinar',
    detail: 'Publicaciones 5 y 6, webinar de 69 minutos y seis respuestas posteriores completadas.',
  },
  {
    week: 'Semana 7',
    title: 'Resultados, evaluación y reflexión',
    detail:
      'Comparación descriptiva y video de reflexión disponibles; métricas de alcance en cierre.',
  },
] as const;
