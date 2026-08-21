import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { glob } from 'node:fs/promises';

const root = process.argv[2] ?? 'dist';
const files = [];
for await (const file of glob('**/*.html', { cwd: root })) files.push(join(root, file));

const broken = [];
const assetReferencePattern = /(?:href|poster|src)="([^"]+)"/g;
for (const file of files) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(assetReferencePattern)) {
    const href = match[1];
    if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/#')) continue;
    const encodedPath = href.split('#')[0].split('?')[0];
    let clean;
    try {
      clean = decodeURIComponent(encodedPath);
    } catch {
      broken.push(`${relative(process.cwd(), file)} -> ${href}`);
      continue;
    }
    if (!clean || clean.startsWith('/sitemap') || clean === '/robots.txt' || clean === '/rss.xml')
      continue;
    const candidates = [
      join(root, clean, 'index.html'),
      join(root, clean.replace(/\/$/u, '') + '.html'),
      join(root, clean),
    ];
    let exists = false;
    for (const candidate of candidates) {
      try {
        await readFile(candidate);
        exists = true;
        break;
      } catch {
        /* candidate does not exist */
      }
    }
    if (!exists) broken.push(`${relative(process.cwd(), file)} -> ${href}`);
  }
}

if (broken.length) {
  console.error('Enlaces internos rotos:\n' + broken.join('\n'));
  process.exit(1);
}
console.log(`Enlaces internos verificados: ${files.length} HTML.`);
