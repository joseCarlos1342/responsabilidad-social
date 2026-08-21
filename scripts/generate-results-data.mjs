import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rename, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const sourceRoot = resolve(process.env.DQS_SOURCE_DIR ?? 'docs/fuentes-academicas/privadas');
const initialWorkbook = join(sourceRoot, 'datos', 'diagnostico', 'respuestas-iniciales.xlsx');
const consolidatedWorkbook = join(
  sourceRoot,
  'datos',
  'diagnostico',
  'respuestas-consolidadas.xlsx',
);
const closureWorkbook = join(sourceRoot, 'datos', 'cierre', 'encuesta-cierre-respuestas.xlsx');
const outputPath = resolve('src/data/financial-results.generated.json');
const closureOutputPath = resolve('src/data/closure-survey.generated.json');
const initialPublicReport = resolve(
  'public/documents/resultados/diagnostico-inicial-agregado.xlsx',
);
const consolidatedPublicReport = resolve(
  'public/documents/resultados/comparacion-diagnostico-agregada.xlsx',
);

const expectedHeaders = [
  'Marca temporal',
  '¿Elaboras un presupuesto semanal o mensual?',
  '¿Registras tus gastos para compararlos con tus ingresos?',
  '¿Tienes una meta de ahorro con valor y fecha?',
  '¿Podrías cubrir un imprevisto sin pedir un nuevo crédito?',
  '¿Diferencias tasa, cuota, plazo y costo total?',
  '¿Comparas al menos dos opciones antes de aceptar un crédito?',
  '¿Reconoces dos señales de un falso prestamista o enlace fraudulento?',
  '¿Conoces un canal oficial para aprender o reclamar?',
  '¿En qué rango de edad te encuentras?',
];

const questionDefinitions = [
  {
    key: 'budget',
    column: 1,
    favorable: 'siempre',
    options: ['Siempre', 'A veces', 'Nunca'],
    label: 'Presupuesto habitual',
  },
  {
    key: 'expense-tracking',
    column: 2,
    favorable: 'si',
    options: ['Sí', 'Algunas veces', 'Nunca'],
    label: 'Registro habitual de gastos',
  },
  {
    key: 'savings-goal',
    column: 3,
    favorable: 'si',
    options: ['Sí', 'Parcialmente', 'No'],
    label: 'Meta de ahorro',
  },
  {
    key: 'unexpected-expense',
    column: 4,
    favorable: 'si',
    options: ['Sí', 'Parcialmente', 'No'],
    label: 'Capacidad para cubrir un imprevisto',
  },
  {
    key: 'credit-concepts',
    column: 5,
    favorable: 'si',
    options: ['Sí', 'Parcialmente', 'No'],
    label: 'Comprensión de tasa, cuota, plazo y costo total',
  },
  {
    key: 'compare-credit',
    column: 6,
    favorable: 'siempre',
    options: ['Siempre', 'A veces', 'Algunos'],
    label: 'Comparación de opciones de crédito',
  },
  {
    key: 'fraud-signals',
    column: 7,
    favorable: 'frecuentemente',
    options: ['Frecuentemente', 'Algunas veces', 'Nunca'],
    label: 'Reconocimiento de señales de fraude',
  },
  {
    key: 'official-channels',
    column: 8,
    favorable: 'si',
    options: ['Sí', 'Creo conocer una', 'No'],
    label: 'Conocimiento de canales oficiales',
  },
];
const allowedAges = ['18–25', '26–35', '36–45', '46–60'];

const closureExpectedHeaders = [
  'Marca temporal',
  'En una escala de 1 a 5, ¿qué tan satisfecho(a) se encuentra con los contenidos y actividades del proyecto “Decisiones que sí suman”?',
  'En una escala de 1 a 5, ¿qué tan útiles considera los conocimientos adquiridos para tomar mejores decisiones financieras en su vida cotidiana?',
  'Después de participar o consultar los contenidos del proyecto, ¿qué acción financiera decidió realizar?',
  '¿Ha puesto en práctica alguna de las acciones anteriores desde que participó en el proyecto?',
  'Si participó en el webinar “Decisiones que sí suman”, ¿realizó o siguió alguno de los ejercicios prácticos desarrollados durante la sesión?',
  '¿Qué aspecto del proyecto le resultó más útil o qué tema considera que debería fortalecerse?',
];

