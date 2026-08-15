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
import { projectStatus, projectTimeline, projectWeeks } from '../../src/lib/project';
import { diagnosticSummary, financialResults } from '../../src/data/diagnostic';
import {
  calculateCreditComparison,
  calculateCreditTotal,
  calculateEmergencyFund,
  fraudChecklist,
} from '../../src/lib/financial-tools';
import {
  closureSurveyQuestions,
  digitalImpact,
  publicationImpactTotals,
  publicationMetrics,
} from '../../src/data/digital-impact';

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
    seoTitle: undefined,
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

  it('valida que una edición pública documental exista', () => {
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
        version: '1.1 edición pública',
        ods: [4],
        tags: [],
        downloadable: true,
        publicVersion: '/documents/actividad-2-publica.pdf',
        privacyReviewed: true as const,
        documentSource: 'publica' as const,
        evidenceStatus: 'disponible' as const,
      },
    } as DocumentEntry;
    expect(validateDocumentEntry(documentEntry)).toEqual([]);
    expect(validateDocumentEntry(documentEntry, '/tmp/documentos-inexistentes')).toContain(
      'PDF documental inexistente: /documents/actividad-2-publica.pdf',
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
        theme: 'Diagnóstico financiero',
        format: 'Carrusel educativo',
        callToAction:
          'Desliza y haz tu autoevaluación → En comentarios, escribe una palabra: presupuesto, ahorro, crédito o fraude.',
      },
      {
        title: 'Presupuesto sin enredos',
        theme: 'Organización del dinero / presupuesto',
        format: 'Carrusel educativo',
        callToAction: 'Desliza para construir uno en 3 pasos → Pruébala durante 7 días.',
      },
      {
        title: 'Pequeños gastos, gran diferencia',
        theme: 'Gastos pequeños / gastos hormiga',
        format: 'Carrusel educativo',
        callToAction: 'Acepta el reto de 7 días → ¿Qué meta financiarías con ese dinero?',
      },
      {
        title: 'Tu fondo de emergencia',
        theme: 'Fondo de emergencia',
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
    expect(diagnosticSummary.hasPosteriorEvaluation).toBe(true);
    expect(diagnosticSummary.paired).toBe(false);
    diagnosticSummary.questions.forEach((question) => {
      expect(question.options.reduce((total, option) => total + option.count, 0)).toBe(16);
    });
  });

  it('publica una comparación descriptiva derivada de 22 respuestas', () => {
    expect(financialResults.totalResponseCount).toBe(22);
    expect(financialResults.initial.responseCount).toBe(16);
    expect(financialResults.posterior.responseCount).toBe(6);
    expect(financialResults.posterior.date).toBe('2026-08-09');
    expect(financialResults.paired).toBe(false);
    expect(financialResults.methodology).toContain('grupos no emparejados');

    const byKey = new Map(financialResults.comparisons.map((item) => [item.key, item]));
    expect(byKey.get('expense-tracking')).toMatchObject({
      initialPercentage: 37.5,
      posteriorPercentage: 66.7,
      differencePp: 29.2,
    });
    expect(byKey.get('unexpected-expense')).toMatchObject({
      initialPercentage: 56.3,
      posteriorPercentage: 83.3,
      differencePp: 27.1,
    });
    expect(byKey.get('credit-concepts')).toMatchObject({
      initialPercentage: 43.8,
      posteriorPercentage: 66.7,
      differencePp: 22.9,
    });
    expect(byKey.get('official-channels')).toMatchObject({
      initialPercentage: 50,
      posteriorPercentage: 33.3,
      differencePp: -16.7,
    });
    expect(financialResults.global).toMatchObject({
      initialFavorableCount: 70,
      initialResponseSlots: 128,
      initialPercentage: 54.7,
      posteriorFavorableCount: 33,
      posteriorResponseSlots: 48,
      posteriorPercentage: 68.8,
      differencePp: 14.1,
      targetDifferencePp: 20,
      targetReached: false,
    });
  });

  it('consolida el alcance digital desde las capturas de Meta', () => {
    expect(digitalImpact.fanPage).toMatchObject({
      viewsLabel: '1,5 mil',
      viewers: 524,
      visits: 258,
      interactions: 248,
      followers: 12,
      threeSecondVideoViews: 213,
    });
    expect(publicationMetrics).toHaveLength(6);
    expect(publicationImpactTotals).toEqual({
      views: 746,
      reach: 169,
      interactions: 123,
      reactions: 90,
      comments: 27,
      shares: 6,
    });
    expect(digitalImpact.webinar).toMatchObject({
      views: 236,
      reach: 190,
      viewers: 192,
      interactions: 15,
      reactions: 7,
      comments: 1,
      shares: 7,
      viewsTargetReached: true,
    });
  });

  it('evalúa asistencia, consentimiento y encuesta sin inferir datos', () => {
    expect(digitalImpact.liveAttendance).toEqual({ count: 2, target: 5, targetReached: false });
    expect(digitalImpact.teacherNotification.status).toBe('evidencia-registrada');
    expect(digitalImpact.interviewConsent.status).toBe('pendiente-verificacion');
    expect(digitalImpact.closureSurvey).toEqual({
      status: 'habilitada',
      responseCount: 0,
      href: 'https://forms.gle/wswjtPct8SRjvuLB8',
    });
  });

  it('define una encuesta final breve y sin datos sensibles', () => {
    expect(closureSurveyQuestions).toHaveLength(6);
    expect(closureSurveyQuestions.map((question) => question.key)).toEqual([
      'satisfaction',
      'utility',
      'financial-action',
      'application',
      'webinar-exercise',
      'comment',
    ]);
    expect(closureSurveyQuestions.map((question) => question.prompt).join(' ')).not.toMatch(
      /documento|ingresos|teléfono|entidad financiera/iu,
    );
    expect(closureSurveyQuestions.at(-1)?.guidance).toContain('No incluya nombres');
  });

  it('calcula localmente una meta de fondo de emergencia', () => {
    expect(
      calculateEmergencyFund({
        essentialMonthlyExpense: 1_200_000,
        targetMonths: 3,
        possibleMonthlySavings: 300_000,
      }),
    ).toEqual({ targetFund: 3_600_000, monthsToTarget: 12 });
    expect(
      calculateEmergencyFund({
        essentialMonthlyExpense: 1_200_000,
        targetMonths: 3,
        possibleMonthlySavings: 0,
      }),
    ).toEqual({ targetFund: 3_600_000, monthsToTarget: null });
  });

  it('compara el costo total sin asumir que la cuota menor es mejor', () => {
    const optionA = {
      principal: 3_000_000,
      monthlyRatePercent: 1.5,
      termMonths: 12,
      extraCosts: 120_000,
    };
    const optionB = {
      principal: 3_000_000,
      monthlyRatePercent: 1.8,
      termMonths: 24,
      extraCosts: 192_000,
    };
    expect(calculateCreditComparison(optionA)).toEqual({
      installment: 275_040,
      totalCost: 3_420_480,
    });
    expect(calculateCreditTotal(optionB)).toBe(3_913_032);
  });

  it('rechaza valores financieros no finitos o negativos', () => {
    expect(() =>
      calculateEmergencyFund({
        essentialMonthlyExpense: Number.NaN,
        targetMonths: 3,
        possibleMonthlySavings: 100_000,
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateCreditTotal({
        principal: 3_000_000,
        monthlyRatePercent: -1,
        termMonths: 12,
        extraCosts: 0,
      }),
    ).toThrow(RangeError);
  });

  it('publica ocho verificaciones independientes contra el fraude', () => {
    expect(fraudChecklist).toHaveLength(8);
    expect(fraudChecklist.join(' ')).toContain('canal oficial');
    expect(fraudChecklist.join(' ')).toContain('dinero anticipado');
  });

  it('refleja el cierre verificable de las semanas 4 a 7', () => {
    expect(projectStatus.currentWeek).toBe('Semana 7');
    expect(projectStatus.status).toBe('en-cierre');
    expect(projectWeeks.map(({ week, status }) => ({ week, status }))).toEqual([
      { week: 'Semana 2', status: 'completada' },
      { week: 'Semana 3', status: 'completada' },
      { week: 'Semana 4', status: 'completada' },
      { week: 'Semana 5', status: 'completada' },
      { week: 'Semana 6', status: 'completada' },
      { week: 'Semana 7', status: 'en-cierre' },
    ]);
  });
});
