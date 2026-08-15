import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const reviewedDocuments = [
  { name: 'actividad-2-publica.pdf', pages: 4, label: 'edición pública sanitizada' },
  { name: 'actividad-4-publica.pdf', pages: 7, label: 'edición pública sanitizada' },
  {
    name: 'plan-humanidades-digitales-publico.pdf',
    pages: 40,
    label: 'edición pública sanitizada',
  },
  { name: 'Actividad 6 Original.pdf', pages: 13, label: 'material original revisado' },
];
const publishedEvidence = [
  { name: 'publi5.pdf', pages: 4 },
  { name: 'publi6.pdf', pages: 4 },
];
const forbidden = [
  /967350/u,
  /José Carlos Gómez Rodríguez/iu,
  /Jose Carlos Gomez Rodriguez/iu,
  /Pruebas\.pdf/iu,
  /comencé su aplicación/iu,
  /comenzó su aplicación/iu,
];

const verifyPdf = (name, pages, label, inspectRestrictedContent = false) => {
  const path = join('public', 'documents', name);
  return readFile(path).then((bytes) => {
    if (bytes.subarray(0, 5).toString() !== '%PDF-')
      throw new Error(`${name}: no es un PDF válido`);
    const info = execFileSync('mutool', ['info', path], { encoding: 'utf8' });
    const pageCount = Number(info.match(/Pages:\s+(\d+)/u)?.[1]);
    if (pageCount !== pages)
      throw new Error(`${name}: se esperaban ${pages} páginas, hay ${pageCount}`);
    if (inspectRestrictedContent) {
      const text = execFileSync('mutool', ['draw', '-F', 'txt', '-o', '-', path], {
        encoding: 'utf8',
      });
      if (forbidden.some((pattern) => pattern.test(text))) {
        throw new Error(`${name}: contiene un identificador o texto bloqueado`);
      }
    }
    console.log(`${name}: ${label} verificado (${pages} páginas)`);
  });
};

for (const { name, pages, label } of reviewedDocuments) {
  await verifyPdf(name, pages, label, true);
}

for (const { name, pages } of publishedEvidence) {
  await verifyPdf(name, pages, 'evidencia visual autorizada', true);
}

const inspectAggregateSpreadsheet = (name, expectedRows, requiredHeaders) => {
  const path = join('public', 'documents', name);
  const entries = execFileSync('unzip', ['-Z1', path], { encoding: 'utf8' })
    .split('\n')
    .filter((entry) => entry.endsWith('.xml') && !entry.startsWith('['));
  const xml = entries
    .map((entry) => execFileSync('unzip', ['-p', path, entry], { encoding: 'utf8' }))
    .join('\n');
  const sheetXml = execFileSync('unzip', ['-p', path, 'xl/worksheets/sheet1.xml'], {
    encoding: 'utf8',
  });
  if ((sheetXml.match(/<row\b/gu) ?? []).length !== expectedRows)
    throw new Error(`${name}: número inesperado de filas agregadas`);
  const disallowed = [
    ...forbidden,
    /Marca temporal/iu,
    /rango de edad/iu,
    /18[–-]25|26[–-]35|36[–-]45|46[–-]60/iu,
  ];
  if (disallowed.some((pattern) => pattern.test(xml)))
    throw new Error(`${name}: contiene filas individuales o información no permitida`);
  for (const header of requiredHeaders) {
    if (!xml.includes(header)) throw new Error(`${name}: falta encabezado agregado: ${header}`);
  }
  console.log(`${name}: reporte agregado sin filas individuales verificado`);
};

inspectAggregateSpreadsheet('Decisiones que suman.xlsx', 25, [
  'Pregunta',
  'Opción',
  'Respuestas',
  'Porcentaje',
]);
inspectAggregateSpreadsheet('Decisiones que suman despues del webinar.xlsx', 10, [
  'Indicador',
  'Inicial n',
  'Posterior n',
  'Diferencia pp',
]);

const publicFiles = await readdir('public', { recursive: true });
if (publicFiles.some((file) => file.toLowerCase().endsWith('.mov')))
  throw new Error('No se permite incluir archivos MOV dentro de public/');
console.log('public/: no contiene archivos MOV pesados');