const closureActionDefinitions = [
  { key: 'expense-tracking', option: 'Registrar con mayor frecuencia mis gastos.' },
  { key: 'budget', option: 'Elaborar o mejorar mi presupuesto.' },
  { key: 'savings-goal', option: 'Definir una meta de ahorro.' },
  { key: 'emergency-fund', option: 'Crear o fortalecer un fondo de emergencia.' },
  { key: 'compare-credit', option: 'Comparar diferentes opciones antes de aceptar un crédito.' },
  {
    key: 'credit-total-cost',
    option: 'Revisar tasa, cuota, plazo y costo total antes de endeudarme.',
  },
  {
    key: 'official-channels',
    option: 'Verificar información y canales oficiales para prevenir fraudes.',
  },
  { key: 'other', option: 'Otra.' },
  { key: 'none', option: 'Ninguna por el momento.' },
];

const decodeXml = (value) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");

const encodeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .trim()
    .toLowerCase();

const columnIndex = (reference) =>
  [...reference].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;

const columnName = (index) => {
  let name = '';
  let current = index + 1;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
};

function readWorkbook(path) {
  const sharedStringsXml = execFileSync('unzip', ['-p', path, 'xl/sharedStrings.xml'], {
    encoding: 'utf8',
  });
  const sharedStrings = [...sharedStringsXml.matchAll(/<si>([\s\S]*?)<\/si>/gu)].map((match) =>
    decodeXml(
      [...match[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/gu)].map((text) => text[1]).join(''),
    ),
  );
  const worksheetXml = execFileSync('unzip', ['-p', path, 'xl/worksheets/sheet1.xml'], {
    encoding: 'utf8',
  });

  return [...worksheetXml.matchAll(/<row\b[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/gu)].map(
    (rowMatch) => {
      const row = [];
      for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/gu)) {
        const reference = cellMatch[1].match(/r="([A-Z]+)/u)?.[1];
        if (!reference) continue;
        const type = cellMatch[1].match(/t="([^"]+)"/u)?.[1];
        const rawValue = cellMatch[2].match(/<v>([\s\S]*?)<\/v>/u)?.[1] ?? '';
        row[columnIndex(reference)] = type === 's' ? sharedStrings[Number(rawValue)] : rawValue;
      }
      return row;
    },
  );
}

function readAggregateWorkbook(path) {
  const worksheetXml = execFileSync('unzip', ['-p', path, 'xl/worksheets/sheet1.xml'], {
    encoding: 'utf8',
  });
  if (/Marca temporal|rango de edad|18[–-]25|26[–-]35|36[–-]45|46[–-]60/iu.test(worksheetXml)) {
    throw new Error(`${path}: el reporte público contiene información individual no permitida.`);
  }
  return [...worksheetXml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/gu)].map((rowMatch) =>
    [...rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/gu)].map((cellMatch) => {
      if (/t="inlineStr"/u.test(cellMatch[1])) {
        const text = cellMatch[2].match(/<t>([\s\S]*?)<\/t>/u)?.[1] ?? '';
        return decodeXml(text);
      }
      return Number(cellMatch[2].match(/<v>([\s\S]*?)<\/v>/u)?.[1] ?? 0);
    }),
  );
}

const roundOne = (value) => Math.round((value + Number.EPSILON) * 10) / 10;
const percentage = (count, total) => roundOne((count / total) * 100);
const excelDate = (serial) => new Date((Number(serial) - 25569) * 86_400_000);

