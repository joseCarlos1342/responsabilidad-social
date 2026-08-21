import { expect, test } from '@playwright/test';

test('carga la portada con su propuesta y navegación principal', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page).toHaveTitle(/Educación financiera/);
  await expect(page.locator('h1')).toContainText('Decisiones que sí suman');
  await expect(page.getByRole('link', { name: 'Explorar actividades' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('.home-links__grid .big-link')).toHaveCount(3);
  await expect(page.getByRole('navigation', { name: 'Accesos prioritarios' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Aprender por tema' })).toHaveAttribute(
    'href',
    '/recursos/',
  );
  await expect(page.locator('.priority-link--warm')).toHaveAttribute('href', '/resultados/');
  await expect(page.getByRole('link', { name: 'Revisar evidencias' })).toHaveAttribute(
    'href',
    '/documentos/',
  );
  const horizontalLayout = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    cardsFit: [...document.querySelectorAll('.home-links__grid .big-link')].every((card) => {
      const cardBox = card.getBoundingClientRect();
      const gridBox = card.parentElement?.getBoundingClientRect();
      return Boolean(gridBox && cardBox.left >= gridBox.left && cardBox.right <= gridBox.right + 1);
    }),
  }));
  expect(horizontalLayout.pageWidth).toBe(horizontalLayout.viewportWidth);
  expect(horizontalLayout.cardsFit).toBe(true);
});

test('orienta la sección actual en la navegación global', async ({ page }) => {
  const sections = [
    ['/recursos/', 'Aprender'],
    ['/resultados/', 'Resultados'],
    ['/documentos/', 'Evidencias'],
    ['/actividades/', 'Proyecto'],
    ['/plan-humanidades-digitales/', 'Proyecto'],
  ] as const;
  for (const [route, label] of sections) {
    await page.goto(route);
    await expect(page.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  }
  await page.goto('/resultados/');
  await expect(page.getByRole('heading', { name: 'Resultados del proyecto' })).toBeVisible();
});

test('mantiene válidas las anclas de accesos temáticos e índices', async ({ page }) => {
  await page.goto('/recursos/');
  const topicLinks = await page
    .locator('.topic-navigation a')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute('href'))
        .filter((href): href is string => Boolean(href)),
    );
  for (const href of topicLinks) {
    await expect(page.locator(href)).toHaveCount(1);
  }

  await page.goto('/actividades/actividad-4-del-diagnostico-a-la-accion/');
  const tocLinks = await page
    .locator('.toc a')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute('href'))
        .filter((href): href is string => Boolean(href)),
    );
  for (const href of tocLinks) {
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('presenta una firma editorial y anima datos sin alterar su geometría', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const balanceLine = page.locator('[data-motion="balance-line"]');
  await expect(balanceLine).toBeVisible();
  const lineMotion = await balanceLine.evaluate((element) => {
    const style = getComputedStyle(element, '::before');
    return { animationName: style.animationName, height: style.height };
  });
  expect(lineMotion.animationName).toContain('balance-line-draw');
  expect(lineMotion.height).toBe('2px');

  const comparisonBar = page.locator('[data-motion-bar]').first();
  const initialGeometry = await comparisonBar.evaluate((element) => ({
    width: (element as HTMLElement).offsetWidth,
    height: (element as HTMLElement).offsetHeight,
  }));
  await comparisonBar.scrollIntoViewIfNeeded();
  await expect(comparisonBar).toHaveAttribute('data-motion-state', 'running');
  const animatedGeometry = await comparisonBar.evaluate((element) => ({
    width: (element as HTMLElement).offsetWidth,
    height: (element as HTMLElement).offsetHeight,
  }));
  await expect(comparisonBar).toHaveAttribute('data-motion-state', 'complete');
  const finalGeometry = await comparisonBar.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      layoutWidth: (element as HTMLElement).offsetWidth,
      layoutHeight: (element as HTMLElement).offsetHeight,
      paintedWidth: rect.width,
    };
  });
  expect(initialGeometry).toEqual(animatedGeometry);
  expect(finalGeometry.layoutWidth).toBe(initialGeometry.width);
  expect(finalGeometry.layoutHeight).toBe(initialGeometry.height);
  expect(finalGeometry.paintedWidth).toBeCloseTo(finalGeometry.layoutWidth, 0);
});

