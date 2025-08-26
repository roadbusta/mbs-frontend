
MBS target coding reference:
For coding references, you may consult the MBS public information at: https://www.mbsonline.gov.au/ where the latest coding rules and documentation are available.
The content is extensive. To improve completeness, you may choose to focus on the emergency scenario (though this is not mandatory; if participants prefer other scenarios, the more the better).
For emergency scenarios, relevant MBS coding rules can be found under:
 Attendances by Medical Practitioners who are Emergency Physicians (Items 5001–5036)
  Plus about 20 items beginning with “14”. 
Depending on the competition design, students may either be guided to search for these themselves as an exercise, or hints can be provided.
 Example Subgroups of “14” Codes
 These additional procedures cover important treatments and interventions commonly seen in emergency departments. Examples include:
 Resuscitation: 
 14255: Resuscitation ≥30 minutes but <1 hour (Emergency Physician) 
 14256: Resuscitation ≥1 hour but <2 hours (Emergency Physician) 
 14257: Resuscitation ≥2 hours (Emergency Physician) 
 14258–14260: Equivalent items for General Practitioners (non-Emergency Physicians) 
 Minor and Other Procedures: 
 14263 / 14265: Minor procedures (Emergency Physician / Non-specialist)
 14264 / 14266: Procedures (Emergency Physician / Non-specialist) 
 Includes: foreign body removal, minor wound suturing, burn dressings, drainage, hemostasis, nerve block, thoracentesis, defibrillation, gastrostomy, laryngoscopy, etc. 
 Fracture and Dislocation Management: 
 14270 / 14272: For fracture/dislocation management in emergency settings (without follow-up care), to be claimed with emergency consultation items. 
 Restraints: 
 14277 / 14278: Chemical or physical restraint, claimable independently or with emergency consultation. 
 Anaesthesia Services: 
 14280 / 14283: Anaesthesia services provided in an emergency setting by an emergency physician or other practitioner, for use by another doctor, not billable by a specialist anaesthetist. 
 Acute Intubation / Airway Management: 
 14285 / 14288: Acute intubation and/or airway management, performed by an Emergency Physician (14285) or a General Practitioner (14288) in an emergency setting, must be claimed with an emergency consultation item.
The core challenge of this task lies in the fact that the dataset is both small and biased — which is exactly the kind of issue we face in practice. One of the goals is to see how participants deal with such a scenario and try to address it as much as possible. Of course, a perfect solution almost never exists in reality; the objective is to make the most progress possible with limited resources. It’s worth noting that even when handled manually by experts, these problems can still introduce biases.
We will provide several cases as references. To simplify the scenario, the input will be consultation records (already de-identified and anonymized), and the output will be the coding results. In addition, participants may also search YouTube for emergency consultation training videos or real-life cases. These can be summarized into consultation notes using AI and then used as practice cases. However, please note that these will not have coding answers provided.
Seq No.
Input 
Output
1
Male with facial and foot injury 
HOPC: Cage fell off, struck face, and landed on left foot No other injuries Tenderness over right mandible Bruising over midfoot with significant swelling Pain with weight bearing 
PMH: Hypertension Meds: Anti-hypertensive Allergies: Testamental 
SH: Lives at home 
O/E: GCS 15 Normal eye movement Pupil size 3, equal and reactive Mouth opening normal Bruising over midfoot with significant swelling Pain with weight bearing 
Impression: Facial and foot injury Management Plan: Pain management CT left foot CT brain and CT facial bones Follow-up with investigations review CT showed medial cuneform avulsion fracture treatment Cammbot review by orthopaedic consultant in clinic
Age: 55Y
5012
Complexity More than Ordinary but Not High, patient aged 4 years or over but under 75 years
Age: 55 / CT left foot, CT brain, CT facial bones / medial cuneiform avulsion fracture / referral to orthopaedic consultant
 
14270
Fracture management
CT showed medial cuneform avulsion fracture / Cammbot
2
Tightness in chest and shortness of breath 
HOPC: Tightness in chest, particularly at night when lying down Shortness of breath, worsening over the last few days Soreness in left shoulder no redness, no rash, no fall, no trauma Bruising on right knee denies any fall Increased leg swelling No recent falls
 No significant cough Chest pain over sternum . pmx: RA -. HTN T2DM renal impairment eGFR 30 anaemia of chronic disease vit D defeciency OP . 