function validateHeaders(headers, label) {
  const actual = headers.map(normalize);
  const expected = expectedHeaders.map(normalize);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: los encabezados o su orden no coinciden con el instrumento.`);
  }
}

function validateRows(rows, label) {
  rows.forEach((row, rowIndex) => {
    if (row.length !== expectedHeaders.length) {
      throw new Error(`${label}: la fila ${rowIndex + 2} no tiene diez columnas.`);
    }
    if (!Number.isFinite(Number(row[0])) || Number.isNaN(excelDate(row[0]).getTime())) {
      throw new Error(`${label}: marca temporal inválida en la fila ${rowIndex + 2}.`);
    }
    questionDefinitions.forEach((definition) => {
      const allowed = definition.options.map(normalize);
      if (!allowed.includes(normalize(row[definition.column]))) {
        throw new Error(
          `${label}: respuesta inesperada en fila ${rowIndex + 2}, columna ${definition.column + 1}.`,
        );
      }
    });
    if (!allowedAges.map(normalize).includes(normalize(row[9]))) {
      throw new Error(`${label}: rango de edad inesperado en la fila ${rowIndex + 2}.`);
    }
  });
}

function summarize(rows, headers, application, sourceHref) {
  return {
    responseCount: rows.length,
    application,
    sourceHref,
    questions: questionDefinitions.map((definition) => ({
      key: definition.key,
      question: String(headers[definition.column]).trim(),
      options: definition.options.map((label) => {
        const count = rows.filter(
          (row) => normalize(row[definition.column]) === normalize(label),
        ).length;
        return { label, count, percentage: percentage(count, rows.length) };
      }),
    })),
  };
}

function cellXml(value, column, row, header) {
  const reference = `${columnName(column)}${row}`;
  if (typeof value === 'number') {
    return `<c r="${reference}"${header ? ' s="1"' : ''}><v>${value}</v></c>`;
  }
  return `<c r="${reference}" t="inlineStr"${header ? ' s="1"' : ''}><is><t>${encodeXml(value)}</t></is></c>`;
}

async function writeAggregatedWorkbook(path, headers, rows) {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'dqs-xlsx-'));
  const temporaryOutput = `${path}.tmp-${process.pid}`;
  try {
    await mkdir(join(temporaryRoot, '_rels'), { recursive: true });
    await mkdir(join(temporaryRoot, 'xl', '_rels'), { recursive: true });
    await mkdir(join(temporaryRoot, 'xl', 'worksheets'), { recursive: true });

    const allRows = [headers, ...rows];
    const sheetRows = allRows
      .map(
        (row, rowIndex) =>
          `<row r="${rowIndex + 1}">${row
            .map((value, column) => cellXml(value, column, rowIndex + 1, rowIndex === 0))
            .join('')}</row>`,
      )
      .join('');
    const files = new Map([
      [
        '[Content_Types].xml',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      ],
      [
        '_rels/.rels',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      ],
      [
        'xl/workbook.xml',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Resultados agregados" sheetId="1" r:id="rId1"/></sheets></workbook>',
      ],
      [
        'xl/_rels/workbook.xml.rels',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      ],
      [
        'xl/styles.xml',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><name val="Arial"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>',
      ],
      [
        'xl/worksheets/sheet1.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`,
      ],
    ]);

    await Promise.all(
      [...files].map(([relativePath, contents]) =>
        writeFile(join(temporaryRoot, relativePath), contents, 'utf8'),
      ),
    );
    const fixedDate = new Date('2026-08-10T00:00:00Z');
    await Promise.all(
      [...files.keys()].map((relativePath) =>
        utimes(join(temporaryRoot, relativePath), fixedDate, fixedDate),
      ),
    );
    await rm(temporaryOutput, { force: true });
    execFileSync('zip', ['-Xq', temporaryOutput, ...files.keys()], { cwd: temporaryRoot });
    await rename(temporaryOutput, path);
  } finally {
    await rm(temporaryOutput, { force: true });
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

function expectedPublicRows(generated) {
  const initialRows = [
    ['Pregunta', 'Opción', 'Respuestas', 'Porcentaje'],
    ...generated.initial.questions.flatMap((question) =>
      question.options.map((option) => [
        question.question,
        option.label,
        option.count,
        option.percentage,
      ]),
    ),
  ];
  const comparisonRows = [
    ['Indicador', 'Inicial n', 'Inicial %', 'Posterior n', 'Posterior %', 'Diferencia pp'],
    ...generated.comparisons.map((item) => [
      item.label,
      item.initialCount,
      item.initialPercentage,
      item.posteriorCount,
      item.posteriorPercentage,
      item.differencePp,
    ]),
    [
      'Proporción global de respuestas plenamente favorables',
      generated.global.initialFavorableCount,
      generated.global.initialPercentage,
      generated.global.posteriorFavorableCount,
      generated.global.posteriorPercentage,
      generated.global.differencePp,
    ],
  ];
  return { initialRows, comparisonRows };
}

function validatePublicReports(generated) {
  const expected = expectedPublicRows(generated);
  const initialRows = readAggregateWorkbook(initialPublicReport);
  const comparisonRows = readAggregateWorkbook(consolidatedPublicReport);
  if (JSON.stringify(initialRows) !== JSON.stringify(expected.initialRows)) {
    throw new Error('El reporte público inicial no coincide con el JSON agregado.');
  }
  if (JSON.stringify(comparisonRows) !== JSON.stringify(expected.comparisonRows)) {
    throw new Error('El reporte público comparativo no coincide con el JSON agregado.');
  }
}

async function validateGeneratedFallback() {
  const required = [outputPath, initialPublicReport, consolidatedPublicReport];
  if (required.some((path) => !existsSync(path))) {
    throw new Error(
      'No están disponibles los XLSX privados ni todos los artefactos agregados versionados.',
    );
  }
  const generated = JSON.parse(await readFile(outputPath, 'utf8'));
  if (generated.totalResponseCount !== 22 || generated.posterior?.responseCount !== 6) {
    throw new Error('El JSON agregado versionado no conserva la estructura esperada.');
  }
  validatePublicReports(generated);
  console.log(
    'Fuentes privadas no disponibles; se conservaron los agregados versionados validados.',
  );
}

function validateClosureRows(rows) {
  const headers = rows[0] ?? [];
  if (
    JSON.stringify(headers.map(normalize)) !== JSON.stringify(closureExpectedHeaders.map(normalize))
  ) {
    throw new Error('Encuesta de cierre: los encabezados no coinciden con el instrumento público.');
  }
  const responses = rows.slice(1);
  if (responses.length !== 9) {
    throw new Error(`Encuesta de cierre: se esperaban 9 respuestas, hay ${responses.length}.`);
  }
  const applicationOptions = [
    'Sí, ya la estoy aplicando.',
    'La he aplicado parcialmente.',
    'Todavía no la he aplicado.',
    'No definí una acción.',
  ].map(normalize);
  const webinarOptions = [
    'Sí, realicé los ejercicios.',
    'Realicé algunos de forma parcial.',
    'No los realicé.',
    'No participé de manera sincrónica en el webinar.',
  ].map(normalize);
  responses.forEach((row, index) => {
    if (row.length !== closureExpectedHeaders.length) {
      throw new Error(`Encuesta de cierre: la fila ${index + 2} no tiene siete columnas.`);
    }
    for (const column of [1, 2]) {
      const rating = Number(row[column]);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error(`Encuesta de cierre: calificación inválida en la fila ${index + 2}.`);
      }
    }
    const selectedActions = closureActionDefinitions.filter(({ option }) =>
      row[3].includes(option),
    );
    if (selectedActions.length === 0) {
      throw new Error(`Encuesta de cierre: acción desconocida en la fila ${index + 2}.`);
    }
    const unknownActionText = selectedActions
      .reduce((remaining, { option }) => remaining.replace(option, ''), row[3])
      .replaceAll(',', '')
      .trim();
    if (unknownActionText) {
      throw new Error(`Encuesta de cierre: opción adicional desconocida en la fila ${index + 2}.`);
    }
    if (selectedActions.some(({ key }) => key === 'none') && selectedActions.length > 1) {
      throw new Error(`Encuesta de cierre: “Ninguna” no puede combinarse en la fila ${index + 2}.`);
    }
    if (!applicationOptions.includes(normalize(row[4]))) {
      throw new Error(`Encuesta de cierre: aplicación desconocida en la fila ${index + 2}.`);
    }
    if (!webinarOptions.includes(normalize(row[5]))) {
      throw new Error(
        `Encuesta de cierre: respuesta de webinar desconocida en la fila ${index + 2}.`,
      );
    }
    if (!Number.isFinite(Number(row[0])) || Number.isNaN(excelDate(row[0]).getTime())) {
      throw new Error(`Encuesta de cierre: marca temporal inválida en la fila ${index + 2}.`);
    }
  });
  return responses;
}

