import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');
const layout = await readFile(new URL('../app/layout.tsx', import.meta.url), 'utf8');
for (const requirement of ['Play a new round', 'Resume my round', 'Random topics', 'Reveal answer', 'Next question', 'flashcard', 'localStorage', 'alternateForm', 'Reward unlocked', 'PNLE · Philippines']) {
  assert.ok(page.includes(requirement), `App Router page must contain ${requirement}`);
}
assert.match(layout, /metadata/, 'root layout must declare deployable page metadata');
console.log('PASS: App Router study page includes the required practice, reveal, progress, alternate-form, and flashcard flows.');
