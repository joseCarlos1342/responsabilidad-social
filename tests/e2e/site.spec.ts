import { expect, test } from '@playwright/test';

test('carga la portada con su propuesta y navegación principal', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Educación financiera/);
  await expect(page.locator('h1')).toContainText('Decisiones que sí suman');
  await expect(page.getByRole('link', { name: 'Explorar actividades' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
});

test('navega a actividad 2, actividad 4 y al plan', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Nombrar el problema/ }).click();
  await expect(page).toHaveURL(/actividad-2-decisiones-que-si-suman/);
  await expect(
    page.getByRole('heading', { name: /educación financiera desde Neiva/i }),
  ).toBeVisible();

  await page.goto('/actividades/actividad-4-del-diagnostico-a-la-accion/');
  await expect(page.getByText('Evidencia pendiente de incorporación').first()).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /¿Cómo manejamos nuestro dinero?/i }),
  ).toBeVisible();
  await expect(page.getByText('Comentarios pendientes de configuración.')).toBeVisible();

  await page.goto('/plan-humanidades-digitales/');
  await expect(page.getByRole('heading', { name: 'Plan de Humanidades Digitales' })).toBeVisible();
  await expect(page.getByText('Cronograma de semanas 4 a 7')).toBeVisible();
});

test('filtra actividades progresivamente', async ({ page }) => {
  await page.goto('/actividades/');
  await expect(page.locator('.activity-item')).toHaveCount(2);
  await page.locator('select[name="status"]').selectOption('en-desarrollo');
  await expect(page.locator('.activity-item:not([data-hidden="true"])')).toHaveCount(1);
  await expect(page.getByText('1 entrada visible')).toBeVisible();
  await expect(page).toHaveURL(/status=en-desarrollo/);
});

test('el menú móvil se puede abrir y cerrar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: /abrir menú/i });
  await menu.click();
  await expect(page.locator('#site-nav')).toHaveAttribute('data-open', 'true');
  await page.getByRole('button', { name: /cerrar menú/i }).click();
  await expect(page.locator('#site-nav')).toHaveAttribute('data-open', 'false');
});

test('la navegación por teclado llega a contenido y controles', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#contenido')).toBeFocused();
});

test('muestra una 404 real y no Giscus en páginas generales', async ({ page }) => {
  const response = await page.goto('/ruta-inexistente/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /Esta página tomó otra ruta/i })).toBeVisible();
  await page.goto('/referencias/');
  await expect(page.locator('.giscus-shell')).toHaveCount(0);
});

test('publica metadatos, RSS y sitemap', async ({ page, request }) => {
  await page.goto('/actividades/actividad-4-del-diagnostico-a-la-accion/');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  expect((await request.get('/rss.xml')).ok()).toBeTruthy();
  expect((await request.get('/sitemap-index.xml')).ok()).toBeTruthy();
});