const countNormalized = (rows, column, expected) =>
  rows.filter((row) => normalize(row[column]) === normalize(expected)).length;

function summarizeClosureSurvey(rows) {
  const responseCount = rows.length;
  const ratings = (column) => rows.map((row) => Number(row[column]));
  const summarizeRating = (column, targetAverage) => {
    const values = ratings(column);
    const average = roundOne(values.reduce((total, value) => total + value, 0) / responseCount);
    return {
      average,
      targetAverage,
      targetReached: average >= targetAverage,
      distribution: [1, 2, 3, 4, 5].map((value) => ({
        value,
        count: values.filter((rating) => rating === value).length,
        percentage: percentage(values.filter((rating) => rating === value).length, responseCount),
      })),
    };
  };

  const actions = closureActionDefinitions.map(({ key, option }) => {
    const count = rows.filter((row) => row[3].includes(option)).length;
    return { key, count, percentage: percentage(count, responseCount) };
  });
  const fullApplication = countNormalized(rows, 4, 'Sí, ya la estoy aplicando.');
  const partialApplication = countNormalized(rows, 4, 'La he aplicado parcialmente.');
  const notYetApplication = countNormalized(rows, 4, 'Todavía no la he aplicado.');
  const noAction = countNormalized(rows, 4, 'No definí una acción.');
  const fullExercises = countNormalized(rows, 5, 'Sí, realicé los ejercicios.');
  const partialExercises = countNormalized(rows, 5, 'Realicé algunos de forma parcial.');
  const noExercises = countNormalized(rows, 5, 'No los realicé.');
  const notSynchronous = countNormalized(
    rows,
    5,
    'No participé de manera sincrónica en el webinar.',
  );
  const synchronousRespondents = responseCount - notSynchronous;
  const normalizedComments = rows.map((row) => normalize(row[6])).filter(Boolean);
  const themeDefinitions = [
    { key: 'credit-evaluation', pattern: /credito|prestamo|propuestas|opciones/u },
    { key: 'budget-tracking', pattern: /ingresos|gastos|economia/u },
    { key: 'fraud-official-channels', pattern: /robar|estafar|canales oficiales/u },
    { key: 'overall-useful', pattern: /todo el contenido/u },
  ];
  const dates = rows.map((row) => excelDate(row[0]));

  return {
    sourceFile: 'encuesta-cierre-respuestas.xlsx',
    responseCount,
    collectionPeriod: {
      start: new Date(Math.min(...dates)).toISOString().slice(0, 10),
      end: new Date(Math.max(...dates)).toISOString().slice(0, 10),
    },
    satisfaction: summarizeRating(1, 4),
    utility: summarizeRating(2, 4),
    actions,
    application: {
      fullCount: fullApplication,
      partialCount: partialApplication,
      notYetCount: notYetApplication,
      noActionCount: noAction,
      fullPercentage: percentage(fullApplication, responseCount),
      atLeastPartialCount: fullApplication + partialApplication,
      atLeastPartialPercentage: percentage(fullApplication + partialApplication, responseCount),
      targetPercentage: 70,
      targetReached: (fullApplication + partialApplication) / responseCount >= 0.7,
    },
    webinarExercises: {
      fullCount: fullExercises,
      partialCount: partialExercises,
      noCount: noExercises,
      notSynchronousCount: notSynchronous,
      synchronousRespondents,
      fullAmongSynchronousPercentage: percentage(fullExercises, synchronousRespondents),
      targetPercentage: 80,
      targetReachedBySelfReport: fullExercises / synchronousRespondents >= 0.8,
      attendanceSourceCount: 2,
      attendanceSourceDiscrepancy: synchronousRespondents !== 2,
      methodology:
        'Autorreporte de la encuesta final. No reemplaza el recap de Teams ni permite reconciliar la asistencia en vivo.',
    },
    openThemes: themeDefinitions.map(({ key, pattern }) => {
      const count = normalizedComments.filter((comment) => pattern.test(comment)).length;
      return { key, count, percentage: percentage(count, responseCount) };
    }),
    evidence: [1, 2, 3, 4, 5].map(
      (number) => `/assets/evidencias/encuesta-cierre/grafico-0${number}.png`,
    ),
    methodology:
      'Encuesta final voluntaria n=9. Resultados descriptivos y agregados; no se publican comentarios individuales.',
  };
}

