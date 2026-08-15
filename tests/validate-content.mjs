import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = async (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const { FUNDAMENTALS_ADULT_TEMPLATES } = await import(new URL('../content-fundamentals-adult.js', import.meta.url));
const { MATERNAL_CHILD_LEADERSHIP_TEMPLATES } = await import(new URL('../content-maternal-child-leadership.js', import.meta.url));
const { SNLE_EXPANSION_TEMPLATES } = await import(new URL('../content-snle-expansion.js', import.meta.url));
const { DOCTOR18_SNLE_MOCK_EXAM_TEMPLATES, SNLE_MOCK_EXAM_PART_1_READABLE_TEMPLATES, SNLE_MOCK_EXAM_PART_2_READABLE_TEMPLATES } = await import(new URL('../content-snle-practice-sets.js', import.meta.url));
const { PNLE_TEMPLATES } = await import(new URL('../content-pnle.js', import.meta.url));
const { PNLE_EXPANSION_TEMPLATES } = await import(new URL('../content-pnle-expansion.js', import.meta.url));
const { USRN_TEMPLATES } = await import(new URL('../content-usrn.js', import.meta.url));
const { USRN_EXPANSION_TEMPLATES } = await import(new URL('../content-usrn-expansion.js', import.meta.url));
const templates = [...FUNDAMENTALS_ADULT_TEMPLATES, ...MATERNAL_CHILD_LEADERSHIP_TEMPLATES, ...SNLE_EXPANSION_TEMPLATES];
const namedSnleSets = [
  ['Doctor18 SNLE Mock Exam', DOCTOR18_SNLE_MOCK_EXAM_TEMPLATES],
  ['snle-mock-exam-part-1-readable', SNLE_MOCK_EXAM_PART_1_READABLE_TEMPLATES],
  ['snle-mock-exam-part-2-readable', SNLE_MOCK_EXAM_PART_2_READABLE_TEMPLATES],
];
const domainFor = (topic) => topic.startsWith('Fundamentals') ? 'Fundamentals' : topic.startsWith('Adult Nursing') ? 'Adult Nursing' : /^(Maternity|Intrapartum|Postpartum|Newborn|Pediatrics)/.test(topic) ? 'Maternal–Child' : 'Management & Leadership';
const scenarioForms = templates => templates.flatMap(template => [template.stem, ...(template.scenarioVariants || template.variants || [])]);
const normalizeStem = stem => stem.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
const questions = templates.flatMap(template => scenarioForms([template]).map((stem, index) => ({ ...template, id: `${template.id}-${index}`, domain: domainFor(template.topic), stem: index ? `${stem}${stem.endsWith('?') ? '' : ' What is the nurse’s best action?'}` : stem })));

assert.equal(templates.length, 60, 'the source bank should have 60 original competency templates');
assert.equal(questions.length, 180, 'SNLE should retain alternate situations for the optional scenario-forms mode');
assert.equal(new Set(questions.map(q => q.id)).size, questions.length, 'scenario form IDs must be unique');
assert.equal(new Set(questions.map(q => normalizeStem(q.stem))).size, questions.length, 'SNLE scenarios must not be redundant rewordings');
const pnleTemplates = [...PNLE_TEMPLATES, ...PNLE_EXPANSION_TEMPLATES];
const usrnTemplates = [...USRN_TEMPLATES, ...USRN_EXPANSION_TEMPLATES];
assert.equal(pnleTemplates.length, 20, 'the PNLE source bank should have original templates across all five Nursing Practice areas');
assert.equal(scenarioForms(pnleTemplates).length, 40, 'PNLE should retain alternate situations for the optional scenario-forms mode');
assert.equal(new Set(scenarioForms(pnleTemplates).map(normalizeStem)).size, 40, 'PNLE scenarios must not be redundant rewordings');
assert.deepEqual(new Set(pnleTemplates.map(template => template.id.split('-').slice(0, 2).join('-'))), new Set(['PNLE-I', 'PNLE-II', 'PNLE-III', 'PNLE-IV', 'PNLE-V']), 'PNLE templates must cover each Nursing Practice area');
assert.equal(usrnTemplates.length, 40, 'the USRN source bank should have original templates');
assert.equal(scenarioForms(usrnTemplates).length, 80, 'USRN should retain alternate situations for the optional scenario-forms mode');
assert.equal(new Set(scenarioForms(usrnTemplates).map(normalizeStem)).size, 80, 'USRN scenarios must not be redundant rewordings');
assert.deepEqual(new Set(usrnTemplates.map(template => template.topic.split(' — ')[0])), new Set(['Management of Care', 'Safety and Infection Control', 'Health Promotion and Maintenance', 'Psychosocial Integrity', 'Basic Care and Comfort', 'Pharmacological and Parenteral Therapies', 'Reduction of Risk Potential', 'Physiological Adaptation']), 'USRN templates must cover every 2026 NCLEX-RN Client Needs domain');

for (const q of questions) {
  assert.equal(q.choices.length, 4, `${q.id} needs four answer choices`);
  assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4, `${q.id} has a valid correct answer`);
  assert.ok(q.stem.length > 30, `${q.id} needs a usable clinical stem`);
  assert.ok(q.rationale.length > 50, `${q.id} needs a teaching rationale`);
  assert.ok(q.domain && q.topic, `${q.id} must be searchable by domain and topic`);
}
for (const [label, set] of namedSnleSets) {
  assert.equal(set.length, 4, `${label} needs four original teaching scenarios`);
  for (const q of set) {
    assert.equal(q.choices.length, 4, `${q.id} needs four answer choices`);
    assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4, `${q.id} has a valid correct answer`);
    assert.ok(q.stem.length > 30, `${q.id} needs a usable clinical stem`);
    assert.ok(q.rationale.length > 50, `${q.id} needs a teaching rationale`);
  }
}
for (const q of pnleTemplates) {
  assert.equal(q.choices.length, 4, `${q.id} needs four answer choices`);
  assert.ok(q.rationale.length > 50, `${q.id} needs a teaching rationale`);
  assert.ok(q.topic.startsWith('Nursing Practice'), `${q.id} must remain in a PNLE Nursing Practice area`);
}
for (const q of usrnTemplates) {
  assert.equal(q.choices.length, 4, `${q.id} needs four answer choices`);
  assert.ok(q.rationale.length > 50, `${q.id} needs a teaching rationale`);
  assert.ok(q.topic.includes(' — '), `${q.id} must identify a USRN Client Needs domain`);
}

