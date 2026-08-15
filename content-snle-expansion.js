/*
 * Original SNLE expansion items. These were written from public competency
 * blueprints and clinical safety guidance; no reviewer or exam item was copied.
 */
export const SNLE_EXPANSION_TEMPLATES = [
  {
    id: 'SNLE-021', topic: 'Fundamentals — Sterile technique',
    stem: 'While setting up a sterile dressing change, the nurse sees the sterile forceps touch the one-inch edge of the sterile field. What should the nurse do?',
    choices: ['Continue because the forceps did not touch the wound', 'Treat the forceps as contaminated and replace them before proceeding', 'Rinse the forceps with saline and continue', 'Ask the client to hold the forceps until the dressing is complete'], correctIndex: 1,
    rationale: 'The outer edge of a sterile field is considered contaminated. Any item that touches it must be replaced to maintain aseptic technique and reduce the risk of introducing organisms into the wound.',
  },
  {
    id: 'SNLE-022', topic: 'Fundamentals — Medication reconciliation',
    stem: 'During admission, a client says they take an over-the-counter herbal product every day but it is not listed in the electronic record. What is the nurse’s best action?',
    choices: ['Tell the client to stop all home products without further review', 'Document the product and communicate it for medication-reconciliation review', 'Ignore it because nonprescription products are not medications', 'Ask the family to take it home and remove it from the record'], correctIndex: 1,
    rationale: 'Medication reconciliation includes prescription medicines, over-the-counter products, vitamins, and herbal preparations. Accurate documentation and review help identify interactions, duplications, and safety concerns.',
  },
  {
    id: 'SNLE-023', topic: 'Fundamentals — Informed consent',
    stem: 'A client says, “I signed the consent form, but I still do not understand why I need this procedure.” What should the nurse do?',
    choices: ['Witness the signature and send the client immediately', 'Explain every procedural risk independently', 'Pause the process and notify the responsible clinician to answer the client’s questions', 'Ask a family member to explain the procedure'], correctIndex: 2,
    rationale: 'The nurse verifies that consent is voluntary and alerts the responsible clinician when a client has unanswered questions. The clinician performing or ordering the procedure is responsible for explaining its purpose, benefits, risks, and alternatives.',
  },
  {
    id: 'SNLE-024', topic: 'Fundamentals — Specimen safety',
    stem: 'After collecting a blood specimen at the bedside, which action best protects client identification and specimen integrity?',
    choices: ['Label the tube at the nurses’ station after completing several collections', 'Label the specimen in the client’s presence using the required identifiers and verify the order', 'Ask a family member to write the client name on the tube', 'Place the unlabelled tube in a pocket until the medication round is finished'], correctIndex: 1,
    rationale: 'Specimens should be labelled immediately at the bedside in the presence of the client, following the organization’s identification process. Delayed or unlabelled specimens create a serious risk of wrong-client results.',
  },
  {
    id: 'SNLE-025', topic: 'Adult Nursing — Hypoglycemia',
    stem: 'A conscious client with diabetes is diaphoretic and shaky. Capillary blood glucose is 58 mg/dL (3.2 mmol/L). What is the nurse’s priority action?',
    choices: ['Give a fast-acting carbohydrate according to protocol and recheck glucose', 'Administer the scheduled insulin dose', 'Give only water and reassess at the end of the shift', 'Place the client flat and delay treatment until a laboratory result is available'], correctIndex: 0,
    rationale: 'A conscious client with symptomatic hypoglycemia needs prompt treatment with a fast-acting carbohydrate and repeat glucose assessment according to protocol. Escalation is needed if symptoms persist, worsen, or the client cannot safely take oral treatment.',
  },
  {
    id: 'SNLE-026', topic: 'Adult Nursing — Anaphylaxis',
    stem: 'Minutes after an antibiotic is started, a client develops wheezing, facial swelling, and hypotension. What should the nurse do first?',
    choices: ['Stop the medication, assess airway and breathing, and activate emergency response', 'Slow the infusion and ask the client to rest', 'Document the symptoms before taking further action', 'Offer oral antihistamine and wait for the wheeze to resolve'], correctIndex: 0,
    rationale: 'Wheezing, facial swelling, and hypotension after medication exposure can indicate anaphylaxis. Stop the trigger, support airway and breathing, call for urgent help, and prepare to follow the organization’s emergency anaphylaxis protocol.',
  },
  {
    id: 'SNLE-027', topic: 'Adult Nursing — Acute coronary syndrome',
    stem: 'A client reports new crushing chest pressure with diaphoresis and nausea. What is the nurse’s priority?',
    choices: ['Encourage the client to walk to improve circulation', 'Assess ABCs, obtain urgent clinical help, and begin the prescribed chest-pain pathway', 'Give a meal because nausea may be from fasting', 'Wait to see if the pain improves after a routine analgesic'], correctIndex: 1,
    rationale: 'New crushing chest pressure with autonomic symptoms may indicate acute coronary syndrome. The nurse rapidly assesses stability, obtains urgent assistance, and implements the prescribed emergency pathway rather than delaying evaluation.',
  },
  {
    id: 'SNLE-028', topic: 'Adult Nursing — Acute kidney injury',
    stem: 'A postoperative client’s urine output falls to 15 mL/hour for two consecutive hours and the client is becoming drowsy. What is the nurse’s best action?',
    choices: ['Recognize possible deterioration, assess perfusion and fluid status, and promptly escalate', 'Document the output as expected after surgery', 'Encourage the client to drink water without further assessment', 'Remove the urinary catheter immediately'], correctIndex: 0,
    rationale: 'Oliguria with a change in mental status can reflect reduced renal perfusion, acute kidney injury, bleeding, or another serious deterioration. Focused assessment and prompt escalation are needed while checking catheter patency and following prescribed monitoring.',
  },
  {
    id: 'SNLE-029', topic: 'Adult Nursing — Compartment syndrome',
    stem: 'A client in a new lower-leg cast reports pain that is severe and increasing despite prescribed analgesia. The toes are pale and painful with passive movement. What is the nurse’s priority?',
    choices: ['Elevate the leg well above heart level and reassess tomorrow', 'Recognize possible compartment syndrome and obtain urgent assessment', 'Apply a heating pad over the cast', 'Encourage the client to walk on the cast to reduce stiffness'], correctIndex: 1,
    rationale: 'Pain out of proportion, pain with passive stretch, and neurovascular changes can indicate compartment syndrome. This is limb-threatening and requires immediate escalation and ongoing neurovascular assessment.',
  },
  {
    id: 'SNLE-030', topic: 'Adult Nursing — Seizure safety',
    stem: 'A hospitalized client suddenly has a generalized tonic-clonic seizure in bed. Which nursing action is most appropriate?',
    choices: ['Hold the client’s limbs firmly to prevent movement', 'Place an object in the client’s mouth', 'Protect the client from injury, maintain the airway as able, time the seizure, and call for help', 'Offer oral fluids as soon as the shaking begins'], correctIndex: 2,
    rationale: 'During a seizure, protect the client from injury, avoid restraining movements or putting objects in the mouth, support airway and positioning when safe, observe and time the event, and obtain urgent help according to protocol.',
  },
  {
    id: 'SNLE-031', topic: 'Adult Nursing — Chest tube safety',
    stem: 'A client with a chest tube becomes acutely short of breath and oxygen saturation falls. The nurse sees that the tubing is kinked under the client. What should the nurse do first?',
    choices: ['Straighten the tubing, rapidly assess respiratory status, and escalate if distress persists', 'Clamp the tube for the rest of the shift', 'Milk the tube forcefully toward the drainage chamber', 'Remove the chest tube and apply an occlusive dressing'], correctIndex: 0,
    rationale: 'A kink can obstruct drainage and contribute to respiratory compromise. Correct the visible obstruction, assess airway and breathing, verify the drainage system, and urgently escalate continuing or severe distress. Routine clamping or forceful stripping is unsafe unless specifically ordered.',
  },
  {
    id: 'SNLE-032', topic: 'Adult Nursing — Anticoagulant safety',
    stem: 'A client receiving an anticoagulant reports a sudden severe headache and new weakness in one arm. What is the nurse’s priority?',
    choices: ['Recognize possible bleeding or stroke and activate urgent assessment', 'Reassure the client that headache is expected', 'Give the next anticoagulant dose early', 'Encourage the client to sleep and report symptoms tomorrow'], correctIndex: 0,
    rationale: 'A sudden severe headache with focal neurologic change in a client receiving anticoagulation may signal intracranial bleeding or stroke. This requires immediate assessment and emergency escalation.',
  },
  {
    id: 'SNLE-033', topic: 'Maternity — Severe preeclampsia',
    stem: 'A pregnant client with severe preeclampsia develops a tonic-clonic seizure. What is the nurse’s priority action?',
    choices: ['Protect the airway, position laterally when possible, call for emergency help, and follow the seizure protocol', 'Insert an oral airway while the client is actively seizing', 'Leave the client to obtain a blood-pressure machine', 'Encourage the client to drink water after the seizure starts'], correctIndex: 0,
    rationale: 'Eclampsia is an obstetric emergency. Protect the client from injury, support airway and breathing, place laterally when safe, call for immediate help, and prepare to implement prescribed seizure and magnesium-sulfate protocols.',
  },
  {
    id: 'SNLE-034', topic: 'Maternity — Placenta previa',
    stem: 'A client at 32 weeks of pregnancy arrives with painless bright-red vaginal bleeding. What should the nurse avoid until placenta location is known?',
    choices: ['Obtaining vital signs', 'Starting prescribed IV access', 'Performing a digital vaginal examination', 'Assessing the fetal heart rate'], correctIndex: 2,
    rationale: 'Painless late-pregnancy bleeding may be placenta previa. A digital vaginal examination can worsen bleeding and is avoided until placenta location is known and the responsible obstetric team directs care.',
  },
  {
    id: 'SNLE-035', topic: 'Newborn — Respiratory distress',
    stem: 'A newborn has persistent grunting, nasal flaring, and subcostal retractions. What is the nurse’s priority?',
    choices: ['Recognize respiratory distress, support thermoregulation and oxygenation per protocol, and obtain urgent neonatal evaluation', 'Feed the newborn a large bottle to increase energy', 'Delay assessment until the next routine observation', 'Place the newborn prone and leave unattended'], correctIndex: 0,
    rationale: 'Grunting, nasal flaring, and retractions are signs of neonatal respiratory distress. Maintain warmth, assess and support oxygenation according to protocol, monitor closely, and obtain prompt neonatal evaluation.',
  },
  {
    id: 'SNLE-036', topic: 'Pediatrics — Febrile seizure safety',
    stem: 'A toddler with fever begins to have a generalized seizure in the clinic. Which action is most appropriate?',
    choices: ['Place a tongue blade between the teeth', 'Protect the child from injury, position safely, time the seizure, and obtain urgent help', 'Hold the child’s arms and legs still', 'Give oral medication while the child is convulsing'], correctIndex: 1,
    rationale: 'Seizure first aid focuses on preventing injury, maintaining a safe position and airway, timing and observing the event, and obtaining emergency support. Do not restrain the child or place anything in the mouth.',
  },
  {
    id: 'SNLE-037', topic: 'Pediatrics — Anaphylaxis',
    stem: 'After eating a food containing peanuts, a school-age child develops widespread hives, wheeze, and dizziness. What is the priority nursing action?',
    choices: ['Activate emergency response and prepare to administer prescribed intramuscular epinephrine', 'Give the child water and wait for the rash to fade', 'Ask the child to lie down alone in a quiet room', 'Apply topical cream to the hives before assessing breathing'], correctIndex: 0,
    rationale: 'Hives with wheeze and dizziness after allergen exposure may indicate anaphylaxis. Immediate emergency response, airway-breathing assessment, and prompt administration of prescribed intramuscular epinephrine are priorities.',
  },
  {
    id: 'SNLE-038', topic: 'Pediatrics — Croup deterioration',
    stem: 'A child with suspected croup now has stridor at rest, marked retractions, and increasing fatigue. What is the nurse’s priority?',
    choices: ['Keep the child calm, assess airway and breathing, and obtain urgent clinical help', 'Inspect the throat with a tongue depressor', 'Encourage the child to run around to loosen secretions', 'Delay care until the next scheduled nebulizer treatment'], correctIndex: 0,
    rationale: 'Stridor at rest with marked work of breathing and fatigue can indicate significant upper-airway obstruction. Minimize agitation, assess airway and breathing, provide protocol-directed support, and urgently escalate.',
  },
  {
    id: 'SNLE-039', topic: 'Management & Leadership — Confidentiality',
    stem: 'A nurse sees a colleague discussing a recognizable client’s diagnosis in a crowded elevator. What is the best action?',
    choices: ['Join the discussion so the information is accurate', 'Wait until the end of the shift and post about it in the unit chat', 'Interrupt respectfully, move the discussion to a private setting, and follow confidentiality policy', 'Ignore the discussion because both people work in health care'], correctIndex: 2,
    rationale: 'Client information must be discussed only with authorized people and in an appropriate private setting. The nurse should intervene respectfully and follow the organization’s confidentiality and reporting processes.',
  },
  {
    id: 'SNLE-040', topic: 'Management & Leadership — Patient identification',
    stem: 'Before administering medication, a client says, “You already know me—I am in this room every day.” What should the nurse do?',
    choices: ['Use the room number as the only identifier', 'Ask the client to state identifiers and compare them with the medication record and identification band per policy', 'Give the medication because the client is familiar to staff', 'Ask a visitor to confirm the client’s name'], correctIndex: 1,
    rationale: 'Reliable client identification uses the organization’s required identifiers, such as the client stating name and date of birth and comparison with the identification band and medication record. Room number and familiarity are not acceptable identifiers.',
  },
];
