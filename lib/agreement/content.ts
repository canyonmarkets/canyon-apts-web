// The Canyon "Arizona Weekly Recreational Lodging Rental Agreement" —
// transcribed verbatim from the June 2022 Eversign template (rendered pages),
// 2026-07-04. Obvious typos fixed: "CAYON"→"CANYON", "beatles"→"beetles".
// Any wording change beyond that needs Jeff/Joleen's sign-off.

export const AGREEMENT_TITLE = `Arizona Weekly Recreational Lodging Rental Agreement`;

export interface AgreementGuest { name: string; email: string; phone: string; }
export interface AgreementChild { name: string; age: string; }

export interface AgreementData {
  address: string;
  guests: AgreementGuest[];        // 1–4
  children: AgreementChild[];      // 0–3
  maxOccupancy: string;
  checkIn: string;                 // M/D/YY display
  checkOut: string;
  weeklyPayment: number;
  securityDeposit: number;
  cleaningFee: number;
  petFee: number;
  total: number;
  dueUponOccupancy: number;
  balanceDue: number;
  specialTerms: string;            // the free-text narrative box
  repName: string;                 // e.g. "Joleen Martin, M.B.A."
  repDate: string;
}

// ── Page 1: representations under the money table ────────────────────────────
export const INTRO_PARAGRAPHS: { label?: string; text: string }[] = [
  { text: `GUEST represents to CANYON that GUEST: (1) has a primary residence elsewhere or GUEST is renting the Premises until GUEST'S primary residence can be occupied, and (2) will occupy the Premises only as temporary, short-term lodging.` },
  { label: `IMPORTANT:`, text: `The Premises are a short-term rental property. GUEST and all Occupants are transient, short-term rental guests, not tenants. The Premises are "Recreational Lodging," pursuant to A.R.S. Section 33-1308(4) and, Therefore GUEST and the Premises are not subject to the Arizona Residential Landlord and Tenant Act, Sections 33-1301 to 33-1381. Instead, the Premises are subject to the Landlord and Tenant Statutes, A.R.S. Sections 33-301 to 33-381, which apply to hotels and motels. If GUEST violates this Agreement, CANYON may immediately terminate this Agreement and lock GUEST out of the Premises.` },
  { text: `The parties intend and contractually agree that the terms of this Agreement shall supersede statutes, case law and rules of procedure, except as expressly and specifically prohibited by law.` },
  { label: `Waiver of Jury Trial.`, text: `To minimize delay and reduce the cost of potential litigation, the parties agree to waive their right to a trial by jury. The parties understand that they may be entitled to a jury trial for claims arising out of this Agreement, but knowingly and voluntarily waive this right.` },
];

export const OCCUPANCY_PERIOD_TEXT = `GUEST use/access to the Premises ends at the Check-Out Date at 10am unless GUEST elects to renew this Rental Agreement for an additional 7 nights with express permission granted by CANYON.`;

// ── Pages 2–4: the numbered clauses ───────────────────────────────────────────
export interface Clause { n: string; title: string; body: string; subs?: { n: string; title?: string; body: string }[] }
export interface Section { heading: string; clauses: Clause[] }

