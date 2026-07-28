import { describe, expect, it } from 'vitest';
import {
  estimateReadingTime,
  filterByOds,
  filterByStatus,
  filterByWeek,
  slugify,
  sortActivities,
  type ActivityEntry,
} from '../../src/lib/content';

const activity = (
  id: string,
  order: number,
  week: string,
  status: ActivityEntry['data']['status'],
  ods: number[],
): ActivityEntry => ({
  id,
  body: '',
  collection: 'activity',
  data: {
    title: id,
    description: '',
    activityNumber: order,
    week,
    date: new Date('2026-01-01'),
    updatedDate: undefined,
    status,
    category: 'acción',
    contentType: 'actividad',
    tags: [],
    ods,
    objectives: [],
    territory: 'Neiva',
    cover: undefined,
    gallery: [],
    evidence: [],
    draft: false,
    featured: false,
    order,
    references: [],
  },
});

describe('content utilities', () => {
  const activities = [
    activity('later', 2, 'Semana 4', 'en-desarrollo', [4, 10]),
    activity('first', 1, 'Semana 2', 'ejecutada', [1, 4]),
  ];

  it('ordena actividades por order', () => {
    expect(sortActivities(activities).map((item) => item.id)).toEqual(['first', 'later']);
  });

  it('filtra por semana', () => {
    expect(filterByWeek(activities, 'Semana 4').map((item) => item.id)).toEqual(['later']);
  });

  it('filtra por estado', () => {
    expect(filterByStatus(activities, 'ejecutada').map((item) => item.id)).toEqual(['first']);
  });

  it('filtra por ODS', () => {
    expect(filterByOds(activities, 10).map((item) => item.id)).toEqual(['later']);
  });

  it('estima al menos un minuto de lectura', () => {
    expect(estimateReadingTime('una dos tres', 220)).toBe(1);
    expect(estimateReadingTime(Array.from({ length: 441 }, () => 'palabra').join(' '), 220)).toBe(
      3,
    );
  });

  it('genera slugs legibles sin tildes', () => {
    expect(slugify('Decisiones que sí suman')).toBe('decisiones-que-si-suman');
  });
});
