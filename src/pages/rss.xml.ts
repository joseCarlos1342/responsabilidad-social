import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: Parameters<typeof rss>[0]) {
  const activities = await getCollection('activity', ({ data }) => !data.draft);
  return rss({
    title: 'Decisiones que sí suman',
    description: 'Actividades y reflexiones sobre educación financiera y responsabilidad social.',
    site: context.site ?? 'https://decisiones-que-si-suman.pages.dev',
    items: activities.map((activity) => ({
      title: activity.data.title,
      description: activity.data.description,
      pubDate: activity.data.date,
      link: `/actividades/${activity.id}/`,
    })),
    customData: '<language>es-co</language>',
  });
}