Meds: Amlodipine 5 mg daily aspirin 100mg/mane B12 on Mon/Wed/Fri morning trajenta 5mg/mane Vit D I/mane physiotens 0,4mg/nocte plaquenil 200mg/nocte . 
SH: Lives at home with aged care support with her husband supportive family 
O/E: GCS 15, alert Saturation 100% on 2 litres Blood pressure 130/26 Heart rate 175 chest bibasal crepitation abdo soft bilateral lower leg pitting oedema +++ up to the knww 
Impression: Heart failure 
Management Plan: CXR -&gt; no consolidation resp PCR swab IV frusemide 20mg fbe euc crp trop bnp CT chest scan tomorrow for L scapula pain Pain management Monitor oxygen levels and blood pressure
Age: 90Y
5019
High Complexity, patient aged 75 years or over
Age: 90 / chest pain and shortness of breath / multiple comorbidities / CT chest scan planned
3
Brought in by ambulance following increasing confusion, fevers, and rigors 
HOPC: Recent hospital stay following lateral prolapse surgery No nausea, vomiting, or diarrhoea Urinary and faecal incontinence No rash, no recent of falls 
PMH: Ischaemic heart disease Previous deep vein thrombosis Previous pulmonary embolism Cardiomyopathy with ejection fraction of 30% Previous cavitating lung abscess Gastro-oesophageal reflux disease Depression Osteopenia Obsessive-compulsive disorder Still's disease Hypogammaglobulinaemia Recent rectal prolapse repair Bilateral cataracts and intraocular lens implants 
Meds: Aspirin 100 mg daily Atorvastatin 20 mg daily Bisoprolol 2.5 mg daily Calcium/Cholecalciferol 600/400 IU daily Esomeprazole 20 mg daily Etanercept 50 mg once a week Fluvoxamine 100 mg daily Leflunomide 10 mg daily Olanzapine 10 mg daily Hydroxychloroquine 200 mg daily Prednisolone 7.5 mg 
Allergies: Erythromycin 
SH: Lives at home with husband Husband is the main carer 
O/E: Temp: 39°C Tachycardic Chest: Basal crepitations JVP: Raised Systolic ejection murmur Abdomen: Soft, bowel sounds present No leg oedema or calf tenderness 
Management Plan: IV access for bloods, FBC, U&amp;E, CRP, LFTs, blood cultures, urine culture COVID-19 and respiratory swab IV fluids IV antibiotics Discuss with Doctor Sharma and Mr. Tilan Pt had ESBL in the past Change to meropenem ? transfer to the Bays when suitable
Age: 75Y
5019
High Complexity, patient aged 75 years or over
Age: 75 / increasing confusion, fevers, and rigors / multiple comorbidities including ischaemic heart disease, cardiomyopathy, hypogammaglobulinaemia / IV fluids and antibiotics / specialist discussion
4
18 y/o female with acute pharyngitis and tonsillitis 
HOPC: One day history of acute pharyngitis and tonsillitis Single episode of vomiting overnight No rash, myalgia, arthralgia, diarrhoea, or dysuria Able to swallow effectively Fever of 39 degrees at home, afebrile at GP clinic and at presentation Temperature up to 39 degrees during time in ED Not looking septic 
PMH: Supraventricular tachycardia investigated by Simon Pinney Single episode of tonsillitis at age 11, uncomplicated spontaneous improvement 
O/E: Pulse 130 Temperature 39 Blood pressure 120/70 Oxygen saturation 100% Alert, conversational, not distressed Clearly inflamed tonsils bilaterally with erythema and exudate No cervical lymphadenopathy, no signs of quinsy, no scarlet fever, no systemic symptoms other than fever Not at high risk of rheumatic heart disease Abdomen soft, no hepatomegaly, splenomegaly 
Impression: Acute tonsillitis Management Plan: Rehydration Paracetamol and dexamethasone as per SPGP request No throat swab or antibiotics as per therapeutic guidelines Expected improvement Return home after IV fluids Return to ED if symptoms not improving
Age: 18Y
5012
Complexity More than Ordinary but Not High, patient aged 4 years or over but under 75 years
Age: 18 / acute tonsillitis / IV fluids administered
5
Headache and leg pain after a bicycle accident 
HOPC: Bicycle hit a pothole, causing a fall Hit head and leg during the fall Brief loss of consciousness Assisted by a nurse at the scene Transported home by parents Headache and leg pain noted No significant back pain No dinner eaten, not feeling hungry 
O/E: Vitals normal Minor bruise on the lateral side of the right knee Abrasion on hand and arm Normal speech and mobility Impression: Likely concussion 
Management Plan: Reassure patient and family Educate on short-term and long-term effects of concussion Advise ED review if concerns arise in the next 24-48 hours
Age: 11Y
5001
Ordinary complexity, patient aged 4 years or over but under 75 years
Age: 11 / bicycle accident with minor head and leg injury / vitals normal / discharged home
6
Severe left-sided abdominal pain 
HOPC: Pain onset after arriving home Pain described as excruciating, similar to previous kidney infections Pain located on the left side Pain severity initially very high, now reduced to 5/10 Nausea and feeling hot Pain not alleviated by lying down or taking oxycodone No anti-inflammatory medications taken Pain started today, with some discomfort in the past few days Previous stent placement in April History of urosepsis PMH: Rectal cancer in 2019 Radiation cystitis since 2021 Multiple stent placements (4-5 times) Hernia 
Meds: Rosuvastatin Tizanidine Rabeprazole Metoprolol (half tablet morning and night) Insulin (70/30, 130 units daily) 
Allergies: Allergic to Ceftriaxone (itchiness) Amoxicillin (mild itchiness) 
O/E: Heart rate: 115 bpm Blood pressure: 177/102 mmHg Bowel sounds normal Colostomy bag in place Mild pain on the left side of the abdomen No pain under ribs or in the middle of the abdomen Impression: Possible pyelonephritis or kidney infection Management Plan: Organise CT scan Administer IV amoxicillin and gentamicin Provide endone for pain relief Monitor blood test results
Age: 50Y
5016
High Complexity, patient aged 4 years or over but under 75 years
Age: 50 / severe left-sided abdominal pain with diagnostic uncertainty / multiple comorbidities including rectal cancer, diabetes, radiation cystitis / CT scan and IV antibiotics administered
7
Injury to right hand 
HOPC: Injury occurred while working with scaffolding Bar weighing 50 kg dropped from 1.5 metres Pain and tightness when stretching hand No issues with finger movement or sensation Open wound present 
PMH: Eczema Meds: Blood pressure medication (unspecified) 
O/E: Pain and tightness in right hand No issues with finger movement or sensation Open wound on right hand 
Impression: Possible bone injury Management Plan: Arrange X-ray to rule out fracture Examine wound after X-ray Consult plastic surgery if necessary
Age: 45Y
5012
Complexity More than Ordinary but Not High, patient aged 4 years or over but under 75 years
Age: 45 / arrange X-ray to rule out fracture / consult plastic surgery if necessary
8
72-year-old male with ongoing cough and bilateral lower leg and foot swelling 
HOPC: Ongoing cough with production of green sputum since discharge from John Faulkner Hospital six days ago following admission for exacerbation of COAD/influenza management No haemoptysis Worsening swelling of lower legs and feet bilaterally over the last week No systemic infective features reported 
PMH: Atrial fibrillation Glaucoma Hypercholesterolaemia Gastro-oesophageal reflux disease Asthma TIA COPD, not on home oxygen Hypertension 
Meds: Doplots (dutasteride 500 micrograms and tamsulosin 400 micrograms), 1 capsule at night Pantoprazole 40 milligrams, 1 tablet at night Giardians (Empug Liflozin) 10 milligrams, 1 tablet daily Fruzomide 20 milligrams in the morning Erythromycin 400 milligrams, 1 tablet daily, to be continued for 30 days Rivaroxaban 15 milligrams at night Emitrestor (sacubitril 24.3 milligrams and valsartan 25 milligrams), 1 tablet twice daily Caltrate, 1 tablet daily Digoxin 62.5 milligrams, 3 tablets daily Ventolin 
Allergies: Allergic to morphine, develops high fevers 
SH: Stopped smoking a few weeks ago 
O/E: Oxygen saturation: 94% on good trace, 80s on poor trace Heart rate: 98, irregular Respiratory rate: 26 Blood pressure: 104/57 mmHg, MAP 69 Occasional chesty cough observed at bedside No wheeze or crackles on chest auscultation Soft, non-tender abdomen Pitting oedema of lower legs, especially ankles and feet No acute shortness of breath, but has laboured breathing 
Impression: Cough possibly secondary to CCF or COAD Management Plan: Arrange blood tests and chest x-ray to evaluate for causes of cough and oedema Treat as both CCF and COAD exacerbation due to overlapping symptoms Recommend hospital admission for further management and monitoring
Age: 72Y 
5016
High Complexity, patient aged 4 years or over but under 75 years
Age: 72 / multiple comorbidities including AF, COPD, TIA / undifferentiated cough and oedema / investigations ordered / hospital admission recommended
9
77-year-old male with laceration to the left shin following injury on a piece of wood 
HOPC: Sustained a laceration to the left shin today after contact with a piece of wood Laceration described as 3 to 4 centimetres, linear, longitudinal, located in the pre-tibial region of the left shin 
PMH: History of child dementia History of rheumatoid arthritis History of prostate cancer 
Meds: arava donepezil predisinone rosu-met, 40/20 vitamin D 
Allergies: No allergies 
SH: Lives with wife Independent 
O/E: Appears well Observations stable 3 to 4 centimetre linear, longitudinal laceration to the pre-tibial region of the left shin Neurovascular compromise Depression of the laceration of the left shin 
Management Plan: Administer ADT as last tetanus injection was more than five years ago, to reduce risk of tetanus infection Suture the laceration to promote optimal wound healing Apply dressing to protect the wound and support healing Arrange removal of sutures in 10 days to ensure proper wound closure and monitor for complications
Age: 77Y 
5011
Ordinary complexity, patient aged 75 years or over
Age: 77 / laceration to left shin / appears well / observations stable / sutured laceration
10
36F P/w RLQ pain 
HOPC: Pain and discomfort in the lower right abdomen began after dinner, around 19:00 Initially mild and attributed to possible ovulation, but progressively worsened, resulting in being hunched over and difficulty walking Pain described as dull and constant, with a sensation of pressure, described: "like there's something there, like a ball" Pain is present all the time, aggravated by walking, standing, or rolling over in bed, and relieved when lying still No pain elsewhere in the abdomen, feels pain may have been radiating to RLQ though unable to recall/describe where from, currently no radiation elsewhere No associated nausea/vomiting No burning or stinging on urination, no abnormal urine appearance or odour No fever, chills, or sweats Felt very tired when the pain first started No chest pain, no trouble breathing, no palpitations, no lightheadedness No recent diarrhoea or constipation; bowels opened yesterday/today normally No vaginal bleeding or discharge at present Reports low risk of pregnancy Last menstrual period was around 3/52 ago; cycles are irregular No previous abdominal surgery; appendix and gallbladder intact No recent trauma or specific trigger identified 
PMH: History of postpartum haemorrhage requiring theatre intervention Polycystic ovaries, with possible prior cyst rupture Fibromyalgia Ankylosing spondylitis, with history of pain and occasional sweats, chills, and shakes 
Meds: Secukinumab Meloxicam Paracetamol 
Allergies: No known allergies SH: Works as a photographer, involved in event and corporate photography Assists husband with video production company Parent to two young children 
O/E: Appears well, GCS 15 speaking full sentences Obs WNL, afebrile HSDNA, JVPNE, W+WP peripheries Chest clear Abdo soft, tender in RUQ w/ Murphy's sign present. very minimal tenderness in RLQ w/ no rebound tenderness/Rovsing's -ve, psoas only mildly +'ve &amp; obtruator -ve Urine +ve for blood Impression: ?cholelithiasis/cystitis Vs appendicitis, consider ovarian cyst +/- rupture Management Plan: Analgesia, anti-emetics, IV fluids, urine MCS, bloods, CT-AP, NBM until review 
Age: 36Y
5012
Complexity More than Ordinary but Not High, patient aged 4 years or over but under 75 years
Age: 36 / undifferentiated abdominal pain / IV fluids administered / bloods and CT-AP ordered
11
Male presenting with bilateral ankle swelling and pain 
HOPC: One week of left ankle swelling and pain Redness present No fevers or systemic symptoms Visited general practitioner Ankle x-ray ordered at Lumis Imaging (writer unable to view) Referred by LMO for ultrasound of left leg to rule out DVT Now developing right ankle and foot swelling Difficulty walking now d/t pain Background of gout, occurring once a year around this time No chest pain or SOB no rashes reported, no recent acute illness Recently treated for a left knee bursitis (one fortnight ago) 
PMH: Gout Nil other SH: Lives with wife and two children, aged 19 and 20 Runs own business 
O/E: Well-looking, non-ambulant Heart rate: 80 Blood pressure: 145/72 Respiratory rate: 20 Saturation: 99% on room air Temperature: 36.9 Pain: 8/10 Blood sugar: 5.8 mmol/L Heart sounds: dual Chest: clear Bilateral red, swollen ankles Tenderness at both lateral and medial malleolus No point tenderness Restricted range of movement in bilateral ankles But able to dorsiflex and plantarflex against resistance Pain maximal on dorsiflexion of left ankle Bilateral medial and lateral malleolar effusions Strong pedal pulses at dorsalis pedis and posterior tibialis No bruising, woody crepitus, or lymphangitic tracking bilaterally No inguinal lymphadenopathy No acute arthritic changes to hands 
Impression: Bilateral gout Need to rule out DVT Possibility of complicating cellulitis Query pseudogout Query infective arthritis 
 