test('mantiene firma y datos visibles con movimiento reducido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const balanceLine = page.locator('[data-motion="balance-line"]');
  const lineAnimation = await balanceLine.evaluate(
    (element) => getComputedStyle(element, '::before').animationName,
  );
  expect(lineAnimation).toBe('none');

  const comparisonBar = page.locator('[data-motion-bar]').first();
  await comparisonBar.scrollIntoViewIfNeeded();
  await expect(comparisonBar).toHaveAttribute('data-motion-state', 'reduced');
  await expect(comparisonBar).toHaveCSS('transform', 'none');

  await page.goto('/encuesta-cierre/');
  const surveyBar = page.locator('[data-motion-bar]').first();
  await expect(surveyBar).toHaveAttribute('data-motion-state', 'reduced');
  await expect(surveyBar).toHaveCSS('transform', 'none');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /abrir menú/i }).click();
  await expect(page.locator('#site-nav')).toHaveCSS('animation-name', 'none');
});

test('conserva las visualizaciones cuando Web Animations API no está disponible', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, 'animate', {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto('/');

  const comparisonBar = page.locator('[data-motion-bar]').first();
  await comparisonBar.scrollIntoViewIfNeeded();
  await expect(comparisonBar).toHaveAttribute('data-motion-state', 'complete');
  await expect(comparisonBar).toHaveCSS('transform', 'none');
  expect(errors).toEqual([]);
});

