/*
 * Original USRN / NCLEX-RN 2026 clinical-competency templates.
 * Private local source notes were used only for nonpublic authoring traceability;
 * no commercial question, answer option, or rationale was copied or paraphrased.
 */
export const USRN_TEMPLATES = [
  {
    id: "USRN-001",
    topic: "Management of Care — Delegation for stable clients",
    stem: "Which task is most appropriate for the RN to delegate to trained assistive personnel for a stable adult client, according to facility policy?",
    choices: [
      "Obtain routine vital signs and report values outside the stated parameters",
      "Perform the initial assessment of new chest pressure",
      "Teach a client how to self-administer a new insulin pen",
      "Evaluate whether a new pain medication achieved the expected effect"
    ],
    correctIndex: 0,
    rationale: "Routine, predictable tasks with clear reporting expectations may be delegated to trained assistive personnel. Initial assessment, teaching, clinical judgment, and evaluation remain RN responsibilities.",
    scenarioVariants: [
      "The RN needs help obtaining intake and output for a stable client who has clear reporting parameters.",
      "A trained nursing assistant is available while the RN prepares discharge teaching for a newly diagnosed client."
    ]
  },
  {
    id: "USRN-002",
    topic: "Management of Care — Client assignment",
    stem: "At the start of the shift, which client is most appropriate for the RN to assign to an experienced practical/vocational nurse working within that nurse's state scope and facility policy?",
    choices: [
      "A client admitted 10 minutes ago with sudden weakness and slurred speech",
      "A stable client needing a routine dressing change for a chronic wound with an established plan",
      "A client receiving the first unit of blood with a history of transfusion reaction",
      "A client returning from surgery with newly low blood pressure"
    ],
    correctIndex: 1,
    rationale: "A stable client with a predictable, established plan is the safest assignment. Unstable, newly admitted, immediately postoperative, and high-risk transfusion clients require RN assessment and judgment.",
    scenarioVariants: [
      "The team needs an assignment for a client whose chronic venous ulcer has unchanged orders and stable findings.",
      "A practical/vocational nurse is available while the RN receives several clients with changing acuity."
    ]
  },
  {
    id: "USRN-003",
    topic: "Management of Care — Advance directives",
    stem: "A hospitalized client with decision-making capacity says, 'I do not want CPR if my heart stops.' What is the nurse's best response?",
    choices: [
      "'Your family must make that decision for you.'",
      "'I will notify the appropriate clinician so your wishes can be discussed, documented, and honored according to policy.'",
      "'You should wait until you are critically ill before deciding.'",
      "'A nurse may independently enter a do-not-resuscitate order.'"
    ],
    correctIndex: 1,
    rationale: "The nurse supports the capable client's autonomy, ensures the request is communicated promptly, and follows the facility process for discussion and orders. The nurse does not independently create a resuscitation-status order.",
    scenarioVariants: [
      "A client asks how to make sure the care team knows about a previously completed advance directive.",
      "A client says treatment preferences have changed and asks to speak with the clinician before a procedure."
    ]
  },
  {
    id: "USRN-004",
    topic: "Safety and Infection Control — Contact-enteric precautions",
    stem: "During a facility outbreak of confirmed C. difficile infection, a nurse removes gloves after providing care. Which hand-hygiene action is most appropriate when leaving the room?",
    choices: [
      "Perform hand hygiene with soap and water after removing gloves",
      "Use alcohol-based hand rub only after removing gloves",
      "Wear a surgical mask in the hallway for the rest of the shift",
      "Place used linens in the regular trash bin"
    ],
    correctIndex: 0,
    rationale: "For care during a C. difficile outbreak, soap-and-water handwashing after glove removal is recommended because it helps remove spores. Gloves and gown are also used as indicated, and linen handling and environmental cleaning follow facility infection-prevention policy.",
    scenarioVariants: [
      "During a C. difficile outbreak, a nurse cleans a stool-contaminated bedside commode and prepares to leave the isolation room.",
      "During a C. difficile outbreak, a nurse removes gloves after providing incontinent care to an isolated client."
    ]
  },
  {
    id: "USRN-005",
    topic: "Safety and Infection Control — Suicide precautions",
    stem: "A client admitted after a suicide attempt says, 'I have been thinking about ending my life again.' What is the nurse's priority action?",
    choices: [
      "Ask directly about current plan, means, and intent while ensuring the client is not left alone",
      "Promise to keep the statement secret to preserve trust",
      "Encourage the client to journal privately and return in an hour",
      "Ask a family member to decide whether the client is serious"
    ],
    correctIndex: 0,
    rationale: "A direct, calm suicide assessment does not create suicidal thoughts and identifies immediate risk. The nurse maintains safety, removes access to hazards according to policy, and promptly escalates the finding to the treatment team.",
    scenarioVariants: [
      "A client who appeared calmer suddenly gives away personal belongings and says goodbye to staff.",
      "During evening rounds, a client says there is no reason to continue living."
    ]
  },
  {
    id: "USRN-006",
    topic: "Safety and Infection Control — Restraint alternatives",
    stem: "An older hospitalized client with delirium repeatedly pulls at an IV line. Which intervention should the nurse try first?",
    choices: [
      "Use the least restrictive measures, such as assessing discomfort, reorienting, and increasing observation",
      "Apply wrist restraints as soon as the behavior occurs",
      "Sedate the client without first assessing possible causes",
      "Raise all four side rails and leave the client alone"
    ],
    correctIndex: 0,
    rationale: "Restraints are a last resort when less restrictive measures cannot protect the client or others. Assess reversible causes such as pain, hypoxia, urinary retention, or medication effects and follow the required order, monitoring, and documentation process if restraint becomes necessary.",
    scenarioVariants: [
      "A postoperative client becomes restless overnight and reaches repeatedly toward oxygen tubing.",
      "A client with a urinary infection is confused and tries to climb out of bed."
    ]
  },
  {
    id: "USRN-007",
    topic: "Health Promotion and Maintenance — Pregnancy warning signs",
    stem: "Which statement by a client at 32 weeks of pregnancy requires the nurse to recommend prompt evaluation?",
    choices: [
      "'My rings feel tighter today and I have a severe headache with new visual spots.'",
      "'I am hungry more often than I was in the first trimester.'",
      "'I need to urinate more frequently during the daytime.'",
      "'I sometimes notice mild fatigue after a busy day.'"
    ],
    correctIndex: 0,
    rationale: "Severe headache and visual changes with new swelling can signal a hypertensive disorder of pregnancy and need prompt evaluation. Teaching should emphasize urgent reporting of warning signs rather than waiting for the next routine visit.",
    scenarioVariants: [
      "A pregnant client calls about persistent headache, blurred vision, and sudden facial swelling.",
      "During prenatal teaching, a client asks which symptoms should be reported immediately."
    ]
  },
  {
    id: "USRN-008",
    topic: "Health Promotion and Maintenance — Infant safe sleep",
    stem: "Which parent statement shows correct understanding of safer sleep teaching for a healthy infant?",
    choices: [
      "'I will put my baby on the back to sleep on a firm, flat surface without loose bedding.'",
      "'A soft pillow will keep my baby from rolling over.'",
      "'My baby should sleep prone after feeding to prevent spit-up.'",
      "'Bed-sharing is safest when the parent is very tired.'"
    ],
    correctIndex: 0,
    rationale: "The safer sleep environment includes supine positioning on a firm, flat sleep surface with no loose blankets, pillows, or soft objects. Families should receive nonjudgmental education tailored to their sleep setting and resources.",
    scenarioVariants: [
      "Before newborn discharge, a parent asks whether a positioner is needed in the bassinet.",
      "A caregiver says an infant sleeps more deeply on a couch cushion beside the family."
    ]
  },
  {
    id: "USRN-009",
    topic: "Psychosocial Integrity — Therapeutic communication",
    stem: "A client newly diagnosed with cancer says, 'I am terrified that I will not be here for my children.' Which response is most therapeutic?",
    choices: [
      "'You should not worry until you know all the test results.'",
      "'Everything will be fine; many people recover from cancer.'",
      "'It sounds like you are very worried about your children. Tell me more about what feels most frightening.'",
      "'Try to focus on the treatment plan instead of those thoughts.'"
    ],
    correctIndex: 2,
    rationale: "Reflection and an open invitation encourage the client to express feelings and identify support needs. False reassurance, minimizing, or changing the topic can close communication.",
    scenarioVariants: [
      "A parent awaiting biopsy results says they cannot stop imagining the worst outcome.",
      "A client beginning chemotherapy says they are afraid their family will see them become ill."
    ]
  },
  {
    id: "USRN-010",
    topic: "Psychosocial Integrity — Acute delirium",
    stem: "An older adult who was oriented yesterday now has fluctuating attention, disorganized thinking, and visual misperceptions. What is the nurse's priority?",
    choices: [
      "Recognize possible acute delirium, assess for reversible causes, and promptly report the change",
      "Assume the behavior is normal aging and reduce interaction",
      "Begin reality-based confrontation until the client agrees the perceptions are false",
      "Diagnose dementia because the client is older"
    ],
    correctIndex: 0,
    rationale: "Acute and fluctuating cognitive change suggests delirium, which may signal infection, hypoxia, medication effect, metabolic disturbance, or another urgent condition. Protect safety, obtain focused assessment data, and escalate promptly.",
    scenarioVariants: [
      "A postoperative client becomes inattentive and alternates between agitation and drowsiness over several hours.",
      "A previously alert client with dehydration suddenly cannot follow a simple conversation."
    ]
  },
  {
    id: "USRN-011",
    topic: "Basic Care and Comfort — Dysphagia precautions",
    stem: "A client who had an acute stroke coughs when taking sips of water. What should the nurse do first?",
    choices: [
      "Stop oral intake and keep the client upright while arranging swallow evaluation per protocol",
      "Encourage larger sips so the client can clear the throat",
      "Offer a straw and continue the meal",
      "Place the client flat to rest before trying again"
    ],
    correctIndex: 0,
    rationale: "Coughing with swallowing may indicate aspiration risk. Stop oral intake, maintain safe positioning, perform required screening or obtain evaluation according to policy, and implement prescribed texture and supervision recommendations.",
    scenarioVariants: [
      "A client after a transient ischemic attack has a wet voice after medication with water.",
      "A client with new facial weakness pockets food and coughs during lunch."
    ]
  },
  {
    id: "USRN-012",
    topic: "Basic Care and Comfort — Pressure injury prevention",
    stem: "An immobile client has persistent nonblanchable redness over the sacrum. Which action is most appropriate?",
    choices: [
      "Relieve pressure, assess the skin and contributing factors, and implement the prevention plan",
      "Massage the red area to improve circulation",
      "Apply a heating pad until the redness fades",
      "Wait for skin breakdown before documenting the finding"
    ],
    correctIndex: 0,
    rationale: "Persistent nonblanchable redness may represent an early pressure injury. Offload pressure promptly, inspect the skin and devices, manage moisture and nutrition risks, and document and escalate findings according to the care plan.",
    scenarioVariants: [
      "A ventilated client develops nonblanchable heel redness after prolonged bed rest.",
      "A frail client has redness beneath a medical device that remains after repositioning."
    ]
  },
  {
    id: "USRN-013",
    topic: "Pharmacological and Parenteral Therapies — High-alert insulin",
    stem: "Before administering a scheduled dose of rapid-acting insulin, the nurse finds that the client's meal tray has not arrived and the client says they feel nauseated. What is the best action?",
    choices: [
      "Clarify the plan and coordinate insulin timing with food intake and current glucose results",
      "Give the full dose immediately because it is scheduled",
      "Withhold insulin for the entire day without notifying anyone",
      "Ask the client to drink water instead of eating"
    ],
    correctIndex: 0,
    rationale: "Rapid-acting insulin can cause hypoglycemia if food intake is delayed or poor. Verify the current glucose and prescribed parameters, coordinate nutrition and medication timing, and communicate with the responsible clinician when the plan is unclear.",
    scenarioVariants: [
      "A premeal insulin dose is due, but a client is NPO for an unexpected procedure.",
      "A client with gastroenteritis cannot tolerate breakfast when prandial insulin is scheduled."
    ]
  },
  {
    id: "USRN-014",
    topic: "Pharmacological and Parenteral Therapies — IV potassium safety",
    stem: "A prescription is received for IV potassium chloride for a client with severe hypokalemia. Which action is essential before administration?",
    choices: [
      "Confirm the dilution and controlled infusion rate using the approved protocol and pump",
      "Give the potassium as an IV push to correct the level quickly",
      "Mix potassium into a hanging blood product",
      "Administer the medication without checking kidney function or urine output"
    ],
    correctIndex: 0,
    rationale: "IV potassium is a high-alert medication that must be diluted and infused at a controlled, prescribed rate using appropriate equipment and monitoring. IV push potassium is unsafe; renal function, urine output, and cardiac monitoring requirements must be considered.",
    scenarioVariants: [
      "A client receiving loop diuretics has weakness and a critically low potassium result.",
      "A clinician prescribes potassium replacement for a client whose telemetry shows ectopy."
    ]
  },
  {
    id: "USRN-015",
    topic: "Pharmacological and Parenteral Therapies — Opioid respiratory depression",
    stem: "Thirty minutes after receiving IV opioid medication, a postoperative client is difficult to arouse and has a respiratory rate of 7/min. What is the nurse's priority?",
    choices: [
      "Stimulate the client, assess airway and breathing, stop further opioid administration, and obtain urgent help",
      "Document that the medication is effective and let the client rest",
      "Give the next analgesic dose later than scheduled without assessing the client",
      "Offer oral fluids and reassess at the end of the shift"
    ],
    correctIndex: 0,
    rationale: "Marked sedation and a very low respiratory rate after an opioid may indicate life-threatening respiratory depression. Immediate ABC assessment, urgent escalation, and preparation to follow the reversal-agent protocol are required.",
    scenarioVariants: [
      "A client using patient-controlled analgesia becomes increasingly sleepy with shallow respirations.",
      "After a pain injection, a client is cyanotic around the lips and cannot stay awake."
    ]
  },
  {
    id: "USRN-016",
    topic: "Reduction of Risk Potential — Post-thyroidectomy assessment",
    stem: "Four hours after thyroid surgery, which finding requires the nurse's immediate action?",
    choices: [
      "Stridor and increasing work of breathing",
      "A request for an extra blanket",
      "Mild incisional discomfort rated 3 out of 10",
      "A small amount of expected bruising near the incision"
    ],
    correctIndex: 0,
    rationale: "Stridor after neck surgery can signal airway compromise from swelling or bleeding and requires immediate emergency response. Airway equipment and escalation measures should be readily available for high-risk postoperative clients.",
    scenarioVariants: [
      "A client after neck surgery develops noisy inspiration and anxiety while lying in bed.",
      "During postoperative rounds, a client has neck swelling and increasing difficulty breathing."
    ]
  },
  {
    id: "USRN-017",
    topic: "Reduction of Risk Potential — Central line complications",
    stem: "A client with a central venous catheter suddenly develops shortness of breath, chest pain, and a drop in oxygen saturation shortly after line manipulation. What is the nurse's priority?",
    choices: [
      "Stop using the line, assess airway and breathing, position and escalate according to emergency protocol",
      "Flush the catheter briskly to restore patency",
      "Ask the client to walk in the hallway to improve circulation",
      "Document the symptoms after the next set of routine vital signs"
    ],
    correctIndex: 0,
    rationale: "Acute cardiopulmonary symptoms after central-line manipulation may indicate a serious complication. Stop the procedure, rapidly assess and support ABCs, and seek emergency assistance while following the facility's line-complication protocol.",
    scenarioVariants: [
      "A client becomes acutely dyspneic during a central-line dressing change.",
      "Soon after a catheter cap is changed, a client reports sudden chest discomfort and looks pale."
    ]
  },
  {
    id: "USRN-018",
    topic: "Physiological Adaptation — Sepsis recognition",
    stem: "A client with a urinary infection becomes confused, has a temperature of 39.2°C, heart rate 124/min, blood pressure 86/50 mmHg, and decreased urine output. What is the nurse's priority?",
    choices: [
      "Recognize possible sepsis with shock, support ABCs, and activate urgent escalation",
      "Encourage the client to rest and repeat vital signs after lunch",
      "Administer an antipyretic and wait for the fever to resolve",
      "Restrict fluids because the client is urinating less"
    ],
    correctIndex: 0,
    rationale: "Infection with altered mentation, hypotension, tachycardia, and oliguria may indicate sepsis with impaired perfusion. The nurse should promptly escalate, obtain ordered monitoring and specimens, and prepare to implement time-sensitive treatment according to the sepsis protocol.",
    scenarioVariants: [
      "A client with pneumonia becomes drowsy, hypotensive, and cool to the touch.",
      "A client with an infected wound has rapidly rising heart rate and new confusion."
    ]
  },
  {
    id: "USRN-019",
    topic: "Physiological Adaptation — Diabetic ketoacidosis treatment",
    stem: "A client being treated for diabetic ketoacidosis receives an IV insulin infusion. Which laboratory value is especially important for the nurse to monitor closely as treatment progresses?",
    choices: [
      "Potassium",
      "Bilirubin",
      "Platelet count",
      "Calcium only"
    ],
    correctIndex: 0,
    rationale: "Insulin shifts potassium into cells and can cause or worsen hypokalemia during diabetic ketoacidosis treatment. Potassium monitoring and prescribed replacement are essential alongside glucose, acid-base, fluid-balance, and cardiac assessments.",
    scenarioVariants: [
      "A young adult with new type 1 diabetes is receiving IV fluids and insulin for severe acidosis.",
      "During DKA treatment, a client's glucose decreases while the potassium value trends downward."
    ]
  },
  {
    id: "USRN-020",
    topic: "Physiological Adaptation — Acute pulmonary edema",
    stem: "A client with heart failure suddenly becomes severely short of breath, has diffuse crackles, and coughs pink frothy sputum. What is the priority nursing action?",
    choices: [
      "Position upright, support oxygenation, perform rapid assessment, and activate urgent clinical escalation",
      "Place the client flat with legs elevated",
      "Encourage oral fluids to improve circulation",
      "Obtain a daily weight before contacting the care team"
    ],
    correctIndex: 0,
    rationale: "These findings are consistent with acute pulmonary edema. Upright positioning can support ventilation and reduce venous return while the nurse rapidly addresses ABCs, applies monitoring and oxygen support according to protocol, and obtains urgent help.",
    scenarioVariants: [
      "A client with cardiomyopathy wakes at night gasping and has widespread crackles.",
      "During IV fluid therapy, a client develops cyanosis, severe orthopnea, and frothy sputum."
    ]
  }
];
