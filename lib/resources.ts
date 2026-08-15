export type StudyTrack = 'SNLE' | 'PNLE' | 'USRN';

export const studyResources = {
  SNLE: [
    { kind: 'Official blueprint', title: 'SCFHS SNLE Applicant Guide', text: 'Start here for the current SNLE blueprint, exam structure, and the Commission’s cited preparation references.', href: 'https://scfhs.org.sa/sites/default/files/2025-09/SNLE%20Applicant%20Guide%20.pdf' },
    { kind: 'Official practice exam', title: 'SCFHS Saudi Licensure Practice Exam', text: 'Official nursing practice-exam service that simulates Saudi licensure examinations. Access and fees are managed by SCFHS.', href: 'https://scfhs.org.sa/en/practice-exam-saudi-licensure-examinations' },
    { kind: 'Free third-party mock', title: 'PrometricMCQ SNLE Mock', text: 'A free 15-question SNLE-style mock with rationales. Third-party material—use it for practice, then verify clinical facts with official guidance.', href: 'https://www.prometricmcq.com/free-scfhs-prometric-mock-for-nurses-doctors/' },
    { kind: 'Free third-party mock', title: 'Phoenix RN Free SNLE Q&A', text: 'Free SNLE-style questions, rationales, and a timed mock. This is not an SCFHS product.', href: 'https://phoenix-rn.com/free/snle/qa' },
    { kind: 'Free third-party mock', title: 'Doctor13 SNLE Mock Exam Part 1', text: 'A third-party SNLE practice mock. Use it as supplementary practice and verify clinical guidance with official resources; Nurse Quest does not reproduce its questions.', href: 'https://doctor13.com/snle-mock-exam-part-1/' },
    { kind: 'Free third-party mock', title: 'Doctor13 SNLE Mock Exam Part 2', text: 'A third-party SNLE practice mock. Use it as supplementary practice and verify clinical guidance with official resources; Nurse Quest does not reproduce its questions.', href: 'https://doctor13.com/snle-mock-exam-part-2/' },
    { kind: 'Saudi practice context', title: 'Scope of Nursing and Midwifery Practice in Saudi Arabia', text: 'Useful for accountability, delegation, escalation, documentation, advocacy, and scope-of-practice revision.', href: 'https://scfhs.org.sa/sites/default/files/2024-02/The%20Scope%20of%20Nursing%20and%20Midwifery%20Practice%20in%20Saudi%20Arabia%20%20%282%29_0.pdf' },
    { kind: 'Commercial companion', title: 'Fast and Easy Steps to Understand Nursing Fundamentals: SNLE Review Manual', text: 'A commercially published SNLE-focused review manual. Confirm the edition and seller yourself; this app does not reproduce its content.', href: 'https://open-exam-prep.com/books/exams/sa-scfhs-snle' },
    { kind: 'Safety reference', title: 'Saudi Patient Safety Standards', text: 'A public Saudi safety reference for identifiers, medication safety, deterioration, infection prevention, and escalation.', href: 'https://resources.spsc.gov.sa/pss.pdf' },
  ],
  PNLE: [
    { kind: 'Official blueprint', title: 'PRC Enhanced Tables of Specifications for Nursing', text: 'The official Philippine Board of Nursing table of specifications for the Nurse Licensure Examination.', href: 'https://prc.gov.ph/sites/default/files/2025-10%20%20published%20Enhanced%20TOS%20nuse.pdf' },
    { kind: 'Free third-party mock', title: 'NursesPH PNLE Simulation Trial', text: 'A free PNLE-style baseline trial with practice and timed modes. Registration is required; it is not a PRC product.', href: 'https://ignition.nursesph.com/pnle2026page-836463' },
    { kind: 'Free third-party reviewer', title: 'St. Louis Review Center Free NLE Reviewer', text: 'Free board-style questions, rationales, and test-taking discussions. Treat it as supplementary practice, not PRC source material.', href: 'https://www.slrcreview.com/2026/07/free-nle-online-reviewer-2026-nursing.html?m=1' },
    { kind: 'Official structure', title: 'PRC Nursing Special Professional Licensure Examination Program', text: 'Shows the five Nursing Practice areas used in the published 2026 examination program.', href: 'https://www.prc.gov.ph/sites/default/files/Exam%20Progam%20May%202026%20SPLE%20%28Nursing%29.pdf' },
    { kind: 'Competency reference', title: 'Philippine National Nursing Core Competency Standards', text: 'A public reference for entry-level nursing roles, leadership, documentation, collaboration, and community practice.', href: 'https://www.prc.gov.ph/uploaded/documents/Nursing%20Core%20Competency%20Standards%202012.pdf' },
  ],
  USRN: [
    { kind: 'Official 2026 blueprint', title: '2026 NCLEX-RN Test Plan', text: 'The National Council of State Boards of Nursing blueprint effective April 2026, including Client Needs categories and clinical-judgment guidance.', href: 'https://www.ncsbn.org/public-files/2026_RN_Test-Plan_English-F.pdf' },
    { kind: 'Official free samples', title: 'NCLEX Prepare: Sample Pack & Exam Preview', text: 'NCSBN’s free sample questions, clinical-judgment case studies, exam preview, and candidate tutorial.', href: 'https://www.nclex.com/prepare.page' },
    { kind: 'Official candidate guide', title: '2026 NCLEX Examination Candidate Bulletin', text: 'Official exam format, registration, and Client Needs distribution information for RN candidates.', href: 'https://www.ncsbn.org/public-files/NCLEX_Examination_Candidate_Bulletin_April_2026.pdf' },
  ],
} as const;
