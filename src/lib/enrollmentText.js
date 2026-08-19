// Fitness-Elevated Enrollment Agreement, Medical Disclaimer, Waiver & Release,
// and Exhibit A (Medical History). Drafted to Utah standards:
//  - release of NEGLIGENCE stated clearly and unequivocally (Pearce v. Utah
//    Athletic Foundation; waiver "not achieved by inference")
//  - gross negligence / willful misconduct expressly NOT released
//  - minors: Utah does not enforce parental pre-injury releases (Hawkins v.
//    Peart) — the minor section is consent/assumption-of-risk/authorization,
//    and the guardian releases only the guardian's OWN claims
//  - e-signature under Utah UETA (Utah Code 46-4-201): intent, consent to
//    transact electronically, and attribution (authenticated login + stamps)
// Bump DOC_VERSION whenever the text changes; each signature records it.
// NOTE: Have a Utah-licensed attorney review before use with clients.

export const DOC_VERSION = "2026-08-v1";
export const BUSINESS = "Fitness-Elevated";
export const COACH = "Dymond Unutoa, CSCS, PTA, LMT, TPI-Certified";
export const STATE = "Utah";

export const SECTIONS = [
  {
    id: "services",
    title: "1. Services & Nature of Coaching",
    body: [
      `${BUSINESS} ("Fitness-Elevated," "we," "us") provides strength and conditioning coaching, exercise programming, movement and mobility instruction, general fitness education, and general nutrition education (collectively, the "Services"), delivered in person and/or through our web application and electronic communications.`,
      `The Services are fitness and performance coaching. They are NOT medical care, physical therapy, rehabilitation of a diagnosed injury or condition, psychological care, or medical nutrition therapy, and no provider–patient relationship is created. Although the coach holds professional credentials (including licensure as a physical therapist assistant and massage therapist), those credentials are not exercised in this coaching relationship, and nothing in the Services constitutes the practice of physical therapy, medicine, or dietetics.`,
    ],
  },
  {
    id: "medical-disclaimer",
    title: "2. Medical Advice Disclaimer",
    body: [
      `Information, programs, recommendations, and materials provided through the Services (including the nutrition guide, portion and calorie estimates, heart-rate zones, and load projections) are for general educational and fitness purposes only and are not medical advice, diagnosis, or treatment. They are not a substitute for consultation with a licensed physician or other qualified health-care provider.`,
      `You should consult your physician before beginning this or any exercise or nutrition program, particularly if you answer "yes" to any question in Exhibit A, are pregnant or postpartum, are over age 45 (men) or 55 (women) and not accustomed to vigorous activity, or have any known or suspected medical condition. If you experience chest pain, unusual shortness of breath, dizziness, fainting, or sharp or worsening pain at any time, stop immediately and seek medical attention.`,
      `Nutrition content is general education consistent with public dietary guidelines; it is not individualized medical nutrition therapy and is not provided by a registered dietitian. Calorie, macronutrient, and portion figures are estimates and starting points that you are responsible for adjusting with your health-care provider as appropriate.`,
      `You agree that you are solely responsible for your own health decisions and for following your physician's advice, and that you will promptly inform us of any change in your health, medications, or injury status.`,
    ],
  },
  {
    id: "risks",
    title: "3. Acknowledgment of Risks & Assumption of Risk",
    body: [
      `I understand that participation in strength training, conditioning, plyometric and power work, mobility work, sport-specific training, and related physical activity involves inherent risks that cannot be eliminated regardless of the care taken, including but not limited to: muscle, tendon, ligament, and joint strains, sprains, and tears; fractures; abnormal blood pressure, fainting, irregular heartbeat, heart attack, stroke, and in rare instances death; injuries from equipment, facilities, or surfaces; aggravation of pre-existing conditions; and risks arising from training in locations I select (including home, hotel, or travel gyms) that Fitness-Elevated does not control.`,
      `I understand that I am free to decline any exercise, modify intensity, rest, or stop at any time, and that I am responsible for training within my own abilities, using equipment properly, and following safety instructions.`,
      `Knowing these risks, I VOLUNTARILY ASSUME ALL RISKS of participation, known and unknown, including the risk of the ordinary negligence of Fitness-Elevated and its Released Parties, to the fullest extent permitted by Utah law.`,
    ],
  },
  {
    id: "waiver",
    title: "4. Waiver and Release of Liability, Covenant Not to Sue, and Indemnity",
    body: [
      `In consideration of being permitted to enroll in and participate in the Services, I, for myself and my heirs, personal representatives, and assigns, HEREBY RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE ${BUSINESS}, ${COACH}, and their owners, employees, contractors, agents, successors, and assigns (the "Released Parties") from and for ANY AND ALL CLAIMS, DEMANDS, LOSSES, LIABILITIES, AND CAUSES OF ACTION OF ANY KIND — INCLUDING CLAIMS FOR PERSONAL INJURY, ILLNESS, DISABILITY, DEATH, OR PROPERTY DAMAGE — ARISING OUT OF OR RELATED TO MY PARTICIPATION IN THE SERVICES, INCLUDING CLAIMS CAUSED IN WHOLE OR IN PART BY THE ORDINARY NEGLIGENCE OF THE RELEASED PARTIES.`,
      `I expressly understand that this release is intended to be, and is, a release of the Released Parties' own NEGLIGENCE. This release does NOT apply to, and does not release, claims arising from gross negligence, willful or wanton misconduct, or intentional wrongdoing of a Released Party, or any liability that cannot be released under Utah law.`,
      `I agree to INDEMNIFY AND HOLD HARMLESS the Released Parties from any loss, liability, damage, or cost (including reasonable attorney fees) they may incur because of my participation, my breach of this Agreement, or any inaccurate or incomplete information I provide in Exhibit A, to the fullest extent permitted by law.`,
      `I represent that I am in good physical condition, that I have no medical condition that would prevent safe participation except as disclosed in Exhibit A, that the information in Exhibit A is complete and accurate, and that I will update it if it changes. I understand Fitness-Elevated relies on that information in designing my program.`,
    ],
  },
  {
    id: "minor",
    title: "5. Participants Under 18 (Parent / Legal Guardian)",
    body: [
      `If the participant is under 18, a parent or legal guardian must complete and sign this Agreement. By signing, the parent/guardian (a) consents to the minor's participation in the Services; (b) confirms they have read this Agreement, explained the risks in Section 3 to the minor, and completed Exhibit A truthfully on the minor's behalf; (c) authorizes Fitness-Elevated to obtain emergency medical care for the minor if the parent/guardian cannot be reached, at the parent/guardian's expense; and (d) agrees to the Medical Advice Disclaimer and the other terms of this Agreement.`,
      `The parent/guardian acknowledges that under Utah law (Hawkins v. Peart, 2001 UT 94) a parent's pre-injury release of a minor's own claims is generally not enforceable, and nothing in this Agreement is intended to waive the minor's own claims beyond what Utah law permits. The parent/guardian DOES, however, for themselves individually, release, waive, and covenant not to sue the Released Parties for the parent/guardian's OWN claims (including claims for medical expenses, loss of services, and emotional distress) arising from the minor's participation, including claims caused by the ordinary negligence of the Released Parties, to the fullest extent permitted by Utah law.`,
    ],
  },
  {
    id: "other",
    title: "6. Additional Terms",
    body: [
      `Emergency Care. I authorize Fitness-Elevated to secure emergency medical treatment for me if I am unable to consent, at my expense, and I release the Released Parties from liability for such assistance rendered in good faith.`,
      `Privacy & Records. Information I provide (including Exhibit A) is used to design and deliver my program, is stored securely, and is shared only as needed to deliver the Services or as required by law. My training logs and health information are visible to my coach.`,
      `Licensed Materials. Programs, videos, guides, and other materials are licensed to me personally for my own use during enrollment and may not be copied, printed for distribution, or shared.`,
      `Governing Law & Venue. This Agreement is governed by the laws of the State of ${STATE}. Any dispute shall be brought exclusively in the state courts located in ${STATE}, and I consent to their jurisdiction.`,
      `Severability & Survival. If any provision is held unenforceable, the remaining provisions remain in full force, and the unenforceable provision shall be enforced to the maximum extent permitted. Sections 2–6 survive termination of enrollment.`,
      `Entire Agreement; Electronic Signature. This Agreement (with Exhibit A) is the entire agreement regarding its subject matter and may be amended only in a signed writing. I agree to conduct this transaction electronically under the Utah Uniform Electronic Transactions Act (Utah Code Title 46, Chapter 4). My typed name, entered while signed in to my account and submitted with the acknowledgments below, is my electronic signature, has the same force and effect as a handwritten signature, and I intend to be bound by it.`,
      `I HAVE READ THIS ENTIRE AGREEMENT, INCLUDING THE WAIVER AND RELEASE OF LIABILITY IN SECTION 4. I UNDERSTAND THAT I AM GIVING UP SUBSTANTIAL LEGAL RIGHTS, INCLUDING THE RIGHT TO SUE FOR NEGLIGENCE. I SIGN IT VOLUNTARILY.`,
    ],
  },
];

