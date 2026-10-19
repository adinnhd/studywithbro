import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { katrolQuestions } from '../src/data/katrolQuestions'
import { QUIZ_STORAGE_KEY, serializeQuiz } from '../src/lib/quiz/state'
import type { Answers } from '../src/types/quiz'

const route = '/ipa/fisika/katrol/latihan/a'
const keys = 'B C C D C C D D C D C A C B D D B B C E'.split(' ')

async function jump(page: Page, id: number, isMobile: boolean) {
  if (isMobile) await page.getByRole('button', { name: 'Navigasi soal' }).click()
  const root = isMobile ? page.getByRole('dialog') : page.locator('.quiz-sidebar')
  await root.getByRole('button', { name: new RegExp(`^Soal ${id},`) }).click()
  await expect(page.locator('#current-question-title')).toHaveText(
    `Soal ${String(id).padStart(2, '0')}`,
  )
}

async function submit(page: Page) {
  await page
    .getByRole('button', { name: 'Selesai & Lihat Nilai' })
    .filter({ visible: true })
    .click()
  await page.getByRole('button', { name: 'Tetap kumpulkan' }).click()
  await expect(page.locator('.quiz-score-circle')).toBeVisible()
}

test('single answers persist across navigation, refresh and clearing, without spoilers or early solution requests', async ({
  page,
  isMobile,
}) => {
  const solutionRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('katrolSolutions')) solutionRequests.push(request.url())
  })
  await page.goto(`${route}?view=review#pembahasan`)
  await expect(page.locator('#current-question-title')).toHaveText('Soal 01')
  await expect(page.locator('.quiz-progress')).toContainText('0 dari 20 soal terjawab')
  await expect(page.locator('.explanation-card')).toHaveCount(0)
  await expect(page.locator('.quiz-result')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Lihat Pembahasan' })).toHaveCount(0)
  await expect(page.locator('.quiz-page')).not.toContainText(/MUDAH|SEDANG|SULIT|KM =|Gaya kuasa/)
  await expect(page.getByRole('button', { name: 'Sebelumnya' })).toBeDisabled()
  await page.getByRole('radio', { name: 'B. 160 N', exact: true }).check()
  await page.getByRole('radio', { name: 'C. 240 N', exact: true }).check()
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(1)
  await expect(page.locator('.quiz-progress')).toContainText('1 dari 20 soal terjawab')
  await page.getByRole('button', { name: 'Selanjutnya' }).click()
  await page.getByRole('radio', { name: 'C. 180 N', exact: true }).check()
  await jump(page, 1, isMobile)
  await expect(page.getByRole('radio', { name: 'C. 240 N', exact: true })).toBeChecked()
  await page.reload()
  await expect(page.getByRole('radio', { name: 'C. 240 N', exact: true })).toBeChecked()
  await page.getByRole('button', { name: 'Kosongkan jawaban' }).click()
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
  await expect(page.locator('.quiz-progress')).toContainText('1 dari 20 soal terjawab')
  await page.reload()
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
  await jump(page, 20, isMobile)
  await expect(page.getByRole('button', { name: 'Selanjutnya' })).toBeDisabled()
  if (isMobile) await page.getByRole('button', { name: 'Navigasi soal' }).click()
  const navigator = isMobile ? page.getByRole('dialog') : page.locator('.quiz-sidebar')
  await expect(navigator.getByRole('button', { name: /^Soal 1,/ })).not.toHaveClass(/is-answered/)
  await expect(navigator.getByRole('button', { name: /^Soal 2,/ })).toHaveClass(/is-answered/)
  await expect(navigator.getByRole('button', { name: /^Soal 20,/ })).toHaveAttribute(
    'aria-current',
    'step',
  )
  if (isMobile) await page.keyboard.press('Escape')
  const saved = await page.evaluate((key) => localStorage.getItem(key), QUIZ_STORAGE_KEY)
  expect(saved).not.toMatch(/correctAnswer|explanation/)
  expect(solutionRequests).toEqual([])
})

