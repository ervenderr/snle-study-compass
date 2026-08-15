// These are fresh teaching scenarios. The set names are study-room labels only;
// no source-document stems, choices, or answer keys are reproduced here.
export const DOCTOR18_SNLE_MOCK_EXAM_TEMPLATES = [
  {
    id: 'SNLE-D18-001', topic: 'Fundamentals — Transmission-based precautions',
    stem: 'A client on contact precautions needs a blood-pressure check. Which action best prevents equipment from carrying organisms to another client?',
    choices: ['Use the unit cuff for all clients after wiping it at the end of the shift', 'Keep dedicated or appropriately disinfected equipment available according to infection-control policy', 'Ask the client to take their own blood pressure without instruction', 'Delay all vital signs until precautions are discontinued'], correctIndex: 1,
    rationale: 'Contact precautions reduce transmission through hands, clothing, and shared equipment. Use dedicated equipment when available or clean and disinfect reusable equipment between clients according to the facility policy.',
  },
  {
    id: 'SNLE-D18-002', topic: 'Adult Nursing — Hypovolemia recognition',
    stem: 'A client with ongoing gastrointestinal bleeding becomes pale, confused, and clammy. Blood pressure is falling and pulse is rapid. What is the nurse’s priority?',
    choices: ['Recognize possible shock, assess ABCs, call for urgent help, and follow the emergency protocol', 'Offer a large glass of water and reassess in one hour', 'Place the client in a chair so they can describe the bleeding', 'Document the findings after routine medication administration'], correctIndex: 0,
    rationale: 'Hypotension, tachycardia, altered mental status, and cool clammy skin can indicate circulatory shock. Immediate assessment, escalation, and protocol-directed support take priority over routine care or delayed documentation.',
  },
  {
    id: 'SNLE-D18-003', topic: 'Newborn — Hypoglycemia screening',
    stem: 'A newborn of a mother with diabetes is jittery and has poor feeding soon after birth. What should the nurse do first?',
    choices: ['Assess the newborn promptly, including blood glucose, and follow the neonatal hypoglycemia protocol', 'Wait until the next scheduled feed because jitteriness is expected', 'Give plain water by bottle', 'Separate the newborn from the parent without assessment'], correctIndex: 0,
    rationale: 'Jitteriness and poor feeding can be signs of neonatal hypoglycemia, especially in an infant of a mother with diabetes. Prompt assessment and protocol-directed feeding or treatment help prevent deterioration.',
  },
  {
    id: 'SNLE-D18-004', topic: 'Management & Leadership — Safety reporting',
    stem: 'A nurse catches a near-miss when a medication label does not match the electronic record before giving the dose. What is the best next action after protecting the client?',
    choices: ['Discard the label and say nothing because no harm occurred', 'Report the near-miss through the approved safety process and share the facts with the appropriate team', 'Change the electronic record independently to match the label', 'Wait to see whether a colleague notices the mismatch'], correctIndex: 1,
    rationale: 'Near-miss reporting supports systems learning before a client is harmed. The nurse protects the client first, preserves accurate facts, and uses the organization’s reporting and escalation process.',
  },
];

