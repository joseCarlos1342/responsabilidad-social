export type Publication = {
  number: number;
  week: 'Semana 4' | 'Semana 5' | 'Semana 6';
  title: string;
  theme: string;
  summary: string;
  format: 'Carrusel educativo';
  callToAction: string;
  pdfHref: `/documents/publi${1 | 2 | 3 | 4 | 5 | 6}.pdf`;
  thumbnailSrc: `/assets/publicaciones/publi${1 | 2 | 3 | 4 | 5 | 6}.png`;
  thumbnailAlt: string;
  facebookHref?: string;
  status: 'ejecutada';
};

export const publications: readonly Publication[] = [
  {
    number: 1,
    week: 'Semana 4',
    title: '¿Cómo manejas tu dinero?',
    theme: 'Diagnóstico rápido',
    summary:
      'Presenta ocho preguntas sobre presupuesto, ahorro, crédito y seguridad financiera para reconocer hábitos y decisiones cotidianas. Invita a responder con honestidad y aclara que el formulario es anónimo y no solicita datos sensibles.',
    format: 'Carrusel educativo',
    callToAction:
      'Desliza y haz tu autoevaluación → En comentarios, escribe una palabra: presupuesto, ahorro, crédito o fraude.',
    pdfHref: '/documents/publi1.pdf',
    thumbnailSrc: '/assets/publicaciones/publi1.png',
    thumbnailAlt:
      'Primera página del carrusel “¿Cómo manejas tu dinero?” sobre un diagnóstico financiero rápido.',
    facebookHref: 'https://www.facebook.com/share/p/1DtDHVwr6r/',
    status: 'ejecutada',
  },
  {
    number: 2,
    week: 'Semana 4',
    title: 'Presupuesto sin enredos',
    theme: 'Organiza lo que entra y lo que sale',
    summary:
      'Explica el presupuesto como una forma de ver qué decisiones se pueden controlar mediante la relación entre ingresos, gastos y saldo. Propone clasificar los gastos, registrar y comparar los valores, y elegir un ajuste pequeño con una meta concreta.',
    format: 'Carrusel educativo',
    callToAction: 'Desliza para construir uno en 3 pasos → Pruébala durante 7 días.',
    pdfHref: '/documents/publi2.pdf',
    thumbnailSrc: '/assets/publicaciones/publi2.png',
    thumbnailAlt:
      'Primera página del carrusel “Presupuesto sin enredos” sobre organizar ingresos y gastos.',
    facebookHref: 'https://www.facebook.com/share/r/1MfWpiS7BT/',
    status: 'ejecutada',
  },
  {
    number: 3,
    week: 'Semana 5',
    title: 'Pequeños gastos, gran diferencia',
    theme: 'Gastos hormiga',
    summary:
      'Invita a observar gastos repetidos como domicilios, snacks, suscripciones, transportes evitables y compras por impulso. Propone registrarlos durante siete días, distinguir necesidad o deseo y convertir una parte del gasto en una meta.',
    format: 'Carrusel educativo',
    callToAction: 'Acepta el reto de 7 días → ¿Qué meta financiarías con ese dinero?',
    pdfHref: '/documents/publi3.pdf',
    thumbnailSrc: '/assets/publicaciones/publi3.png',
    thumbnailAlt:
      'Primera página del carrusel “Pequeños gastos, gran diferencia” sobre gastos hormiga.',
    facebookHref: 'https://www.facebook.com/share/p/19BGtDDH9q/',
    status: 'ejecutada',
  },
  {
    number: 4,
    week: 'Semana 5',
    title: 'Tu fondo de emergencia',
    theme: 'Ahorro para imprevistos',
    summary:
      'Explica que un fondo de emergencia puede ayudar a afrontar salud inesperada, reparaciones urgentes, reducción temporal de ingresos o una necesidad familiar prioritaria sin convertir cada imprevisto en una nueva deuda. Propone construirlo por etapas y adaptar el monto a la realidad de cada persona.',
    format: 'Carrusel educativo',
    callToAction:
      'Desliza para construirlo por etapas → Adapta el monto a tu realidad, no a la de otra persona.',
    pdfHref: '/documents/publi4.pdf',
    thumbnailSrc: '/assets/publicaciones/publi4.png',
    thumbnailAlt:
      'Primera página del carrusel “Tu fondo de emergencia” sobre ahorro para imprevistos.',
    facebookHref: 'https://www.facebook.com/share/p/1QUunWR1rH/',
    status: 'ejecutada',
  },
  {
    number: 5,
    week: 'Semana 6',
    title: 'Antes de aceptar un crédito, mira más allá de la cuota',
    theme: 'Crédito responsable',
    summary:
      'Invita a revisar tasa, plazo, seguros, capacidad de pago y costo total antes de firmar. Una cuota menor no siempre significa un crédito más económico.',
    format: 'Carrusel educativo',
    callToAction: 'Haz una pausa antes de decidir → Revisa seis datos y compara opciones.',
    pdfHref: '/documents/publi5.pdf',
    thumbnailSrc: '/assets/publicaciones/publi5.png',
    thumbnailAlt:
      'Primera página del carrusel “Antes de aceptar un crédito, mira más allá de la cuota”.',
    status: 'ejecutada',
  },
  {
    number: 6,
    week: 'Semana 6',
    title: '¿Crédito fácil o fraude?',
    theme: 'Prevención del fraude',
    summary:
      'Presenta señales de alerta, prácticas para proteger los datos y pasos para verificar ofertas, canales y entidades antes de entregar dinero o información.',
    format: 'Carrusel educativo',
    callToAction: 'Desconfía cuando haya presión o anticipos → Verifica por canales oficiales.',
    pdfHref: '/documents/publi6.pdf',
    thumbnailSrc: '/assets/publicaciones/publi6.png',
    thumbnailAlt:
      'Primera página del carrusel “¿Crédito fácil o fraude?” sobre seguridad financiera.',
    status: 'ejecutada',
  },
] as const;

export const publicationTotal = 6;

export function getPublicationProgress(items: readonly Publication[]) {
  return {
    current: items.filter((item) => item.status === 'ejecutada').length,
    total: publicationTotal,
  } as const;
}