test('muestra los enlaces profesionales del autor', async ({ page }) => {
  await page.goto('/sobre-el-autor/');
  const links = [
    ['Portafolio profesional', 'https://portafoliojosecarlos.com/'],
    ['GitHub del proyecto', 'https://github.com/joseCarlos1342/responsabilidad-social'],
    ['Perfil de LinkedIn', 'https://www.linkedin.com/in/josecarlos-gomez-ing/'],
  ] as const;
  for (const [name, href] of links) {
    const link = page.getByRole('link', { name: new RegExp(name) });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
});

test('ofrece acceso directo a los tres videos desde la navegación', async ({ page }) => {
  await page.goto('/');
  const videoMenu = page.getByRole('group', { name: 'Videos del proyecto' });
  await expect(videoMenu).toBeVisible();
  await videoMenu.getByText('Videos', { exact: true }).click();
  await expect(videoMenu.getByRole('link', { name: /Entrevista/ })).toHaveAttribute(
    'href',
    '/#entrevista',
  );
  await expect(videoMenu.getByRole('link', { name: /Webinar/ })).toHaveAttribute(
    'href',
    '/#webinar',
  );
  await expect(videoMenu.getByRole('link', { name: /Informe final/ })).toHaveAttribute(
    'href',
    '/actividades/actividad-6-de-la-informacion-a-la-accion/#video-reflexion',
  );
  await videoMenu.getByRole('link', { name: /Informe final/ }).click();
  await expect(page).toHaveURL(/actividad-6-de-la-informacion-a-la-accion\/#video-reflexion/);
  await expect(page.locator('#video-reflexion')).toBeVisible();
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
      `/documents/publicaciones/publicacion-0${index + 1}.pdf`,
    );
    const facebookLink = card.getByRole('link', { name: /Ver publicación .* Facebook/ });
    await expect(facebookLink).toHaveAttribute('href', facebookUrl);
    await expect(facebookLink).toHaveAttribute('target', '_blank');
    await expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      (await request.get(`/documents/publicaciones/publicacion-0${index + 1}.pdf`)).ok(),
    ).toBeTruthy();
  }

  for (const number of [5, 6]) {
    const card = page.locator(`[data-publication="${number}"]`);
    await expect(card.locator('img')).toHaveAttribute('alt', /Primera página/);
    await expect(card.locator('img')).toHaveCSS('object-fit', 'contain');
    await expect(card.locator('a.button')).toHaveAttribute(
      'href',
      `/documents/publicaciones/publicacion-0${number}.pdf`,
    );
    await expect(card.getByText('Enlace individual no disponible')).toBeVisible();
    expect(
      (await request.get(`/documents/publicaciones/publicacion-0${number}.pdf`)).ok(),
    ).toBeTruthy();
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
  await expect(page.getByText('Actualizado: 14/8/2026')).toBeVisible();
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
    page.getByText(/seis respuestas posteriores permiten observar tendencias/),
  ).toBeVisible();
  const reportLink = page.getByRole('link', { name: 'Descargar diagnóstico XLSX' });
  await expect(reportLink).toBeVisible();
  await expect(reportLink).toHaveAttribute('download', '');
  const reportColors = await reportLink.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, background: styles.backgroundColor };
  });
  expect(reportColors.color).not.toBe(reportColors.background);
  await expect(page.getByRole('link', { name: /diagnóstico inicial agregado/i })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /¿Cómo manejamos nuestro dinero?/i }),
  ).toBeVisible();

  await page.goto('/plan-humanidades-digitales/');
  await expect(page.getByRole('heading', { name: 'Plan de Humanidades Digitales' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cronograma de semanas 4 a 7' })).toBeVisible();

  await page.getByRole('tab', { name: 'Versión pública (PDF)' }).click();
  await expect(page.getByText('Edición pública revisada', { exact: true })).toBeVisible();
  await expect(page.locator('[data-pdf-viewer]')).toHaveAttribute(
    'data-src',
    '/documents/entregas/plan-humanidades-digitales-publico.pdf',
  );
});

test('difiere los reproductores y publica la autorización verificada', async ({
  page,
  request,
}) => {
  const externalVideoRequests: string[] = [];
  page.on('request', (request) => {
    if (/youtube|ytimg|googlevideo/iu.test(request.url()))
      externalVideoRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('[data-youtube-lite] iframe')).toHaveCount(0);
  await expect(page.locator('[data-youtube-lite]')).toHaveCount(2);
  await expect(page.getByText('AUTORIZACIÓN VERIFICADA', { exact: true })).toBeVisible();
  await expect(page.getByText('Leer transcripción completa del permiso')).toBeVisible();
  await expect(page.locator('#entrevista a[href*="youtu"]')).toHaveCount(1);
  await expect(page.locator('#entrevista video source')).toHaveAttribute(
    'src',
    '/media/video/permiso-entrevista.mp4',
  );
  expect((await request.get('/media/video/permiso-entrevista.mp4')).ok()).toBeTruthy();
  expect(externalVideoRequests).toEqual([]);
  await page.getByRole('button', { name: /Cargar reproductor de la entrevista/ }).click();
  await expect(page.locator('#entrevista [data-youtube-lite] iframe')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/mLFCR_STZ2Q?rel=0',
  );
  await page.getByRole('button', { name: /Cargar reproductor del webinar/ }).click();
  await expect(page.locator('[data-youtube-lite] iframe')).toHaveCount(2);
  await expect(page.locator('#webinar [data-youtube-lite] iframe')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/StYZ2l1TA3U?rel=0',
  );
  await expect(page.locator('[data-youtube-status]')).toHaveText([
    'Reproductor cargado. Usa los controles de YouTube.',
    'Reproductor cargado. Usa los controles de YouTube.',
  ]);
  const videoFrame = await page
    .locator('[data-youtube-frame]')
    .first()
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, ratio: rect.width / rect.height };
    });
  expect(videoFrame.width).toBeGreaterThan(600);
  expect(videoFrame.ratio).toBeCloseTo(16 / 9, 1);
  await expect(page.getByRole('link', { name: 'Ver rendimiento global' })).toHaveAttribute(
    'href',
    '/assets/evidencias/resultados/estadisticas-generales.png',
  );
});