test('all questions match the source bank, all 7 diagrams load and zoom, and 320px layouts stay contained', async ({
  page,
  isMobile,
}) => {
  await page.goto(route)
  for (const question of katrolQuestions) {
    await jump(page, question.id, isMobile)
    expect(await page.getByRole('radio').count()).toBe(5)
    const expected = question.text.replace(/([Fs])_A/g, '$1ₐ').replace(/([Fs])_B/g, '$1ᵦ')
    await expect(page.locator('.quiz-question-text')).toHaveText(expected)
    if (question.statements) {
      await expect(page.locator('.quiz-statements li')).toHaveCount(5)
      for (const [i, text] of question.statements.entries())
        await expect(page.locator('.quiz-statements li').nth(i)).toContainText(text)
    }
    if (question.image) {
      const img = page.locator('.quiz-diagram > img')
      await expect(img).toBeVisible()
      expect(
        await img.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth === 485),
      ).toBe(true)
      await page.getByRole('button', { name: 'Perbesar diagram', exact: true }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByRole('button', { name: 'Perbesar diagram lagi' }).click()
      await expect(page.getByRole('dialog')).toContainText('200%')
      expect(
        await page
          .locator('.diagram-scroll')
          .evaluate((node) => node.scrollWidth > node.clientWidth),
      ).toBe(true)
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).toHaveCount(0)
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1)
  }
  await page.setViewportSize({ width: 320, height: 800 })
  for (const id of [3, 12, 15, 18, 20]) {
    await jump(page, id, true)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1)
  }
})

test('submission warns about blanks, allows cancellation, locks answers and supports review filters and reset', async ({
  page,
  isMobile,
}) => {
  await page.goto(route)
  await page.getByRole('radio', { name: 'B. 160 N', exact: true }).check()
  await page.getByRole('button', { name: 'Selanjutnya' }).click()
  await page.getByRole('radio', { name: 'A. 90 N', exact: true }).check()
  await page
    .getByRole('button', { name: 'Selesai & Lihat Nilai' })
    .filter({ visible: true })
    .click()
  await expect(page.getByRole('dialog')).toContainText('18 soal belum dijawab')
  await expect(page.getByRole('button', { name: 'Kembali mengerjakan' })).toBeFocused()
  await page.getByRole('button', { name: 'Kembali mengerjakan' }).click()
  await expect(page.getByRole('radio', { name: 'A. 90 N', exact: true })).toBeChecked()
  await submit(page)
  await expect(page.locator('.quiz-score-circle')).toHaveAccessibleName('Nilai kamu: 5 dari 100')
  await expect(page.locator('.quiz-result-stats > div').nth(0)).toContainText('1Benar')
  await expect(page.locator('.quiz-result-stats > div').nth(1)).toContainText('1Salah')
  await expect(page.locator('.quiz-result-stats > div').nth(2)).toContainText('18Tidak dijawab')
  await expect(page.locator('.quiz-accuracy')).toContainText('5%')
  await expect(page.getByRole('radio')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.quiz-score-circle')).toHaveAccessibleName('Nilai kamu: 5 dari 100')
  await page.getByRole('button', { name: 'Lihat Pembahasan' }).click()
  await expect(page.locator('.quiz-review-card')).toHaveCount(20)
  await expect(page.locator('.explanation-card')).toHaveCount(20)
  await expect(page.locator('.quiz-review-card').nth(0)).toContainText('Jawabanmu: B')
  await expect(page.locator('.quiz-review-card').nth(1)).toContainText('Jawabanmu: A')
  await expect(page.locator('.quiz-review-card').nth(1)).toContainText('Jawaban benar: C')
  await expect(page.locator('.quiz-review-card').nth(14)).toContainText(
    'Kombinasi pernyataan yang benar adalah D.',
  )
  await expect(page.locator('.quiz-review-card').nth(17)).toContainText('A memiliki n = 3')
  expect(
    await page
      .locator('math')
      .first()
      .evaluate((node) => node.namespaceURI),
  ).toBe('http://www.w3.org/1998/Math/MathML')
  for (const [label, count] of [
    ['Jawaban salah', 1],
    ['Belum dijawab', 18],
    ['Jawaban benar', 1],
    ['Semua soal', 20],
  ] as const) {
    await page.getByRole('button', { name: new RegExp(`^${label}`) }).click()
    await expect(page.locator('.quiz-review-card')).toHaveCount(count)
  }
  await page.getByRole('button', { name: 'Coba Lagi' }).click()
  await page.getByRole('button', { name: 'Batal', exact: true }).click()
  await expect(page.locator('.quiz-review-card')).toHaveCount(20)
  await page.getByRole('button', { name: 'Coba Lagi' }).click()
  await page.getByRole('button', { name: 'Mulai ulang', exact: true }).click()
  await expect(page.locator('#current-question-title')).toHaveText('Soal 01')
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
  await expect(page.locator('.quiz-progress')).toContainText('0 dari 20 soal terjawab')
  await expect(page.locator('.explanation-card')).toHaveCount(0)
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), QUIZ_STORAGE_KEY))
    .toBeNull()
  await page.reload()
  await expect(page.locator('#current-question-title')).toHaveText('Soal 01')
  await jump(page, 2, isMobile)
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
})

