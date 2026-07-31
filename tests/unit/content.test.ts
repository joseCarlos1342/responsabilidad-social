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
import {
  getDocumentRoute,
  sortDocuments,
  validateDocumentEntry,
  type DocumentEntry,
} from '../../src/lib/documents';
import { projectTimeline } from '../../src/lib/project';

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

  it('ordena documentos por fecha de publicación', () => {
    const documentEntry = (id: string, publishedAt: string): DocumentEntry => ({
      id,
      body: '',
      collection: 'document',
      data: {
        title: id,
        description: '',
        slug: id,
        documentType: 'actividad',
        activityNumber: 2,
        week: 'Semana 2',
        status: 'ejecutado',
        publishedAt: new Date(publishedAt),
        updatedAt: new Date(publishedAt),
        originalFile: 'docs/fuentes-academicas/source.pdf',
        webRoute: '/actividades/actividad-2-decisiones-que-si-suman/',
        pageCount: 1,
        version: '1.0 pública',
        ods: [4],
        tags: [],
        downloadable: true,
        publicVersion: `/documents/${id}-publica.pdf`,
        privacyReviewed: true,
        evidenceStatus: 'disponible',
      },
    });
    const entries = [documentEntry('later', '2026-07-27'), documentEntry('first', '2026-07-07')];
    expect(sortDocuments(entries).map((entry) => entry.id)).toEqual(['first', 'later']);
    expect(getDocumentRoute(entries[0])).toBe('/documentos/later/');
  });

  it('valida que un PDF público exista y tenga privacidad revisada', () => {
    const documentEntry = {
      id: 'actividad-2-publica',
      body: '',
      collection: 'document' as const,
      data: {
        title: 'Actividad 2',
        description: '',
        slug: 'actividad-2-publica',
        documentType: 'actividad' as const,
        activityNumber: 2,
        week: 'Semana 2',
        status: 'ejecutado' as const,
        publishedAt: new Date('2026-07-07'),
        updatedAt: new Date('2026-07-30'),
        originalFile: 'docs/fuentes-academicas/source.pdf',
        webRoute: '/actividades/actividad-2-decisiones-que-si-suman/',
        pageCount: 4,
        version: '1.0 pública',
        ods: [4],
        tags: [],
        downloadable: true,
        publicVersion: '/documents/actividad-2-publica.pdf',
        privacyReviewed: true as const,
        evidenceStatus: 'disponible' as const,
      },
    } as DocumentEntry;
    expect(validateDocumentEntry(documentEntry)).toEqual([]);
    expect(validateDocumentEntry(documentEntry, '/tmp/documentos-inexistentes')).toContain(
      'PDF público inexistente: /documents/actividad-2-publica.pdf',
    );
  });

  it('mantiene la cronología canónica de semanas 2 a 7', () => {
    expect(projectTimeline.map((item) => item.week)).toEqual([
      'Semana 2',
      'Semana 3',
      'Semana 4',
      'Semana 5',
      'Semana 6',
      'Semana 7',
    ]);
  });
});
