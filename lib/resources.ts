export type StudyTrack = 'SNLE' | 'PNLE';

export const studyResources = {
  SNLE: [
    { kind: 'Official blueprint', title: 'SCFHS SNLE Applicant Guide', text: 'Start here for the current SNLE blueprint, exam structure, and the Commission’s cited preparation references.', href: 'https://scfhs.org.sa/sites/default/files/2025-09/SNLE%20Applicant%20Guide%20.pdf' },
    { kind: 'Saudi practice context', title: 'Scope of Nursing and Midwifery Practice in Saudi Arabia', text: 'Useful for accountability, delegation, escalation, documentation, advocacy, and scope-of-practice revision.', href: 'https://scfhs.org.sa/sites/default/files/2024-02/The%20Scope%20of%20Nursing%20and%20Midwifery%20Practice%20in%20Saudi%20Arabia%20%20%282%29_0.pdf' },
    { kind: 'Commercial companion', title: 'Fast and Easy Steps to Understand Nursing Fundamentals: SNLE Review Manual', text: 'A commercially published SNLE-focused review manual. Confirm the edition and seller yourself; this app does not reproduce its content.', href: 'https://open-exam-prep.com/books/exams/sa-scfhs-snle' },
    { kind: 'Safety reference', title: 'Saudi Patient Safety Standards', text: 'A public Saudi safety reference for identifiers, medication safety, deterioration, infection prevention, and escalation.', href: 'https://resources.spsc.gov.sa/pss.pdf' },
  ],
  PNLE: [
    { kind: 'Official blueprint', title: 'PRC Enhanced Tables of Specifications for Nursing', text: 'The official Philippine Board of Nursing table of specifications for the Nurse Licensure Examination.', href: 'https://prc.gov.ph/sites/default/files/2025-10%20%20published%20Enhanced%20TOS%20nuse.pdf' },
    { kind: 'Official structure', title: 'PRC Nursing Special Professional Licensure Examination Program', text: 'Shows the five Nursing Practice areas used in the published 2026 examination program.', href: 'https://www.prc.gov.ph/sites/default/files/Exam%20Progam%20May%202026%20SPLE%20%28Nursing%29.pdf' },
    { kind: 'Competency reference', title: 'Philippine National Nursing Core Competency Standards', text: 'A public reference for entry-level nursing roles, leadership, documentation, collaboration, and community practice.', href: 'https://www.prc.gov.ph/uploaded/documents/Nursing%20Core%20Competency%20Standards%202012.pdf' },
  ],
} as const;