export const SNLE_MOCK_EXAM_PART_1_READABLE_TEMPLATES = [
  {
    id: 'SNLE-M1-001', topic: 'Fundamentals — Peripheral IV assessment',
    stem: 'While checking a peripheral IV infusion, the nurse finds cool swelling and blanching around the insertion site. The client reports tightness. What is the best action?',
    choices: ['Stop the infusion, remove the IV as appropriate, assess the limb, and follow the infiltration protocol', 'Increase the infusion rate to clear the line', 'Apply a tourniquet above the site and continue the infusion', 'Leave the IV in place until the prescribed fluid is finished'], correctIndex: 0,
    rationale: 'Cool swelling, blanching, and discomfort suggest infiltration. Stop the infusion promptly, assess the site, remove the device when indicated, and provide treatment and documentation according to local policy.',
  },
  {
    id: 'SNLE-M1-002', topic: 'Adult Nursing — Acute stroke response',
    stem: 'During a meal, a client suddenly develops facial droop and slurred speech. What should the nurse do first?',
    choices: ['Activate urgent stroke assessment, note the time symptoms were first observed, and assess ABCs', 'Offer water to see whether the speech improves', 'Ask the client to rest and repeat the assessment after lunch', 'Give the client their routine antihypertensive medication'], correctIndex: 0,
    rationale: 'New focal neurologic changes may indicate stroke. Rapid escalation, assessment of stability, and documenting the last known well time support time-sensitive evaluation and treatment.',
  },
  {
    id: 'SNLE-M1-003', topic: 'Pediatrics — Respiratory assessment',
    stem: 'A child with asthma is sitting upright, speaking only one or two words at a time, and using neck muscles to breathe. What is the nurse’s priority?',
    choices: ['Recognize severe respiratory distress, assess airway and breathing, and obtain urgent help', 'Encourage the child to lie flat and rest quietly', 'Offer food before assessing the child', 'Delay action until the family can provide a full history'], correctIndex: 0,
    rationale: 'Difficulty speaking, accessory-muscle use, and an upright posture can signal significant respiratory distress. Immediate airway-breathing assessment, protocol-directed support, and escalation are priorities.',
  },
  {
    id: 'SNLE-M1-004', topic: 'Management & Leadership — Delegation',
    stem: 'The registered nurse is caring for four stable clients and one client newly reporting chest pressure. Which task is most appropriate to delegate to trained assistive personnel, according to local policy?',
    choices: ['Obtain routine vital signs for a stable client and report abnormal findings promptly', 'Perform the initial assessment of the client with chest pressure', 'Teach a client how to use a new inhaler', 'Decide whether a client can be discharged'], correctIndex: 0,
    rationale: 'Routine, predictable tasks can be delegated to trained assistive personnel within policy, with clear reporting expectations. Assessment, teaching, clinical judgment, and discharge decisions remain registered-nurse responsibilities.',
  },
];

export const SNLE_MOCK_EXAM_PART_2_READABLE_TEMPLATES = [
  {
    id: 'SNLE-M2-001', topic: 'Fundamentals — Sepsis escalation',
    stem: 'A postoperative client has a temperature of 39.1°C, heart rate of 122/min, new confusion, and low urine output. What is the nurse’s best action?',
    choices: ['Recognize possible sepsis, assess ABCs and perfusion, and urgently escalate using the facility pathway', 'Give a routine antipyretic and reassess tomorrow', 'Encourage sleep because confusion is common after surgery', 'Remove the urinary catheter without further assessment'], correctIndex: 0,
    rationale: 'Fever with tachycardia, altered mentation, and oliguria may indicate sepsis with organ dysfunction. Rapid assessment, escalation, and the approved sepsis pathway are needed without waiting for routine review.',
  },
  {
    id: 'SNLE-M2-002', topic: 'Adult Nursing — Potassium administration safety',
    stem: 'A prescription for intravenous potassium chloride arrives for a client with hypokalemia. Which action is essential before administration?',
    choices: ['Verify the concentration, dilution, infusion rate, and monitoring requirements using the high-alert medication process', 'Give the potassium by rapid IV push to correct the level quickly', 'Mix it with any compatible-looking medication at the bedside', 'Administer it without checking renal function or urine output'], correctIndex: 0,
    rationale: 'Intravenous potassium is a high-alert medication. Safe administration requires prescribed dilution and controlled infusion, verification procedures, and appropriate monitoring; it must never be given by IV push.',
  },
  {
    id: 'SNLE-M2-003', topic: 'Postpartum — Hemorrhage response',
    stem: 'Thirty minutes after birth, a client has heavy vaginal bleeding and a boggy uterus. What should the nurse do first while calling for help?',
    choices: ['Assess uterine tone and begin protocol-directed uterine massage while preparing further emergency measures', 'Offer the client a warm drink and reassess in 15 minutes', 'Leave to complete the birth documentation', 'Ask the client to walk to the bathroom alone'], correctIndex: 0,
    rationale: 'Heavy bleeding with a boggy uterus suggests uterine atony, a common cause of postpartum hemorrhage. The nurse calls for urgent assistance and starts immediate, protocol-directed assessment and treatment while monitoring the client closely.',
  },
  {
    id: 'SNLE-M2-004', topic: 'Management & Leadership — Clinical handover',
    stem: 'At shift handover, which information is most important to communicate about a client receiving a new opioid infusion?',
    choices: ['The client’s favorite television program', 'Current pain score, sedation and respiratory assessment, infusion details, recent changes, and escalation concerns', 'Only the diagnosis listed at admission', 'A summary of the client’s visitors during the day'], correctIndex: 1,
    rationale: 'Safe handover communicates current risks, treatment details, assessments, response to therapy, and what needs follow-up. Opioid infusions require particular attention to sedation and respiratory status.',
  },
];