const targets = { Fundamentals: 20, 'Adult Nursing': 40, 'Maternal–Child': 30, 'Management & Leadership': 10 };
for (const [domain, target] of Object.entries(targets)) {
  const share = questions.filter(q => q.domain === domain).length / questions.length * 100;
  assert.ok(Math.abs(share - target) <= 5, `${domain} must remain within the SCFHS ±5% blueprint tolerance; got ${share}%`);
}

const appSource = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');
for (const requiredFeature of ['Random topics', 'Reveal answer', 'Next question', 'alternateForm', 'localStorage', 'flashcard', 'Question library', 'SNLE · Saudi Arabia', 'PNLE · Philippines', 'USRN · NCLEX-RN 2026', 'never mix between exams']) {
  assert.ok(appSource.includes(requiredFeature), `UI source must include ${requiredFeature}`);
}

console.log(`PASS: SNLE ${templates.length} core questions / ${questions.length} optional scenario forms plus ${namedSnleSets.length} selectable original practice sets; PNLE ${pnleTemplates.length} core questions / ${scenarioForms(pnleTemplates).length} optional scenario forms; USRN ${usrnTemplates.length} core questions / ${scenarioForms(usrnTemplates).length} optional scenario forms; valid MCQ/rationale structure, separated libraries, blueprint balance, and required UI flows.`);
