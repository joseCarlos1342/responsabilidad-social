import { expect, test } from '@playwright/test';

test('carga la portada con su propuesta y navegación principal', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Educación financiera/);
  await expect(page.locator('h1')).toContainText('Decisiones que sí suman');
  await expect(page.getByRole('link', { name: 'Explorar actividades' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
});

test('muestra las seis evidencias de publicaciones de las semanas 4 a 6', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Publicaciones realizadas en Facebook.' }),
  ).toBeVisible();
  await expect(page.locator('.publication-card')).toHaveCount(6);
  await expect(page.getByText('6 de 6 publicaciones realizadas')).toBeVisible();
  await expect(page.locator('progress')).toHaveAttribute('value', '6');
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

  for (const number of [5, 6]) {
    const card = page.locator(`[data-publication="${number}"]`);
    await expect(card.locator('img')).toHaveAttribute('alt', /Primera página/);
    await expect(card.locator('a.button')).toHaveAttribute('href', `/documents/publi${number}.pdf`);
    await expect(card.getByText('Enlace individual no disponible')).toBeVisible();
    expect((await request.get(`/documents/publi${number}.pdf`)).ok()).toBeTruthy();
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
  await expect(page.locator('.publication-card')).toHaveCount(6);
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
  await expect(page.getByText('COMPLETADA', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Publicado: 27/7/2026')).toBeVisible();
  await expect(page.getByText('Actualizado: 9/8/2026')).toBeVisible();
  await expect(page.getByText('16 respuestas diagnósticas').first()).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '16 respuestas para orientar el proyecto.' }),
  ).toBeVisible();
  await expect(page.getByText('Evidencia pendiente de incorporación')).toHaveCount(0);
  await expect(page.getByText('espacio para gráfica futura')).toHaveCount(0);
  await expect(
    page
      .getByText('Reflexión académica de la Actividad 4 y aporte a los ODS')
      .locator('xpath=../..')
      .getByText('COMPLETADA'),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Reflexión académica de la Actividad 4' }),
  ).toBeVisible();
  await expect(
    page.getByText('Sin un postest válido no es responsable afirmar impacto'),
  ).toBeVisible();
  const reportLink = page.getByRole('link', { name: 'Descargar reporte XLSX' });
  await expect(reportLink).toBeVisible();
  await expect(reportLink).toHaveAttribute('download', '');
  const reportColors = await reportLink.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, background: styles.backgroundColor };
  });
  expect(reportColors.color).not.toBe(reportColors.background);
  await expect(page.getByRole('link', { name: /Decisiones que suman.xlsx/ })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /¿Cómo manejamos nuestro dinero?/i }),
  ).toBeVisible();

  await page.goto('/plan-humanidades-digitales/');
  await expect(page.getByRole('heading', { name: 'Plan de Humanidades Digitales' })).toBeVisible();
  await expect(page.getByText('Cronograma de semanas 4 a 7')).toBeVisible();

  await page.getByRole('tab', { name: 'Documento original' }).click();
  await expect(page.getByText('Documento original académico', { exact: true })).toBeVisible();
  await expect(page.locator('[data-pdf-viewer]')).toHaveAttribute(
    'data-src',
    '/documents/plan-responsabilidad-social-educacion-financiera.pdf',
  );
});

test('difiere los medios pesados hasta interacción', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-youtube-lite] iframe')).toHaveCount(0);
  await expect(page.locator('[data-evidence-pdf] iframe')).toHaveCount(0);
  await page.getByRole('button', { name: /Reproducir entrevista/ }).click();
  await expect(page.locator('[data-youtube-lite] iframe')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/mLFCR_STZ2Q?rel=0',
  );
  const videoFrame = await page.locator('[data-youtube-frame]').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, ratio: rect.width / rect.height };
  });
  expect(videoFrame.width).toBeGreaterThan(600);
  expect(videoFrame.ratio).toBeCloseTo(16 / 9, 1);
  await page.getByRole('button', { name: 'Ver evidencia' }).click();
  await expect(page.locator('[data-evidence-pdf] iframe')).toHaveAttribute(
    'src',
    '/documents/Pruebas.pdf#page=1',
  );
  const dialogWidth = await page
    .locator('[data-evidence-pdf] dialog')
    .evaluate((element) => element.getBoundingClientRect().width);
  expect(dialogWidth).toBeGreaterThan(600);
});

