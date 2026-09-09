import { expect, test, type Page } from '@playwright/test';

async function openMobileFilters(page: Page) {
  if ((page.viewportSize()?.width || 0) > 540) return;
  const toggle = page.locator('.mobile-control-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/get-session', route => route.fulfill({ json: { user: { id: 'test-learner', name: 'Test learner', email: 'learner@example.com' } } }));
  await page.route('**/api/sync', route => route.fulfill({ json: { flashcards: [], progress: {}, players: {}, savedSession: null } }));
});

test('a guest lands on the welcome page and must sign in to study', async ({ page }) => {
  await page.route('**/api/auth/get-session', route => route.fulfill({ json: null }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your calm corner/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Create your free account/i })).toBeVisible();
  await page.getByRole('button', { name: /I already have an account/i }).click();
  await expect(page.getByRole('heading', { name: /Come in/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Practice', exact: true })).toHaveCount(0);
});

test('invalid sign-in credentials show a clear form error instead of a raw 401', async ({ page }) => {
  await page.route('**/api/auth/get-session', route => route.fulfill({ json: null }));
  await page.route('**/api/auth/sign-in/email', route => route.fulfill({ status: 401, json: { code: 'INVALID_EMAIL_OR_PASSWORD', message: 'Unauthorized' } }));
  await page.goto('/');
  await page.getByRole('button', { name: /I already have an account/i }).click();
  await page.getByLabel(/Email address/i).fill('learner@example.com');
  await page.getByLabel(/^Password/i).fill('WrongPassword!2026');
  await page.getByRole('button', { name: /Continue/i }).click();
  await expect(page.locator('#account-error')).toHaveText('That email or password doesn’t match. Please try again.');
  await expect(page.getByLabel(/Email address/i)).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel(/^Password/i)).toHaveAttribute('aria-invalid', 'true');
});

test('a temporary cloud-sync failure does not sign out an authenticated learner', async ({ page }) => {
  await page.unroute('**/api/sync');
  await page.route('**/api/sync', route => route.fulfill({ status: 503, json: { error: 'Sync is temporarily unavailable.' } }));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /One question/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Practice', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Practice', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Which exam are we/i })).toBeVisible();
});

test('a temporary session-check failure shows a retry state instead of a login screen', async ({ page }) => {
  await page.unroute('**/api/auth/get-session');
  await page.route('**/api/auth/get-session', route => route.fulfill({ status: 503, json: { error: 'Authentication is temporarily unavailable.' } }));

  await page.goto('/');
  await expect(page.getByText(/could not reach your study space/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Try again/i })).toBeVisible();
  await expect(page.getByText(/Come in\. Your progress is here/i)).toHaveCount(0);
});

test('primary navigation uses shareable URLs without signing out the learner', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
  await expect(page).toHaveURL(/\/flashcards$/);
  await expect(page.getByLabel(/Front of card/i)).toBeVisible();

  await page.getByRole('button', { name: 'Rewards', exact: true }).click();
  await expect(page).toHaveURL(/\/rewards$/);
  await expect(page.getByText(/Every answer is/i)).toBeVisible();

  await page.getByRole('button', { name: 'Library', exact: true }).click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(page.getByRole('heading', { name: /SNLE question library/i })).toBeVisible();

  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText(/Cloud study space/i)).toBeVisible();
});

test('learner can practise, reveal a rationale, continue, and review a flashcard', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await expect(page.getByRole('heading', { name: /One question/i })).toBeVisible();
  await page.getByRole('button', { name: /Play a new round/i }).click();
  await page.getByRole('button', { name: /Nurse Quest originals/i }).click();

  await expect(page.locator('.question-title')).toBeVisible();
  const answers = page.locator('.answer-btn');
  await expect(answers).toHaveCount(4);
  await expect(page.getByText('Pick an answer to unlock the next question.')).toBeVisible();
  await answers.first().click();

  const reveal = page.getByRole('button', { name: 'Reveal answer' });
  if (await reveal.isVisible()) await reveal.click();
  await expect(page.getByText('Rationale:', { exact: false })).toBeVisible();
  const celebration = page.getByRole('dialog');
  if (await celebration.isVisible()) await celebration.getByRole('button', { name: /Keep playing/i }).click();
  const firstStem = await page.locator('.question-title').innerText();
  await page.getByRole('button', { name: /Next question/i }).click();
  await expect(page.locator('.question-title')).not.toHaveText(firstStem);
  await expect(page.locator('.answer-btn')).toHaveCount(4);
  await expect.poll(() => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('snle-study-compass-progress-v2') || '{}')).length)).toBeGreaterThan(0);
  const resumedStem = await page.locator('.question-title').innerText();
  await page.reload();
  await expect(page.locator('.question-title')).toHaveText(resumedStem);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();

  await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
  await page.getByRole('button', { name: /Start random clinical card/i }).click();
  const card = page.locator('.single-flashcard .flashcard');
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
  await page.getByRole('button', { name: /PNLE · Philippines.*20 original/i }).click();
  await page.getByRole('button', { name: /Play a new round/i }).click();
  await expect(page.locator('#exam-track')).toHaveValue('PNLE');
  await expect(page.locator('.tag')).toContainText('PNLE');
  await expect(page.locator('.question-title')).not.toContainText('Saudi');
  await openMobileFilters(page);
  await page.locator('#exam-track').selectOption('SNLE');
  await expect(page.locator('.tag')).toContainText('SNLE');
});

