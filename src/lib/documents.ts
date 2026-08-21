import { existsSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import type { CollectionEntry } from 'astro:content';

export type DocumentEntry = CollectionEntry<'document'>;

const publicRoot = resolve(process.cwd(), 'public');
const allowedWebRoutes = new Set([
  '/actividades/actividad-2-decisiones-que-si-suman/',
  '/actividades/actividad-4-del-diagnostico-a-la-accion/',
  '/actividades/actividad-6-de-la-informacion-a-la-accion/',
  '/plan-humanidades-digitales/',
]);

export function sortDocuments(documents: DocumentEntry[]): DocumentEntry[] {
  return [...documents].sort((a, b) => a.data.publishedAt.getTime() - b.data.publishedAt.getTime());
}

export function getDocumentRoute(document: DocumentEntry): string {
  return `/documentos/${document.data.slug}/`;
}

export function getDocumentAssetPath(document: DocumentEntry, root = publicRoot): string {
  const relativePath = decodeURIComponent(document.data.publicVersion.replace(/^\//u, ''));
  return resolve(root, relativePath);
}

export function validateDocumentEntry(document: DocumentEntry, root = publicRoot): string[] {
  const errors: string[] = [];
  const { data } = document;
  const assetPath = getDocumentAssetPath(document, root);
  const relativeAsset = relative(root, assetPath);

  if (!allowedWebRoutes.has(data.webRoute)) {
    errors.push(`ruta web no relacionada permitida: ${data.webRoute}`);
  }
  if (
    isAbsolute(relativeAsset) ||
    relativeAsset.startsWith('..') ||
    !relativeAsset.startsWith('documents/entregas/')
  ) {
    errors.push(`archivo público fuera de public/documents/entregas: ${data.publicVersion}`);
  }
  if (!existsSync(assetPath) || !statSync(assetPath).isFile()) {
    errors.push(`PDF documental inexistente: ${data.publicVersion}`);
  }
  if (
    data.documentSource === 'publica' &&
    data.originalFile?.replace(/^\/+/, '').startsWith('public/')
  ) {
    errors.push(`el original no puede publicarse como asset: ${data.originalFile}`);
  }
  if (!data.privacyReviewed && data.documentSource === 'publica') {
    errors.push('el documento no tiene privacidad revisada');
  }
  if (!data.downloadable && data.publicVersion) {
    errors.push('un documento con PDF público debe ser descargable');
  }

  return errors;
}

export function validateDocuments(documents: DocumentEntry[], root = publicRoot): void {
  const errors = documents.flatMap((document) =>
    validateDocumentEntry(document, root).map((error) => `${document.id}: ${error}`),
  );
  const routes = documents.map((document) => document.data.webRoute);
  const duplicateRoutes = routes.filter((route, index) => routes.indexOf(route) !== index);
  const missingRoutes = [...allowedWebRoutes].filter((route) => !routes.includes(route));
  if (duplicateRoutes.length > 0)
    errors.push(`rutas web documentales duplicadas: ${duplicateRoutes.join(', ')}`);
  if (missingRoutes.length > 0)
    errors.push(`faltan documentos relacionados para: ${missingRoutes.join(', ')}`);
  if (errors.length > 0) {
    throw new Error(`Documentos inválidos:\n${errors.join('\n')}`);
  }
}
