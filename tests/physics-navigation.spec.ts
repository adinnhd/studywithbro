import { expect, test, type Page } from '@playwright/test'

const physics = '/ipa/fisika'
const katrol = `${physics}/katrol`
const energy = `${physics}/usaha-dan-energi`
const machines = `${physics}/pesawat-sederhana`
const categories = [
  {
    path: energy,
    title: 'Usaha dan Energi',
    description: 'Pelajari bagaimana gaya, gerak, dan energi saling berkaitan.',
    lessons: [
      ['usaha-dan-perpindahan', 'Usaha dan Perpindahan'],
      ['energi-kinetik-dan-potensial', 'Energi Kinetik dan Potensial'],
      ['energi-mekanik-dan-kekekalannya', 'Energi Mekanik dan Kekekalannya'],
      ['transformasi-energi', 'Transformasi Energi'],
      ['hubungan-usaha-dan-energi', 'Hubungan Usaha dan Energi'],
      ['daya', 'Daya'],
    ],
  },
  {
    path: machines,
    title: 'Pesawat Sederhana',
    description: 'Kenali cara kerja alat yang membantu meringankan pekerjaan.',
    lessons: [
      ['tuas', 'Tuas'],
      ['bidang-miring', 'Bidang Miring'],
      ['roda-berporos', 'Roda Berporos'],
    ],
  },
]

function card(page: Page, title: string) {
  return page
    .locator('.topic-card')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
}

test('Fisika lists exactly two browsable categories and Katrol belongs to Pesawat Sederhana', async ({
  page,
}) => {
  await page.goto(physics)
  await expect(page.locator('.topic-card')).toHaveCount(2)
  await expect(page.locator('.topic-card h3')).toHaveText(
    categories.map((category) => category.title),
  )
  await expect(page.locator(`.topic-card[href="${katrol}"]`)).toHaveCount(0)
  for (const category of categories) {
    await expect(card(page, category.title)).toContainText(category.description)
    await card(page, category.title).click()
    await expect(page).toHaveURL(category.path)
    await expect(page.locator('h1')).toHaveText(category.title)
    await expect(page.locator('.topic-card')).toHaveCount(
      category.lessons.length + (category.path === machines ? 1 : 0),
    )
    for (const [slug, title] of category.lessons) {
      await expect(card(page, title)).toHaveAttribute('href', `${category.path}/${slug}`)
      await expect(card(page, title)).toContainText('Coming Soon')
      await expect(card(page, title)).not.toHaveClass(/available/)
    }
    if (category.path === machines) {
      await expect(card(page, 'Katrol')).toHaveClass(/available/)
      await expect(card(page, 'Katrol')).toHaveAttribute('href', katrol)
      await card(page, 'Katrol').click()
      await expect(page).toHaveURL(katrol)
      const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })
      await expect(breadcrumb.locator(':scope > span')).toHaveText([
        'IPA',
        'Fisika',
        'Pesawat Sederhana',
        'Katrol',
      ])
      await page.getByRole('link', { name: 'Kembali', exact: true }).click()
      await expect(page).toHaveURL(machines)
    }
    await page.getByRole('link', { name: 'Kembali', exact: true }).click()
    await expect(page).toHaveURL(physics)
  }
})

test('all nine placeholders have their own route, heading, breadcrumb and parent return links', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
  })
  for (const category of categories) {
    await page.goto(category.path)
    for (const [slug, title] of category.lessons) {
      const path = `${category.path}/${slug}`
      await card(page, title).click()
      await expect(page).toHaveURL(path)
      await expect(page.locator('h1')).toHaveText(title)
      await expect(page.locator('.coming-soon > .eyebrow')).toHaveText('Coming Soon')
      await expect(page.locator('.coming-soon > p')).toHaveText('Materi sedang disiapkan.')
      await expect(
        page.locator('.coming-soon input, .coming-soon math, .coming-soon .pulley-svg'),
      ).toHaveCount(0)
      await expect(page).toHaveTitle(`${title} — studywithbro`)
      const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })
      await expect(breadcrumb.locator(':scope > span')).toHaveText([
        'IPA',
        'Fisika',
        category.title,
        title,
      ])
      await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(title)
      await expect(
        page.getByRole('link', { name: `Kembali ke ${category.title}`, exact: true }),
      ).toHaveAttribute('href', category.path)
      await page.reload()
      await expect(page.locator('h1')).toHaveText(title)
      await page.getByRole('link', { name: `Kembali ke ${category.title}`, exact: true }).click()
      await expect(page).toHaveURL(category.path)
      await card(page, title).click()
      await breadcrumb.getByRole('link', { name: category.title, exact: true }).click()
      await expect(page).toHaveURL(category.path)
      await card(page, title).click()
      await page.getByRole('link', { name: 'Kembali', exact: true }).click()
      await expect(page).toHaveURL(category.path)
    }
  }
  await page.goto(`${energy}/belum-ada`)
  await expect(page.locator('h1')).toHaveText('Sepertinya salah belok.')
  expect(errors).toEqual([])
})

