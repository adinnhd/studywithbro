import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const base = '/ipa/fisika/katrol'

test('four stages keep legacy deep links and the mnemonic available', async ({ page }) => {
  await page.goto(base)
  const navigation = page.getByRole('navigation', { name: 'Empat tahap pembelajaran' })
  await expect(navigation.getByRole('link')).toHaveCount(4)
  for (const [label, hash] of [
    ['Dasar Katrol', 'dasar'],
    ['Usaha dan Energi', 'usaha'],
    ['Efisiensi Katrol', 'efisiensi'],
    ['Analisis Lanjutan', 'analisis'],
  ]) {
    await navigation.getByRole('link', { name: new RegExp(label) }).click()
    await expect(page).toHaveURL(`${base}#${hash}`)
    await expect(page.locator(`#${hash} .learning-heading`)).toBeInViewport()
  }
  await page.goto(`${base}#rumus`)
  await expect(page.locator('.mnemonic-card')).toContainText('Kamar Mandi')
  await expect(page.getByRole('button', { name: 'Cari F', exact: true })).toBeVisible()
})

test('work experiment changes both sides of the energy flow with rope travel', async ({ page }) => {
  await page.goto(`${base}#usaha`)
  const experiment = page.getByLabel('Eksperimen usaha', { exact: true })
  await experiment.getByLabel('Usaha: berat beban', { exact: true }).fill('750')
  await experiment.getByLabel('Usaha: ruas penopang', { exact: true }).fill('4')
  await experiment.getByLabel('Usaha: panjang tarikan', { exact: true }).fill('12')
  await expect(experiment.locator('.energy-side').first()).toContainText('187,5 N')
  await expect(experiment.locator('.energy-side').last()).toContainText('3 m')
  await expect(experiment.locator('.energy-side').last()).toContainText('2.250 J')
  await experiment.getByText('Lihat langkah perhitungan eksperimen').click()
  await expect(experiment.locator('.learning-calculations')).toContainText('12 / 4 = 3 m')
  await experiment.getByLabel('Usaha: ruas penopang', { exact: true }).fill('8')
  await expect(experiment.locator('.energy-side').last()).toContainText('1,5 m')
  await expect(experiment.locator('.energy-side').last()).toContainText('1.125 J')
})

test('80 percent efficiency matches physics case B and reports energy conversion', async ({
  page,
}) => {
  await page.goto(`${base}#efisiensi`)
  const experiment = page.getByLabel('Eksperimen efisiensi', { exact: true })
  await experiment.getByLabel('Efisiensi: berat beban', { exact: true }).fill('900')
  await experiment.getByLabel('Efisiensi: ruas penopang', { exact: true }).fill('3')
  await experiment.getByLabel('Efisiensi: tinggi angkat', { exact: true }).fill('2')
  await expect(experiment.getByLabel('Efisiensi: efisiensi sistem', { exact: true })).toHaveValue(
    '100',
  )
  await experiment
    .getByRole('slider', { name: 'Efisiensi: efisiensi sistem — penggeser', exact: true })
    .fill('80')
  await expect(experiment.locator('.learning-note').first()).toContainText('80% = 0,8')
  await expect(experiment.locator('.energy-side').first()).toContainText('375 N')
  await expect(experiment.locator('.energy-side').first()).toContainText('6 m')
  await expect(experiment.locator('.energy-side').first()).toContainText('2.250 J')
  await expect(experiment.locator('.energy-side').last()).toContainText('1.800 J')
  await expect(experiment.locator('figcaption')).toContainText('450 J')
  await expect(
    experiment.locator('.learning-metric').filter({ hasText: 'KM aktual' }),
  ).toContainText('2,4')
  await expect(experiment.getByRole('img')).toHaveAccessibleName(/80% menjadi usaha berguna/)
  await experiment.getByLabel('Efisiensi: efisiensi sistem', { exact: true }).fill('50')
  await expect(experiment.locator('.energy-side').last()).toContainText('1.800 J')
  await expect(experiment.locator('figcaption')).toContainText('1.800 J')
})

test('invalid inputs preserve valid results and never allow division by zero', async ({ page }) => {
  await page.goto(`${base}#efisiensi`)
  const experiment = page.getByLabel('Eksperimen efisiensi', { exact: true })
  const initial = await experiment.locator('.learning-metrics').textContent()
  for (const [name, invalid, restored] of [
    ['Efisiensi: efisiensi sistem', '0', '100'],
    ['Efisiensi: efisiensi sistem', '101', '100'],
    ['Efisiensi: ruas penopang', '2.5', '4'],
    ['Efisiensi: berat beban', '', '640'],
    ['Efisiensi: tinggi angkat', '-1', '1.5'],
  ]) {
    const field = experiment.getByLabel(name, { exact: true })
    await field.fill(invalid)
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await expect(experiment.locator('.learning-metrics')).toHaveText(initial!)
    await field.blur()
    await expect(field).toHaveValue(restored)
  }
})

