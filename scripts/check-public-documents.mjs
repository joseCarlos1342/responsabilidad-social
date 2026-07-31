import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const documents = [
  'actividad-2-publica.pdf',
  'actividad-4-publica.pdf',
  'plan-humanidades-digitales-publico.pdf',
];
const forbidden = [
  /967350/gu,
  /Jose Carlos Gomez Rodriguez/giu,
  /José Carlos Gómez Rodríguez/gu,
  /comencé su aplicación/giu,
  /comenzó su aplicación/giu,
];

for (const name of documents) {
  const path = join('public', 'documents', name);
  const text = execFileSync('mutool', ['draw', '-F', 'txt', path], { encoding: 'utf8' });
  const metadata = execFileSync(
    'exiftool',
    ['-s3', '-Author', '-Creator', '-CreateDate', '-ModifyDate', '-MetadataDate', path],
    { encoding: 'utf8' },
  );
  if (!text.includes('Versión pública para consulta web'))
    throw new Error(`${name}: falta leyenda pública`);
  if (forbidden.some((pattern) => pattern.test(text) || pattern.test(metadata))) {
    throw new Error(`${name}: contiene un dato privado bloqueado`);
  }
  if (metadata.trim()) throw new Error(`${name}: conserva metadatos personales`);
  const bytes = await readFile(path);
  if (bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error(`${name}: no es un PDF válido`);
  console.log(`${name}: privacidad y firma PDF verificadas`);
}
