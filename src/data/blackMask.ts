import type {
  Budget,
  Collateral,
  CrewSize,
  OperationMode,
  TargetVector,
  VectorId,
} from '../types/plan';

/* ------------------------------------------------------------------ *
 * Editorial copy. Written to be read, not skimmed.
 * ------------------------------------------------------------------ */

export const FILE_META = {
  masthead: 'Janus Cosmetics',
  division: 'Office of the Chairman Emeritus',
  fileNumber: 'File 07-B',
  classification: 'Internal circulation only',
  year: 'Fiscal year ████',
};

export const ORIGIN = {
  kicker: 'The man beneath the mask',
  headline: 'Roman Sionis was the worst thing his family ever manufactured.',
  deck: 'Heir to a cosmetics empire and the only ugly thing Janus ever produced. He burned the house, carved a face out of his father’s coffin, and has been correcting the record ever since.',
  body: [
    'Roman Sionis was born into the Janus fortune and raised by two people who treated their son as evidence of poor manufacturing. The Sionis house was all mirrors and no reflection: galas downstairs, a locked room upstairs, and a boy learning early that a good face was the only currency that cleared.',
    'When the company finally landed in his hands he proved an indifferent steward and an exceptional vandal. Janus bled money, then reputation. Bruce Wayne — whose fortune sat one address and one lifetime away — bought enough of the wreckage to keep the name alive, and in doing so became the one man Roman could not forgive.',
    'So he went down to the family mausoleum with a chisel. The mask is ebony, taken from his father’s coffin, fitted to a face he had always been told was a defect. The house burned that night. The board never convened again. What replaced them both was a man who had worked out that terror is a product like any other: shelf-stable, endlessly repeatable, and very profitable where the market has no alternative.',
  ],
  pullQuote:
    'A mask doesn’t hide the face. It advertises the one thing the face could never manage: intent.',
  pullAttribution: 'R. Sionis, to a room that did not survive the meeting',
  society: {
    title: 'The False Face Society',
    body: 'His congregation wears the same blank face he does. They are told it is a brotherhood. It is actually an inventory system: every lieutenant interchangeable, every name disposable, and nobody in the room able to describe the man who gave the order.',
  },
};

export const DOSSIER: Array<{ label: string; value: string; redacted?: boolean }> = [
  { label: 'Subject', value: 'Sionis, Roman' },
  { label: 'Working name', value: 'Black Mask' },
  { label: 'Enterprise', value: 'Janus Cosmetics — chmn. emeritus (disputed)' },
  { label: 'Affiliation', value: 'False Face Society' },
  { label: 'First record', value: '19██', redacted: true },
  { label: 'Present status', value: 'At large. Presumed solvent.' },
  { label: 'Assessment', value: 'Executive' },
  { label: 'Method', value: 'Leverage first, theatre second, witnesses always' },
];

export const TIMELINE: Array<{ mark: string; title: string; body: string }> = [
  {
    mark: '19██',
    title: 'The heir',
    body: 'Born to Charles and Maria Sionis, a marriage that was a merger and a son who was a line item. Raised to be seen. Never once looked at.',
  },
  {
    mark: '19██',
    title: 'The company',
    body: 'Inherits Janus Cosmetics and executes a masterclass in mismanagement. Wayne capital arrives to save the brand, along with a debt Roman chooses to read as an insult.',
  },
  {
    mark: '19██',
    title: 'The coffin',
    body: 'Enters the Sionis mausoleum with a chisel. Takes the lid from his father’s ebony coffin and carves it into a face. The estate burns. Two bodies are recovered. One is never explained.',
  },
  {
    mark: '19██',
    title: 'The congregation',
    body: 'Founds the False Face Society. Masks for the faithful, fear as liturgy, and a rule that no lieutenant is ever permitted to be memorable.',
  },
  {
    mark: '20██',
    title: 'The fixation',
    body: 'Every operation since has carried the same unstated objective: make the Batman fail in front of witnesses, and prove that Roman Sionis was never the replaceable one.',
  },
];

/* ------------------------------------------------------------------ *
 * The target. Six openings, plotted on the city he chose to hold.
 * ------------------------------------------------------------------ */

export const TARGET = {
  kicker: 'The target',
  headline: 'He is not unbreakable. He is merely thorough.',
  deck: 'Six ways through the armour, plotted on the city he has taken responsibility for. Every one of them requires him to be exactly what he claims to be. That is the whole trick: he cannot stop.',
  closing:
    'None of these are weaknesses in the ordinary sense. They are the price of the arrangement — and he pays it every night, on schedule.',
};

