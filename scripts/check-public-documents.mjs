import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const originalDocuments = [
  { name: 'actividad-2-original.pdf', pages: 3 },
  { name: 'actividad-4-original.pdf', pages: 5 },
  { name: 'plan-responsabilidad-social-educacion-financiera.pdf', pages: 24 },
];
const publishedEvidence = [
  { name: 'publi5.pdf', pages: 4 },
  { name: 'publi6.pdf', pages: 4 },
  { name: 'Pruebas.pdf', pages: 10 },
];
const forbidden = [/967350/u, /comencé su aplicación/iu, /comenzó su aplicación/iu];

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

for (const { name, pages } of originalDocuments) {
  await verifyPdf(name, pages, 'PDF original académico');
}

const activityFourPath = join('public', 'documents', 'actividad-4-original.pdf');
const activityFourFinalPage = execFileSync(
  'mutool',
  ['draw', '-F', 'txt', '-o', '-', activityFourPath, '5'],
  { encoding: 'utf8' },
);
const activityFourEvidence = [
  'Lista de Evidencias Actualizada',
  'https://decisiones-que-si-suman.pages.dev/',
  'https://www.canva.com/d/osljqsu323O_2OF',
  '37 reacciones',
  '6 comentarios',
  '1 compartido',
];
for (const evidence of activityFourEvidence) {
  if (!activityFourFinalPage.includes(evidence)) {
    throw new Error(`actividad-4-original.pdf: falta evidencia final: ${evidence}`);
  }
}
const activityFourAnnotations = execFileSync(
  'mutool',
  ['show', activityFourPath, 'pages/5/Annots/*'],
  { encoding: 'utf8' },
);
const activityFourLinks = [
  'https://decisiones-que-si-suman.pages.dev/',
  'https://decisiones-que-si-suman.pages.dev/documents/Pruebas.pdf#page=7',
  'https://decisiones-que-si-suman.pages.dev/actividades/actividad-4-del-diagnostico-a-la-accion/#instrumento-diagnostico',
  'https://decisiones-que-si-suman.pages.dev/documents/publi2.pdf',
  'https://www.canva.com/d/osljqsu323O_2OF',
];
for (const uri of activityFourLinks) {
  if (!activityFourAnnotations.includes(`/URI (${uri})`)) {
    throw new Error(`actividad-4-original.pdf: falta enlace interactivo: ${uri}`);
  }
}
console.log('actividad-4-original.pdf: lista final y enlaces interactivos verificados');

for (const { name, pages } of publishedEvidence) {
  await verifyPdf(name, pages, 'evidencia visual autorizada', true);
}

const spreadsheetPath = join('public', 'documents', 'Decisiones que suman.xlsx');
const spreadsheetXml = execFileSync('unzip', ['-p', spreadsheetPath, 'xl/worksheets/sheet1.xml'], {
  encoding: 'utf8',
});
if ((spreadsheetXml.match(/<row\b/gu) ?? []).length !== 17)
  throw new Error('Decisiones que suman.xlsx: se esperaba encabezado y 16 respuestas');
if (forbidden.some((pattern) => pattern.test(spreadsheetXml)))
  throw new Error('Decisiones que suman.xlsx: contiene un identificador o texto bloqueado');
console.log('Decisiones que suman.xlsx: estructura de diagnóstico verificada (16 respuestas)');

const publicFiles = await readdir('public', { recursive: true });
if (publicFiles.some((file) => file.toLowerCase().endsWith('.mov')))
  throw new Error('No se permite incluir archivos MOV dentro de public/');
console.log('public/: no contiene archivos MOV pesados');
