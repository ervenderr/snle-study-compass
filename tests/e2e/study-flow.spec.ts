import { expect, test } from '@playwright/test';

test('learner can practise, reveal a rationale, continue, and review a flashcard', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await expect(page.getByRole('heading', { name: /One question/i })).toBeVisible();
  await page.getByRole('button', { name: /Play a new round/i }).click();

  await expect(page.locator('.question-title')).toBeVisible();
  const answers = page.locator('.answer-btn');
  await expect(answers).toHaveCount(4);
  await answers.first().click();

  const reveal = page.getByRole('button', { name: 'Reveal answer' });
  if (await reveal.isVisible()) await reveal.click();
  await expect(page.getByText('Rationale:', { exact: false })).toBeVisible();
  const firstStem = await page.locator('.question-title').innerText();
  await page.getByRole('button', { name: /Next question/i }).click();
  await expect(page.locator('.question-title')).not.toHaveText(firstStem);
  await expect(page.locator('.answer-btn')).toHaveCount(4);
  await expect.poll(() => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('snle-study-compass-progress-v2') || '{}')).length)).toBeGreaterThan(0);
  const resumedStem = await page.locator('.question-title').innerText();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Resume my round' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume my round' }).click();
  await expect(page.locator('.question-title')).toHaveText(resumedStem);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();

  await page.getByRole('button', { name: 'Flashcards' }).click();
  const card = page.locator('.flashcard').first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(card.getByText('Best response')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.getByRole('button', { name: 'Rewards' }).click();
  await expect(page.getByText('Every answer is', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Library' }).click();
  await page.getByRole('button', { name: /PNLE · Philippines/i }).click();
  await expect(page.getByText('PNLE question library—separate by design.')).toBeVisible();
  await page.getByRole('button', { name: /Open PNLE question library/i }).click();
  await expect(page.locator('.tag')).toContainText('PNLE');
  await expect(page.locator('.tag')).not.toContainText('SNLE');
  expect(pageErrors).toEqual([]);
});

test('the learner can choose an entirely separate PNLE library', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /PNLE · Philippines.*80 original/i }).click();
  await page.getByRole('button', { name: /Play a new round/i }).click();
  await expect(page.locator('#exam-track')).toHaveValue('PNLE');
  await expect(page.locator('.tag')).toContainText('PNLE');
  await expect(page.locator('.question-title')).not.toContainText('Saudi');
  await page.locator('#exam-track').selectOption('SNLE');
  await expect(page.locator('.tag')).toContainText('SNLE');
});

test('a correct answer earns a shareable reward', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Play a new round/i }).click();
  await page.locator('#domain').selectOption('Fundamentals');
  await page.locator('#topic').selectOption('Fundamentals — Infection prevention');
  await page.locator('.answer-btn').nth(1).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Reward unlocked')).toBeVisible();
  await expect(page.getByText(/Screenshot this little win/i)).toBeVisible();
  await page.getByRole('button', { name: /Keep playing/i }).click();
  await page.getByRole('button', { name: 'Rewards' }).click();
  await expect(page.getByText('First Spark')).toBeVisible();
  await expect(page.getByText('Unlocked!')).toBeVisible();
});