test('comparison uses actual efficiency and preserves work for ideal systems', async ({ page }) => {
  await page.goto(`${base}#analisis`)
  const comparison = page.getByLabel('Perbandingan dua sistem', { exact: true })
  await comparison.getByLabel('Perbandingan: berat bersama', { exact: true }).fill('900')
  await comparison.getByLabel('Perbandingan: tinggi bersama', { exact: true }).fill('1.6')
  const a = comparison.getByLabel('Sistem A', { exact: true })
  const b = comparison.getByLabel('Sistem B', { exact: true })
  await expect(a.locator('.learning-metric').filter({ hasText: 'Gaya kuasa' })).toContainText('300')
  await expect(b.locator('.learning-metric').filter({ hasText: 'Gaya kuasa' })).toContainText('180')
  for (const system of [a, b])
    await expect(
      system.locator('.learning-metric').filter({ hasText: 'Usaha masuk' }),
    ).toContainText('1.440')
  await b.getByLabel('Sistem B: efisiensi', { exact: true }).fill('80')
  await expect(b.locator('.learning-metric').filter({ hasText: 'Usaha masuk' })).toContainText(
    '1.800',
  )
})

test('operator enforces both limits and explains when no system is usable', async ({ page }) => {
  await page.goto(`${base}#analisis`)
  const operator = page.getByLabel('Batas kemampuan operator', { exact: true })
  for (const [name, value] of [
    ['massa peti', '50'],
    ['gaya maksimum', '250'],
    ['panjang tarikan maksimum', '8'],
    ['tinggi target', '3'],
    ['ruas pilihan', '2'],
  ]) {
    await operator.getByLabel(`Operator: ${name}`, { exact: true }).fill(value)
  }
  await expect(operator.locator('.operator-result')).toContainText('2 ruas: dapat digunakan')
  await expect(operator.locator('.operator-result')).toContainText(
    'Massa maksimum pada susunan ini = 50 kg',
  )
  await expect(operator.locator('.configuration-list .feasible')).toHaveCount(1)
  await operator.getByRole('button', { name: /^4 ruas/ }).click()
  await expect(operator.locator('.operator-result')).toContainText('4 ruas: belum memenuhi batas')
  await expect(operator.locator('.operator-result')).toContainText('tarikan tidak cukup')
  await operator.getByLabel('Operator: massa peti', { exact: true }).fill('51')
  await expect(operator.locator('.configuration-list .feasible')).toHaveCount(0)
  await expect(operator.locator('.learning-challenge')).toContainText('Tidak ada susunan')
})

test('worked examples reveal steps and formula rearrangements are selectable', async ({ page }) => {
  await page.goto(`${base}#analisis`)
  const examples = page.locator('.worked-examples')
  await expect(examples.locator('.worked-steps li')).toHaveCount(0)
  await expect(examples.locator('.story-formula')).toHaveCount(0)
  await examples.getByRole('button', { name: 'Lihat langkah berikutnya' }).click()
  await expect(examples.locator('.worked-steps li')).toHaveCount(1)
  await expect(examples.locator('.worked-steps')).not.toContainText('Hasil:')
  await examples.getByRole('button', { name: 'Tampilkan rumus' }).click()
  await expect(examples.locator('.story-formula')).toContainText('F = w / (η × n)')
  await examples.getByRole('button', { name: 'Lihat hasil akhir' }).click()
  await expect(examples.locator('.worked-steps')).toContainText('1.125 J')
  await examples.getByRole('button', { name: /Contoh 2/ }).click()
  await expect(examples.locator('.worked-steps li')).toHaveCount(0)
  await examples.getByRole('button', { name: 'Lihat hasil akhir' }).click()
  await expect(examples.locator('.worked-steps')).toContainText('Hanya n = 4')

  const reference = page.locator('.formula-reference')
  await reference.getByRole('button', { name: 'Efisiensi', exact: true }).click()
  const realForce = reference
    .locator('.reference-card')
    .filter({ hasText: 'Gaya pada sistem nyata' })
  const target = realForce.getByRole('combobox')
  for (const [value, equation] of [
    ['w', 'w = η × n × F'],
    ['n', 'n = w / (η × F)'],
    ['η (desimal)', 'η = w / (n × F)'],
    ['F', 'F = w / (η × n)'],
  ]) {
    await target.selectOption(value)
    await expect(realForce.locator('.reference-equation')).toHaveText(equation)
  }
})

test('all new states fit narrow screens and pass automated accessibility checks', async ({
  page,
}) => {
  await page.goto(base)
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    for (const group of ['Dasar Katrol', 'Usaha', 'Efisiensi']) {
      await page
        .locator('.formula-reference')
        .getByRole('button', { name: group, exact: true })
        .click()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        `${group} at ${width}px`,
      ).toBeLessThanOrEqual(1)
    }
  }
  await page.getByLabel('Efisiensi: efisiensi sistem', { exact: true }).fill('80')
  await page.locator('#efisiensi summary').first().click()
  await page.locator('.worked-examples').getByRole('button', { name: 'Lihat hasil akhir' }).click()
  const results = await new AxeBuilder({ page })
    .include('.learning-stage')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(results.violations).toEqual([])
})