function validateClosureAggregate(generated) {
  const expectedKeys = [
    'sourceFile',
    'responseCount',
    'collectionPeriod',
    'satisfaction',
    'utility',
    'actions',
    'application',
    'webinarExercises',
    'openThemes',
    'evidence',
    'methodology',
  ];
  if (JSON.stringify(Object.keys(generated)) !== JSON.stringify(expectedKeys)) {
    throw new Error('El agregado de cierre contiene una estructura inesperada.');
  }
  if (generated.responseCount !== 9) {
    throw new Error('El agregado versionado de la encuesta final no conserva nueve respuestas.');
  }
  for (const key of ['start', 'end']) {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(generated.collectionPeriod?.[key] ?? '')) {
      throw new Error(`Encuesta de cierre: fecha ${key} inválida.`);
    }
  }
  for (const key of ['satisfaction', 'utility']) {
    const metric = generated[key];
    if (
      !Number.isFinite(metric?.average) ||
      metric.distribution?.length !== 5 ||
      metric.distribution.reduce((total, item) => total + item.count, 0) !== generated.responseCount
    ) {
      throw new Error(`Encuesta de cierre: distribución inválida en ${key}.`);
    }
  }
  if (
    generated.actions?.length !== closureActionDefinitions.length ||
    generated.actions.some(
      (item) =>
        !closureActionDefinitions.some(({ key }) => key === item.key) ||
        item.count < 0 ||
        item.count > generated.responseCount,
    )
  ) {
    throw new Error('Encuesta de cierre: acciones agregadas inválidas.');
  }
  const applicationCount = ['fullCount', 'partialCount', 'notYetCount', 'noActionCount'].reduce(
    (total, key) => total + generated.application[key],
    0,
  );
  if (
    applicationCount !== generated.responseCount ||
    generated.application.atLeastPartialCount !==
      generated.application.fullCount + generated.application.partialCount
  ) {
    throw new Error('Encuesta de cierre: consolidado de aplicación inválido.');
  }
  const webinarCount = ['fullCount', 'partialCount', 'noCount', 'notSynchronousCount'].reduce(
    (total, key) => total + generated.webinarExercises[key],
    0,
  );
  if (
    webinarCount !== generated.responseCount ||
    generated.webinarExercises.synchronousRespondents !==
      generated.responseCount - generated.webinarExercises.notSynchronousCount
  ) {
    throw new Error('Encuesta de cierre: consolidado del webinar inválido.');
  }
  if (
    !Array.isArray(generated.evidence) ||
    generated.evidence.length !== 5 ||
    generated.evidence.some(
      (path) =>
        !/^\/assets\/evidencias\/encuesta-cierre\/grafico-0[1-5]\.png$/u.test(path) ||
        !existsSync(resolve('public', path.slice(1))),
    )
  ) {
    throw new Error('Encuesta de cierre: faltan evidencias agregadas canónicas.');
  }
  if (JSON.stringify(generated).includes('Marca temporal')) {
    throw new Error('Encuesta de cierre: el agregado contiene campos de respuestas individuales.');
  }
}

