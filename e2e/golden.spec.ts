import { test, expect } from '@playwright/test'

test.describe('Y22 Roleplay golden path (synthetic mode)', () => {
  test('configurator → live → end → scorecard → restart', async ({ page }) => {
    await page.goto('/')

    // Synthetic banner is visible because /api/health responds with mode=synthetic
    // when XAI_API_KEY is missing in preview.
    await expect(page.getByText(/Live voice unavailable/i)).toBeVisible({ timeout: 5000 })

    // Configurator hero CTA.
    const startBtn = page.getByRole('button', { name: /start roleplay/i })
    await expect(startBtn).toBeVisible()

    // Pick the CFO preset (active by default).
    await expect(page.getByText('Skeptical mid-market CFO')).toBeVisible()

    await startBtn.click()

    // Calibrating overlay appears briefly then live call header.
    await expect(page.getByText(/Speaking with/i)).toBeVisible({ timeout: 6000 })

    // 6 behavior tiles render.
    await expect(page.locator('.tile').first()).toBeVisible()
    const tiles = page.locator('.tiles-grid .tile')
    await expect(tiles).toHaveCount(6, { timeout: 6000 })

    // End the call → scorecard.
    await page.getByRole('button', { name: /end call/i }).click()
    await expect(page.getByText(/Final score/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Moment the deal turned/i)).toBeVisible()

    // Run another → return to configurator.
    await page.getByRole('button', { name: /run another roleplay/i }).click()
    await expect(page.getByRole('button', { name: /start roleplay/i })).toBeVisible()
  })

  test('Prompt Lab tab loads and shows 3 versions', async ({ page }) => {
    await page.goto('/?tab=prompt')
    await expect(page.getByText('v1.2 baseline')).toBeVisible()
    await expect(page.getByText('v1.3 +objection script')).toBeVisible()
    await expect(page.getByText('v1.4 +personality')).toBeVisible()
  })

  test('Demo Guide tab renders the system status panel', async ({ page }) => {
    await page.goto('/?tab=guide')
    await expect(page.getByText(/Voice loop/)).toBeVisible()
    await expect(page.getByText(/Behavior scoring/)).toBeVisible()
  })
})