test('new categories and nested placeholders do not overflow at narrow and tablet widths', async ({
  page,
}) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of [
      physics,
      ...categories.flatMap((category) => [
        category.path,
        ...category.lessons.map(([slug]) => `${category.path}/${slug}`),
      ]),
    ]) {
      await page.goto(path)
      await expect(page.locator('h1')).toBeVisible()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        `${path} at ${width}px`,
      ).toBeLessThanOrEqual(1)
    }
  }
})

test('existing quiz storage and legacy routes survive curriculum navigation', async ({ page }) => {
  await page.goto(physics)
  const saved = {
    'studywithbro:katrol:latihan-a:v1': JSON.stringify({
      version: 1,
      answers: { 1: 'B' },
      currentIndex: 0,
      submitted: false,
    }),
    'studywithbro:katrol:latihan-b:v1': JSON.stringify({
      version: 1,
      answers: { 1: 'D' },
      currentIndex: 0,
      submitted: false,
    }),
    'studywithbro:katrol:latihan-c:v1': JSON.stringify({
      version: 1,
      answers: { 1: 'D' },
      currentIndex: 0,
      submitted: true,
    }),
  }
  await page.evaluate((saved) => {
    for (const [key, value] of Object.entries(saved)) localStorage.setItem(key, value)
  }, saved)
  for (const id of ['a', 'b', 'c']) {
    await page.goto(`${katrol}/latihan/${id}`)
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(breadcrumb.locator(':scope > span')).toHaveText([
      'IPA',
      'Fisika',
      'Pesawat Sederhana',
      'Katrol',
      'Latihan Soal',
      `Latihan ${id.toUpperCase()}`,
    ])
    if (id === 'c')
      await expect(page.locator('.quiz-score-circle')).toHaveAccessibleName(
        'Nilai kamu: 5 dari 100',
      )
    else {
      await expect(page.locator('#current-question-title')).toHaveText('Soal 01')
      await expect(page.getByRole('radio', { checked: true })).toHaveCount(1)
      await expect(page.locator('.quiz-progress')).toContainText('1 dari 20 soal terjawab')
    }
    await expect(page.getByRole('link', { name: 'Unduh PDF Soal', exact: true })).toHaveAttribute(
      'href',
      `/latihan/katrol/Studywithbro_Paket_${id.toUpperCase()}_Soal.pdf`,
    )
    await breadcrumb.getByRole('link', { name: 'Pesawat Sederhana', exact: true }).click()
    await expect(page).toHaveURL(machines)
    await card(page, 'Katrol').click()
    await expect(page).toHaveURL(katrol)
    await page.getByRole('link', { name: 'Kembali', exact: true }).click()
    await expect(page).toHaveURL(machines)
    await page.getByRole('link', { name: 'Kembali', exact: true }).click()
    await card(page, 'Usaha dan Energi').click()
    await expect(page).toHaveURL(energy)
  }
  expect(
    await page.evaluate(
      (keys) => Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)])),
      Object.keys(saved),
    ),
  ).toEqual(saved)
  await page.goto(`${katrol}/latihan`)
  await expect(
    page
      .getByRole('navigation', { name: 'Breadcrumb' })
      .getByRole('link', { name: 'Pesawat Sederhana', exact: true }),
  ).toHaveAttribute('href', machines)
  await page.getByRole('link', { name: 'Kembali', exact: true }).click()
  await expect(page).toHaveURL(katrol)
})