export const SECTIONS: Section[] = [
  {
    heading: `GUEST OBLIGATIONS`,
    clauses: [
      { n: `1`, title: `Guest agrees:`, body: `to pay the amounts stated herein; to do or take the actions described herein; to not do or allow the prohibited actions described below; to not cause or allow the Premises or CANYON'S Personal Property to be damaged; to keep the Premises clean; and to abide by all other terms of this Agreement.` },
      { n: `2`, title: `Rent.`, body: `Time is of the essence of this Agreement. All amounts due under this Agreement are collectable as "rent," pursuant to A.R.S. §§ 33-323 and 33-361. Rent is payable: (a) in advance, (b) in U.S. currency, and (c) without deductions or offsets. Failure to pay any amount when due is a material breach of this Agreement.` },
      { n: `3`, title: `Utilities`, body: `Utilities are included in the weekly rate. 1 bedroom units Receive a $100 "credit" per month. 2 bedroom units receive $125 and 3 bedroom units receive $150 per month. Any charges above These credits will be the responsibility of the guests and shall be Due immediately upon billing. These are not hotels. Please respect the cost of all utilities in the home. Treat it as if it were your own.` },
      { n: `4`, title: `Notices.`, body: `Informal communications (e.g., keys, directions) and legal notices (e.g., cancellation of reservation) between GUEST and CANYON before, during and after the Occupancy Period, shall be given by email or as indicated above. CANYON shall have no obligation to provide any notice to GUEST.` },
      { n: `5`, title: `Give notice of defects.`, body: ``, subs: [
        { n: `a`, body: `Guest must provide immediate telephonic notice to Manager of mold, leaks, plumbing or sewer issues, electrical or other serious issues, and thereafter must provide written notice (via email or text) to Manager. For all other defects on the Premises, Guest shall notify Manager in writing before vacating the Premises. Failure to timely notify Manager may subject Guest to liability for unreported damages.` },
        { n: `b`, body: `Owner shall respond to requests for repairs and notice of defects reported by Guest within a reasonable time and take action on issues that affect safety and habitability of the Premises. Owner need not repair or replace items that do not relate to safety/habitability of the Premises.` },
      ]},
      { n: `6`, title: `Comply with Law and Rules.`, body: `GUEST agrees to comply with all federal, state, county laws, and city/town ordinances. GUEST agree to comply with the Owner's Rules and Instructions.` },
      { n: `7`, title: `Supervision.`, body: `Guest agrees to supervise Occupants (e.g., minor children) and invitees. Guest is responsible — financially and otherwise — for fines, penalties, and damages resulting from GUEST'S acts or omissions on the Premises.` },
      { n: `8`, title: `Insurance.`, body: `GUEST agrees to obtain insurance for personal property loss, theft, etc., personal injury, liability, and other insurable risks. GUEST'S failure to obtain insurance shall constitute an assumption of all risk and loss/damages.` },
      { n: `9`, title: `Not Permitted:`, body: `Unless stated otherwise above, each of the following is NOT PERMITTED and, however brief the violation, is a material breach of this Agreement and, in addition to remedies stated elsewhere in this Agreement or permitted by law, CANYON may: immediately, with or without notice: terminate this Agreement; terminate GUEST'S right to use and occupy the Premises; lock GUEST out of the Premises; and/or enforce CANYON'S lien on any/all personal property found in/on the Premises.`, subs: [
        { n: `a`, title: `No Fires.`, body: `Fires are not permitted in or on the Premises.` },
        { n: `b`, title: `No Mail.`, body: `GUEST shall not receive mail at the Premises before, during or after the Occupancy Period.` },
        { n: `c`, title: `No Pets.`, body: `GUEST shall not have or allow any pet(s) on the Premises for any length of time unless approved.` },
        { n: `d`, title: `No Smoking.`, body: `Smoking IS NOT permitted anywhere on the Premises or inside any Building on the Premises. GUEST is responsible for any damage to the Premises which may result from smoking anywhere on or near the Premises for any length of time, including repainting of one or more rooms and/or cleaning of window and/or floor coverings.` },
        { n: `e`, title: `No Disturbances.`, body: `GUEST shall not cause or allow: (1) any loud or offensive sounds that can be heard outside the Premises or (2) noise or disturbance from 10:00 p.m. to 8:00 a.m. GUEST shall not be rude to neighbors.` },
        { n: `f`, title: `No Parties or Events.`, body: `GUEST shall not allow any events on the Premises, including: weddings, reunions, parties, ceremonies, etc. Two or more complaints received from one or more neighbors is a breach of this Agreement.` },
        { n: `g`, title: `No Commercial vehicles, trailers or RV's.`, body: `Vehicles with commercial license plates, trailers, or recreational vehicles shall not be parked on or near the Premises.` },
        { n: `h`, title: `No Repairs, Alterations or Improvements.`, body: `GUEST shall not paint any portion of Premises. GUEST shall make no repairs, alterations, or improvements to the Premises.` },
        { n: `i`, title: `No Criminal Conduct or Illegal Drugs.`, body: `GUEST shall not engage in any criminal activity on or near the Premises. GUEST shall not store or use illegal drugs, as defined by federal law, including marijuana, on the Premises.` },
        { n: `j`, title: `No Damage.`, body: `GUEST shall not cause or allow damage to the Premises or CANYON'S Personal Property.` },
        { n: `k`, title: `No Assignment.`, body: `GUEST shall not sublet, transfer or assign this Agreement, the Premises, or any part thereof, without CANYON'S prior written consent.` },
        { n: `l`, title: `Unkept Apartment.`, body: `GUEST is required to keep the Premises clean. Bed linen, towels, kitchen items (e.g., pots, pans, glasses), etc., have been provided for GUEST use, but washing and cleaning thereof is GUEST'S responsibility.` },
      ]},
    ],
  },
  {
    heading: `THE PREMISES`,
    clauses: [
      { n: `10`, title: `Access Device.`, body: `CANYON will provide GUEST with one Access Device at or before the Check-In Date/Time. GUEST shall not change or re-key any locks or add additional locks or security devices to the Premises.` },
      { n: `11`, title: `Access.`, body: `CANYON shall have access to the Premises (outside and inside all Buildings) with or without prior notice to GUEST: (1) for maintenance and repairs (routine or otherwise), (2) for landscape and/or Pool maintenance, (3) pest control, and (4) to respond to issues reported by GUEST. GUEST denial of access, interference or hindrance of CANYON'S efforts to access the Premises is a breach of this Agreement.` },
      { n: `12`, title: `Security.`, body: `GUESTS are responsible for the security of the Premises until Check-Out. CANYON has no duty to provide security services to GUEST or the Premises. GUEST shall look exclusively to the local police force for security and/or protection. CANYON is not liable for criminal or wrongful acts committed against GUEST or GUEST'S property.` },
      { n: `13`, title: `Condition of Premises.`, body: `In the event a defect exists, then GUEST must notify CANYON in writing (text or email) of the defect (e.g., carpet stained, drapes torn, etc.) within 24 hours after the Check-In Date/Time. Guest is responsible for the entire cost of maintenance, repairs or replacement parts, including glass (e.g., glass doors), that are the result of negligence, recklessness, gross negligence or intentional acts of GUEST, Occupants, visitors, invitees, and trespassers, including criminal conduct by known or unknown third-parties.` },
      { n: `14`, title: `Pests.`, body: `GUEST may encounter common pests in/on the Premises. "Common pests" include, but are not limited to: ants, beetles, bedbugs, bees and other stinging insects, spiders, cockroaches, scorpions, termites, free-roaming neighborhood cats and other household pests indigenous to Arizona.` },
      { n: `15`, title: `Hazards.`, body: `The Premises may be near real or perceived natural and/or man-made hazards, including, but not limited to: busy street, shopping center, train and rail road tracks, open water (e.g., ditches, canals, natural or man-made lakes and/or streams), golf course, stadium, school, and/or power lines. As a result, the Premises and occupants may be exposed to noise, light, water, moisture, humidity, vibrations, smoke, second-hand smoke, airborne particulates, pollen, traffic (air and ground), electric current, magnetic fields and/or other hazards, conditions or events. The Premises may be located near an airport and/or in the flight path and/or be affected by future flight path changes. The Premises may have mold, radon gas and/or other environmental hazards in/on the Premises. If GUESTS are sensitive to or otherwise concerned about the presence of these or other pests, hazards, conditions, etc., then GUEST shall consult qualified persons or obtain further information about all areas of concern before signing this Agreement. Guest understands, acknowledges and assumes the foregoing risks. GUEST agrees to inform Occupants and invitees of these risks. GUEST'S approval of this Agreement is conclusive evidence that GUEST has investigated and is satisfied with the Premises.` },
      { n: `16`, title: `Canyon's Personal Property.`, body: `"CANYON'S Personal property" all items in or on the Premises provided by the CANYON that are not permanently attached to the real property. The CANYON'S Personal Property is provided "as is" and without any warranty. CANYON is not responsible for any loss or damage caused by the failure of any personal property or appliances to operate and/or operate properly, including, but not limited to loss of food or perishables if the refrigerator or freezer fails to operate or operate properly. The failure of one or more personal property items to operate for any length of time shall not impact the Rent. In the event one or more of the personal property items fail to operate or operate properly, GUEST shall notify CANYON of same, but CANYON shall not be obligated to repair or replace any personal property. CANYON may elect, however, in CANYON'S unfettered discretion, to repair any or all of the personal property or replace any or all of the personal property with items with similar function, but which may be of superior, the same or inferior quality. If GUEST damages any personal property or any personal property is missing from the Premises, then GUEST shall be charged the replacement value of item(s).` },
      { n: `17`, title: `GUEST'S Personal property.`, body: `During occupancy, except for automobiles, GUEST shall not store or leave personal property outside the dwelling on the Premises. CANYON shall not be responsible for any personal property, including vehicles, belonging to GUEST that is/are lost, stolen, damaged or destroyed, regardless of the cause; GUEST assumes the risk of all loss. After Check-Out or after CANYON otherwise takes possession of the Premises, any of GUEST'S personal property remaining on the Premises shall be deemed abandoned and CANYON may hold or dispose of it. GUEST may be charged for removal and/or disposal costs incurred by CANYON. Under no circumstances shall CANYON be responsible for any damages, including current or replacement value, of GUEST'S personal property.` },
    ],
  },
  {
    heading: `FEES and REMEDIES`,
    clauses: [
      { n: ``, title: ``, body: `The following are in addition to remedies stated elsewhere in this Agreement or permitted by law.` },
      { n: `18`, title: `Late Fees.`, body: `If a payment is not received (paid online or postmarked) by GUEST by the due date stated in this Agreement, then GUEST may be assessed a $50.00 initial late fee. See payment addendum for full details on payments.` },
      { n: `19`, title: `Cleaning and Repair Fees.`, body: `If GUEST leave apartment unclean or in need of repairs or maintenance, then CANYON shall have the option to: (1) hire a licensed or unlicensed person or company to perform the task and CANYON may bill GUEST for the cost thereof and/or deduct the cost from the Deposit, plus a 25% administrative fee, or (2) GUEST may, if willing and able to do the task, do all or part of the work and may charge GUEST $35.00 per hour or, if more, an hourly rate equal to that charged by other persons or companies for similar work.` },
      { n: `20`, title: `Termination.`, body: `Unless otherwise stated in writing and signed by CANYON, GUEST'S promise to pay for all amounts due under this Agreement shall survive termination of this Agreement.`, subs: [
        { n: `a`, body: `If all or part of the funds tendered by or on behalf of GUEST are subsequently not received by CANYON for any reason (e.g., chargeback by bank/ credit card company), or if any other amount is due hereunder but is not timely and retain all funds already paid.` },
        { n: `b`, body: `In the event GUESTS violate or fail to comply with any term or condition in this Agreement, CANYON may treat the same as a material breach of this Agreement and, with or without providing prior oral or written notice, CANYON may do one or more of the following: (1) terminate GUEST'S contractual right to use and occupy the Premises, but GUEST'S liability for amounts due under this Agreement shall not be terminated, (2) assess, collect and/or pursue actual damages or liquidated damages, (3) if GUESTS are not in possession of the Premises, CANYON may withhold possession of the Premises until all sums due are paid, and/or (4) if GUESTS are in possession of the Premises, CANYON may reenter and take possession of the Premises.` },
        { n: `c`, body: `If GUEST vacates the Premises and remove all or most of GUEST'S personal property before Check-Out Date/Time, then GUEST'S access to the Premises terminates and GUEST shall not be entitled to a refund or proration of amounts paid. CANYON may elect additional Remedies.` },
      ]},
      { n: `21`, title: `Administrative Fees & Liquidated Damages.`, body: `The parties acknowledge the harm and damages caused by the some breaches may be difficult or impossible to calculate in advance. In addition to other Remedies stated herein, the following liquidated damages will fairly compensate CANYON for harm and/or damages sustained (e.g., administrative expenses; time expended to clean, remediate, or repair the Premises; etc.): $200.00 for "each incident" (i.e., each day and each violation) of each of the following: (1) unauthorized Occupant on the Premises, (2) unauthorized pet on the Premises, (3) unauthorized smoking on the Premises, (4) permanently or temporarily attaching anything to the Premises without CANYON'S prior written consent, and (5) disconnecting or otherwise stopping utilities (e.g., water, electricity, etc.) to or for the Premises. Example: 2 unauthorized pets on the Premises for 2 days is 4 incidents.` },
      { n: `22`, title: `Actual Damages.`, body: `As an alternative to liquidated damages, CANYON may elect to sue GUEST for CANYON'S actual damages, including: Rent, Additional Rent, Rental Tax, late fees, cleaning, repairs, property damage, re-renting fees, incidental and consequential damages, amounts refunded or paid to another guest who terminated their agreement because GUEST did not timely Check-Out.` },
    ],
  },
  {
    heading: `MISCELLANEOUS`,
    clauses: [
      { n: `23`, title: `Limitation of Damages.`, body: `In the event GUEST makes a claim or files an action against CANYON relating to the Premises, this Agreement, or otherwise, GUEST'S damages, including Guest's attorney's fees and court costs, shall be limited to amounts paid by GUEST for the Occupancy Period. GUEST shall not be entitled to consequential or incidental damages, statutory, contract, tort, or exemplary damages.` },
      { n: `24`, title: `Waiver, Release, and Indemnification by GUEST.`, body: ``, subs: [
        { n: `a`, body: `GUEST (on behalf of Guest's minor children, and Occupants) hereby waives and releases CANYON from and against All Claims.` },
        { n: `b`, body: `Except for intentional or grossly negligent conduct by CANYON, GUEST releases CANYON and assumes all risk caused, related to or associated with the interruption, surge or failure of utilities and services to the Premises and any damages related directly or indirectly thereto.` },
        { n: `c`, body: `GUEST shall indemnify CANYON for damages sustained by CANYON for All Claims. "All Claims" shall include claims (contract, tort, or otherwise) arising, directly or indirectly, out of this Agreement and/or out of the activities on or near the Premises during the Occupancy Period, by GUEST visitors, invitees, third-parties, and/or trespassers.` },
      ]},
      { n: `25`, title: `Waiver by CANYON.`, body: `No waiver by CANYON of any provision hereof shall be deemed a waiver of any other provision hereof or of any subsequent breach by GUEST of the same provision or any other provision.` },
      { n: `26`, title: `Parties.`, body: `The parties to this Agreement are GUEST and CANYON. If more than one GUEST, the liability of all GUEST shall be joint and several and, if a GUEST is married, liability shall be both community and separate. Each GUEST is responsible for the acts and omissions, and consequences of each act and/or omission, of every other GUEST, as well as for Occupants, visitors, invitees, and third-parties.` },
      { n: `27`, title: `Jurisdiction/Court Modification.`, body: `The Agreement shall be governed by Arizona law. Jurisdiction for all actions arising out of this Agreement is conferred exclusively on Arizona.` },
      { n: `28`, title: `Counterparts and Digital Signatures.`, body: `The Agreement may be signed (including digital signatures and "Approval" or "Acceptance" of terms on a Website) in counterpart. Together, all counterparts constitute one, fully executed agreement. A fully executed fax, copy, scanned image or other digitally stored or reproduced copy of this Agreement: shall be treated and enforceable as the original; shall be admissible in legal and administrative proceedings; and the original documents may be destroyed without impairing the rights and obligations of the parties under this Agreement. Failure of a party to initial any page or specific provision of this Agreement shall not affect its validity.` },
      { n: `29`, title: `Legal fees.`, body: `CANYON and GUEST agree the prevailing party in any litigation, action or controversy arising out of this Agreement, arising out of attempts to enforce this Agreement, and/or any controversy arising between the parties hereto whether or not related to this Agreement, shall be entitled to reimbursement of or, if applicable, an award of reasonable attorneys' fees, litigation expenses (including, but not limited to, travel expenses for CANYON and/or CANYON'S agents to appear in court), out-of-pocket expenses of every kind and court costs incurred prior to trial, during trial, post-judgment and/or on appeal. CANYON shall be entitled to recover all costs of collection, including collection agency fees, and expenses relating to recording judgments, creating, recording or releasing lien notices. The award of fees, costs and expenses (above), if made by a court of law, shall be made by the court, sitting without a jury. CANYON shall be entitled to pre-judgment and postjudgment interest on liquidated amounts at the rate of eighteen percent interest per annum.` },
      { n: `30`, title: `Evidence at Trial.`, body: `The parties stipulate and agree the following documentary evidence, whether or not it would otherwise be considered hearsay or otherwise inadmissible, shall be admitted into evidence at trial with or without foundation: invoices, receipts, and/or estimates for cleaning, repair, and/or maintenance of the Premises; documents showing fees, costs and/or expenses incurred by a party hereto; police reports and incident reports; this Agreement, email and text messages to and from GUEST relating to this Agreement; screen shots of the Website; photographs of the Premises; demand letters sent on CANYON'S behalf; and a list of damages (including calculations) sought by CANYON.` },
    ],
  },
];