test('filtra actividades progresivamente', async ({ page }) => {
  await page.goto('/actividades/');
  await expect(page.locator('.activity-item')).toHaveCount(2);
  await page.locator('select[name="status"]').selectOption('finalizada');
  await expect(page.locator('.activity-item:not([data-hidden="true"])')).toHaveCount(1);
  await expect(page.getByText('1 entrada visible')).toBeVisible();
  await expect(page).toHaveURL(/status=finalizada/);
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
  await expect(page.getByRole('link', { name: /Ver versión pública/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Ver documento original/ })).toHaveCount(3);
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
  await expect(page.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Página siguiente' })).toBeEnabled();
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
  await page.getByRole('button', { name: 'Página siguiente' }).evaluate((button) => {
    for (let index = 0; index < 4; index += 1) (button as HTMLButtonElement).click();
  });
  await expect(page.locator('[data-status]')).toHaveText('Página 5 de 5 cargada.');
  await expect(page.locator('[data-page-input]')).toHaveValue('5');
  await expect(page.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: /Abrir PDF en otra pestaña/ }).click();
  await popupPromise;
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.pdf-toolbar a[download]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('actividad-4-original.pdf');
});

test('carga directamente los PDF originales con contenido visible', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    deviceScaleFactor: 2,
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (
          record.type !== 'attributes' ||
          !(record.target instanceof HTMLElement) ||
          record.target.dataset.ready !== 'true'
        )
          continue;

        const canvas = record.target.querySelector<HTMLCanvasElement>('[data-canvas]');
        const context = canvas?.getContext('2d');
        const pixels =
          canvas && context && canvas.width > 0 && canvas.height > 0
            ? context.getImageData(0, 0, canvas.width, canvas.height).data
            : new Uint8ClampedArray();
        const stride = Math.max(4, Math.floor(pixels.length / 20_000 / 4) * 4);
        let visibleSamples = 0;
        for (let index = 0; index < pixels.length; index += stride) {
          const red = pixels[index] ?? 255;
          const green = pixels[index + 1] ?? 255;
          const blue = pixels[index + 2] ?? 255;
          const alpha = pixels[index + 3] ?? 0;
          if (alpha > 0 && (red < 245 || green < 245 || blue < 245)) {
            visibleSamples += 1;
          }
        }
        (window as typeof window & { __pdfReadyVisibleSamples?: number }).__pdfReadyVisibleSamples =
          visibleSamples;
      }
    });
    observer.observe(document, {
      attributes: true,
      attributeFilter: ['data-ready'],
      childList: true,
      subtree: true,
    });
  });

  const documents = [
    { route: '/documentos/actividad-2-publica/?vista=documento', pages: 3 },
    { route: '/documentos/actividad-4-publica/?vista=documento', pages: 5 },
  ];

  for (const document of documents) {
    await page.goto(document.route);
    await expect(page.getByRole('tab', { name: 'Documento original' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.locator('[data-status]')).toHaveText(
      `Página 1 de ${document.pages} cargada.`,
      { timeout: 30_000 },
    );
    expect(
      await page.evaluate(
        () =>
          (window as typeof window & { __pdfReadyVisibleSamples?: number })
            .__pdfReadyVisibleSamples,
      ),
    ).toBeGreaterThan(100);

    const canvasMetrics = await page.locator('[data-canvas]').evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      const context = canvas.getContext('2d');
      if (!context || canvas.width === 0 || canvas.height === 0)
        return { visibleSamples: 0, scaleX: 0, scaleY: 0 };

      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const stride = Math.max(4, Math.floor(pixels.length / 20_000 / 4) * 4);
      let visibleSamples = 0;
      for (let index = 0; index < pixels.length; index += stride) {
        const red = pixels[index] ?? 255;
        const green = pixels[index + 1] ?? 255;
        const blue = pixels[index + 2] ?? 255;
        const alpha = pixels[index + 3] ?? 0;
        if (alpha > 0 && (red < 245 || green < 245 || blue < 245)) visibleSamples += 1;
      }
      return {
        visibleSamples,
        scaleX: canvas.width / Number.parseFloat(canvas.style.width),
        scaleY: canvas.height / Number.parseFloat(canvas.style.height),
      };
    });

    expect(canvasMetrics.visibleSamples).toBeGreaterThan(100);
    expect(canvasMetrics.scaleX).toBeCloseTo(2, 1);
    expect(canvasMetrics.scaleY).toBeCloseTo(2, 1);
  }
  await context.close();
});