test('filtra actividades progresivamente', async ({ page }) => {
  await page.goto('/actividades/');
  await expect(page.locator('.activity-item')).toHaveCount(3);
  await page.locator('select[name="status"]').selectOption('finalizada');
  await expect(page.locator('.activity-item:not([data-hidden="true"])')).toHaveCount(2);
  await expect(page.getByText('2 entradas visibles')).toBeVisible();
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

test('el menú móvil se cierra con Escape y devuelve el foco', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: /abrir menú/i });
  await menu.click();
  await expect(page.getByRole('link', { name: 'Aprender', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#site-nav')).toHaveAttribute('data-open', 'false');
  await expect(menu).toBeFocused();
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
  await page.goto('/');
  await expect(page).toHaveTitle('Educación financiera | Decisiones que sí suman');
  await expect(page.locator('link[rel="icon"][type="image/png"]')).toHaveAttribute(
    'href',
    '/favicon-32x32.png',
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/apple-touch-icon.png',
  );
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest');
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
  const ogDescription = await page
    .locator('meta[property="og:description"]')
    .getAttribute('content');
  expect(ogTitle?.length).toBeLessThanOrEqual(60);
  expect(ogDescription?.length).toBeLessThanOrEqual(160);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /\/social-card\.png$/,
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');

  await page.goto('/actividades/actividad-4-del-diagnostico-a-la-accion/');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  expect((await request.get('/rss.xml')).ok()).toBeTruthy();
  expect((await request.get('/sitemap-index.xml')).ok()).toBeTruthy();
  expect((await request.get('/robots.txt')).ok()).toBeTruthy();
  expect((await request.get('/favicon.ico')).ok()).toBeTruthy();
  expect((await request.get('/apple-touch-icon.png')).ok()).toBeTruthy();
  const manifest = await request.get('/site.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  expect((await manifest.json()).name).toBe('Decisiones que sí suman');
  const llms = await request.get('/llms.txt');
  expect(llms.ok()).toBeTruthy();
  expect(await llms.text()).toContain('# Decisiones que sí suman');
});

test('incluye las referencias obligatorias de Semana 7 sin duplicarlas', async ({ page }) => {
  await page.goto('/referencias/');
  await expect(
    page.getByText(/Pacheco Duarte, J\. F\., & Archila Quiñones, S\. \(2020\)/),
  ).toHaveCount(1);
  await expect(page.getByText(/Pérez Carvajal, M\. R\., et al\. \(2022\)/)).toHaveCount(1);
});

test('difiere medios y renderizado fuera de pantalla en la portada', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#entrevista video')).toHaveAttribute('preload', 'none');
  const evidenceImages = page.locator('.impact-evidence img');
  await expect(evidenceImages).toHaveCount(2);
  for (const image of await evidenceImages.all()) {
    await expect(image).toHaveAttribute('width', /\d+/);
    await expect(image).toHaveAttribute('height', /\d+/);
  }
  await expect(page.locator('.journey-section')).toHaveCSS('content-visibility', 'auto');
});

for (const anchor of ['entrevista', 'webinar', 'alcance-digital']) {
  test(`mantiene estable la navegación directa a #${anchor}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#${anchor}`);
    const target = page.locator(`#${anchor}`);
    await expect(target).toBeVisible();
    await expect
      .poll(async () => Math.abs((await target.boundingBox())?.y ?? Number.POSITIVE_INFINITY))
      .toBeLessThan(2);
    const initialScroll = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(150);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - initialScroll)).toBeLessThan(2);
  });
}

test('muestra la biblioteca y las cuatro entregas', async ({ page }) => {
  await page.goto('/documentos/');
  await expect(page.getByRole('heading', { name: 'Documentos y entregas' })).toBeVisible();
  await expect(page.locator('.document-card')).toHaveCount(4);
  await expect(page.getByText('Actividad 2 · Decisiones que sí suman')).toBeVisible();
  await expect(page.getByText('Actividad 4 · Del diagnóstico a la acción')).toBeVisible();
  await expect(page.getByText('Actividad 6 · De la información a la acción')).toBeVisible();
  await expect(
    page.locator('.document-card').filter({ hasText: 'Plan de Humanidades Digitales' }),
  ).toBeVisible();
  await expect(page.locator('body')).not.toContainText('967350');
  await expect(page.getByRole('link', { name: /Ver versión pública/ })).toHaveCount(3);
  await expect(page.getByRole('link', { name: /Ver documento original/ })).toHaveCount(1);
});