export const END_MARK = `END OF THIS DOCUMENT`;

// ── Page 5: Special Terms (fixed bullets; the narrative box is per-agreement) ─
export const SPECIAL_TERMS_BULLETS = [
  `GUEST has been informed through verbal conversation with CANYON that a minimum of 4 week stay is necessary to retain full refund of deposit. Additionally, a 72 hour notice of vacancy is required by the GUEST to retain full refund of deposit.`,
  `GUEST has been informed through verbal conversation and through writing that there will be a $200 fine assessed immediately if CANYON or one of its representatives inspects the apartment and discovers evidence of either smoking in or around the apartment or an unauthorized animal, fish, or pet of any kind.`,
  `GUEST has been informed through verbal conversation and through writing that there will be a $200 fine assessed for each item that is hung on, nailed to, or otherwise attached to the walls of the apartment.`,
];

export const SIGNING_STATEMENT = `By signing below, all parties understand the terms and conditions outlined in this RENTAL AGREEMENT and agree to adhere to them while occupancy in this apartment is in effect.`;

// Auto-compose the Special Terms narrative from the wizard's numbers —
// mirrors the story Joleen hand-writes today. Everything stays editable.
export function composeSpecialTerms(d: {
  applicationFee: number; holdPaid: number; deposit: number;
  prorateAndBuffer: number; cleaningFee: number; petFee: number;
  weeklyPayment: number; checkIn: string; firstMonday: string; petDeclared?: string;
}): string {
  const money = (n: number) => `$` + Number(n || 0).toLocaleString();
  const upfront = (d.applicationFee || 0) + (d.holdPaid || 0);
  const remainingDeposit = Math.max(0, (d.deposit || 0) - (d.holdPaid || 0));
  const lines = [
    `Guest has paid ${money(upfront)}. ${money(d.applicationFee)} went to process the application and is non refundable. The ${money(d.holdPaid)} is holding the apartment for guest and will go towards their ${money(d.deposit)} Security Deposit as long as they check in on the check in day, ${d.checkIn}. If they do not check in on ${d.checkIn} the ${money(d.holdPaid)} is non refundable.`,
    `Guest will pay the prorated amount with buffer day of ${money(d.prorateAndBuffer)}, the remaining ${money(remainingDeposit)} Security Deposit, ${money(d.cleaningFee)} cleaning fee${d.petFee > 0 ? ` and the ${money(d.petFee)} animal fee` : ``} on the day of check in, ${d.checkIn}, before any check in information will be sent out.`,
    `Guest will pay first full weekly payment of ${money(d.weeklyPayment)} on Monday ${d.firstMonday} by 10am and every Monday by 10am after that.`,
  ];
  if (d.petFee > 0) {
    lines.push(`Guest has been told all rules and that no other animal is allowed except the one they have declared${d.petDeclared ? ` (${d.petDeclared})` : ``}. Guest will provide all paperwork for the animal that was requested.`);
  }
  return lines.join(`\n\n`);
}