// Exhibit A — PAR-Q+ 2023 core questions (yes/no) + clinical history fields.
export const PARQ = [
  "Has your doctor ever said that you have a heart condition OR high blood pressure?",
  "Do you feel pain in your chest at rest, during your daily activities of living, OR when you do physical activity?",
  "Do you lose balance because of dizziness OR have you lost consciousness in the last 12 months?",
  "Have you ever been diagnosed with another chronic medical condition (other than heart disease or high blood pressure), e.g. diabetes, asthma, cancer, kidney disease, neurological condition?",
  "Are you currently taking prescribed medications for a chronic medical condition?",
  "Do you currently have (or have had within the past 12 months) a bone, joint, or soft-tissue problem (muscle, ligament, tendon) that could be made worse by becoming more physically active?",
  "Has your doctor ever said that you should only do medically supervised physical activity?",
];

export const HISTORY_FIELDS = [
  { key: "conditions", label: "Current or past medical conditions / diagnoses", placeholder: "e.g. hypertension (controlled), asthma — or 'None'" },
  { key: "surgeries", label: "Surgeries, hospitalizations, or significant injuries (with approximate dates)", placeholder: "e.g. R ACL reconstruction 2021; L shoulder labrum 2019" },
  { key: "current_pain", label: "Current pain, limitations, or areas we should protect", placeholder: "e.g. low back stiffness in the morning; L knee with deep squats" },
  { key: "medications", label: "Current medications and supplements", placeholder: "name / dose / purpose — or 'None'" },
  { key: "allergies", label: "Allergies (medication, food, environmental)", placeholder: "e.g. tree nuts, penicillin — or 'None'" },
  { key: "family_history", label: "Family history of heart disease, stroke, or sudden death before age 55", placeholder: "e.g. father, heart attack age 52 — or 'None known'" },
  { key: "activity_level", label: "Current activity level (days/week and type)", placeholder: "e.g. 3 days lifting, 1 day golf; sedentary job" },
  { key: "physician", label: "Primary physician name & phone", placeholder: "Dr. … / (555) 123-4567" },
  { key: "other", label: "Anything else your coach should know (pregnancy/postpartum, sleep, stress, prior coaching, goals)", placeholder: "" },
];

export function fullText() {
  return SECTIONS.map((s) => s.title + "\n" + s.body.join("\n")).join("\n\n")
    + "\n\nEXHIBIT A\n" + PARQ.join("\n") + "\n" + HISTORY_FIELDS.map((f) => f.label).join("\n");
}
