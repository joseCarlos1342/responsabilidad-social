import { expect, test } from '@playwright/test';

test('carga la portada con su propuesta y navegación principal', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Educación financiera/);
  await expect(page.locator('h1')).toContainText('Decisiones que sí suman');
  await expect(page.getByRole('link', { name: 'Explorar actividades' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
});

test('muestra las cuatro evidencias de publicaciones de las semanas 4 y 5', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Publicaciones realizadas en Facebook.' }),
  ).toBeVisible();
  await expect(page.locator('.publication-card')).toHaveCount(4);
  await expect(page.getByText('4 de 6 publicaciones realizadas')).toBeVisible();
  await expect(page.locator('progress')).toHaveAttribute('value', '4');
  await expect(page.locator('progress')).toHaveAttribute('max', '6');

  const facebookUrls = [
    'https://www.facebook.com/share/p/1DtDHVwr6r/',
    'https://www.facebook.com/share/r/1MfWpiS7BT/',
    'https://www.facebook.com/share/p/19BGtDDH9q/',
    'https://www.facebook.com/share/p/1QUunWR1rH/',
  ];

  for (const [index, facebookUrl] of facebookUrls.entries()) {
    const card = page.locator(`[data-publication="${index + 1}"]`);
    await expect(card.locator('img')).toHaveAttribute('alt', /Primera página/);
    await expect(card.locator('a.button')).toHaveAttribute(
      'href',
      `/documents/publi${index + 1}.pdf`,
    );
    const facebookLink = card.getByRole('link', { name: /Ver publicación .* Facebook/ });
    await expect(facebookLink).toHaveAttribute('href', facebookUrl);
    await expect(facebookLink).toHaveAttribute('target', '_blank');
    await expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect((await request.get(`/documents/publi${index + 1}.pdf`)).ok()).toBeTruthy();
  }

  const facebookPageLink = page.getByRole('link', { name: /Visitar la página de Facebook/ });
  await expect(facebookPageLink).toHaveAttribute(
    'href',
    'https://www.facebook.com/share/1DPqucucd7/',
  );
  await expect(facebookPageLink).toHaveAttribute('target', '_blank');
  await expect(facebookPageLink).toHaveAttribute('rel', 'noopener noreferrer');
});

test('apila las evidencias en una columna sin desbordamiento en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.publication-card')).toHaveCount(4);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  const columnCount = await page
    .locator('.publications-grid')
    .evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/u).length,
    );
  expect(columnCount).toBe(1);
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

  await page.goto('/plan-humanidades-digitales/');
  await expect(page.getByRole('heading', { name: 'Plan de Humanidades Digitales' })).toBeVisible();
  await expect(page.getByText('Cronograma de semanas 4 a 7')).toBeVisible();

  await page.getByRole('tab', { name: 'Documento original' }).click();
  await expect(page.getByText('Documento original académico')).toBeVisible();
  await expect(page.locator('[data-pdf-viewer]')).toHaveAttribute(
    'data-src',
    '/documents/plan-responsabilidad-social-educacion-financiera.pdf',
  );
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

test('muestra una 404 real y una página informativa de participación', async ({ page }) => {
  const response = await page.goto('/ruta-inexistente/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /Esta página tomó otra ruta/i })).toBeVisible();
  await page.goto('/comentarios/');
  await expect(page.getByRole('heading', { name: /No hay comentarios integrados/i })).toBeVisible();
});

test('publica metadatos, RSS y sitemap', async ({ page, request }) => {
  await page.goto('/actividades/actividad-4-del-diagnostico-a-la-accion/');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  expect((await request.get('/rss.xml')).ok()).toBeTruthy();
  expect((await request.get('/sitemap-index.xml')).ok()).toBeTruthy();
});

test('muestra la biblioteca y las tres entregas', async ({ page }) => {
  await page.goto('/documentos/');
  await expect(page.getByRole('heading', { name: 'Documentos y entregas' })).toBeVisible();
  await expect(page.locator('.document-card')).toHaveCount(3);
  await expect(page.getByText('Actividad 2 · Decisiones que sí suman')).toBeVisible();
  await expect(page.getByText('Actividad 4 · Del diagnóstico a la acción')).toBeVisible();
  await expect(page.getByText('Plan de Humanidades Digitales').first()).toBeVisible();
  await expect(page.locator('body')).not.toContainText('967350');
});

test('navega entre versión web y PDF, renderiza páginas y conserva controles', async ({ page }) => {
  await page.goto('/documentos/actividad-4-publica/');
  const webTab = page.getByRole('tab', { name: 'Versión web' });
  const pdfTab = page.getByRole('tab', { name: 'Documento original' });
  await expect(webTab).toHaveAttribute('aria-selected', 'true');
  await pdfTab.click();
  await expect(pdfTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.pdf-canvas-wrap')).toHaveAttribute('data-ready', 'true', {
    timeout: 30_000,
  });
  await expect(page.locator('[data-page-input]')).toHaveValue('1');
  await page.getByRole('button', { name: 'Página siguiente' }).click();
  await expect(page.locator('[data-page-input]')).toHaveValue('2');
  await page.getByRole('button', { name: 'Página anterior' }).click();
  await expect(page.locator('[data-page-input]')).toHaveValue('1');
  await page.getByRole('button', { name: 'Acercar' }).click();
  await expect(page.locator('[data-zoom]')).toHaveText('110%');
  await page.locator('.pdf-viewer').hover();
  await page.keyboard.press('+');
  await expect(page.locator('[data-zoom]')).toHaveText('120%');
  await page.keyboard.press('0');
  await expect(page.locator('[data-zoom]')).toHaveText('100%');
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: /Abrir PDF en otra pestaña/ }).click();
  await popupPromise;
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.pdf-toolbar a[download]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('actividad-4-publica.pdf');
});

test('actividad 4 no inventa resultados y funciona en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/actividades/actividad-4-del-diagnostico-a-la-accion/');
  await expect(page.getByText('quedó preparado para su aplicación')).toBeVisible();
  await expect(page.getByText('comenzó su aplicación')).toHaveCount(0);
  await expect(page.getByText('Evidencia pendiente de incorporación').first()).toBeVisible();
  await page.getByRole('tab', { name: 'Documento original' }).click();
  await expect(page.locator('.pdf-viewer')).toBeVisible();
});

test('muestra un error recuperable si el PDF no está disponible', async ({ page }) => {
  await page.route('**/documents/actividad-2-publica.pdf', (route) => route.abort());
  await page.goto('/documentos/actividad-2-publica/');
  await page.getByRole('tab', { name: 'Documento original' }).click();
  await expect(page.locator('[data-status]')).toContainText('No se pudo cargar el PDF', {
    timeout: 30_000,
  });
});
