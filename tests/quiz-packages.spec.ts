import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import sourceB from '../reference/katrol/paket-bc/data/latihan_b_katrol.json' with { type: 'json' }
import sourceC from '../reference/katrol/paket-bc/data/latihan_c_katrol.json' with { type: 'json' }
import { quizStorageKey, serializeQuiz } from '../src/lib/quiz/state'
import type { Answers } from '../src/types/quiz'

const base = '/ipa/fisika/katrol/latihan'

async function submit(page: Page) {
  await page
    .getByRole('button', { name: 'Selesai & Lihat Nilai' })
    .filter({ visible: true })
    .click()
  await page.getByRole('button', { name: 'Tetap kumpulkan' }).click()
  await expect(page.locator('.quiz-score-circle')).toBeVisible()
}

for (const [id, source] of [
  ['b', sourceB],
  ['c', sourceC],
] as const) {
  test(`${id}: all 20 source questions, SVG zoom, PDF download, 100 points and original explanations`, async ({
    page,
  }) => {
    const errors: string[] = []
    const solutionRequests: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => {
      if (/katrol[BC]?Solutions/.test(request.url())) solutionRequests.push(request.url())
    })
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
    })
    await page.goto(`${base}/${id}?view=review`)
    await expect(page.locator('h1')).toHaveText(`Latihan ${id.toUpperCase()}.`)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: 'Unduh PDF Soal', exact: true }).click(),
    ])
    expect(download.suggestedFilename()).toBe(`Studywithbro_Paket_${id.toUpperCase()}_Soal.pdf`)
    const pdf = await page.request.get(
      `/latihan/katrol/Studywithbro_Paket_${id.toUpperCase()}_Soal.pdf`,
    )
    expect(pdf.ok()).toBe(true)
    expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-')

    for (const q of source.questions) {
      await expect(page.locator('#current-question-title')).toHaveText(
        `Soal ${String(q.id).padStart(2, '0')}`,
      )
      await expect(page.locator('.quiz-question-text')).toHaveText(q.text)
      await expect(page.getByRole('radio')).toHaveCount(5)
      for (const [index, option] of q.options.entries())
        await expect(page.locator('.quiz-option-text').nth(index)).toHaveText(
          `${option.id}. ${option.text}`,
        )
      await expect(page.locator('.explanation-card')).toHaveCount(0)
      await expect(page.locator('.quiz-page')).not.toContainText(
        /MUDAH|SEDANG|SULIT|difficulty|proof/,
      )
      if (q.image) {
        const img = page.locator('.quiz-diagram > img')
        await expect(img).toHaveAttribute('src', q.image)
        await expect(img).toHaveAccessibleName(`Diagram katrol, diagram asli soal ${q.id}`)
        await expect
          .poll(() =>
            img.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0),
          )
          .toBe(true)
        await page.getByRole('button', { name: 'Perbesar diagram', exact: true }).click()
        await page.getByRole('button', { name: 'Perbesar diagram lagi' }).click()
        await expect(page.getByRole('dialog')).toContainText('200%')
        expect(
          await page
            .locator('.diagram-scroll')
            .evaluate((node) => node.scrollWidth > node.clientWidth),
        ).toBe(true)
        await page.keyboard.press('Escape')
      } else await expect(page.locator('.quiz-diagram')).toHaveCount(0)
      await page.getByRole('radio', { name: new RegExp(`^${q.correctAnswer}\\.`) }).check()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(1)
      if (q.id < 20) await page.getByRole('button', { name: 'Selanjutnya' }).click()
    }
    expect(solutionRequests).toEqual([])
    await page
      .getByRole('button', { name: 'Selesai & Lihat Nilai' })
      .filter({ visible: true })
      .click()
    await expect(page.getByRole('dialog')).toContainText('Semua 20 soal sudah dijawab')
    expect(solutionRequests).toEqual([])
    await page.getByRole('button', { name: 'Tetap kumpulkan' }).click()
    await expect(page.locator('.quiz-score-circle')).toHaveAccessibleName(
      'Nilai kamu: 100 dari 100',
    )
    expect(solutionRequests.some((url) => url.includes(`katrol${id.toUpperCase()}Solutions`))).toBe(
      true,
    )
    expect(
      solutionRequests.every((url) => url.includes(`katrol${id.toUpperCase()}Solutions`)),
    ).toBe(true)
    await page.reload()
    await expect(page.locator('.quiz-score-circle')).toHaveAccessibleName(
      'Nilai kamu: 100 dari 100',
    )
    await page.getByRole('button', { name: 'Lihat Pembahasan' }).click()
    await expect(page.locator('.quiz-review-card')).toHaveCount(20)
    await expect(page.locator('.quiz-status.status-correct')).toHaveCount(20)
    for (const [index, q] of source.questions.entries()) {
      const card = page.locator('.quiz-review-card').nth(index)
      await expect(card.locator('.quiz-question-text')).toHaveText(q.text)
      await expect(card.locator('.quiz-answer-summary')).toContainText(
        `Jawaban benar: ${q.correctAnswer}`,
      )
      // Fractions are rendered as MathML; compare the complete source text without fraction separators.
      expect(
        (await card.locator('.explanation-card p').textContent())?.replace(/[\s/()]/g, ''),
      ).toBe(q.explanation.replace(/[\s/()]/g, ''))
    }
    await page.getByRole('button', { name: /^Jawaban salah/ }).click()
    await expect(page.locator('.quiz-empty')).toBeVisible()
    expect(errors).toEqual([])
  })

  test(`${id}: empty submission scores 0, review stays gated, and retry clears only this attempt`, async ({
    page,
  }) => {
    await page.goto(`${base}/${id}#pembahasan`)
    await expect(page.locator('.quiz-review')).toHaveCount(0)
    await page
      .getByRole('button', { name: 'Selesai & Lihat Nilai' })
      .filter({ visible: true })
      .click()
    await expect(page.getByRole('dialog')).toContainText('20 soal belum dijawab')
    await page.getByRole('button', { name: 'Kembali mengerjakan' }).click()
    await submit(page)
    await expect(page.locator('.quiz-score-circle')).toHaveAccessibleName('Nilai kamu: 0 dari 100')
    await expect(page.locator('.quiz-result-stats .status-unanswered')).toContainText(
      '20Tidak dijawab',
    )
    await page.getByRole('button', { name: 'Lihat Pembahasan' }).click()
    await page.getByRole('button', { name: /^Belum dijawab/ }).click()
    await expect(page.locator('.quiz-review-card')).toHaveCount(20)
    await page.getByRole('button', { name: 'Coba Lagi' }).click()
    await page.getByRole('button', { name: 'Mulai ulang', exact: true }).click()
    await expect(page.locator('#current-question-title')).toHaveText('Soal 01')
    await expect(page.locator('.quiz-progress')).toContainText('0 dari 20 soal terjawab')
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), quizStorageKey(id)))
      .toBeNull()
    await page.reload()
    await expect(page.locator('.quiz-review')).toHaveCount(0)
  })

  test(`${id}: mixed answers score 60 and review filters distinguish wrong from empty`, async ({
    page,
  }) => {
    const answers = Object.fromEntries(
      source.questions
        .slice(0, 17)
        .map((q, i) => [q.id, i < 12 ? q.correctAnswer : q.correctAnswer === 'A' ? 'B' : 'A']),
    ) as Answers
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: quizStorageKey(id),
      value: serializeQuiz({ answers, currentIndex: 19, submitted: false }),
    })
    await page.goto(`${base}/${id}`)
    await expect(page.locator('.quiz-progress')).toContainText('17 dari 20 soal terjawab')
    await submit(page)
    await expect(page.locator('.quiz-score-circle')).toHaveAccessibleName('Nilai kamu: 60 dari 100')
    await expect(page.locator('.quiz-result-stats .status-correct')).toContainText('12Benar')
    await expect(page.locator('.quiz-result-stats .status-incorrect')).toContainText('5Salah')
    await expect(page.locator('.quiz-result-stats .status-unanswered')).toContainText(
      '3Tidak dijawab',
    )
    await page.getByRole('button', { name: 'Lihat Pembahasan' }).click()
    for (const [label, count] of [
      ['Jawaban salah', 5],
      ['Belum dijawab', 3],
      ['Jawaban benar', 12],
    ] as const) {
      await page.getByRole('button', { name: new RegExp(`^${label}`) }).click()
      await expect(page.locator('.quiz-review-card')).toHaveCount(count)
    }
  })

  test(`${id}: narrow layouts and automated accessibility checks cover question, SVG zoom, result and review`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 850 })
    const index = source.questions.findIndex((q) => q.image)
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: quizStorageKey(id),
      value: serializeQuiz({ answers: {}, currentIndex: index, submitted: false }),
    })
    await page.goto(`${base}/${id}`)
    const check = async () => {
      await page.evaluate(async () => {
        await document.fonts.ready
        await Promise.all(
          document
            .getAnimations()
            .filter((a) => a.effect?.getTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => undefined)),
        )
      })
      expect(
        (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
          .violations,
      ).toEqual([])
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(1)
    }
    await check()
    await page.getByRole('button', { name: 'Perbesar diagram', exact: true }).click()
    await check()
    await page.getByRole('button', { name: 'Perbesar diagram lagi' }).click()
    await page.getByRole('button', { name: 'Perbesar diagram lagi' }).click()
    await expect(page.getByRole('dialog')).toContainText('300%')
    await page.keyboard.press('Escape')
    await submit(page)
    await check()
    await page.getByRole('button', { name: 'Lihat Pembahasan' }).click()
    await check()
  })
}