test('the learner can choose the separate USRN 2026 library', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /USRN · NCLEX-RN 2026.*Original bank/i }).click();
  await page.getByRole('button', { name: /Play a new round/i }).click();
  await expect(page.getByRole('heading', { name: /Which NCLEX set/i })).toBeVisible();
  await page.getByRole('button', { name: /Nurse Quest originals/i }).click();
  await expect(page.locator('#exam-track')).toHaveValue('USRN');
  await expect(page.locator('.tag')).toContainText('USRN');
  await openMobileFilters(page);
  await expect(page.locator('#domain')).toContainText('Management of Care');
  await expect(page.locator('#domain')).toContainText('Physiological Adaptation');
});

test('Practice opens a three-library chooser before any question', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Practice', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Which exam are we/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Choose an SNLE set/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Start PNLE practice/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Choose an NCLEX-RN set/i })).toBeVisible();
  await page.getByRole('button', { name: /Choose an NCLEX-RN set/i }).click();
  await page.getByRole('button', { name: /Nurse Quest originals/i }).click();
  await expect(page.locator('.tag')).toContainText('USRN');
  await expect(page.locator('.question-title')).toBeVisible();
});

test('SNLE practice opens a set chooser and keeps the four-choice flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Practice', exact: true }).click();
  await page.getByRole('button', { name: /Choose an SNLE set/i }).click();
  await expect(page.getByRole('heading', { name: /Which SNLE set/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /SNLE Mock Exam Part 1/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /SNLE Mock Exam Part 2/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Prometric 1/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Prometric 2/i })).toBeVisible();
  await page.getByRole('button', { name: /Prometric 1/i }).click();
  await expect(page.locator('#exam-track')).toHaveValue('SNLE');
  await expect(page.locator('#snle-question-set')).toHaveValue('prometric-1');
  await expect(page.locator('.answer-btn')).toHaveCount(4);
});

test('NCLEX Challenge Exam 1 requires every correct select-all-that-apply choice', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Practice', exact: true }).click();
  await page.getByRole('button', { name: /Choose an NCLEX-RN set/i }).click();
  await expect(page).toHaveURL(/\/practice\/nclex$/);
  await page.evaluate(() => { Math.random = () => 0.48; });
  await page.getByRole('button', { name: /NCLEX Challenge Exam 1/i }).click();
  await expect(page).toHaveURL(/\/practice\/nclex\/exam-1$/);
  await expect(page.getByText('SELECT ALL THAT APPLY', { exact: true })).toBeVisible();
  const answers = page.locator('.answer-btn');
  await expect(answers).toHaveCount(6);
  await answers.nth(1).click();
  await answers.nth(3).click();
  await answers.nth(5).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/Correct — keep the clinical priority/i)).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const first = Object.values(JSON.parse(localStorage.getItem('snle-study-compass-progress-v2') || '{}'))[0] as { selected?: number[] } | undefined;
    return first?.selected?.length;
  })).toBe(3);
});

test('a completed focused set ends with a saved score summary instead of repeating questions', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Play a new round/i }).click();
  await page.getByRole('button', { name: /Nurse Quest originals/i }).click();
  await openMobileFilters(page);
  await page.locator('#domain').selectOption('Fundamentals');
  await page.locator('#topic').selectOption('Fundamentals — Infection prevention');
  for (let index = 0; index < 10; index += 1) {
    await page.locator('.answer-btn').last().click();
    const celebration = page.getByRole('dialog');
    if (await celebration.isVisible()) await celebration.getByRole('button', { name: /Keep playing/i }).click();
    await page.getByRole('button', { name: /Next question/i }).click();
    if (await page.getByRole('heading', { name: /You finished/i }).isVisible()) break;
  }
  await expect(page.getByRole('heading', { name: /You finished/i })).toBeVisible();
  await expect(page.getByText(/correct out of/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Review incorrect/i })).toBeVisible();
});

