/// <reference types="vitest/config" />

import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts'],
    },
  },
});
