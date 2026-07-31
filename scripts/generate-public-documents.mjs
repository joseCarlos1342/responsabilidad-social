import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const outputDirectory = join(root, 'public', 'documents');
const jobs = [
  {
    source: 'docs/fuentes-academicas/semana-4-decisiones-que-si-suman.pdf',
    output: 'actividad-2-publica.pdf',
    heading: 'Actividad 2 · Decisiones que sí suman',
  },
  {
    source: 'docs/fuentes-academicas/semana-2-del-diagnostico-a-la-accion.pdf',
    output: 'actividad-4-publica.pdf',
    heading: 'Actividad 4 · Del diagnóstico a la acción',
  },
  {
    source: 'docs/fuentes-academicas/plan-responsabilidad-social-educacion-financiera.pdf',
    output: 'plan-humanidades-digitales-publico.pdf',
    heading: 'Plan de Humanidades Digitales',
  },
];

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function sanitize(text) {
  return text
    .replaceAll(/Jose Carlos Gomez Rodriguez/giu, 'José Carlos Gómez')
    .replaceAll(/José Carlos Gómez Rodríguez/gu, 'José Carlos Gómez')
    .replaceAll(/José Carlos Gomez/gu, 'José Carlos Gómez')
    .replaceAll(/\bID\s*[:.]?\s*967350\b/giu, '')
    .replaceAll(/\b967350\b/gu, '')
    .replaceAll(
      /Durante la semana 4 dejé preparado el instrumento\s+y\s+comencé su aplicación/giu,
      'Durante la semana 4 el instrumento quedó preparado para su aplicación',
    )
    .replaceAll(
      /el instrumento quedó preparado y comenzó su aplicación/giu,
      'el instrumento quedó preparado para su aplicación',
    )
    .replaceAll(/comenzó su aplicación/giu, 'quedó preparado para su aplicación')
    .replaceAll(/Nombre del estudiante(?: o integrantes del grupo)?/giu, 'Autoría pública')
    .replaceAll(/Nombre del estudiante/giu, 'Autoría pública');
}

function htmlForDocument(title, text) {
  const pages = text.split('\f').filter((page) => page.trim());
  const pageMarkup = pages
    .map(
      (page, index) => `
        <section class="page">
          <header><strong>${escapeHtml(title)}</strong><span>Versión pública · ${index + 1}/${pages.length}</span></header>
          <pre>${escapeHtml(sanitize(page).trim())}</pre>
          <footer>Versión pública para consulta web · Decisiones que sí suman</footer>
        </section>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 12mm 14mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #1f2928; font-family: Arial, sans-serif; background: #fff; }
  .page { position: relative; min-height: 270mm; page-break-after: always; padding-bottom: 12mm; }
  .page:last-child { page-break-after: auto; }
  header { display: flex; justify-content: space-between; gap: 16px; padding-bottom: 5mm; border-bottom: 1px solid #164b4a; color: #164b4a; font-size: 9pt; }
  header span { color: #52605c; font-size: 8pt; }
  pre { margin: 7mm 0 0; white-space: pre-wrap; overflow-wrap: anywhere; font: 8.3pt/1.35 Arial, sans-serif; }
  footer { position: absolute; right: 0; bottom: 0; color: #52605c; font-size: 7.5pt; }
</style></head><body>${pageMarkup}</body></html>`;
}

await mkdir(outputDirectory, { recursive: true });

for (const job of jobs) {
  const sourcePath = join(root, job.source);
  const outputPath = join(outputDirectory, job.output);
  const tempTextPath = join(tmpdir(), `${job.output}.txt`);
  const tempHtmlPath = join(tmpdir(), `${job.output}.html`);

  execFileSync('mutool', ['draw', '-F', 'txt', '-o', tempTextPath, sourcePath], {
    stdio: 'inherit',
  });
  const text = await readFile(tempTextPath, 'utf8');
  await writeFile(tempHtmlPath, htmlForDocument(job.heading, text), 'utf8');
  execFileSync(
    'chromium',
    [
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${outputPath}`,
      `file://${tempHtmlPath}`,
    ],
    { stdio: 'inherit' },
  );
  execFileSync(
    'exiftool',
    [
      '-overwrite_original',
      '-all=',
      `-Title=${job.heading}`,
      '-Subject=Versión pública para consulta web',
      outputPath,
    ],
    { stdio: 'inherit' },
  );
  await rm(tempTextPath, { force: true });
  await rm(tempHtmlPath, { force: true });
}

console.log(`Documentos públicos generados en ${outputDirectory}`);
