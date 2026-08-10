export const projectStatus = {
  currentWeek: 'Semana 6',
  currentStage:
    'Seis publicaciones y el diagnóstico están registrados; el webinar, el postest y la actividad académica de la semana 6 siguen en progreso.',
} as const;

export const projectWeeks = [
  {
    week: 'Semana 4',
    status: 'completada' as const,
    summary: 'Página activa, publicaciones 1 y 2, diagnóstico y 16 respuestas.',
  },
  {
    week: 'Semana 5',
    status: 'en-progreso' as const,
    summary:
      'Publicaciones 3 y 4, interacción y entrevista publicada; duración objetivo no cumplida.',
  },
  {
    week: 'Semana 6',
    status: 'en-progreso' as const,
    summary: 'Publicaciones 5 y 6 registradas; webinar, asistencia y evaluación final pendientes.',
  },
  {
    week: 'Semana 7',
    status: 'pendiente' as const,
    summary: 'Seguimiento, satisfacción, comparación y reflexión final pendientes.',
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
      'Publicaciones 3 y 4, comentarios y entrevista publicada; la duración mínima no se cumplió.',
  },
  {
    week: 'Semana 6',
    title: 'Crédito, fraude y webinar',
    detail: 'Publicaciones 5 y 6 registradas; webinar, asistencia y postest siguen pendientes.',
  },
  {
    week: 'Semana 7',
    title: 'Resultados, evaluación y reflexión',
    detail: 'Revisar métricas, satisfacción, comparación pretest-postest y reflexión final.',
  },
] as const;
