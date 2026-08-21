import closureSurveyResults from './closure-survey.generated.json';

export type PublicationMetric = {
  number: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  views: number;
  reach: number;
  interactions: number;
  reactions: number;
  comments: number;
  shares: number;
};

export const publicationMetrics: readonly PublicationMetric[] = [
  {
    number: 1,
    title: '¿Qué tan organizadas están tus finanzas?',
    views: 110,
    reach: 20,
    interactions: 21,
    reactions: 18,
    comments: 3,
    shares: 0,
  },
  {
    number: 2,
    title: '¿Sabes realmente en qué se va tu dinero?',
    views: 80,
    reach: 27,
    interactions: 23,
    reactions: 19,
    comments: 3,
    shares: 1,
  },
  {
    number: 3,
    title: 'Pequeños gastos, gran diferencia',
    views: 135,
    reach: 30,
    interactions: 23,
    reactions: 19,
    comments: 4,
    shares: 0,
  },
  {
    number: 4,
    title: 'Tu fondo de emergencia',
    views: 187,
    reach: 43,
    interactions: 27,
    reactions: 20,
    comments: 5,
    shares: 2,
  },
  {
    number: 5,
    title: 'Antes de aceptar un crédito',
    views: 120,
    reach: 24,
    interactions: 12,
    reactions: 6,
    comments: 4,
    shares: 2,
  },
  {
    number: 6,
    title: '¿Crédito fácil o posible fraude?',
    views: 114,
    reach: 25,
    interactions: 17,
    reactions: 8,
    comments: 8,
    shares: 1,
  },
] as const;

type PublicationTotals = Omit<PublicationMetric, 'number' | 'title'>;

export const publicationImpactTotals = publicationMetrics.reduce<PublicationTotals>(
  (totals, item) => ({
    views: totals.views + item.views,
    reach: totals.reach + item.reach,
    interactions: totals.interactions + item.interactions,
    reactions: totals.reactions + item.reactions,
    comments: totals.comments + item.comments,
    shares: totals.shares + item.shares,
  }),
  { views: 0, reach: 0, interactions: 0, reactions: 0, comments: 0, shares: 0 },
);

export type ClosureSurveyQuestion = {
  key:
    | 'satisfaction'
    | 'utility'
    | 'financial-action'
    | 'application'
    | 'webinar-exercise'
    | 'comment';
  prompt: string;
  options?: readonly string[];
  guidance?: string;
};

export const closureSurveyQuestions: readonly ClosureSurveyQuestion[] = [
  {
    key: 'satisfaction',
    prompt:
      'En una escala de 1 a 5, ¿qué tan satisfecho(a) se encuentra con los contenidos y actividades del proyecto Decisiones que sí suman?',
    options: ['1 · Muy insatisfecho', '2', '3', '4', '5 · Muy satisfecho'],
  },
  {
    key: 'utility',
    prompt:
      'En una escala de 1 a 5, ¿qué tan útiles considera los conocimientos adquiridos para tomar mejores decisiones financieras en su vida cotidiana?',
    options: ['1 · Nada útiles', '2', '3', '4', '5 · Muy útiles'],
  },
  {
    key: 'financial-action',
    prompt:
      'Después de participar o consultar los contenidos del proyecto, ¿qué acción financiera decidió realizar?',
    options: [
      'Registrar con mayor frecuencia mis gastos.',
      'Elaborar o mejorar mi presupuesto.',
      'Definir una meta de ahorro.',
      'Crear o fortalecer un fondo de emergencia.',
      'Comparar diferentes opciones antes de aceptar un crédito.',
      'Revisar tasa, cuota, plazo y costo total antes de endeudarme.',
      'Verificar información y canales oficiales para prevenir fraudes.',
      'Otra.',
      'Ninguna por el momento.',
    ],
  },
  {
    key: 'application',
    prompt:
      '¿Ha puesto en práctica alguna de las acciones anteriores desde que participó en el proyecto?',
    options: [
      'Sí, ya la estoy aplicando.',
      'La he aplicado parcialmente.',
      'Todavía no la he aplicado.',
      'No definí una acción.',
    ],
  },
  {
    key: 'webinar-exercise',
    prompt:
      'Si participó en el webinar Decisiones que sí suman, ¿realizó o siguió alguno de los ejercicios prácticos desarrollados durante la sesión?',
    options: [
      'Sí, realicé los ejercicios.',
      'Realicé algunos de forma parcial.',
      'No los realicé.',
      'No participé de manera sincrónica en el webinar.',
    ],
  },
  {
    key: 'comment',
    prompt:
      '¿Qué aspecto del proyecto le resultó más útil o qué tema considera que debería fortalecerse?',
    guidance:
      'Respuesta abierta opcional. No incluya nombres, datos personales ni información financiera.',
  },
] as const;

export const digitalImpact = {
  source: 'Estadísticas de Meta/Facebook de la Fan Page Decisiones que sí suman.',
  period: '17 de julio de 2026 – 13 de agosto de 2026',
  evidence: {
    overview: '/assets/evidencias/resultados/estadisticas-generales.png',
    content: '/assets/evidencias/resultados/estadisticas-publicaciones.png',
  },
  fanPage: {
    viewsLabel: '1,5 mil',
    viewers: 524,
    followerViewPercentage: 24.1,
    nonFollowerViewPercentage: 75.9,
    visits: 258,
    interactions: 248,
    followerInteractions: 112,
    nonFollowerInteractions: 136,
    followers: 12,
    netFollows: 12,
    unfollows: 0,
    threeSecondVideoViews: 213,
    watchTimeLabel: '1 h 51 min',
  },
  webinar: {
    views: 236,
    reach: 190,
    viewers: 192,
    interactions: 15,
    reactions: 7,
    comments: 1,
    shares: 7,
    viewsTarget: 20,
    viewsTargetReached: true,
  },
  liveAttendance: { count: 2, target: 5, targetReached: false },
  teacherNotification: {
    status: 'evidencia-registrada',
    note: 'La invitación de Teams y la participación de la docente están registradas.',
  },
  interviewConsent: {
    status: 'verificado',
    note: 'Constancia audiovisual verificada para grabación y uso de fragmentos con fines académicos y educativos.',
    href: '/media/video/permiso-entrevista.mp4',
    durationSeconds: 41,
  },
  practicalWebinarObjective: {
    targetPercentage: 80,
    status: 'autorreporte-consolidado',
    reportedPercentage: closureSurveyResults.webinarExercises.fullAmongSynchronousPercentage,
    sourceDiscrepancy: closureSurveyResults.webinarExercises.attendanceSourceDiscrepancy,
  },
  closureSurvey: {
    status: 'consolidada',
    responseCount: closureSurveyResults.responseCount,
    href: 'https://forms.gle/wswjtPct8SRjvuLB8',
  },
} as const;
