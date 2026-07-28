import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://decisiones-que-si-suman.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
});
