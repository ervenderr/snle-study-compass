// Original PNLE expansion items aligned to the public Nursing Practice areas.
export const PNLE_EXPANSION_TEMPLATES = [
  {
    id: 'PNLE-I-003', topic: 'Nursing Practice I — Immunization cold chain',
    stem: 'At a community clinic, the nurse finds that a vaccine refrigerator was left open and the temperature is outside the documented safe range. What is the best action?',
    choices: ['Use the vaccines first so none are wasted', 'Quarantine the affected vaccines, document the excursion, and follow the cold-chain escalation process', 'Return the vaccines to the shelf and check the temperature next week', 'Give the vaccines only to healthy adults'], correctIndex: 1,
    rationale: 'A temperature excursion can affect vaccine potency. The nurse protects clients by separating the stock, documenting the event, and following the local cold-chain and public-health process before any product is used.',
  },
  {
    id: 'PNLE-I-004', topic: 'Nursing Practice I — Community disaster triage',
    stem: 'After a community flood, which client should the nurse prioritize for immediate referral?',
    choices: ['An adult requesting a refill of vitamins', 'A child who is lethargic with rapid breathing and signs of poor perfusion', 'A stable adult asking where food supplies are distributed', 'A client with a superficial abrasion and normal vital signs'], correctIndex: 1,
    rationale: 'In disaster triage, clients with immediate threats to airway, breathing, circulation, or mental status require urgent referral and stabilization. Stable or minor concerns can be addressed after life-threatening needs.',
  },
  {
    id: 'PNLE-II-003', topic: 'Nursing Practice II — Breastfeeding support',
    stem: 'A breastfeeding client reports painful cracked nipples and says the newborn feeds for long periods but still seems hungry. What is the nurse’s best initial action?',
    choices: ['Tell the client to stop breastfeeding for a week', 'Assess positioning and latch, then provide hands-on feeding support', 'Offer water to the newborn between feeds', 'Recommend nipple cream without assessing a feed'], correctIndex: 1,
    rationale: 'Painful nipples and ineffective feeding often reflect a positioning or latch problem. Observing a feeding and supporting a deep, effective latch addresses milk transfer and protects the parent’s skin while further assessment is arranged as needed.',
  },
  {
    id: 'PNLE-II-004', topic: 'Nursing Practice II — Pediatric dehydration',
    stem: 'An infant with diarrhea is difficult to arouse, has sunken eyes, weak pulses, and markedly decreased urine output. What is the nurse’s priority?',
    choices: ['Recognize severe dehydration, assess ABCs, and prepare for urgent fluid resuscitation per protocol', 'Offer a high-fiber snack', 'Delay intervention until the infant accepts oral fluids', 'Give an antidiarrheal medication without assessment'], correctIndex: 0,
    rationale: 'Lethargy, weak pulses, and low urine output suggest severe dehydration with poor perfusion. Immediate assessment, urgent escalation, and protocol-directed fluid management are priorities.',
  },
  {
    id: 'PNLE-III-003', topic: 'Nursing Practice III — Airborne infection control',
    stem: 'A client with suspected pulmonary tuberculosis is admitted with persistent cough and weight loss. Which infection-control measure is most appropriate while evaluation is underway?',
    choices: ['Place the client in appropriate airborne precautions and use the required respiratory protection', 'Use standard precautions only because tuberculosis is not contagious', 'Ask the client to share a room with another coughing client', 'Delay isolation until a culture result is final'], correctIndex: 0,
    rationale: 'Suspected pulmonary tuberculosis requires prompt infection-control measures according to local policy, including appropriate airborne precautions and respiratory protection, while diagnostic evaluation proceeds.',
  },
  {
    id: 'PNLE-III-004', topic: 'Nursing Practice III — Therapeutic communication',
    stem: 'A client experiencing panic says, “I am dying. I cannot breathe.” Which response is most therapeutic?',
    choices: ['“There is nothing wrong with you.”', '“Stay with me. You are safe right now; let us slow your breathing together while I assess you.”', '“Stop talking about the panic.”', '“You should handle this on your own.”'], correctIndex: 1,
    rationale: 'A calm, present response acknowledges distress, supports safety, and combines therapeutic communication with clinical assessment. Minimizing or dismissing the client can increase fear and reduce trust.',
  },
  {
    id: 'PNLE-IV-003', topic: 'Nursing Practice IV — Septic shock',
    stem: 'A client with an infected wound becomes confused, hypotensive, tachycardic, and cool to the touch. What is the nurse’s priority action?',
    choices: ['Recognize possible septic shock, support ABCs, and activate urgent escalation', 'Wait for the next scheduled antibiotic dose', 'Restrict fluids because urine output is low', 'Encourage the client to walk to improve circulation'], correctIndex: 0,
    rationale: 'Infection with hypotension, altered mental status, and poor perfusion may indicate septic shock. Rapid ABC assessment and time-critical escalation are required while ordered sepsis care is initiated.',
  },
  {
    id: 'PNLE-IV-004', topic: 'Nursing Practice IV — Acute stroke safety',
    stem: 'A client develops sudden facial droop, unilateral weakness, and difficulty speaking. What should the nurse do first?',
    choices: ['Activate the stroke pathway and assess ABCs while noting the time symptoms began', 'Give oral fluids to test swallowing', 'Ask the client to walk to assess balance', 'Wait for the next physician round'], correctIndex: 0,
    rationale: 'Sudden focal neurologic deficits require immediate stroke evaluation. The nurse activates the emergency pathway, assesses stability, and identifies the symptom-onset time; oral intake is withheld until swallowing is assessed.',
  },
  {
    id: 'PNLE-V-003', topic: 'Nursing Practice V — Research ethics',
    stem: 'A client is invited to join a nursing research study and says, “Will my care change if I say no?” What is the nurse’s best response?',
    choices: ['“You must participate because the unit approved the study.”', '“Your care will continue regardless; participation is voluntary and you may ask questions before deciding.”', '“Sign first and read the information later.”', '“Your family must decide for you.”'], correctIndex: 1,
    rationale: 'Ethical research participation is voluntary. Clients must be free to decline or withdraw without penalty or loss of usual care, and they need an opportunity to ask questions before providing informed consent.',
  },
  {
    id: 'PNLE-V-004', topic: 'Nursing Practice V — Professional accountability',
    stem: 'A nurse discovers that a medication was given to the wrong client. After assessing the client and obtaining urgent help, what should happen next?',
    choices: ['Hide the error because reporting may lead to discipline', 'Document and report the event through the organization’s required safety process', 'Change the medication record so it appears correct', 'Wait to see whether the client develops symptoms'], correctIndex: 1,
    rationale: 'Medication errors require immediate client assessment and escalation, followed by factual documentation and reporting through the organization’s safety process. Reporting supports follow-up, disclosure processes, and prevention of future harm.',
  },
];
