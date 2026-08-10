export type DiagnosticOption = {
  label: string;
  count: number;
  percentage: number;
};

export type DiagnosticQuestion = {
  question: string;
  options: readonly DiagnosticOption[];
};

/**
 * Consolidado derivado de “Decisiones que suman.xlsx”.
 * Corresponde a una sola aplicación diagnóstica de 16 respuestas.
 */
export const diagnosticSummary = {
  responseCount: 16,
  application: 'Diagnóstico inicial',
  sourceHref: '/documents/Decisiones%20que%20suman.xlsx',
  hasPosttest: false,
  questions: [
    {
      question: '¿Elaboras un presupuesto semanal o mensual?',
      options: [
        { label: 'Siempre', count: 8, percentage: 50 },
        { label: 'A veces', count: 7, percentage: 43.8 },
        { label: 'Nunca', count: 1, percentage: 6.3 },
      ],
    },
    {
      question: '¿Registras tus gastos para compararlos con tus ingresos?',
      options: [
        { label: 'Si', count: 6, percentage: 37.5 },
        { label: 'Algunas veces', count: 8, percentage: 50 },
        { label: 'Nunca', count: 2, percentage: 12.5 },
      ],
    },
    {
      question: '¿Tienes una meta de ahorro con valor y fecha?',
      options: [
        { label: 'Si', count: 6, percentage: 37.5 },
        { label: 'Parcialmente', count: 6, percentage: 37.5 },
        { label: 'No', count: 4, percentage: 25 },
      ],
    },
    {
      question: '¿Podrías cubrir un imprevisto sin pedir un nuevo crédito?',
      options: [
        { label: 'SI', count: 9, percentage: 56.3 },
        { label: 'Parcialmente', count: 4, percentage: 25 },
        { label: 'No', count: 3, percentage: 18.8 },
      ],
    },
    {
      question: '¿Diferencias tasa, cuota, plazo y costo total?',
      options: [
        { label: 'Sí', count: 7, percentage: 43.8 },
        { label: 'Parcialmente', count: 7, percentage: 43.8 },
        { label: 'No', count: 2, percentage: 12.5 },
      ],
    },
    {
      question: '¿Comparas al menos dos opciones antes de aceptar un crédito?',
      options: [
        { label: 'Siempre', count: 13, percentage: 81.3 },
        { label: 'A veces', count: 2, percentage: 12.5 },
        { label: 'Algunos', count: 1, percentage: 6.3 },
      ],
    },
    {
      question: '¿Reconoces dos señales de un falso prestamista o enlace fraudulento?',
      options: [
        { label: 'Frecuentemente', count: 13, percentage: 81.3 },
        { label: 'Algunas veces', count: 2, percentage: 12.5 },
        { label: 'Nunca', count: 1, percentage: 6.3 },
      ],
    },
    {
      question: '¿Conoces un canal oficial para aprender o reclamar?',
      options: [
        { label: 'Si', count: 8, percentage: 50 },
        { label: 'Creo conocer una', count: 6, percentage: 37.5 },
        { label: 'No', count: 2, percentage: 12.5 },
      ],
    },
  ] as const,
} as const;