test('learner can make, review, retain, and find every private flashcard across libraries', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
  await page.getByLabel('Front of card').fill('What should I check before a first-dose medication?');
  await page.getByLabel('Back of card').fill('Confirm the order, allergy status, identity, and safe administration checks.');
  await page.getByRole('button', { name: /Add to my SNLE deck/i }).click();
  await expect(page.getByRole('dialog', { name: /Flashcard created/i })).toBeVisible();
  await page.getByRole('button', { name: 'Keep creating' }).click();
  await expect(page.getByRole('button', { name: 'View my deck' })).toBeVisible();
  await page.getByRole('button', { name: /Start my random deck/i }).click();
  await expect(page).toHaveURL(/\/flashcards\/deck$/);
  const myCard = page.locator('.single-flashcard');
  await expect(myCard).toContainText('What should I check before a first-dose medication?');
  await myCard.locator('.flashcard').click();
  await expect(myCard.getByText('Your answer / note')).toBeVisible();
  await myCard.getByRole('button', { name: /Got it/i }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('nurse-quest-custom-flashcards-v1') || '[]')[0]?.intervalDays)).toBe(1);

  await page.reload();
  await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
  await expect(page.getByRole('button', { name: /Start my random deck/i })).toBeEnabled();
  await page.getByRole('button', { name: 'Overview' }).click();
  await page.getByRole('button', { name: /PNLE · Philippines.*20 original/i }).click();
  await page.getByRole('button', { name: 'Flashcards' }).click();
  await expect(page.getByRole('button', { name: /Start my random deck/i })).toBeDisabled();
  await page.getByRole('button', { name: 'View my deck' }).click();
  await expect(page).toHaveURL(/\/flashcards\/my-deck$/);
  await expect(page.getByText(/1 private card saved across your exam libraries/i)).toBeVisible();
  await page.getByRole('button', { name: /Start my random deck/i }).click();
  await expect(page).toHaveURL(/\/flashcards\/deck$/);
  await expect(page.locator('.single-flashcard')).toContainText('What should I check before a first-dose medication?');
});

