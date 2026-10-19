import { expect, test } from '@playwright/test'

const base = '/ipa/fisika/katrol'

test('all routes load without runtime errors, failed assets or horizontal overflow', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
  })
  for (const route of [
    '/',
    '/ipa',
    '/ipa/fisika',
    base,
    `${base}/latihan`,
    ...['a', 'b', 'c'].map((id) => `${base}/latihan/${id}`),
    '/matematika',
    '/ipa/kimia',
    '/ipa/biologi',
    '/coming-soon',
    '/ipa/fisika/materi-lainnya',
    '/not-a-route',
    `${base}/latihan/z`,
  ]) {
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page).toHaveTitle(/studywithbro/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'id')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow, `overflow on ${route}`).toBeLessThanOrEqual(1)
  }
  expect(errors).toEqual([])
})

test('home lab is interactive and learning navigation works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Belajar nggakharus ngebosenin.')
  const slider = page.getByRole('slider', { name: 'Ketinggian beban lab mini' })
  await slider.fill('70')
  await expect(page.locator('.preview-slider strong')).toHaveText('70 cm')
  await expect(page.locator('.hero-lab svg.pulley-svg')).toHaveAccessibleDescription(
    /Beban naik 70 cm.*140 cm/,
  )
  await page.getByRole('link', { name: 'Coba Simulasi Katrol' }).click()
  await expect(page).toHaveURL(`${base}#simulasi`)
  await expect(page.getByRole('heading', { name: 'Sekarang, giliran kamu.' })).toBeInViewport()
  await page.getByRole('link', { name: 'Latihan Soal', exact: false }).click()
  await expect(page).toHaveURL(`${base}/latihan`)
})

test('physics inputs, all compound configurations, lift and reset work', async ({ page }) => {
  await page.goto(`${base}#simulasi`)
  await expect(page.getByLabel('Gravitasi', { exact: true })).toHaveValue('10')
  await expect(page.locator('.stat-card').nth(0).locator('strong')).toHaveText('500')
  const mass = page.getByLabel('Massa beban', { exact: true })
  await mass.fill('200')
  await expect(page.locator('.stat-card').nth(2).locator('strong')).toHaveText('2.000')
  await page.getByRole('button', { name: '02 Katrol bergerak' }).click()
  await expect(page.locator('.stat-card').nth(2).locator('strong')).toHaveText('1.000')
  await expect(page.locator('.insight-note')).toContainText('Dua ruas tali')
  await page.getByRole('button', { name: '03 Katrol majemuk' }).click()
  for (let n = 1; n <= 10; n++) {
    await page.getByRole('slider', { name: /Ruas tali penopang/ }).fill(String(n))
    await expect(page.locator('.stat-card').nth(1).locator('strong')).toHaveText(String(n))
    await expect(page.locator('.visual-panel svg.pulley-svg')).toHaveAccessibleDescription(
      new RegExp(`Tali hijau bernomor menopang beban`),
    )
    expect(
      await page
        .locator('.visual-panel svg.pulley-svg')
        .evaluate(
          (svg) => svg.querySelectorAll('g[transform^="translate"] > circle[r="9"]').length,
        ),
    ).toBe(n)
  }
  await page.getByRole('slider', { name: /Ruas tali penopang/ }).fill('4')
  await page.getByRole('slider', { name: /Ketinggian angkat/ }).fill('10')
  await expect(page.locator('.stat-card').nth(2).locator('strong')).toHaveText('500')
  await expect(page.locator('.stat-card').nth(3).locator('strong')).toHaveText('40')
  await expect(page.locator('.calculation-answer').last()).toContainText('F = 500 N')
  await page.getByLabel('Gravitasi', { exact: true }).fill('9.8')
  await expect(page.locator('.stat-card').nth(0).locator('strong')).toHaveText('1.960')
  await page.getByRole('button', { name: 'Reset simulasi' }).click()
  await expect(mass).toHaveValue('50')
  await expect(page.getByLabel('Gravitasi', { exact: true })).toHaveValue('10')
  await expect(page.locator('.stat-card').nth(2).locator('strong')).toHaveText('500')
  await expect(page.locator('.stat-card').nth(3).locator('strong')).toHaveText('0')
})

test('invalid numeric values preserve last valid results and explain the error', async ({
  page,
}) => {
  await page.goto(`${base}#simulasi`)
  const mass = page.getByLabel('Massa beban', { exact: true })
  await mass.fill('-5')
  await expect(mass).toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('#mass-error')).toHaveText('Masukkan angka 0–1000.')
  await expect(page.locator('.stat-card').nth(0).locator('strong')).toHaveText('500')
  await mass.blur()
  await expect(mass).toHaveValue('50')
  const gravity = page.getByLabel('Gravitasi', { exact: true })
  await gravity.fill('0')
  await expect(gravity).toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('.stat-card').nth(2).locator('strong')).toHaveText('500')
  await gravity.blur()
  await expect(gravity).toHaveValue('10')
  await mass.fill('0')
  await expect(page.locator('.stat-card').nth(2).locator('strong')).toHaveText('0')
})

