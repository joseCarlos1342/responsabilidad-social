import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const evidenceSchema = z.object({
  label: z.string(),
  status: z.enum(['pendiente', 'disponible', 'autorizada']),
  href: z.url().optional(),
});

const referenceSchema = z.object({
  label: z.string(),
  href: z.url().optional(),
});

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

export const collections = { activity, plan, recurso };