test('publica Actividad 6 con video, resultados y material diferido', async ({ page, request }) => {
  const youtubeRequests: string[] = [];
  page.on('request', (currentRequest) => {
    if (/youtube|ytimg|googlevideo/iu.test(currentRequest.url()))
      youtubeRequests.push(currentRequest.url());
  });
  await page.goto('/actividades/actividad-6-de-la-informacion-a-la-accion/');
  await expect(page).toHaveTitle(
    'Decisiones que sí suman: de la información a la acción | Experiencia como agente social',
  );
  await expect(
    page.getByRole('heading', { name: 'Decisiones que sí suman: de la información a la acción' }),
  ).toBeVisible();
  await expect(page.getByText('Publicado: 10/8/2026')).toBeVisible();
  await expect(page.getByText('COMPLETADA', { exact: true }).first()).toBeVisible();
  await expect(page.locator('[data-youtube-lite] iframe')).toHaveCount(0);
  expect(youtubeRequests).toEqual([]);
  const finalVideo = page.locator('[data-video-id="bYAT98hbR-8"]');
  await expect(finalVideo).toBeVisible();
  expect(
    await finalVideo.locator('img').evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  const directLink = finalVideo.getByRole('link', { name: 'Abrir en YouTube' });
  await expect(directLink).toHaveAttribute('href', 'https://youtu.be/bYAT98hbR-8');
  await expect(directLink).toHaveAttribute('target', '_blank');
  await expect(directLink).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.getByText('Diagnóstico inicial n=16 · Evaluación posterior n=6')).toBeVisible();
  await expect(page.getByText(/54,7 % → 68,8 %/)).toBeVisible();
  await expect(page.getByText(/meta global de \+20 pp no se alcanzó/).first()).toBeVisible();
  await expect(page.getByText(/Conocimiento declarado: 50 % → 33,3 %/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'verse bajo demanda' })).toHaveAttribute(
    'href',
    '/documents/entregas/actividad-06-original.pdf',
  );
  await page.getByRole('button', { name: /Cargar informe final/ }).click();
  await expect(page.locator('[data-youtube-lite] iframe')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/bYAT98hbR-8?rel=0',
  );
  await expect(page.locator('[data-youtube-lite] iframe')).toHaveAttribute(
    'title',
    'Decisiones que sí suman | Informe final y autoevaluación de la Práctica en Responsabilidad Social',
  );
  await expect(
    page.getByRole('link', { name: 'video previo con voz en off', exact: true }),
  ).toHaveAttribute('href', 'https://youtu.be/YL1LWZWOzAk');
  expect((await request.get('/documents/entregas/actividad-06-original.pdf')).ok()).toBeTruthy();
});

test('Actividad 6 es legible en móvil y no desborda', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/actividades/actividad-6-de-la-informacion-a-la-accion/');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await expect(page.getByRole('button', { name: /Cargar informe final/ })).toBeVisible();
  await expect(page.getByText(/grupos no emparejados/).first()).toBeVisible();
});

test('rutas principales no producen errores de consola', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  for (const route of [
    '/',
    '/actividades/actividad-4-del-diagnostico-a-la-accion/',
    '/actividades/actividad-6-de-la-informacion-a-la-accion/',
  ]) {
    await page.goto(route);
  }
  expect(errors).toEqual([]);
});