test('learner can create folders and sort existing flashcards individually or in bulk', async ({ page }) => {
  await page.goto('/flashcards');
  await page.getByRole('button', { name: 'View my deck' }).click();
  await page.getByLabel('New SNLE folder').fill('Pharmacology essentials');
  await page.getByRole('button', { name: 'Create folder' }).click();
  await expect(page.getByText('“Pharmacology essentials” is ready for your cards.')).toBeVisible();
  await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
  await page.getByLabel('Front of card').fill('What is the medication check?');
  await page.getByLabel('Back of card').fill('Confirm the prescription, allergies, identity, and required safety checks.');
  await page.locator('#custom-card-folder').selectOption({ label: 'Pharmacology essentials' });
  await page.getByRole('button', { name: /Add to my SNLE deck/i }).click();
  await page.getByRole('button', { name: 'Keep creating' }).click();
  await page.locator('#custom-card-folder').selectOption({ label: 'Unfiled cards' });
  await page.getByLabel('Front of card').fill('What should I document after a medication?');
  await page.getByLabel('Back of card').fill('Document administration, assessment findings, and any relevant patient response.');
  await page.getByRole('button', { name: /Add to my SNLE deck/i }).click();
  await page.getByLabel('Flashcard created').getByRole('button', { name: 'View my deck' }).click();
  await expect(page.getByText('Choose a folder above to see its cards.')).toBeVisible();
  await page.getByLabel('Open Pharmacology essentials folder').click();
  await expect(page.getByRole('heading', { name: /Pharmacology essentials/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Unfiled cards' })).toBeVisible();
  await page.getByLabel('Select What should I document after a medication?').check();
  await page.getByLabel('Move selected cards to a folder').selectOption({ label: 'Pharmacology essentials' });
  await expect(page.getByText('2 cards', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const cards = JSON.parse(localStorage.getItem('nurse-quest-custom-flashcards-v1') || '[]');
    const folders = JSON.parse(localStorage.getItem('nurse-quest-flashcard-folders-v1') || '[]');
    return cards.every((card: { folderId?: string }) => card.folderId === folders[0]?.id);
  })).toBeTruthy();
  await page.getByLabel('Move What is the medication check? to a folder').selectOption({ label: 'Unfiled cards' });
  await expect(page.getByRole('heading', { name: 'Unfiled cards' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test('long custom flashcard text stays inside its card', async ({ page }) => {
  const longWord = 'clinicalpriorityassessment'.repeat(18);
  await page.goto('/');
  await page.getByRole('button', { name: 'Flashcards' }).click();
  await page.getByLabel('Front of card').fill(longWord);
  await page.getByLabel('Back of card').fill(`${longWord} — Check the patient, prescription, and safety steps before acting.`);
  await page.getByRole('button', { name: /Add to my SNLE deck/i }).click();
  await page.getByRole('button', { name: 'Keep creating' }).click();
  await page.getByRole('button', { name: /Start my random deck/i }).click();
  const card = page.locator('.single-flashcard .flashcard');
  await expect(card).toBeVisible();
  await expect.poll(() => card.evaluate(element => element.scrollWidth <= element.clientWidth)).toBeTruthy();
  await card.click();
  await expect.poll(() => card.evaluate(element => element.scrollWidth <= element.clientWidth)).toBeTruthy();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test('practice keeps serving new question scenarios after four answers', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('snle-study-compass-player-v1', JSON.stringify({
      SNLE: { xp: 0, streak: 0, bestStreak: 0, correct: 1, unlocked: ['spark'] },
      PNLE: { xp: 0, streak: 0, bestStreak: 0, correct: 1, unlocked: ['spark'] },
      USRN: { xp: 0, streak: 0, bestStreak: 0, correct: 1, unlocked: ['spark'] },
    }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Practice', exact: true }).click();
  await page.getByRole('button', { name: /Choose an NCLEX-RN set/i }).click();
  await page.getByRole('button', { name: /Nurse Quest originals/i }).click();
  await openMobileFilters(page);
  await page.locator('#mode').selectOption('All scenario forms');
  await page.evaluate(() => { Math.random = () => 0; });

  const stems: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    stems.push(await page.locator('.question-title').innerText());
    await page.locator('.answer-btn').first().click();
    if (index < 4) await page.getByRole('button', { name: /Next question/i }).click();
  }

  expect(new Set(stems).size).toBe(5);
});

test('normal practice uses original core questions before scenario variations', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('snle-study-compass-player-v1', JSON.stringify({
      SNLE: { xp: 0, streak: 0, bestStreak: 0, correct: 1, unlocked: ['spark'] },
      PNLE: { xp: 0, streak: 0, bestStreak: 0, correct: 1, unlocked: ['spark'] },
      USRN: { xp: 0, streak: 0, bestStreak: 0, correct: 1, unlocked: ['spark'] },
    }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Practice', exact: true }).click();
  await page.getByRole('button', { name: /Choose an NCLEX-RN set/i }).click();
  await page.getByRole('button', { name: /Nurse Quest originals/i }).click();
  await page.evaluate(() => { Math.random = () => 0; });

  const stems: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    stems.push(await page.locator('.question-title').innerText());
    await expect(page.getByText('SCENARIO 1', { exact: true })).toBeVisible();
    await page.locator('.answer-btn').first().click();
    if (index < 4) await page.getByRole('button', { name: /Next question/i }).click();
  }

  expect(new Set(stems).size).toBe(5);
});

test('a correct answer earns a shareable reward', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('snle-study-compass-session-v1', JSON.stringify({
      current: {
        id: 'reward-test-question', track: 'SNLE', questionSet: 'nurse-quest-originals', domain: 'Fundamentals', topic: 'Fundamentals — Infection prevention',
        stem: 'A focused test question.', choices: ['First option', 'Correct option', 'Third option', 'Fourth option'], correctIndex: 1, rationale: 'A focused test rationale.', variantNumber: 0,
      },
      track: 'SNLE', questionSet: 'nurse-quest-originals', domain: 'All domains', topic: 'All topics', mode: 'Random topics', selected: [], revealed: false, savedAt: new Date().toISOString(),
    }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Play a new round/i }).click();
  await page.getByRole('button', { name: /Nurse Quest originals/i }).click();
  await page.locator('.answer-btn').nth(1).click();
  const firstReward = page.getByRole('dialog');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Reward unlocked')).toBeVisible();
  await expect(page.getByText(/Screenshot this little win/i)).toBeVisible();
  await page.getByRole('button', { name: /Keep playing/i }).click();
  await page.getByRole('button', { name: 'Rewards' }).click();
  await expect(page.getByText('First Spark')).toBeVisible();
  await expect(page.getByText('Unlocked!')).toBeVisible();
});