test('SPA navigation, refresh and reset keep A, B and C attempts independent', async ({ page }) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value)
    },
    {
      key: quizStorageKey('a'),
      value: serializeQuiz({ answers: { 1: 'B' }, currentIndex: 4, submitted: false }),
    },
  )
  await page.goto(base)
  await page.getByRole('link', { name: 'Kerjakan Latihan B' }).click()
  await page.getByRole('radio', { name: 'D. 240 N', exact: true }).check()
  await page.getByRole('button', { name: 'Selanjutnya' }).click()
  await page.getByRole('link', { name: 'Latihan Soal', exact: true }).first().click()
  await page.getByRole('link', { name: 'Kerjakan Latihan C' }).click()
  await expect(page.locator('.quiz-progress')).toContainText('0 dari 20 soal terjawab')
  await page.getByRole('radio', { name: 'A. 150 N', exact: true }).check()
  await page.getByRole('button', { name: 'Selanjutnya' }).click()
  await page.getByRole('button', { name: 'Selanjutnya' }).click()
  await page.reload()
  await expect(page.locator('#current-question-title')).toHaveText('Soal 03')
  await page.getByRole('link', { name: 'Latihan Soal', exact: true }).first().click()
  await page.getByRole('link', { name: 'Kerjakan Latihan B' }).click()
  await expect(page.locator('#current-question-title')).toHaveText('Soal 02')
  await page.getByRole('button', { name: 'Sebelumnya' }).click()
  await expect(page.getByRole('radio', { name: 'D. 240 N', exact: true })).toBeChecked()
  const before = await page.evaluate(
    ({ a, c }) => ({ a: localStorage.getItem(a), c: localStorage.getItem(c) }),
    { a: quizStorageKey('a'), c: quizStorageKey('c') },
  )
  await submit(page)
  await expect(page.locator('.quiz-score-circle')).toHaveAccessibleName('Nilai kamu: 5 dari 100')
  await page.getByRole('button', { name: 'Coba Lagi' }).click()
  await page.getByRole('button', { name: 'Mulai ulang', exact: true }).click()
  await expect(page.locator('.quiz-progress')).toContainText('0 dari 20 soal terjawab')
  expect(
    await page.evaluate(
      ({ a, c }) => ({ a: localStorage.getItem(a), c: localStorage.getItem(c) }),
      { a: quizStorageKey('a'), c: quizStorageKey('c') },
    ),
  ).toEqual(before)
  await page.getByRole('link', { name: 'Latihan Soal', exact: true }).first().click()
  await page.getByRole('link', { name: 'Kerjakan Latihan A' }).click()
  await expect(page.locator('#current-question-title')).toHaveText('Soal 05')
  await expect(page.locator('.quiz-progress')).toContainText('1 dari 20 soal terjawab')
  await page
    .getByRole('button', { name: 'Selesai & Lihat Nilai' })
    .filter({ visible: true })
    .click()
  await page.getByRole('button', { name: 'Kembali mengerjakan' }).click()
  await expect(page.locator('.quiz-review')).toHaveCount(0)
  // Only the three participant PDFs are linked on the exercise listing.
  await page.getByRole('link', { name: 'Latihan Soal', exact: true }).first().click()
  await expect(page.locator('a[download]')).toHaveCount(3)
  for (const link of await page.locator('a[download]').all())
    expect(await link.getAttribute('href')).toMatch(/_Soal\.pdf$/)
})