test('navega entre versión web y PDF, renderiza páginas y conserva controles', async ({ page }) => {
  await page.goto('/documentos/actividad-4-publica/');
  const webTab = page.getByRole('tab', { name: 'Versión web' });
  const pdfTab = page.getByRole('tab', { name: 'Versión pública (PDF)' });
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
    for (let index = 0; index < 6; index += 1) (button as HTMLButtonElement).click();
  });
  await expect(page.locator('[data-status]')).toHaveText('Página 7 de 7 cargada.');
  await expect(page.locator('[data-page-input]')).toHaveValue('7');
  await expect(page.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: /Abrir PDF en otra pestaña/ }).click();
  await popupPromise;
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.pdf-toolbar a[download]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('actividad-04-publica.pdf');
});

test('carga directamente las ediciones PDF con contenido visible', async ({
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
    {
      route: '/documentos/actividad-2-publica/?vista=documento',
      pages: 4,
      tab: 'Versión pública (PDF)',
    },
    {
      route: '/documentos/actividad-4-publica/?vista=documento',
      pages: 7,
      tab: 'Versión pública (PDF)',
    },
    {
      route: '/documentos/actividad-6-publica/?vista=documento',
      pages: 13,
      tab: 'Documento original',
    },
  ];

  for (const document of documents) {
    await page.goto(document.route);
    await expect(page.getByRole('tab', { name: document.tab })).toHaveAttribute(
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
  await page.route('**/documents/entregas/actividad-02-publica.pdf', async (route) => {
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
  await expect(page.locator('[data-status]')).toHaveText('Página 1 de 4 cargada.');
});

test('actividad 4 no inventa resultados y funciona en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/actividades/actividad-4-del-diagnostico-a-la-accion/');
  await expect(page.getByText('diagnóstico se aplicó y cuenta con 16 respuestas')).toBeVisible();
  await expect(page.getByText('comenzó su aplicación')).toHaveCount(0);
  await expect(page.getByText('16 respuestas diagnósticas').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'estadísticas globales' })).toHaveAttribute(
    'href',
    '/assets/evidencias/resultados/estadisticas-generales.png',
  );
  await expect(page.locator('a[href*="Pruebas.pdf"]')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Versión pública (PDF)' }).click();
  await expect(page.locator('.pdf-viewer')).toBeVisible();
});

test('publica la lista final de evidencias verificadas', async ({ page }) => {
  await page.goto('/actividades/actividad-4-del-diagnostico-a-la-accion/');
  await expect(
    page.getByRole('heading', { name: 'Lista de evidencias actualizada' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Consolidado agregado' })).toHaveAttribute(
    'href',
    '#resultados-diagnostico',
  );
  await expect(
    page.getByRole('link', { name: 'Instrumento diagnóstico', exact: true }),
  ).toHaveAttribute('href', '#instrumento-diagnostico');
  await expect(page.getByRole('link', { name: 'Carrusel de presupuesto' })).toHaveAttribute(
    'href',
    '/documents/publicaciones/publicacion-02.pdf',
  );
  await expect(page.getByRole('link', { name: 'Plantilla editable en Canva' })).toHaveAttribute(
    'href',
    'https://www.canva.com/d/osljqsu323O_2OF',
  );
  await expect(
    page.getByText(
      /746 visualizaciones, 123 interacciones, 90 reacciones, 27 comentarios y 6 compartidos/,
    ),
  ).toBeVisible();
});

test('publica el dashboard con métricas y límites verificables', async ({ page, request }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Lo ejecutado, lo observado y sus límites.' }),
  ).toBeVisible();
  await expect(page.getByText('746').first()).toBeVisible();
  await expect(page.getByText('236 visualizaciones', { exact: true })).toBeVisible();
  await expect(page.getByText('Meta global evaluada, no alcanzada.')).toBeVisible();
  await expect(page.getByText('Semana 7 · Completada')).toBeVisible();
  const publicationStatBoxes = await page
    .locator('.publication-summary dl > div')
    .evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
      }),
    );
  expect(publicationStatBoxes[0]?.right).toBeLessThanOrEqual(publicationStatBoxes[1]?.left ?? 0);
  expect(publicationStatBoxes[2]?.right).toBeLessThanOrEqual(publicationStatBoxes[3]?.left ?? 0);
  for (const privatePath of [
    '/documents/Pruebas.pdf',
    '/documents/soportewebinar.jpg',
    '/documents/actividad-2-original.pdf',
    '/documents/actividad-4-original.pdf',
    '/documents/plan-responsabilidad-social-educacion-financiera.pdf',
    '/video/permiso.mov',
  ]) {
    expect((await request.get(privatePath)).status()).toBe(404);
  }
});