export const VECTORS: TargetVector[] = [
  {
    id: 'code',
    code: '01',
    name: 'The Code',
    claim: 'He will not kill. Not you, not your soldiers, not the man holding the detonator.',
    diagnosis:
      'Twenty years of restraint is not a temperament, it is a policy, and policies have edge cases. He has built an entire identity on being the one who stops short.',
    leverage:
      'Construct an operation whose only successful ending requires him to break his own rule. Then make the alternative — letting it happen — cost more than the rule is worth.',
    exposure:
      'He is very good at inventing third options. Assume he will find one, and price that in before you commit a single man.',
    asset: 'One expendable crew and a great deal of public patience',
    at: { x: 214, y: 262 },
  },
  {
    id: 'family',
    code: '02',
    name: 'The Family',
    claim: 'Four wards, one butler, and a city that files him under “ours”.',
    diagnosis:
      'He has war-gamed threats against them for years. What he has not war-gamed is being unnecessary — being late, being wrong, being the reason they had to handle it themselves.',
    leverage:
      'Do not threaten them. Make them necessary. Draw them into a problem only they can solve, then solve it in a way that costs him one of them.',
    exposure:
      'Highest retaliation coefficient in the file. Cross this line and he stops being a detective and becomes a problem with no off switch.',
    asset: 'A leak placed where a teenager is certain to find it',
    at: { x: 402, y: 386 },
  },
  {
    id: 'city',
    code: '03',
    name: 'The City',
    claim: 'He protects an institution largely staffed by people who would sell him.',
    diagnosis:
      'Gotham’s money, police and press are for rent, and always have been. His authority on those streets is borrowed from a public that can be re-briefed.',
    leverage:
      'Buy the narrative before the crime. If the city concludes that the Batman is the reason it is bleeding, he loses the ground he needs to stand on — and every rooftop becomes trespass.',
    exposure:
      'Slow and expensive, and it requires keeping the Sionis name clean, which is a contradiction nobody has yet solved.',
    asset: 'Two editors, one deputy commissioner, and a year of patience',
    at: { x: 330, y: 196 },
  },
  {
    id: 'fortune',
    code: '04',
    name: 'The Fortune',
    claim: 'Wayne money is the load-bearing wall of the entire arrangement.',
    diagnosis:
      'The tech, the lawyers, the alibis, the time to be a vigilante — all of it is funded by a fortune that has to appear in public filings once a year.',
    leverage:
      'Do not rob him. Audit him. A hostile position in Wayne Enterprises, a signature that isn’t his on a defence contract, a federal subpoena with our fingerprints carefully absent.',
    exposure:
      'Wayne’s people are better at this than ours. Do not fight them where they are strong, and never let them see the second set of books.',
    asset: 'Janus legal retainer, still billable, and three compliant accountants',
    at: { x: 438, y: 206 },
  },
  {
    id: 'method',
    code: '05',
    name: 'The Method',
    claim: 'A creature of pattern wearing a costume of improvisation.',
    diagnosis:
      'He deduces for a living, which means he cannot resist a hierarchy of clues. Give him one and he will dismantle it in order, convinced the whole time that he is the one choosing.',
    leverage:
      'Feed him three lies he can prove and a fourth he can only suspect. He will spend the night on the fourth while the actual operation finishes three streets away.',
    exposure:
      'Assume he has already read the file you are drafting. Build the plan so that being discovered is, itself, a step.',
    asset: 'One forged ledger good enough to survive an hour of scrutiny',
    at: { x: 446, y: 344 },
  },
  {
    id: 'compassion',
    code: '06',
    name: 'The Compassion',
    claim: 'He will always go back for the one person still breathing.',
    diagnosis:
      'It is the only thing in him that is not a strategy. Whatever the tactical maths says, whatever the trap obviously is, he turns around.',
    leverage:
      'Present a rescue and a target at the same moment. He chooses the rescue every time, and he will hate that we knew that about him.',
    exposure:
      'You will have to spend someone. Not a stranger — someone the room recognises, and someone whose loss will be remembered by name.',
    asset: 'A willing volunteer, or a convincing one',
    at: { x: 176, y: 424 },
  },
];

export const VECTOR_IDS: VectorId[] = VECTORS.map((vector) => vector.id);

export function getVector(id: VectorId): TargetVector {
  return VECTORS.find((vector) => vector.id === id) ?? VECTORS[0];
}

/* ------------------------------------------------------------------ *
 * Form vocabulary.
 * ------------------------------------------------------------------ */

export const MODES: Array<{ id: OperationMode; label: string; blurb: string }> = [
  { id: 'financial', label: 'Financial ruin', blurb: 'Bleed the fortune until the cape is a line item we can strike.' },
  { id: 'reputation', label: 'Public unmasking', blurb: 'Make the city believe he is the reason it is afraid.' },
  { id: 'siege', label: 'Siege', blurb: 'Hold a place he cannot abandon and make him come to us.' },
  { id: 'false_flag', label: 'False flag', blurb: 'Commit a crime in his colours and let the city do the rest.' },
  { id: 'decoy', label: 'Decoy', blurb: 'A loud operation to hide a quiet one he will never think to look for.' },
];

export const CREWS: Array<{ id: CrewSize; label: string }> = [
  { id: 'handful', label: 'A handful — four to six, deniable' },
  { id: 'crew', label: 'A crew — twenty to thirty, paid in advance' },
  { id: 'syndicate', label: 'A syndicate — a hundred, mostly expendable' },
];

export const BUDGETS: Array<{ id: Budget; label: string }> = [
  { id: 'lean', label: 'Lean — what is already in the walls' },
  { id: 'funded', label: 'Funded — a serious line of credit' },
  { id: 'unlimited', label: 'Effectively unlimited — do not itemise it' },
];

export const COLLATERAL_LEVELS: Array<{ id: Collateral; label: string }> = [
  { id: 'surgical', label: 'Surgical — no body we cannot explain' },
  { id: 'acceptable', label: 'Acceptable — the cost of doing business' },
  { id: 'citywide', label: 'Citywide — let the insurance industry cope' },
];

export function labelFor<T extends string>(list: Array<{ id: T; label: string }>, id: T): string {
  return list.find((entry) => entry.id === id)?.label ?? id;
}