Management Plan: Blood tests including ESR and uric acid Analgesia: NSAID, opiate, and paracetamol Arthrocentesis of ankle for MCNS, Gram stain, and crystal examination X-ray of bilateral ankles Ultrasound Doppler of bilateral legs to rule out DVT DVT prophylaxis Bed rest Regular NSAID PPI - PUD prophylaxis Generous analgesia charted for non-comorbid gentleman Eat and drink Discussed with Dr. Falar for admission to AMP One West Procedure/ left medial malleolar arthrocentesis: landmarks identified chlorhexidine prep sterile gloves lignocaine infiltrate area aspirate attempt x 2 only 1ml of synovial fluid aspirated - blood stained sent to lab for crystal exam, cell count, mc&amp;s and asked to notify if insufficient sample. Anticipate will require referral for USS-Guided aspirate mane Have handed this over to Night MO with thanks. 
Age: 56Y
5016
High Complexity, patient aged 4 years or over but under 75 years
Age: 56 / bilateral ankle swelling with diagnostic uncertainty / multiple investigations and procedure / discussed with Dr. Falar for admission
 
14263
Minor procedure
left medial malleolar arthrocentesis / lignocaine infiltrate area / aspirate attempt x 2 / only 1ml of synovial fluid aspirated
 
12
80-year-old male presenting with an unresponsive episode and fall from a chair HOPC: Fell sideways from a chair onto the left-hand side earlier today Unresponsive for 3 to 4 minutes, only blinking eyes and not responding verbally Facial colour appeared purplish at the time, gradually returning to normal No chest pain, shortness of breath, headaches, or palpitations prior to the collapse Wound to left forearm sustained during the fall, repaired with steri-strips and tissue adhesive PMH: Dementia, history details unreliable due to cognitive impairment Cerebrovascular accident (CVA) 
Meds: aspirin 100 milligrams daily rosuvastatin 10 milligrams daily pantoprazole 40 milligrams daily Allergies: No known allergies SH: Lives at home with wife, receives a lot of support Can walk indoors without a walking aid Recommended to use a walking stick outside 
O/E: GCS: 14 No obvious sign of trauma to head, neck, chest, or abdomen Wound to left forearm, repaired with steri-strips and tissue adhesive Neurological examination grossly unremarkable Vital signs normal Moving all limbs with no problems 
Impression: Fall with unclear cause Management Plan: Requested CT abdomen, chest, and CT brain to rule out injuries Sent blood tests and urine, urine normal in full ward test Discussion regarding hospital observation: wife prefers admission for further observation, patient not keen to stay, ongoing discussion to reach a decision 
Age: 80Y
5019
High Complexity, patient aged 75 years or over
Age: 80 / fall with unclear cause / unresponsive episode / dementia and previous CVA / CT brain, chest, and abdomen requested
 