test('publica la encuesta final consolidada sin respuestas individuales', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/encuesta-cierre/');
  await expect(
    page.getByRole('heading', { name: 'Encuesta de cierre y seguimiento.' }),
  ).toBeVisible();
  await expect(page.locator('.survey-preview > li')).toHaveCount(6);
  await expect(page.getByText('RESULTADOS CONSOLIDADOS · N=9')).toBeVisible();
  await expect(page.getByText(/cuentan con resultados verificables/)).toBeVisible();
  await expect(page.getByText('4,6/5')).toBeVisible();
  await expect(page.getByText('5/5')).toBeVisible();
  await expect(page.getByText('100 %')).toBeVisible();
  await expect(page.locator('.theme-list li')).toHaveCount(3);
  await expect(page.getByText('Valoración integral del contenido')).toHaveCount(0);
  await expect(page.locator('.survey-evidence img')).toHaveCount(5);
  await expect(page.locator('.survey-evidence img').first()).toHaveAttribute(
    'src',
    '/assets/evidencias/encuesta-cierre/grafico-01.png',
  );
  const formLink = page.getByRole('link', { name: 'Abrir formulario' });
  await expect(formLink).toHaveAttribute('href', 'https://forms.gle/wswjtPct8SRjvuLB8');
  await expect(formLink).toHaveAttribute('target', '_blank');
  await expect(page.locator('a[href="https://forms.gle/wswjtPct8SRjvuLB8"]')).toHaveCount(1);
  const surveyLayout = await page.evaluate(() => {
    const intro = document.querySelector('.closure-survey__intro')?.getBoundingClientRect();
    const sheet = document.querySelector('.closure-survey__sheet')?.getBoundingClientRect();
    const title = document.querySelector('.closure-survey__intro h1');
    return {
      introRight: intro?.right ?? 0,
      sheetLeft: sheet?.left ?? 0,
      titleFits: title ? title.scrollWidth <= title.clientWidth : false,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  expect(surveyLayout.introRight).toBeLessThanOrEqual(surveyLayout.sheetLeft);
  expect(surveyLayout.titleFits).toBe(true);
  expect(surveyLayout.bodyWidth).toBe(surveyLayout.viewportWidth);
});

test('calcula localmente y publica recursos de cierre', async ({ page }) => {
  await page.goto('/recursos/');
  const calculator = page.locator('[data-emergency-calculator]');
  await calculator.locator('[name="essentialExpense"]').fill('1200000');
  await calculator.locator('[name="targetMonths"]').fill('3');
  await calculator.locator('[name="monthlySavings"]').fill('300000');
  await calculator.getByRole('button', { name: 'Calcular mi referencia' }).click();
  await expect(calculator.locator('[data-target-fund]')).toContainText('3.600.000');
  await expect(calculator.locator('[data-months-to-target]')).toHaveText('12 meses');
  await expect(page.getByRole('columnheader', { name: 'Opción A' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Opción B' })).toBeVisible();
  await expect(page.locator('.fraud-checklist li')).toHaveCount(8);
  await expect(page.getByText(/no se envían ni guardan los valores/)).toBeVisible();
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
  await page.route('**/documents/entregas/actividad-02-publica.pdf', (route) => route.abort());
  await page.goto('/documentos/actividad-2-publica/');
  await page.getByRole('tab', { name: 'Versión pública (PDF)' }).click();
  await expect(page.locator('[data-status]')).toContainText('No se pudo cargar el PDF', {
    timeout: 30_000,
  });
});
