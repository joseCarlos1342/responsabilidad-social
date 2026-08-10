import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
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
import {
  getPublicationProgress,
  publicationTotal,
  publications,
  type Publication,
} from '../../src/lib/publications';
import { projectTimeline } from '../../src/lib/project';
import { diagnosticSummary } from '../../src/data/diagnostic';

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
        documentSource: 'publica',
        evidenceStatus: 'disponible',
      },
    });
    const entries = [documentEntry('later', '2026-07-27'), documentEntry('first', '2026-07-07')];
    expect(sortDocuments(entries).map((entry) => entry.id)).toEqual(['first', 'later']);
    expect(getDocumentRoute(entries[0])).toBe('/documentos/later/');
  });

  it('valida que un PDF documental original exista', () => {
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
        pageCount: 3,
        version: '1.0 original académico',
        ods: [4],
        tags: [],
        downloadable: true,
        publicVersion: '/documents/actividad-2-original.pdf',
        privacyReviewed: true as const,
        documentSource: 'original' as const,
        evidenceStatus: 'disponible' as const,
      },
    } as DocumentEntry;
    expect(validateDocumentEntry(documentEntry)).toEqual([]);
    expect(validateDocumentEntry(documentEntry, '/tmp/documentos-inexistentes')).toContain(
      'PDF documental inexistente: /documents/actividad-2-original.pdf',
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

  it('registra las seis publicaciones ejecutadas', () => {
    expect(publications).toHaveLength(6);
    expect(publications.map((publication) => publication.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(publicationTotal).toBe(6);
    expect(getPublicationProgress(publications)).toEqual({ current: 6, total: publicationTotal });
    expect(publications.every((publication) => publication.status === 'ejecutada')).toBe(true);
    expect(publications.map((publication) => publication.week)).toEqual([
      'Semana 4',
      'Semana 4',
      'Semana 5',
      'Semana 5',
      'Semana 6',
      'Semana 6',
    ]);
  });

  it('conserva PDF y miniatura por publicación, y enlaces sociales cuando existen', () => {
    const requiredFields: Array<keyof Publication> = [
      'pdfHref',
      'thumbnailSrc',
      'title',
      'callToAction',
    ];

    publications.forEach((publication) => {
      requiredFields.forEach((field) => expect(publication[field]).toBeTruthy());
      expect(publication.pdfHref).toMatch(/^\/documents\/publi[1-6]\.pdf$/u);
      expect(publication.thumbnailSrc).toMatch(/^\/assets\/publicaciones\/publi[1-6]\.png$/u);
      if (publication.facebookHref)
        expect(publication.facebookHref).toMatch(/^https:\/\/www\.facebook\.com\/share\//u);
      expect(existsSync(resolve(process.cwd(), 'public', publication.pdfHref.slice(1)))).toBe(true);
      expect(existsSync(resolve(process.cwd(), 'public', publication.thumbnailSrc.slice(1)))).toBe(
        true,
      );
    });
  });

  it('conserva la ficha editorial extraída de cada pieza visual', () => {
    expect(
      publications.map(({ title, theme, format, callToAction }) => ({
        title,
        theme,
        format,
        callToAction,
      })),
    ).toEqual([
      {
        title: '¿Cómo manejas tu dinero?',
        theme: 'Diagnóstico rápido',
        format: 'Carrusel educativo',
        callToAction:
          'Desliza y haz tu autoevaluación → En comentarios, escribe una palabra: presupuesto, ahorro, crédito o fraude.',
      },
      {
        title: 'Presupuesto sin enredos',
        theme: 'Organiza lo que entra y lo que sale',
        format: 'Carrusel educativo',
        callToAction: 'Desliza para construir uno en 3 pasos → Pruébala durante 7 días.',
      },
      {
        title: 'Pequeños gastos, gran diferencia',
        theme: 'Gastos hormiga',
        format: 'Carrusel educativo',
        callToAction: 'Acepta el reto de 7 días → ¿Qué meta financiarías con ese dinero?',
      },
      {
        title: 'Tu fondo de emergencia',
        theme: 'Ahorro para imprevistos',
        format: 'Carrusel educativo',
        callToAction:
          'Desliza para construirlo por etapas → Adapta el monto a tu realidad, no a la de otra persona.',
      },
      {
        title: 'Antes de aceptar un crédito, mira más allá de la cuota',
        theme: 'Crédito responsable',
        format: 'Carrusel educativo',
        callToAction: 'Haz una pausa antes de decidir → Revisa seis datos y compara opciones.',
      },
      {
        title: '¿Crédito fácil o fraude?',
        theme: 'Prevención del fraude',
        format: 'Carrusel educativo',
        callToAction: 'Desconfía cuando haya presión o anticipos → Verifica por canales oficiales.',
      },
    ]);
    expect(publications.map((publication) => publication.summary)).toEqual([
      expect.stringContaining('ocho preguntas'),
      expect.stringContaining('ingresos, gastos y saldo'),
      expect.stringContaining('gastos repetidos'),
      expect.stringContaining('fondo de emergencia'),
      expect.stringContaining('tasa, plazo'),
      expect.stringContaining('señales de alerta'),
    ]);
  });

  it('mantiene el consolidado diagnóstico en ocho preguntas y 16 respuestas', () => {
    expect(diagnosticSummary.responseCount).toBe(16);
    expect(diagnosticSummary.questions).toHaveLength(8);
    expect(diagnosticSummary.hasPosttest).toBe(false);
    diagnosticSummary.questions.forEach((question) => {
      expect(question.options.reduce((total, option) => total + option.count, 0)).toBe(16);
    });
  });
});
