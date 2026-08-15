import { FUNDAMENTALS_ADULT_TEMPLATES } from '../content-fundamentals-adult';
import { MATERNAL_CHILD_LEADERSHIP_TEMPLATES } from '../content-maternal-child-leadership';

export type Domain = 'Fundamentals' | 'Adult Nursing' | 'Maternal–Child' | 'Management & Leadership';

export type Question = {
  id: string;
  templateId: string;
  topic: string;
  domain: Domain;
  stem: string;
  choices: string[];
  correctIndex: number;
  rationale: string;
  variantNumber: number;
  isAlternateForm: boolean;
};

type RawTemplate = Omit<Question, 'domain' | 'templateId' | 'variantNumber' | 'isAlternateForm'> & {
  variants?: string[];
  scenarioVariants?: string[];
};

const raw = [...FUNDAMENTALS_ADULT_TEMPLATES, ...MATERNAL_CHILD_LEADERSHIP_TEMPLATES] as RawTemplate[];

const domainFor = (topic: string): Domain => {
  if (topic.startsWith('Fundamentals')) return 'Fundamentals';
  if (topic.startsWith('Adult Nursing')) return 'Adult Nursing';
  if (/^(Maternity|Intrapartum|Postpartum|Newborn|Pediatrics)/.test(topic)) return 'Maternal–Child';
  return 'Management & Leadership';
};

const questionTail = (stem: string) => /\?$/.test(stem.trim()) ? '' : ' What is the nurse’s best action?';

export const questions: Question[] = raw.flatMap((template) => {
  const contexts = template.scenarioVariants || template.variants || [];
  const alternateWordings = [
    `Choose the one best nursing response. ${template.stem}`,
    `Clinical-priority check: ${template.stem}`,
    `Safety-first scenario: ${template.stem}`,
    `Read the cues, then select the most appropriate action. ${template.stem}`,
  ];
  return [template.stem, ...contexts, ...alternateWordings].map((stem, index) => ({
    id: `${template.id}-${index}`,
    templateId: template.id,
    topic: template.topic,
    domain: domainFor(template.topic),
    stem: index === 0 ? template.stem : `${stem}${questionTail(stem)}`,
    choices: template.choices,
    correctIndex: template.correctIndex,
    rationale: template.rationale,
    variantNumber: index,
    isAlternateForm: false,
  }));
});

export const domains: { name: Domain; target: string; summary: string }[] = [
  { name: 'Fundamentals', target: '20%', summary: 'Assessment, pharmacology & safe foundations' },
  { name: 'Adult Nursing', target: '40%', summary: 'Medical, surgical, critical & community care' },
  { name: 'Maternal–Child', target: '30%', summary: 'Maternity, newborn & paediatric practice' },
  { name: 'Management & Leadership', target: '10%', summary: 'Delegation, quality & clinical coordination' },
];

export const domainReferences: Record<Domain, { title: string; href: string }> = {
  Fundamentals: { title: 'Saudi Patient Safety Standards', href: 'https://resources.spsc.gov.sa/pss.pdf' },
  'Adult Nursing': { title: 'SCFHS Scope of Nursing and Midwifery Practice', href: 'https://scfhs.org.sa/sites/default/files/2024-02/The%20Scope%20of%20Nursing%20and%20Midwifery%20Practice%20in%20Saudi%20Arabia%20%20%282%29_0.pdf' },
  'Maternal–Child': { title: 'WHO Intrapartum Care Recommendations', href: 'https://www.who.int/publications/i/item/9789241550215' },
  'Management & Leadership': { title: 'SCFHS Scope of Nursing and Midwifery Practice', href: 'https://scfhs.org.sa/sites/default/files/2024-02/The%20Scope%20of%20Nursing%20and%20Midwifery%20Practice%20in%20Saudi%20Arabia%20%20%282%29_0.pdf' },
};