test('bloquea la navegación hasta completar el primer render PDF', async ({ page }) => {
  await page.route('**/documents/actividad-2-original.pdf', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.goto('/documentos/actividad-2-publica/?vista=documento');

  const pageInput = page.locator('[data-page-input]');
  await expect(pageInput).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Acercar' })).toBeDisabled();
  await pageInput.evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = '2';
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.keyboard.press('+');
  await expect(page.locator('[data-zoom]')).toHaveText('100%');

  await expect(page.locator('.pdf-canvas-wrap')).toHaveAttribute('data-ready', 'true', {
    timeout: 30_000,
  });
  await expect(pageInput).toBeEnabled();
  await expect(pageInput).toHaveValue('1');
  await expect(page.locator('[data-status]')).toHaveText('Página 1 de 3 cargada.');
});

test('actividad 4 no inventa resultados y funciona en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/actividades/actividad-4-del-diagnostico-a-la-accion/');
  await expect(page.getByText('diagnóstico se aplicó y cuenta con 16 respuestas')).toBeVisible();
  await expect(page.getByText('comenzó su aplicación')).toHaveCount(0);
  await expect(page.getByText('16 respuestas diagnósticas').first()).toBeVisible();
  await page.getByRole('button', { name: 'Ver evidencia' }).click();
  await expect(page.locator('[data-pdf-dialog]')).toBeVisible();
  await expect(page.locator('[data-pdf-dialog] iframe')).toHaveAttribute(
    'src',
    /Pruebas\.pdf#page=1/,
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-pdf-dialog]')).not.toBeVisible();
  await page.getByRole('tab', { name: 'Documento original' }).click();
  await expect(page.locator('.pdf-viewer')).toBeVisible();
});

test('publica la lista final de evidencias verificadas', async ({ page }) => {
  await page.goto('/actividades/actividad-4-del-diagnostico-a-la-accion/');
  await expect(
    page.getByRole('heading', { name: 'Lista de evidencias actualizada' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Captura del diagnóstico' })).toHaveAttribute(
    'href',
    '/documents/Pruebas.pdf#page=7',
  );
  await expect(
    page.getByRole('link', { name: 'Instrumento diagnóstico', exact: true }),
  ).toHaveAttribute('href', '#instrumento-diagnostico');
  await expect(page.getByRole('link', { name: 'Carrusel de presupuesto' })).toHaveAttribute(
    'href',
    '/documents/publi2.pdf',
  );
  await expect(page.getByRole('link', { name: 'Plantilla editable en Canva' })).toHaveAttribute(
    'href',
    'https://www.canva.com/d/osljqsu323O_2OF',
  );
  await expect(page.getByText(/37 reacciones, 6 comentarios y 1 compartido/)).toBeVisible();
});

test('publica la plantilla de presupuesto editable como recurso', async ({ page }) => {
  await page.goto('/recursos/');
  const template = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Plantilla reutilizable de presupuesto' }),
  });
  await expect(template.getByText('Disponible', { exact: true })).toBeVisible();
  await expect(template.getByRole('link', { name: 'Abrir plantilla editable' })).toHaveAttribute(
    'href',
    'https://www.canva.com/d/osljqsu323O_2OF',
  );
  await expect(template.getByRole('link', { name: 'Abrir plantilla editable' })).toHaveAttribute(
    'target',
    '_blank',
  );
});

test('muestra un error recuperable si el PDF no está disponible', async ({ page }) => {
  await page.route('**/documents/actividad-2-original.pdf', (route) => route.abort());
  await page.goto('/documentos/actividad-2-publica/');
  await page.getByRole('tab', { name: 'Documento original' }).click();
  await expect(page.locator('[data-status]')).toContainText('No se pudo cargar el PDF', {
    timeout: 30_000,
  });
});