async function processClosureSurvey() {
  if (!existsSync(closureWorkbook)) {
    if (!existsSync(closureOutputPath)) {
      throw new Error('No está disponible la fuente privada ni el agregado de la encuesta final.');
    }
    const generated = JSON.parse(await readFile(closureOutputPath, 'utf8'));
    validateClosureAggregate(generated);
    console.log('Fuente privada de cierre no disponible; se conservó el agregado validado.');
    return;
  }
  const rows = readWorkbook(closureWorkbook);
  const responses = validateClosureRows(rows);
  const output = summarizeClosureSurvey(responses);
  validateClosureAggregate(output);
  await writeFile(closureOutputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log('Encuesta final agregada desde 9 respuestas sin publicar registros individuales.');
}

if (!existsSync(initialWorkbook) || !existsSync(consolidatedWorkbook)) {
  await validateGeneratedFallback();
} else {
  const initialRows = readWorkbook(initialWorkbook);
  const consolidatedRows = readWorkbook(consolidatedWorkbook);
  const initialHeaders = initialRows[0];
  const headers = consolidatedRows[0];
  const initialSourceRows = initialRows.slice(1);
  const allRows = consolidatedRows.slice(1);

  validateHeaders(initialHeaders, 'XLSX inicial');
  validateHeaders(headers, 'XLSX consolidado');
  validateRows(initialSourceRows, 'XLSX inicial');
  validateRows(allRows, 'XLSX consolidado');
  if (initialSourceRows.length !== 16 || allRows.length !== 22) {
    throw new Error('Se esperaban 16 respuestas iniciales y 22 respuestas consolidadas.');
  }
  if (
    initialSourceRows.some((row, index) => JSON.stringify(row) !== JSON.stringify(allRows[index]))
  ) {
    throw new Error('Las primeras 16 respuestas del consolidado no coinciden con el XLSX inicial.');
  }

  const diagnosticRows = allRows.slice(0, initialSourceRows.length);
  const posteriorRows = allRows.slice(initialSourceRows.length);
  if (
    posteriorRows.length !== 6 ||
    posteriorRows.some((row) => excelDate(row[0]).toISOString().slice(0, 10) !== '2026-08-09')
  ) {
    throw new Error('Las seis respuestas añadidas deben corresponder al 9 de agosto de 2026.');
  }

  const initial = summarize(
    diagnosticRows,
    headers,
    'Diagnóstico inicial',
    '/documents/resultados/diagnostico-inicial-agregado.xlsx',
  );
  const posterior = {
    ...summarize(
      posteriorRows,
      headers,
      'Evaluación posterior',
      '/documents/resultados/comparacion-diagnostico-agregada.xlsx',
    ),
    date: '2026-08-09',
  };

  const comparisons = questionDefinitions.map((definition, index) => {
    const initialCount = diagnosticRows.filter(
      (row) => normalize(row[definition.column]) === definition.favorable,
    ).length;
    const posteriorCount = posteriorRows.filter(
      (row) => normalize(row[definition.column]) === definition.favorable,
    ).length;
    const initialExact = (initialCount / diagnosticRows.length) * 100;
    const posteriorExact = (posteriorCount / posteriorRows.length) * 100;
    return {
      key: definition.key,
      label: definition.label,
      initialCount,
      initialPercentage: roundOne(initialExact),
      posteriorCount,
      posteriorPercentage: roundOne(posteriorExact),
      differencePp: roundOne(posteriorExact - initialExact),
      featured: [1, 3, 4, 5, 6].includes(index),
    };
  });

  const initialFavorable = comparisons.reduce((total, item) => total + item.initialCount, 0);
  const posteriorFavorable = comparisons.reduce((total, item) => total + item.posteriorCount, 0);
  const initialSlots = diagnosticRows.length * comparisons.length;
  const posteriorSlots = posteriorRows.length * comparisons.length;
  const initialGlobal = (initialFavorable / initialSlots) * 100;
  const posteriorGlobal = (posteriorFavorable / posteriorSlots) * 100;

  const output = {
    sourceFile: 'comparacion-diagnostico-agregada.xlsx',
    sourceHref: '/documents/resultados/comparacion-diagnostico-agregada.xlsx',
    totalResponseCount: allRows.length,
    paired: false,
    methodology:
      'Diagnóstico inicial n=16 · Evaluación posterior n=6. Comparación descriptiva de grupos no emparejados.',
    initial,
    posterior,
    comparisons,
    global: {
      initialFavorableCount: initialFavorable,
      initialResponseSlots: initialSlots,
      initialPercentage: roundOne(initialGlobal),
      posteriorFavorableCount: posteriorFavorable,
      posteriorResponseSlots: posteriorSlots,
      posteriorPercentage: roundOne(posteriorGlobal),
      differencePp: roundOne(posteriorGlobal - initialGlobal),
      targetDifferencePp: 20,
      targetReached: posteriorGlobal - initialGlobal >= 20,
    },
  };

  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  await writeAggregatedWorkbook(
    initialPublicReport,
    ['Pregunta', 'Opción', 'Respuestas', 'Porcentaje'],
    initial.questions.flatMap((question) =>
      question.options.map((option) => [
        question.question,
        option.label,
        option.count,
        option.percentage,
      ]),
    ),
  );
  await writeAggregatedWorkbook(
    consolidatedPublicReport,
    ['Indicador', 'Inicial n', 'Inicial %', 'Posterior n', 'Posterior %', 'Diferencia pp'],
    [
      ...comparisons.map((item) => [
        item.label,
        item.initialCount,
        item.initialPercentage,
        item.posteriorCount,
        item.posteriorPercentage,
        item.differencePp,
      ]),
      [
        'Proporción global de respuestas plenamente favorables',
        initialFavorable,
        roundOne(initialGlobal),
        posteriorFavorable,
        roundOne(posteriorGlobal),
        roundOne(posteriorGlobal - initialGlobal),
      ],
    ],
  );
  validatePublicReports(output);
  console.log(
    'Datos y reportes agregados generados desde 22 respuestas (16 iniciales + 6 posteriores).',
  );
}

await processClosureSurvey();
