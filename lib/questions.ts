import { FUNDAMENTALS_ADULT_TEMPLATES } from '../content-fundamentals-adult';
import { MATERNAL_CHILD_LEADERSHIP_TEMPLATES } from '../content-maternal-child-leadership';
import { SNLE_EXPANSION_TEMPLATES } from '../content-snle-expansion';
import { PNLE_TEMPLATES } from '../content-pnle';
import { USRN_TEMPLATES } from '../content-usrn';
import type { StudyTrack } from './resources';

export type Domain = 'Fundamentals' | 'Adult Nursing' | 'Maternal–Child' | 'Management & Leadership';
export type PnleDomain = 'Nursing Practice I' | 'Nursing Practice II' | 'Nursing Practice III' | 'Nursing Practice IV' | 'Nursing Practice V';
export type UsrnDomain = 'Management of Care' | 'Safety and Infection Control' | 'Health Promotion and Maintenance' | 'Psychosocial Integrity' | 'Basic Care and Comfort' | 'Pharmacological and Parenteral Therapies' | 'Reduction of Risk Potential' | 'Physiological Adaptation';
export type LibraryDomain = Domain | PnleDomain | UsrnDomain;

export type Question = {
  id: string;
  templateId: string;
  track: StudyTrack;
  topic: string;
  domain: LibraryDomain;
  stem: string;
  choices: string[];
  correctIndex: number;
  rationale: string;
  variantNumber: number;
  isAlternateForm: boolean;
};

type RawTemplate = Omit<Question, 'domain' | 'templateId' | 'track' | 'variantNumber' | 'isAlternateForm'> & {
  variants?: string[];
  scenarioVariants?: string[];
};

export type DomainInfo = { name: LibraryDomain; target: string; summary: string };

const snleRaw = [...FUNDAMENTALS_ADULT_TEMPLATES, ...MATERNAL_CHILD_LEADERSHIP_TEMPLATES, ...SNLE_EXPANSION_TEMPLATES] as RawTemplate[];
const pnleRaw = PNLE_TEMPLATES as RawTemplate[];
const usrnRaw = USRN_TEMPLATES as RawTemplate[];

const snleDomainFor = (topic: string): Domain => {
  if (topic.startsWith('Fundamentals')) return 'Fundamentals';
  if (topic.startsWith('Adult Nursing')) return 'Adult Nursing';
  if (/^(Maternity|Intrapartum|Postpartum|Newborn|Pediatrics)/.test(topic)) return 'Maternal–Child';
  return 'Management & Leadership';
};

const pnleDomainFor = (topic: string): PnleDomain => {
  const match = topic.match(/^Nursing Practice (I{1,3}|IV|V)/);
  return `Nursing Practice ${match?.[1] || 'I'}` as PnleDomain;
};

const usrnDomainFor = (topic: string): UsrnDomain => {
  const domains: UsrnDomain[] = ['Management of Care', 'Safety and Infection Control', 'Health Promotion and Maintenance', 'Psychosocial Integrity', 'Basic Care and Comfort', 'Pharmacological and Parenteral Therapies', 'Reduction of Risk Potential', 'Physiological Adaptation'];
  return domains.find(domain => topic.startsWith(domain)) || 'Management of Care';
};

const questionTail = (stem: string) => /\?$/.test(stem.trim()) ? '' : ' What is the nurse’s best action?';

function expandTemplates(raw: RawTemplate[], track: StudyTrack, getDomain: (topic: string) => LibraryDomain): Question[] {
  return raw.flatMap((template) => {
    const contexts = template.scenarioVariants || template.variants || [];
    return [template.stem, ...contexts].map((stem, index) => ({
      id: `${template.id}-${index}`,
      templateId: template.id,
      track,
      topic: template.topic,
      domain: getDomain(template.topic),
      stem: index === 0 ? template.stem : `${stem}${questionTail(stem)}`,
      choices: template.choices,
      correctIndex: template.correctIndex,
      rationale: template.rationale,
      variantNumber: index,
      isAlternateForm: false,
    }));
  });
}

export const snleQuestions = expandTemplates(snleRaw, 'SNLE', snleDomainFor);
export const pnleQuestions = expandTemplates(pnleRaw, 'PNLE', pnleDomainFor);
export const usrnQuestions = expandTemplates(usrnRaw, 'USRN', usrnDomainFor);
export const questions: Question[] = [...snleQuestions, ...pnleQuestions, ...usrnQuestions];

export const domains: DomainInfo[] = [
  { name: 'Fundamentals', target: '20%', summary: 'Assessment, pharmacology & safe foundations' },
  { name: 'Adult Nursing', target: '40%', summary: 'Medical, surgical, critical & community care' },
  { name: 'Maternal–Child', target: '30%', summary: 'Maternity, newborn & paediatric practice' },
  { name: 'Management & Leadership', target: '10%', summary: 'Delegation, quality & clinical coordination' },
];

export const pnleDomains: DomainInfo[] = [
  { name: 'Nursing Practice I', target: '20%', summary: 'Community health, health promotion & care of the well client' },
  { name: 'Nursing Practice II', target: '20%', summary: 'Mother, child, family and population nursing' },
  { name: 'Nursing Practice III', target: '20%', summary: 'Care of clients with physiologic and psychosocial alterations' },
  { name: 'Nursing Practice IV', target: '20%', summary: 'Complex and acute care across the lifespan' },
  { name: 'Nursing Practice V', target: '20%', summary: 'Mental health, leadership, research and professional practice' },
];

