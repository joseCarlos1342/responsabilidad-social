import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of [
  '/',
  '/actividades/',
  '/actividades/actividad-2-decisiones-que-si-suman/',
  '/actividades/actividad-4-del-diagnostico-a-la-accion/',
  '/plan-humanidades-digitales/',
  '/documentos/',
  '/documentos/actividad-4-publica/',
]) {
  test(`sin violaciones axe en ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('las pestañas y el visor mantienen una ruta accesible', async ({ page }) => {
  await page.goto('/documentos/actividad-2-publica/');
  await expect(page.getByRole('tablist', { name: 'Modo de lectura' })).toBeVisible();
  await page.getByRole('tab', { name: 'Documento original' }).click();
  await expect(page.locator('.pdf-toolbar')).toHaveAttribute('role', 'toolbar');
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', /Página 1/);
});
