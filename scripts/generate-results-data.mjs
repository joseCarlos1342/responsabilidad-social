import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rename, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const sourceRoot = resolve(process.env.DQS_SOURCE_DIR ?? 'docs/fuentes-academicas');
const initialWorkbook = join(sourceRoot, 'Decisiones que suman.xlsx');
const consolidatedWorkbook = join(sourceRoot, 'Decisiones que suman despues del webinar.xlsx');
const outputPath = resolve('src/data/financial-results.generated.json');
const initialPublicReport = resolve('public/documents/Decisiones que suman.xlsx');
const consolidatedPublicReport = resolve(
  'public/documents/Decisiones que suman despues del webinar.xlsx',
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
    '/documents/Decisiones%20que%20suman.xlsx',
  );
  const posterior = {
    ...summarize(
      posteriorRows,
      headers,
      'Evaluación posterior',
      '/documents/Decisiones%20que%20suman%20despues%20del%20webinar.xlsx',
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
    sourceFile: 'Decisiones que suman despues del webinar.xlsx',
    sourceHref: '/documents/Decisiones%20que%20suman%20despues%20del%20webinar.xlsx',
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