14263
Minor procedure
wound to left forearm, repaired with steri-strips and tissue adhesive
13
45 year old male with left toe injury after kicking a wall 
HOPC: Kicked the wall with the left shift toe at home Noted the toe was quite deformed Presented this morning Otherwise well 
PMH: No significant past medical history SH: Lives at home with wife 
O/E: Right foot sore No open wound Hair deformed Red Quite swollen Tender to touch Bland 
Impression: Correct dislocation Correct fracture 
Management Plan: Review post-imaging Stop Block for pain management
Age: 45Y 
5001
Ordinary complexity, patient aged 4 years or over but under 75 years
Age: 45 / left toe injury after trauma / no significant past medical history / straightforward diagnosis and management
 
14270
Fracture management
Correct dislocation / Correct fracture
 
14280
Anaesthesia
block for pain management


Other examples:
https://www.youtube.com/watch?v=YHCRluo6MM4
https://www.youtube.com/watch?v=eiRIm6BOzP4
https://www.youtube.com/watch?v=X_3wY-4f8HY
https://www.youtube.com/watch?v=ztqn5Br44UQ
https://geekymedics.com/tag/emergency/
https://med.fsu.edu/sites/default/files/userFiles/file/MedInfo_SOAPnote_Jobaid.pdf
https://www.saem.org/about-saem/academies-interest-groups-affiliates2/cdem/for-students/online-education/m3-curriculum/documentation/documentation-of-em-encounters
Another approach to consider is the use of synthetic data generation. With AI, a simple tool could be developed that generates consultation cases based on specified conditions. This would also serve as a way to evaluate participants’ ability to apply AI techniques. This could either be provided as a hint for participants or left open for them to explore on their own. The idea is to use various emergency/outpatient note-writing guidelines as zero-shot or few-shot examples, enabling the AI to context-learn these conventions and directly generate clinical notes. The generated notes can then be reviewed for plausibility and used as synthetic data for the challenge.

