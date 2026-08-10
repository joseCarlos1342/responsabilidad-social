import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const evidenceSchema = z.object({
  label: z.string(),
  status: z.enum(['pendiente', 'disponible', 'autorizada', 'completada']),
  href: z
    .string()
    .refine((value) => value.startsWith('/') || /^https?:\/\//u.test(value), {
      message: 'La evidencia debe usar una ruta interna o una URL HTTP(S).',
    })
    .optional(),
});

const referenceSchema = z.object({
  label: z.string(),
  href: z.url().optional(),
});

const documentStatus = z.enum(['planeado', 'en-desarrollo', 'ejecutado', 'finalizado']);

const activity = defineCollection({
  loader: glob({ base: './src/content/actividades', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    activityNumber: z.number().int().positive(),
    week: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    status: z.enum(['planeada', 'en-desarrollo', 'ejecutada', 'finalizada']),
    category: z.enum(['diagnóstico', 'planificación', 'acción', 'reflexión']),
    contentType: z.enum(['actividad', 'entrada-reflexiva', 'guía']),
    tags: z.array(z.string()),
    ods: z.array(z.number().int().min(1).max(17)),
    objectives: z.array(z.string()),
    territory: z.string(),
    cover: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    evidence: z.array(evidenceSchema).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    order: z.number().int(),
    references: z.array(referenceSchema).default([]),
    documentSlug: z.string().optional(),
  }),
});

const plan = defineCollection({
  loader: glob({ base: './src/content/plan', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedDate: z.coerce.date(),
    status: z.enum(['planeada', 'en-desarrollo', 'ejecutada', 'finalizada']),
    territory: z.string(),
    download: z.string().optional(),
    references: z.array(referenceSchema).default([]),
    documentSlug: z.string().optional(),
  }),
});

const recurso = defineCollection({
  loader: glob({ base: './src/content/recursos', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    kind: z.enum(['plantilla', 'fuente', 'guía', 'evidencia']),
    status: z.enum(['pendiente', 'disponible', 'autorizada']),
    href: z.string().optional(),
    updatedDate: z.coerce.date(),
  }),
});

const document = defineCollection({
  loader: glob({ base: './src/content/documents', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string().regex(/^[a-z0-9-]+$/u),
    documentType: z.enum(['plan', 'actividad', 'guía']),
    activityNumber: z.number().int().positive().optional(),
    week: z.string(),
    status: documentStatus,
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    originalFile: z.string().optional(),
    webRoute: z.string().regex(/^\/(actividades|plan-humanidades-digitales)\//u),
    pageCount: z.number().int().positive(),
    version: z.string().min(1),
    ods: z.array(z.number().int().min(1).max(17)),
    tags: z.array(z.string()),
    downloadable: z.boolean(),
    publicVersion: z
      .string()
      .regex(
        /^\/documents\/(?:.*-(?:publico|publica|original)\.pdf|plan-responsabilidad-social-educacion-financiera\.pdf)$/u,
      ),
    privacyReviewed: z.literal(true),
    documentSource: z.enum(['publica', 'original']),
    evidenceStatus: z.enum(['pendiente', 'disponible', 'autorizada']),
  }),
});

export const collections = { activity, plan, recurso, document };