test('all 20 correct answers produce 100 and no unanswered warning', async ({ page }) => {
  await page.goto(route)
  for (let i = 0; i < 20; i++) {
    await page.getByRole('radio', { name: new RegExp(`^${keys[i]}\\.`) }).check()
    if (i < 19) await page.getByRole('button', { name: 'Selanjutnya' }).click()
  }
  await page
    .getByRole('button', { name: 'Selesai & Lihat Nilai' })
    .filter({ visible: true })
    .click()
  await expect(page.getByRole('dialog')).toContainText('Semua 20 soal sudah dijawab')
  await page.getByRole('button', { name: 'Tetap kumpulkan' }).click()
  await expect(page.locator('.quiz-score-circle')).toHaveAccessibleName('Nilai kamu: 100 dari 100')
  await expect(page.locator('.quiz-result-stats > div').nth(0)).toContainText('20Benar')
  await page.getByRole('button', { name: 'Lihat Pembahasan' }).click()
  await page.getByRole('button', { name: /^Jawaban salah/ }).click()
  await expect(page.locator('.quiz-review-card')).toHaveCount(0)
  await expect(page.locator('.quiz-empty')).toBeVisible()
})

test('a completely unanswered submission produces 0 with all 20 questions reviewable', async ({
  page,
}) => {
  await page.goto(route)
  await submit(page)
  await expect(page.locator('.quiz-score-circle')).toHaveAccessibleName('Nilai kamu: 0 dari 100')
  await expect(page.locator('.quiz-result-stats > div').nth(2)).toContainText('20Tidak dijawab')
  await page.getByRole('button', { name: 'Lihat Pembahasan' }).click()
  await expect(page.locator('.quiz-status.status-unanswered')).toHaveCount(20)
})

test('corrupt storage recovers safely and blocked storage allows working with a clear notice', async ({
  page,
}) => {
  await page.addInitScript((key) => localStorage.setItem(key, '{broken-json'), QUIZ_STORAGE_KEY)
  await page.goto(route)
  await expect(page.locator('#current-question-title')).toHaveText('Soal 01')
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Blocked', 'SecurityError')
    }
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError')
    }
    Storage.prototype.removeItem = () => {
      throw new DOMException('Blocked', 'SecurityError')
    }
  })
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('Browser belum bisa menyimpan progres')
  await page.getByRole('radio', { name: 'B. 160 N', exact: true }).check()
  await page.getByRole('button', { name: 'Selanjutnya' }).click()
  await page.getByRole('button', { name: 'Sebelumnya' }).click()
  await expect(page.getByRole('radio', { name: 'B. 160 N', exact: true })).toBeChecked()
})

test('question, modal, result and review pass automated accessibility checks', async ({
  page,
  isMobile,
}) => {
  const check = async () => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  }
  await page.goto(route)
  await check()
  if (isMobile) {
    await page.getByRole('button', { name: 'Navigasi soal' }).click()
    await check()
    await page.keyboard.press('Escape')
  }
  await page
    .getByRole('button', { name: 'Selesai & Lihat Nilai' })
    .filter({ visible: true })
    .click()
  await check()
  await page.getByRole('button', { name: 'Tetap kumpulkan' }).click()
  await expect(page.locator('.quiz-score-circle')).toBeVisible()
  await check()
  await page.getByRole('button', { name: 'Lihat Pembahasan' }).click()
  await check()
})

test('restores an unfinished attempt at the saved question without exposing review', async ({
  page,
}) => {
  const answers: Answers = { 1: 'B', 15: 'D' }
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: QUIZ_STORAGE_KEY,
    value: serializeQuiz({ answers, currentIndex: 14, submitted: false }),
  })
  await page.goto(`${route}?view=review`)
  await expect(page.locator('#current-question-title')).toHaveText('Soal 15')
  await expect(page.getByRole('radio', { name: 'D. (1), (2), (4)', exact: true })).toBeChecked()
  await expect(page.locator('.quiz-review')).toHaveCount(0)
})
