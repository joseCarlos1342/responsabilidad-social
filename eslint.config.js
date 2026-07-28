import tsParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**', 'coverage/**', 'playwright-report/**'],
  },
  ...astro.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
  },
  prettier,
];