test('formula triangle supports pointer and keyboard selection', async ({ page }) => {
  await page.goto(base)
  for (const [symbol, equation] of [
    ['W', 'W = KM × F'],
    ['KM', 'KM = W / F'],
    ['F', 'F = W / KM'],
  ]) {
    const button = page.getByRole('button', { name: `Cari ${symbol}`, exact: true })
    await button.focus()
    await page.keyboard.press('Enter')
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.selected-equation')).toHaveText(equation)
  }
  await expect(page.locator('.mnemonic-card')).toContainText('Kamar Mandi')
})

test('animation advances in one direction, pauses and respects reduced motion', async ({
  page,
}) => {
  await page.goto(`${base}#simulasi`)
  await page.getByRole('button', { name: '03 Katrol majemuk' }).click()
  await page.getByRole('button', { name: 'Putar animasi' }).click()
  await expect
    .poll(async () => Number(await page.locator('#lift-height').inputValue()))
    .toBeGreaterThan(2)
  await page.getByRole('button', { name: 'Jeda animasi' }).click()
  const stopped = await page.locator('#lift-height').inputValue()
  await page.waitForTimeout(150)
  expect(await page.locator('#lift-height').inputValue()).toBe(stopped)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.getByRole('button', { name: 'Putar animasi' })).toBeDisabled()
  await page.getByRole('slider', { name: /Ketinggian angkat/ }).fill('50')
  await expect(page.locator('.stat-card').nth(3).locator('strong')).toHaveText('200')
})

test('all three exercise cards open a quiz and offer question-only PDF downloads', async ({
  page,
}) => {
  await page.goto(`${base}/latihan`)
  for (const id of ['a', 'b', 'c']) {
    const label = `Latihan ${id.toUpperCase()}`
    await expect(
      page.getByRole('link', { name: `Unduh PDF Soal ${label}`, exact: true }),
    ).toHaveAttribute('download', '')
    await page.getByRole('link', { name: `Kerjakan ${label}` }).click()
    await expect(page).toHaveURL(`${base}/latihan/${id}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Latihan ${id.toUpperCase()}.`)
    await expect(page.getByRole('radio')).toHaveCount(5)
    await expect(page.getByRole('link', { name: 'Unduh PDF Soal', exact: true })).toHaveAttribute(
      'download',
      '',
    )
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: 'Unduh PDF Soal', exact: true }).click(),
    ])
    expect(download.suggestedFilename()).toBe(`Studywithbro_Paket_${id.toUpperCase()}_Soal.pdf`)
    expect(await page.locator('object').count()).toBe(0)
    await page.getByRole('link', { name: 'Latihan Soal', exact: true }).first().click()
  }
})

test('navigation menu and breadcrumbs lead to working categories', async ({ page, isMobile }) => {
  await page.goto('/')
  if (isMobile) await page.getByRole('button', { name: 'Buka menu' }).click()
  await page
    .getByRole('navigation', { name: 'Navigasi utama' })
    .getByRole('link', { name: /Jelajahi Materi/ })
    .click()
  await expect(page).toHaveURL('/ipa')
  await page
    .locator('.subject-card')
    .filter({ has: page.getByRole('heading', { name: 'Fisika', exact: true }) })
    .click()
  await expect(page).toHaveURL('/ipa/fisika')
  await page
    .locator('.topic-card')
    .filter({ has: page.getByRole('heading', { name: 'Pesawat Sederhana', exact: true }) })
    .click()
  await expect(page).toHaveURL('/ipa/fisika/pesawat-sederhana')
  await page
    .locator('.topic-card')
    .filter({ has: page.getByRole('heading', { name: 'Katrol', exact: true }) })
    .click()
  await expect(page).toHaveURL(base)
  await page
    .getByRole('navigation', { name: 'Breadcrumb' })
    .getByRole('link', { name: 'IPA', exact: true })
    .click()
  await expect(page).toHaveURL('/ipa')
})

test('SVG geometry stays inside the drawing and narrow viewports do not overflow', async ({
  page,
}) => {
  await page.goto(`${base}#simulasi`)
  for (const width of [320, 360, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    for (const type of ['01 Katrol tetap', '02 Katrol bergerak', '03 Katrol majemuk']) {
      await page.getByRole('button', { name: type }).click()
      const strands = type.startsWith('03') ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [0]
      for (const n of strands) {
        if (n) await page.locator('#strands').fill(String(n))
        for (const h of [0, 100]) {
          await page.locator('#lift-height').fill(String(h))
          const box = await page.locator('.visual-panel .pulley-svg').evaluate((element) => {
            const svg = element as SVGSVGElement
            const drawing = svg.getBBox()
            const bounds = svg.viewBox.baseVal
            return {
              left: drawing.x - bounds.x,
              right: bounds.x + bounds.width - drawing.x - drawing.width,
              top: drawing.y - bounds.y,
              bottom: bounds.y + bounds.height - drawing.y - drawing.height,
            }
          })
          for (const [edge, distance] of Object.entries(box))
            expect(distance, `${type}, n=${n}, h=${h}, ${width}px, ${edge}`).toBeGreaterThanOrEqual(
              0,
            )
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
          ).toBeLessThanOrEqual(1)
        }
      }
    }
  }
})