export const usrnDomains: DomainInfo[] = [
  { name: 'Management of Care', target: '15–21%', summary: 'Delegation, advocacy, legal and coordinated care' },
  { name: 'Safety and Infection Control', target: '10–16%', summary: 'Infection prevention, emergency safety and risk reduction' },
  { name: 'Health Promotion and Maintenance', target: '6–12%', summary: 'Lifespan development, prevention and teaching' },
  { name: 'Psychosocial Integrity', target: '6–12%', summary: 'Mental health, communication and coping support' },
  { name: 'Basic Care and Comfort', target: '6–12%', summary: 'Mobility, elimination, nutrition and comfort care' },
  { name: 'Pharmacological and Parenteral Therapies', target: '13–19%', summary: 'Medication safety, IV therapy and high-alert care' },
  { name: 'Reduction of Risk Potential', target: '9–15%', summary: 'Monitoring, complications and diagnostic risk' },
  { name: 'Physiological Adaptation', target: '11–17%', summary: 'Acute illness, shock and complex physiologic changes' },
];

export const domainsForTrack = (track: StudyTrack) => track === 'SNLE' ? domains : track === 'PNLE' ? pnleDomains : usrnDomains;

export const domainReferences: Record<LibraryDomain, { title: string; href: string }> = {
  Fundamentals: { title: 'Saudi Patient Safety Standards', href: 'https://resources.spsc.gov.sa/pss.pdf' },
  'Adult Nursing': { title: 'SCFHS Scope of Nursing and Midwifery Practice', href: 'https://scfhs.org.sa/sites/default/files/2024-02/The%20Scope%20of%20Nursing%20and%20Midwifery%20Practice%20in%20Saudi%20Arabia%20%20%282%29_0.pdf' },
  'Maternal–Child': { title: 'WHO Intrapartum Care Recommendations', href: 'https://www.who.int/publications/i/item/9789241550215' },
  'Management & Leadership': { title: 'SCFHS Scope of Nursing and Midwifery Practice', href: 'https://scfhs.org.sa/sites/default/files/2024-02/The%20Scope%20of%20Nursing%20and%20Midwifery%20Practice%20in%20Saudi%20Arabia%20%20%282%29_0.pdf' },
  'Nursing Practice I': { title: 'PRC Enhanced Table of Specifications for Nursing', href: 'https://prc.gov.ph/sites/default/files/2025-10%20%20published%20Enhanced%20TOS%20nuse.pdf' },
  'Nursing Practice II': { title: 'PRC Enhanced Table of Specifications for Nursing', href: 'https://prc.gov.ph/sites/default/files/2025-10%20%20published%20Enhanced%20TOS%20nuse.pdf' },
  'Nursing Practice III': { title: 'PRC Enhanced Table of Specifications for Nursing', href: 'https://prc.gov.ph/sites/default/files/2025-10%20%20published%20Enhanced%20TOS%20nuse.pdf' },
  'Nursing Practice IV': { title: 'PRC Enhanced Table of Specifications for Nursing', href: 'https://prc.gov.ph/sites/default/files/2025-10%20%20published%20Enhanced%20TOS%20nuse.pdf' },
  'Nursing Practice V': { title: 'PRC Enhanced Table of Specifications for Nursing', href: 'https://prc.gov.ph/sites/default/files/2025-10%20%20published%20Enhanced%20TOS%20nuse.pdf' },
  'Management of Care': { title: '2026 NCLEX-RN Test Plan', href: 'https://www.ncsbn.org/public-files/2026_RN_Test-Plan_English-F.pdf' },
  'Safety and Infection Control': { title: '2026 NCLEX-RN Test Plan', href: 'https://www.ncsbn.org/public-files/2026_RN_Test-Plan_English-F.pdf' },
  'Health Promotion and Maintenance': { title: '2026 NCLEX-RN Test Plan', href: 'https://www.ncsbn.org/public-files/2026_RN_Test-Plan_English-F.pdf' },
  'Psychosocial Integrity': { title: '2026 NCLEX-RN Test Plan', href: 'https://www.ncsbn.org/public-files/2026_RN_Test-Plan_English-F.pdf' },
  'Basic Care and Comfort': { title: '2026 NCLEX-RN Test Plan', href: 'https://www.ncsbn.org/public-files/2026_RN_Test-Plan_English-F.pdf' },
  'Pharmacological and Parenteral Therapies': { title: '2026 NCLEX-RN Test Plan', href: 'https://www.ncsbn.org/public-files/2026_RN_Test-Plan_English-F.pdf' },
  'Reduction of Risk Potential': { title: '2026 NCLEX-RN Test Plan', href: 'https://www.ncsbn.org/public-files/2026_RN_Test-Plan_English-F.pdf' },
  'Physiological Adaptation': { title: '2026 NCLEX-RN Test Plan', href: 'https://www.ncsbn.org/public-files/2026_RN_Test-Plan_English-F.pdf' },
};
