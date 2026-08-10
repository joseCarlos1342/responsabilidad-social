import type { CollectionEntry } from 'astro:content';

export type ActivityEntry = CollectionEntry<'activity'>;
export type ContentStatus =
  | 'planeada'
  | 'planeado'
  | 'en-desarrollo'
  | 'ejecutada'
  | 'ejecutado'
  | 'finalizada'
  | 'finalizado'
  | 'completada'
  | 'en-progreso'
  | 'pendiente'
  | 'evidencia-registrada'
  | 'en-preparacion';

export const statusLabels: Record<ContentStatus, string> = {
  planeada: 'Planeada',
  planeado: 'Planeado',
  'en-desarrollo': 'En desarrollo',
  ejecutada: 'Ejecutada',
  ejecutado: 'Ejecutado',
  finalizada: 'COMPLETADA',
  finalizado: 'COMPLETADO',
  completada: 'COMPLETADA',
  'en-progreso': 'EN PROGRESO',
  pendiente: 'PENDIENTE',
  'evidencia-registrada': 'EVIDENCIA REGISTRADA',
  'en-preparacion': 'EN PREPARACIÓN',
};

export function sortActivities(activities: ActivityEntry[]): ActivityEntry[] {
  return [...activities].sort((a, b) => a.data.order - b.data.order);
}

export function filterByWeek(activities: ActivityEntry[], week: string): ActivityEntry[] {
  return activities.filter((activity) => activity.data.week === week);
}

export function filterByStatus(
  activities: ActivityEntry[],
  status: ActivityEntry['data']['status'],
): ActivityEntry[] {
  return activities.filter((activity) => activity.data.status === status);
}

export function filterByOds(activities: ActivityEntry[], ods: number): ActivityEntry[] {
  return activities.filter((activity) => activity.data.ods.includes(ods));
}

export function estimateReadingTime(text: string, wordsPerMinute = 220): number {
  const words = text.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/(^-|-$)/gu, '');
}

export const odsData = [
  {
    number: 1,
    name: 'Fin de la pobreza',
    color: '#E5243B',
    explanation:
      'Una organización básica puede ayudar a anticipar gastos y reducir la exposición a una crisis, sin sustituir ingresos dignos ni protección social.',
    action:
      'La actividad 4 propone registrar ingresos, separar gastos y elegir un ajuste sostenible.',
    scope: 'Educativo, local e indirecto.',
    limitation: 'No resuelve pobreza, desempleo ni insuficiencia de ingresos.',
  },
  {
    number: 4,
    name: 'Educación de calidad',
    color: '#C5192D',
    explanation:
      'El proyecto traduce presupuesto, ahorro, crédito y seguridad digital en aprendizajes prácticos y reutilizables.',
    action:
      'Las actividades 2 y 4 usan lenguaje claro, preguntas y una herramienta de presupuesto.',
    scope: 'Microaprendizaje abierto para la comunidad cercana.',
    limitation: 'Una publicación no mide por sí sola aprendizaje ni cambio de conducta.',
  },
  {
    number: 8,
    name: 'Trabajo decente y crecimiento económico',
    color: '#A21942',
    explanation:
      'Comprender ingresos variables, capacidad de pago y costo total puede apoyar decisiones laborales y económicas más informadas.',
    action:
      'La actividad 4 separa ingresos, obligaciones y gastos para revisar el margen disponible.',
    scope: 'Herramienta educativa para decisiones cotidianas.',
    limitation: 'No cambia las condiciones laborales ni recomienda productos financieros.',
  },
  {
    number: 10,
    name: 'Reducción de las desigualdades',
    color: '#DD1367',
    explanation:
      'El sitio evita tecnicismos innecesarios y considera que las personas tienen ingresos, trayectorias y conectividad distintas.',
    action:
      'La actividad 2 delimita la comunidad y la actividad 4 diseña un diagnóstico voluntario sin datos sensibles.',
    scope: 'Accesibilidad editorial y escucha situada.',
    limitation: 'El alcance no representa a toda Neiva ni elimina desigualdades estructurales.',
  },
  {
    number: 12,
    name: 'Producción y consumo responsables',
    color: '#BF8B2E',
    explanation:
      'Registrar gastos y distinguir necesidades de gastos flexibles permite conversar sobre consumo consciente sin culpabilizar.',
    action:
      'La plantilla de presupuesto de la actividad 4 invita a reconocer ajustes concretos y sostenibles.',
    scope: 'Reflexión práctica sobre decisiones de consumo.',
    limitation: 'La herramienta no determina qué debe comprar cada persona.',
  },
  {
    number: 16,
    name: 'Paz, justicia e instituciones sólidas',
    color: '#00689D',
    explanation:
      'La prevención del fraude y la consulta de fuentes oficiales fortalecen la capacidad de preguntar, verificar y reclamar.',
    action:
      'La actividad 2 introduce seguridad digital y la actividad 4 pregunta por señales de mensajes o prestamistas fraudulentos.',
    scope: 'Prevención informativa y ciudadanía económica.',
    limitation:
      'No reemplaza investigación, denuncia ni asesoría profesional ante un caso particular.',
  },
  {
    number: 17,
    name: 'Alianzas para lograr los objetivos',
    color: '#19486A',
    explanation:
      'El plan proyecta colaboración con una experta y actores cercanos para convertir conocimientos técnicos en recursos públicos.',
    action:
      'La actividad 2 define una entrevista y un webinar como acciones futuras sujetas a autorización y evidencia.',
    scope: 'Alianza académica y comunitaria proyectada.',
    limitation: 'La entrevista y el webinar todavía no tienen evidencia de ejecución publicada.',
  },
] as const;

export function getOds(number: number) {
  return odsData.find((item) => item.number === number);
}
