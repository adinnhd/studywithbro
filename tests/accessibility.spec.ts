import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('shared page templates pass automated WCAG A and AA checks', async ({ page }) => {
  for (const route of [
    '/',
    '/ipa',
    '/ipa/fisika',
    '/ipa/fisika/usaha-dan-energi',
    '/ipa/fisika/usaha-dan-energi/energi-mekanik-dan-kekekalannya',
    '/ipa/fisika/pesawat-sederhana',
    '/ipa/fisika/pesawat-sederhana/tuas',
    '/ipa/fisika/katrol',
    '/ipa/fisika/katrol/latihan',
    '/ipa/fisika/katrol/latihan/a',
    '/matematika',
  ]) {
    await page.goto(route)
    // Check the settled UI, after the existing formula's opacity entrance animation.
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => undefined)),
      )
    })
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(results.violations, route).toEqual([])
  }
})
