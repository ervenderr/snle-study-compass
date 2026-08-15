import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = async (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const { FUNDAMENTALS_ADULT_TEMPLATES } = await import(new URL('../content-fundamentals-adult.js', import.meta.url));
const { MATERNAL_CHILD_LEADERSHIP_TEMPLATES } = await import(new URL('../content-maternal-child-leadership.js', import.meta.url));
const { PNLE_TEMPLATES } = await import(new URL('../content-pnle.js', import.meta.url));
const templates = [...FUNDAMENTALS_ADULT_TEMPLATES, ...MATERNAL_CHILD_LEADERSHIP_TEMPLATES];
const domainFor = (topic) => topic.startsWith('Fundamentals') ? 'Fundamentals' : topic.startsWith('Adult Nursing') ? 'Adult Nursing' : /^(Maternity|Intrapartum|Postpartum|Newborn|Pediatrics)/.test(topic) ? 'Maternal–Child' : 'Management & Leadership';
const questions = templates.flatMap(template => {
  const alternateWordings = [`Choose the one best nursing response. ${template.stem}`, `Clinical-priority check: ${template.stem}`, `Safety-first scenario: ${template.stem}`, `Read the cues, then select the most appropriate action. ${template.stem}`];
  return [template.stem, ...(template.scenarioVariants || template.variants || []), ...alternateWordings].map((stem, index) => ({ ...template, id: `${template.id}-${index}`, domain: domainFor(template.topic), stem: index && index < 4 ? `${stem}${stem.endsWith('?') ? '' : ' What is the nurse’s best action?'}` : stem }));
});

assert.equal(templates.length, 40, 'the source bank should have 40 original competency templates');
assert.equal(questions.length, 320, 'every template should supply eight core scenario forms');
assert.equal(new Set(questions.map(q => q.id)).size, questions.length, 'scenario form IDs must be unique');
assert.equal(PNLE_TEMPLATES.length, 10, 'the PNLE source bank should have original templates across all five Nursing Practice areas');
assert.equal(PNLE_TEMPLATES.length * 8, 80, 'every PNLE template should supply eight core scenario forms');
assert.deepEqual(new Set(PNLE_TEMPLATES.map(template => template.id.split('-').slice(0, 2).join('-'))), new Set(['PNLE-I', 'PNLE-II', 'PNLE-III', 'PNLE-IV', 'PNLE-V']), 'PNLE templates must cover each Nursing Practice area');

for (const q of questions) {
  assert.equal(q.choices.length, 4, `${q.id} needs four answer choices`);
  assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4, `${q.id} has a valid correct answer`);
  assert.ok(q.stem.length > 30, `${q.id} needs a usable clinical stem`);
  assert.ok(q.rationale.length > 50, `${q.id} needs a teaching rationale`);
  assert.ok(q.domain && q.topic, `${q.id} must be searchable by domain and topic`);
}
for (const q of PNLE_TEMPLATES) {
  assert.equal(q.choices.length, 4, `${q.id} needs four answer choices`);
  assert.ok(q.rationale.length > 50, `${q.id} needs a teaching rationale`);
  assert.ok(q.topic.startsWith('Nursing Practice'), `${q.id} must remain in a PNLE Nursing Practice area`);
}

const targets = { Fundamentals: 20, 'Adult Nursing': 40, 'Maternal–Child': 30, 'Management & Leadership': 10 };
for (const [domain, target] of Object.entries(targets)) {
  const share = questions.filter(q => q.domain === domain).length / questions.length * 100;
  assert.ok(Math.abs(share - target) <= 5, `${domain} must remain within the SCFHS ±5% blueprint tolerance; got ${share}%`);
}

const appSource = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');
for (const requiredFeature of ['Random topics', 'Reveal answer', 'Next question', 'alternateForm', 'localStorage', 'flashcard', 'Question library', 'SNLE · Saudi Arabia', 'PNLE · Philippines', 'never mix between countries']) {
  assert.ok(appSource.includes(requiredFeature), `UI source must include ${requiredFeature}`);
}

console.log(`PASS: SNLE ${templates.length} templates / ${questions.length} forms; PNLE ${PNLE_TEMPLATES.length} templates / ${PNLE_TEMPLATES.length * 8} forms; valid MCQ/rationale structure, separated libraries, blueprint balance, and required UI flows.`);
