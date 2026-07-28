import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of [
  '/',
  '/actividades/',
  '/actividades/actividad-4-del-diagnostico-a-la-accion/',
  '/plan-humanidades-digitales/',
]) {
  test(`sin violaciones axe en ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
