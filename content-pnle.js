// Original study prompts written for this app. They are mapped broadly to the
// PRC Nursing Practice areas; they are not copied from reviewers or past exams.
export const PNLE_TEMPLATES = [
  {
    id: 'PNLE-I-001', topic: 'Nursing Practice I — Community respiratory health',
    stem: 'During a home visit, a client reports a cough for more than two weeks with weight loss and night sweats. What is the nurse’s priority action?',
    choices: ['Suggest an over-the-counter cough suppressant and review next month', 'Provide cough etiquette teaching and arrange prompt evaluation through the local TB pathway', 'Ask the client to avoid all family contact until symptoms resolve', 'Document the symptoms but wait for a fever before referring'], correctIndex: 1,
    rationale: 'Persistent cough with systemic symptoms needs prompt assessment through the local TB pathway. Cough etiquette reduces transmission while evaluation is arranged.',
    scenarioVariants: ['At a community clinic, a client has prolonged cough, unintentional weight loss, and night sweats. Which nursing action best protects the client and household?', 'A barangay health nurse identifies a resident with symptoms concerning for pulmonary tuberculosis. What should happen first?'],
  },
  {
    id: 'PNLE-I-002', topic: 'Nursing Practice I — Community documentation',
    stem: 'A nurse notices an error in a community health record before the report is submitted. What is the most appropriate correction?',
    choices: ['Erase the entry completely so the record appears clean', 'Use correction fluid and write the replacement value', 'Follow agency policy to make a traceable correction, then date and authenticate it', 'Leave the error because changing a record is never permitted'], correctIndex: 2,
    rationale: 'Health records must remain accurate and traceable. A policy-compliant correction preserves the original record and shows who made the update.',
    scenarioVariants: ['While preparing a community census report, a nurse finds a transposed value in one client entry. How should it be corrected?', 'A public-health nurse sees that a vaccination date was entered incorrectly. Which documentation practice is safest?'],
  },
  {
    id: 'PNLE-II-001', topic: 'Nursing Practice II — Maternal magnesium safety',
    stem: 'A postpartum client receiving magnesium sulfate becomes very drowsy, has absent patellar reflexes, and respirations of 9/minute. What is the nurse’s first action?',
    choices: ['Increase the infusion to prevent seizures', 'Stop the magnesium infusion and call for urgent help', 'Place the client flat and reassess in 30 minutes', 'Encourage oral fluids and continue observation'], correctIndex: 1,
    rationale: 'Absent reflexes and respiratory depression suggest magnesium toxicity. Stop the infusion, support airway and breathing, and escalate immediately per protocol.',
    scenarioVariants: ['In the recovery area, a client on magnesium sulfate has a respiratory rate of 9/minute and no deep tendon reflexes. What is the priority response?', 'During a postpartum assessment, which action is most urgent when magnesium toxicity is suspected?'],
  },
  {
    id: 'PNLE-II-002', topic: 'Nursing Practice II — Postpartum hemorrhage',
    stem: 'Thirty minutes after birth, a client has heavy vaginal bleeding and a boggy fundus. What should the nurse do first?',
    choices: ['Massage the fundus and assess whether the bladder is distended', 'Wait for the next scheduled vital signs', 'Offer oral fluids and encourage sleep', 'Prepare the client for discharge teaching'], correctIndex: 0,
    rationale: 'A boggy uterus commonly reflects uterine atony. Fundal massage and assessment for bladder distention are immediate nursing actions while help and further treatment are arranged.',
    scenarioVariants: ['A new mother has brisk lochia and a soft, poorly contracted uterus. What is the nurse’s immediate priority?', 'After a vaginal birth, the fundus is boggy with increased bleeding. Which nursing action comes first?'],
  },
  {
    id: 'PNLE-III-001', topic: 'Nursing Practice III — Postoperative respiratory priority',
    stem: 'A postoperative client suddenly reports shortness of breath, looks anxious, and has an oxygen saturation of 86% on room air. What is the nurse’s priority action?',
    choices: ['Encourage the client to walk independently', 'Apply oxygen, assess airway and breathing, and seek urgent clinical review', 'Offer oral pain medicine and reassess later', 'Ask the client to lie flat and remain still'], correctIndex: 1,
    rationale: 'Sudden hypoxemia after surgery is an airway-breathing emergency. Provide oxygen, rapidly assess, and escalate for urgent evaluation.',
    scenarioVariants: ['Following surgery, a client becomes acutely dyspneic with low oxygen saturation. What should the nurse do first?', 'A post-op client has new respiratory distress and an SpO2 of 86%. Which response is the priority?'],
  },
  {
    id: 'PNLE-III-002', topic: 'Nursing Practice III — Fluid overload',
    stem: 'A client receiving IV fluids develops crackles, increasing dyspnea, and new peripheral edema. What is the nurse’s priority action?',
    choices: ['Increase the IV rate to improve circulation', 'Position upright, assess respiratory status, and notify the prescriber promptly', 'Encourage the client to drink more water', 'Document the findings at the end of the shift'], correctIndex: 1,
    rationale: 'Crackles and dyspnea can indicate fluid overload with pulmonary congestion. Upright positioning, rapid respiratory assessment, and escalation are priorities.',
    scenarioVariants: ['During an IV infusion, a client develops worsening breathlessness, crackles, and edema. Which nursing action is most appropriate?', 'A medical-surgical client shows signs of possible fluid overload. What is the first safe response?'],
  },
  {
    id: 'PNLE-IV-001', topic: 'Nursing Practice IV — Diabetic ketoacidosis',
    stem: 'A client with diabetic ketoacidosis is receiving IV insulin. Which laboratory value requires especially close monitoring as treatment begins?',
    choices: ['Potassium', 'Hemoglobin', 'Calcium', 'Platelet count'], correctIndex: 0,
    rationale: 'Insulin shifts potassium into cells and can cause dangerous hypokalemia. Potassium must be monitored and managed closely during DKA treatment.',
    scenarioVariants: ['While IV insulin is started for DKA, which value is the nurse most concerned could fall quickly?', 'A client is being treated for DKA with insulin infusion. Which laboratory trend needs close surveillance?'],
  },
  {
    id: 'PNLE-IV-002', topic: 'Nursing Practice IV — Gastrointestinal bleeding',
    stem: 'A client with suspected upper gastrointestinal bleeding becomes pale, confused, and hypotensive. What is the nurse’s priority?',
    choices: ['Assess circulation, obtain help, and prepare for rapid stabilization', 'Give oral iron and encourage rest', 'Offer a high-fiber snack', 'Delay intervention until the next hemoglobin result'], correctIndex: 0,
    rationale: 'Pallor, confusion, and hypotension can indicate shock from blood loss. Immediate circulation assessment and rapid escalation take priority.',
    scenarioVariants: ['A client with coffee-ground emesis becomes hypotensive and confused. What is the priority nursing response?', 'During care for a possible GI bleed, the client’s blood pressure falls and mental status changes. What comes first?'],
  },
  {
    id: 'PNLE-V-001', topic: 'Nursing Practice V — Suicide safety',
    stem: 'A client says, “My family would be better off without me.” What is the nurse’s best initial response?',
    choices: ['Change the subject to avoid upsetting the client', 'Ask directly about thoughts, plan, means, and immediate safety', 'Promise to keep the statement secret', 'Tell the client to focus on positive thoughts'], correctIndex: 1,
    rationale: 'Direct, calm suicide-risk assessment does not create risk. Asking about thoughts, plan, means, and immediate safety guides urgent protection and escalation.',
    scenarioVariants: ['A client makes a statement suggesting hopelessness and self-harm. What is the nurse’s first therapeutic action?', 'During an interview, a client expresses that life is no longer worth living. Which response is most appropriate?'],
  },
  {
    id: 'PNLE-V-002', topic: 'Nursing Practice V — Acute confusion',
    stem: 'An older adult becomes suddenly disoriented and restless overnight. What is the nurse’s priority approach?',
    choices: ['Assume the change is normal aging', 'Assess for acute reversible causes and protect the client from harm', 'Teach complex relaxation exercises', 'Restrict all family communication'], correctIndex: 1,
    rationale: 'Sudden confusion can be delirium and requires assessment for reversible contributors such as infection, hypoxia, medication effects, or metabolic problems, alongside safety measures.',
    scenarioVariants: ['A previously alert older client becomes acutely confused during the shift. What is the nurse’s priority?', 'A hospitalized older adult develops sudden agitation and disorientation. Which nursing approach is safest?'],
  },
];
