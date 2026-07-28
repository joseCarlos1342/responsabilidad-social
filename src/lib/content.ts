import type { CollectionEntry } from 'astro:content';

export type ActivityEntry = CollectionEntry<'activity'>;

export const statusLabels: Record<ActivityEntry['data']['status'], string> = {
  planeada: 'Planeada',
  'en-desarrollo': 'En desarrollo',
  ejecutada: 'Ejecutada',
  finalizada: 'Finalizada',
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
  { number: 1, name: 'Fin de la pobreza', color: '#E5243B' },
  { number: 4, name: 'Educación de calidad', color: '#C5192D' },
  { number: 8, name: 'Trabajo decente y crecimiento económico', color: '#A21942' },
  { number: 10, name: 'Reducción de las desigualdades', color: '#DD1367' },
  { number: 12, name: 'Producción y consumo responsables', color: '#BF8B2E' },
  { number: 16, name: 'Paz, justicia e instituciones sólidas', color: '#00689D' },
  { number: 17, name: 'Alianzas para lograr los objetivos', color: '#19486A' },
] as const;

export function getOds(number: number) {
  return odsData.find((item) => item.number === number);
}
