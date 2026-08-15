/* Original SNLE study templates: maternal-child nursing and leadership. */
export const MATERNAL_CHILD_LEADERSHIP_TEMPLATES = [
  {
    id: "mc-01",
    topic: "Maternity — Hypertensive Disorders",
    stem: "A postpartum client receiving IV magnesium sulfate for severe preeclampsia has a respiratory rate of 10/min, absent patellar reflexes, and urine output of 20 mL/hr. Which action is the priority?",
    choices: [
      "Increase the maintenance IV-fluid rate",
      "Stop the magnesium infusion and prepare to give calcium gluconate per protocol",
      "Place the client in a high-Fowler position and reassess in 30 minutes",
      "Encourage the client to cough and deep-breathe"
    ],
    correctIndex: 1,
    rationale: "Respiratory depression, absent deep-tendon reflexes, and oliguria suggest magnesium toxicity. Stop magnesium immediately, maintain airway support, notify the appropriate clinician, and prepare the antidote, calcium gluconate, according to local policy.",
    scenarioVariants: [
      "The client has a respiratory rate of 9/min and cannot elicit patellar reflexes.",
      "After a magnesium dose, the client becomes very drowsy and urine output falls to 15 mL/hr.",
      "A client reports blurred vision; assessment finds weak reflexes and respirations of 11/min."
    ]
  },
  {
    id: "mc-02",
    topic: "Intrapartum — Fetal Monitoring",
    stem: "During oxytocin induction, the fetal monitor shows recurrent late decelerations and contractions every 1.5 minutes lasting 95 seconds. What should the nurse do first?",
    choices: [
      "Stop the oxytocin infusion",
      "Perform a sterile vaginal examination",
      "Increase the oxytocin infusion to shorten labor",
      "Ask the client to push with the next contraction"
    ],
    correctIndex: 0,
    rationale: "Tachysystole with recurrent late decelerations can reduce uteroplacental perfusion. The immediate action is to stop oxytocin, reposition the client laterally, support oxygenation as clinically indicated, and escalate using unit protocol.",
    scenarioVariants: [
      "Contractions occur six times in 10 minutes with a prolonged late deceleration.",
      "An oxytocin-treated client develops a nonreassuring tracing after contractions become very frequent.",
      "The fetal baseline is stable, but late decelerations begin after each closely spaced contraction."
    ]
  },
  {
    id: "mc-03",
    topic: "Intrapartum — Umbilical Cord Prolapse",
    stem: "Immediately after rupture of membranes, the nurse sees a pulsating umbilical cord at the vaginal opening and the fetal heart rate drops to 70/min. What is the priority action?",
    choices: [
      "Gently push the cord back into the vagina",
      "Elevate the presenting part with a gloved hand while calling for immediate assistance",
      "Place the client flat and apply fundal pressure",
      "Clamp the cord and document the time of rupture"
    ],
    correctIndex: 1,
    rationale: "A prolapsed cord is an obstetric emergency. Relieve pressure on the cord by manually elevating the presenting part, call for emergency assistance, position the client as directed by protocol, and avoid handling or replacing the cord.",
    scenarioVariants: [
      "A cord is felt during a vaginal examination after spontaneous membrane rupture.",
      "The fetal heart rate suddenly becomes profoundly bradycardic after membranes rupture.",
      "A loop of cord is visible with a breech-presenting fetus."
    ]
  },
  {
    id: "mc-04",
    topic: "Postpartum — Hemorrhage",
    stem: "One hour after a vaginal birth, a client saturates a perineal pad in 15 minutes. The uterus is boggy and displaced to the right. Which nursing action should occur first?",
    choices: [
      "Massage the fundus and assess bladder distention",
      "Administer an oral iron supplement",
      "Prepare the client for discharge teaching",
      "Place the newborn skin-to-skin with the client"
    ],
    correctIndex: 0,
    rationale: "A boggy, displaced uterus suggests uterine atony with bladder distention. Fundal massage and promoting bladder emptying are immediate measures while activating the postpartum-hemorrhage response and preparing prescribed uterotonics.",
    scenarioVariants: [
      "The fundus is above the umbilicus, soft, and deviated after birth.",
      "A client reports a gush of blood and has a full bladder with a boggy uterus.",
      "Heavy lochia is noted while the uterus is soft rather than firm and midline."
    ]
  },
  {
    id: "mc-05",
    topic: "Postpartum — Infection",
    stem: "On postpartum day 3, a client reports uterine tenderness and foul-smelling lochia; temperature is 38.6°C. Which action is most appropriate?",
    choices: [
      "Explain that fever is expected while breast milk is coming in",
      "Promptly notify the responsible clinician and assess for postpartum infection",
      "Encourage a hot sitz bath and reassess at the next shift",
      "Restrict oral fluids until the temperature normalizes"
    ],
    correctIndex: 1,
    rationale: "Fever, uterine tenderness, and foul lochia are concerning for postpartum endometritis or another infection. Prompt assessment, escalation, cultures or antimicrobials as prescribed, and monitoring for sepsis are needed.",
    scenarioVariants: [
      "A postpartum client develops chills, malodorous lochia, and lower abdominal pain.",
      "After cesarean birth, a client has fever and increasing uterine tenderness.",
      "A client returns after discharge with fever and foul vaginal discharge."
    ]
  },
  {
    id: "mc-06",
    topic: "Newborn — Hypoglycemia",
    stem: "A term newborn of a mother with diabetes is jittery two hours after birth. Bedside glucose is low, but the newborn is alert and able to suck. What is the best initial nursing action?",
    choices: [
      "Support prompt feeding and repeat glucose monitoring according to protocol",
      "Delay feeding until a venous sample is resulted",
      "Give plain water by bottle",
      "Place the newborn under phototherapy"
    ],
    correctIndex: 0,
    rationale: "For an alert newborn able to feed, early feeding with timely repeat glucose testing is a common first intervention. Symptomatic infants who cannot feed or remain hypoglycemic need urgent escalation and IV dextrose per local protocol.",
    scenarioVariants: [
      "A large-for-gestational-age newborn is tremulous before the first scheduled feed.",
      "A newborn exposed to maternal diabetes is sleepy but arouses well and has low bedside glucose.",
      "A late-preterm infant has jitteriness and a low glucose value but an effective suck."
    ]
  },
  {
    id: "mc-07",
    topic: "Newborn — Jaundice",
    stem: "A newborn develops visible jaundice at 18 hours of life. Which interpretation is most accurate?",
    choices: [
      "This is expected physiologic jaundice and needs no follow-up",
      "Jaundice in the first 24 hours requires prompt clinical evaluation",
      "The newborn should receive extra water only",
      "This finding confirms breast-milk jaundice"
    ],
    correctIndex: 1,
    rationale: "Jaundice appearing in the first 24 hours is not assumed to be physiologic. It needs timely bilirubin assessment and evaluation for causes such as hemolysis, with treatment guided by age-specific protocols.",
    scenarioVariants: [
      "Yellow discoloration is noted during a newborn's first evening assessment.",
      "A 12-hour-old infant has scleral icterus before the first routine bilirubin screen.",
      "Mild jaundice is observed soon after delivery in an infant with blood-group incompatibility risk."
    ]
  },
  {
    id: "mc-08",
    topic: "Newborn — Safe Sleep",
    stem: "Which parent statement shows correct understanding of safe sleep teaching for a healthy newborn?",
    choices: [
      "I will place my baby on the back in a separate, firm sleep space.",
      "I will use a soft pillow to keep my baby from rolling.",
      "My baby can sleep on the stomach after a full feeding.",
      "Bed-sharing is safest when I am very tired."
    ],
    correctIndex: 0,
    rationale: "The safest routine sleep position is supine on a firm, flat, separate sleep surface without loose bedding, pillows, or soft objects. Teaching should be adapted respectfully to family circumstances while preserving this safety principle.",
    scenarioVariants: [
      "Parents ask how to arrange a newborn's bassinet for overnight sleep.",
      "A family plans to use rolled blankets around the infant during sleep.",
      "A parent says the infant sleeps longer when placed prone."
    ]
  },
  {
    id: "mc-09",
    topic: "Pediatrics — Airway Emergency",
    stem: "A 4-year-old has high fever, drooling, muffled voice, inspiratory stridor, and is sitting forward with the neck extended. What should the nurse do?",
    choices: [
      "Use a tongue depressor to inspect the throat",
      "Keep the child calm, avoid throat examination, and activate urgent airway support",
      "Offer the child oral fluids and reassess after 20 minutes",
      "Place the child supine for a complete physical assessment"
    ],
    correctIndex: 1,
    rationale: "These findings suggest possible epiglottitis or another critical upper-airway obstruction. Agitation or throat examination can worsen obstruction. Keep the child with the caregiver in the position of comfort and mobilize an experienced airway team.",
    scenarioVariants: [
      "A child with suspected epiglottitis refuses to lie down and has drooling.",
      "A febrile child has stridor, anxiety, and a muffled hot-potato voice.",
      "A preschooler is tripod-positioned and cannot comfortably swallow secretions."
    ]
  },
  {
    id: "mc-10",
    topic: "Pediatrics — Dehydration",
    stem: "A 2-year-old with gastroenteritis is lethargic, has no tears, cool extremities, capillary refill of 4 seconds, and weak pulses. Which prescription should the nurse anticipate as the priority?",
    choices: [
      "An isotonic IV fluid bolus",
      "A high-fiber meal",
      "A fluid restriction order",
      "An antidiarrheal medication without further assessment"
    ],
    correctIndex: 0,
    rationale: "Poor perfusion and lethargy indicate severe dehydration or evolving shock. Rapid restoration of intravascular volume with isotonic fluid and close reassessment are priorities; ongoing management follows pediatric weight-based protocols.",
    scenarioVariants: [
      "An infant with vomiting has delayed capillary refill and markedly decreased urine output.",
      "A toddler with diarrhea is difficult to arouse and has thready peripheral pulses.",
      "A child cannot tolerate oral rehydration and shows signs of hypoperfusion."
    ]
  },
  {
    id: "mc-11",
    topic: "Pediatrics — Asthma",
    stem: "A school-age child with asthma is using accessory muscles, speaks only one or two words at a time, and now has very diminished breath sounds. Which finding is most concerning?",
    choices: [
      "The child requests water",
      "The wheeze has become quieter because airflow is severely reduced",
      "The child has a pulse oximeter on the finger",
      "The child is sitting upright"
    ],
    correctIndex: 1,
    rationale: "A silent chest or markedly diminished breath sounds in a distressed asthmatic child can indicate critically reduced airflow and impending respiratory failure. Escalate immediately and implement emergency respiratory treatment per protocol.",
    scenarioVariants: [
      "A previously wheezing child becomes quieter but more fatigued.",
      "A child receiving bronchodilator treatment has worsening work of breathing and minimal air entry.",
      "An asthmatic child becomes drowsy with faint breath sounds."
    ]
  },
  {
    id: "mc-12",
    topic: "Pediatrics — Cardiac Medication Safety",
    stem: "A 3-year-old prescribed digoxin has an apical pulse of 72/min before the dose. What should the nurse do?",
    choices: [
      "Administer the dose with food",
      "Hold the dose and notify the prescriber according to parameters",
      "Double the next dose to maintain the schedule",
      "Give the medication after vigorous activity"
    ],
    correctIndex: 1,
    rationale: "A low apical pulse may indicate that digoxin should be withheld. Compare the rate with the prescribed pediatric hold parameter, hold the medication when indicated, and notify the responsible clinician; do not compensate by doubling later.",
    scenarioVariants: [
      "Before digoxin, a young child has an apical pulse below the documented hold parameter.",
      "A pediatric cardiac patient is unusually sleepy and has a slow apical rate before medication.",
      "A child on digoxin has vomiting and a lower-than-usual heart rate."
    ]
  },
  {
    id: "mc-13",
    topic: "Pediatrics — Medication Calculation Safety",
    stem: "A nurse receives a pediatric medication order written in mg/kg, but the record lists the child's weight only in pounds. What is the safest next step?",
    choices: [
      "Estimate the kilogram weight from the child's age",
      "Convert and verify the current weight in kilograms before calculating the dose",
      "Use the adult maximum dose without calculation",
      "Ask the parent to choose the closest dose"
    ],
    correctIndex: 1,
    rationale: "Weight-based pediatric dosing requires an accurate, current metric weight. Convert pounds to kilograms when needed, independently verify high-risk calculations, and check the ordered dose against safe-range references and local policy.",
    scenarioVariants: [
      "An antibiotic order is written per kilogram, while triage recorded weight in pounds.",
      "A nurse notices a large dose difference after converting a child's recent weight.",
      "A pediatric infusion is ordered in mcg/kg/min and no kilogram weight is documented."
    ]
  },
  {
    id: "mc-14",
    topic: "Pediatrics — Family-Centered Care",
    stem: "A hospitalized child requires a procedure, and the parents have limited proficiency in the care team's primary language. Which action best supports safe informed communication?",
    choices: [
      "Use the child's older sibling as the interpreter",
      "Use a qualified medical interpreter and speak directly to the parent",
      "Provide consent information only after the procedure",
      "Ask another family in the waiting area to translate"
    ],
    correctIndex: 1,
    rationale: "Qualified interpretation supports accurate communication, consent, confidentiality, and family participation. Children and untrained relatives should not be relied upon for complex clinical interpretation except in a genuine emergency when no safer option is available.",
    scenarioVariants: [
      "Parents request an Arabic-language explanation before a procedure.",
      "A parent nods but cannot accurately teach back the medication plan.",
      "A teenager offers to translate surgical-consent information for a parent."
    ]
  },
  {
    id: "lm-01",
    topic: "Leadership — Delegation",
    stem: "Which task is most appropriate for the RN to delegate to trained assistive personnel for a stable adult client?",
    choices: [
      "Perform the initial assessment of new chest pain",
      "Teach insulin self-injection for the first time",
      "Obtain routine vital signs and report abnormal values",
      "Evaluate the response to a newly administered opioid"
    ],
    correctIndex: 2,
    rationale: "Routine, predictable tasks such as obtaining vital signs may be delegated to trained assistive personnel for stable clients. Assessment, initial teaching, clinical judgment, and evaluation remain RN responsibilities.",
    scenarioVariants: [
      "A stable postoperative client needs scheduled temperature, pulse, and blood-pressure measurements.",
      "The RN asks which task a nursing assistant can perform during a busy medication round.",
      "A client needs help with hygiene and routine measurements, while the RN completes assessments."
    ]
  },
  {
    id: "lm-02",
    topic: "Leadership — Assignment",
    stem: "Which client is most appropriate for assignment to an RN rather than to a practical nurse or assistive personnel?",
    choices: [
      "A stable client awaiting routine discharge paperwork",
      "A client who needs assistance with a shower",
      "A client with sudden chest pressure who requires immediate assessment",
      "A client needing a scheduled bed bath"
    ],
    correctIndex: 2,
    rationale: "Sudden chest pressure is an unstable, potentially life-threatening presentation requiring rapid RN assessment, judgment, intervention, and escalation. Client stability and unpredictability are central to safe assignments.",
    scenarioVariants: [
      "A client develops acute shortness of breath while awaiting transfer.",
      "A postoperative client suddenly becomes confused and hypotensive.",
      "A client reports crushing chest discomfort during a routine round."
    ]
  },
  {
    id: "lm-03",
    topic: "Quality and Safety — Near Miss",
    stem: "A nurse catches a wrong-dose medication order before the medication reaches the client. What is the best next action after correcting the immediate risk?",
    choices: [
      "Do not report it because no harm occurred",
      "Report the near miss through the organization’s safety-reporting system",
      "Record the event in a personal notebook only",
      "Wait to see whether another nurse finds the same problem"
    ],
    correctIndex: 1,
    rationale: "Near-miss reporting identifies system vulnerabilities before a client is harmed. A just-culture approach focuses on learning, trend analysis, and safer processes rather than hiding events.",
    scenarioVariants: [
      "A barcode scan prevents administration of a look-alike medication.",
      "A nurse identifies a mismatched patient label before collecting a specimen.",
      "A dose calculation error is detected during an independent double-check."
    ]
  },
  {
    id: "lm-04",
    topic: "Informatics — Clinical Decision Support",
    stem: "While preparing to administer a medication, the electronic record displays a severe allergy alert that does not match the nurse’s current understanding of the history. What should the nurse do?",
    choices: [
      "Override the alert immediately to avoid delaying the dose",
      "Pause administration and verify the allergy history and order before proceeding",
      "Disable future alerts for the client",
      "Ask the client to sign a waiver and give the medication"
    ],
    correctIndex: 1,
    rationale: "A severe allergy alert requires verification before administration. Alert fatigue is a safety risk, but bypassing a high-severity warning without clinical review can cause preventable harm.",
    scenarioVariants: [
      "An eMAR warning identifies a documented anaphylactic reaction to the prescribed antibiotic.",
      "A newly entered drug order conflicts with an allergy in the electronic chart.",
      "The scanner displays a high-priority interaction alert during medication preparation."
    ]
  },
  {
    id: "lm-05",
    topic: "Leadership — Handover Communication",
    stem: "Which handover statement best uses SBAR to communicate a deteriorating client?",
    choices: [
      "The client is not doing well; please come when you can.",
      "Mr. A is 2 hours post-op, now has BP 84/50 and increasing drain output; I suspect bleeding and need you to assess him now.",
      "The laboratory results are in the chart if you want to read them.",
      "I gave the usual medications and will call again later."
    ],
    correctIndex: 1,
    rationale: "Effective escalation clearly states the situation, relevant background, assessment, and a specific recommendation or request. This supports timely shared understanding and clinical action.",
    scenarioVariants: [
      "A client develops new hypoxia and requires urgent provider notification.",
      "A nurse calls about rapidly decreasing urine output after surgery.",
      "A postpartum client has increasing bleeding and a falling blood pressure."
    ]
  },
  {
    id: "lm-06",
    topic: "Quality Improvement — PDSA",
    stem: "A unit wants to reduce omitted hand-hygiene opportunities. Which action best represents the Study phase of a Plan-Do-Study-Act cycle?",
    choices: [
      "Select a small test of change for one shift",
      "Collect and analyze hand-hygiene observations after the test",
      "Implement the intervention permanently across the hospital",
      "Write a policy before identifying the problem"
    ],
    correctIndex: 1,
    rationale: "In PDSA, teams plan a focused change, test it, study the results, and then adapt, adopt, or abandon the approach. Reviewing data after the test is the Study phase.",
    scenarioVariants: [
      "A ward pilots a new central-line checklist for one week and reviews infection-process data.",
      "A team tests a bedside handoff script on one unit before expanding it.",
      "A medication-safety project compares error reports before and after a small pilot."
    ]
  }
];
