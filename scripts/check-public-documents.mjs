import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const reviewedDocuments = [
  {
    name: 'entregas/actividad-02-publica.pdf',
    pages: 4,
    label: 'edición pública sanitizada',
  },
  {
    name: 'entregas/actividad-04-publica.pdf',
    pages: 7,
    label: 'edición pública sanitizada',
  },
  {
    name: 'entregas/plan-humanidades-digitales-publico.pdf',
    pages: 40,
    label: 'edición pública sanitizada',
  },
  {
    name: 'entregas/actividad-06-original.pdf',
    pages: 13,
    label: 'material original revisado',
  },
];
const publishedEvidence = Array.from({ length: 6 }, (_, index) => ({
  name: `publicaciones/publicacion-0${index + 1}.pdf`,
  pages: 4,
}));
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

inspectAggregateSpreadsheet('resultados/diagnostico-inicial-agregado.xlsx', 25, [
  'Pregunta',
  'Opción',
  'Respuestas',
  'Porcentaje',
]);
inspectAggregateSpreadsheet('resultados/comparacion-diagnostico-agregada.xlsx', 10, [
  'Indicador',
  'Inicial n',
  'Posterior n',
  'Diferencia pp',
]);

const publicFiles = await readdir('public', { recursive: true });
if (publicFiles.some((file) => file.toLowerCase().endsWith('.mov')))
  throw new Error('No se permite incluir archivos MOV dentro de public/');
const forbiddenPublicNames = ['pruebas-evidencia.png', 'pruebas-encuesta'];
if (
  publicFiles.some((file) => forbiddenPublicNames.some((name) => file.toLowerCase().includes(name)))
) {
  throw new Error('public/: contiene una evidencia privada o una ruta documental obsoleta');
}
console.log('public/: no contiene archivos MOV pesados');

const reviewedImages = [
  ...Array.from(
    { length: 5 },
    (_, index) => `assets/evidencias/encuesta-cierre/grafico-0${index + 1}.png`,
  ),
  'assets/evidencias/encuesta-cierre/confirmacion-envio.jpeg',
  'assets/evidencias/resultados/estadisticas-generales.png',
  'assets/evidencias/resultados/estadisticas-publicaciones.png',
  ...Array.from(
    { length: 6 },
    (_, index) => `assets/miniaturas/publicaciones/publicacion-0${index + 1}.png`,
  ),
  'assets/miniaturas/videos/actividad-06.webp',
  'assets/miniaturas/videos/entrevista.jpg',
  'assets/miniaturas/videos/webinar.webp',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'icon-192x192.png',
  'icon-512x512.png',
  'social-card.png',
];
for (const path of reviewedImages) {
  const bytes = await readFile(join('public', path));
  const validPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const validJpeg = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
  const validWebp =
    bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  if (!validPng && !validJpeg && !validWebp) throw new Error(`${path}: formato de imagen inválido`);
  if (
    path === 'social-card.png' &&
    (bytes.readUInt32BE(16) !== 1200 || bytes.readUInt32BE(20) !== 630)
  ) {
    throw new Error('social-card.png: debe medir 1200 × 630 px');
  }
}
console.log(`${reviewedImages.length} imágenes públicas revisadas tienen una firma válida`);

const manifest = JSON.parse(await readFile(join('public', 'site.webmanifest'), 'utf8'));
if (manifest.name !== 'Decisiones que sí suman' || manifest.lang !== 'es-CO')
  throw new Error('site.webmanifest: identidad o idioma inválidos');
console.log('site.webmanifest: manifest válido');

const favicon = await readFile(join('public', 'favicon.ico'));
if (favicon.byteLength === 0) throw new Error('favicon.ico: archivo vacío');
console.log('favicon.ico: icono válido');

const socialCard = await readFile(join('public', 'social-card.svg'), 'utf8');
if (!socialCard.includes('<svg')) throw new Error('social-card.svg: contenido SVG inválido');
console.log('social-card.svg: recurso vectorial verificado');

const permissionVideo = await readFile(join('public', 'media', 'video', 'permiso-entrevista.mp4'));
if (permissionVideo.subarray(4, 8).toString() !== 'ftyp')
  throw new Error('permiso-entrevista.mp4: no es un contenedor MP4 válido');
if (permissionVideo.byteLength > 10 * 1024 * 1024)
  throw new Error('permiso-entrevista.mp4: supera el límite público de 10 MB');
console.log(
  `permiso-entrevista.mp4: copia web verificada (${(permissionVideo.byteLength / 1024 / 1024).toFixed(1)} MB)`,
);
