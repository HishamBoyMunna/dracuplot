import type { BlackMaskPlan } from '../types/plan';

/**
 * A complete operation, written in-house. Used for the no-key sample and as
 * the shape every generated memo is validated against.
 */
export const SAMPLE_PLAN: BlackMaskPlan = {
  codename: 'THE QUIET AUCTION',
  thesis:
    'He pays for the Batman out of a fortune that has to file paperwork once a year. Buy the paperwork and the Batman becomes an unfunded liability.',
  vectorId: 'fortune',
  vector: 'The Fortune',
  phases: [
    {
      name: 'Collateral',
      objective: 'Get a claim on the money before anybody knows there is a claim.',
      actions: [
        'Have Janus counsel file a quiet security interest in three Delaware shells that exist only to lease Wayne tech back to Wayne.',
        'Second two accountants into the logistics contractor. They need read access, not keys, and no discretion to enjoy it.',
        'Send nothing to the press. The first move of an auction is the silence before the reserve is met.',
      ],
      asset: 'Janus legal retainer, still billable',
      window: 'Weeks one to three',
    },
    {
      name: 'The subpoena',
      objective: 'Turn the Batman into a federal accounting problem with a docket number.',
      actions: [
        'Bundle the shells into a complaint alleging defence-contract fraud, filed by a shell of our own in the Eastern District.',
        'Brief one assistant US attorney with a taste for promotion and a clean copy of the ledger.',
        'Leak the existence of the investigation and never the contents. Uncertainty does the work.',
      ],
      asset: 'One forged ledger, good enough for an hour of scrutiny',
      window: 'Weeks four to six',
    },
    {
      name: 'The rescue',
      objective: 'Give the city one night where he saves the wrong thing.',
      actions: [
        'Stage a chemical incident in the Narrows: real evacuation, fake casualty list, forty convincing extras.',
        'Make the only building that matters a Wayne warehouse — insured, photographed, and legally ours to lose.',
        'Watch him choose the building. He will. Then publish what was inside it.',
      ],
      asset: 'A warehouse, a hazmat crew, and forty extras',
      window: 'Night of the sixth',
    },
    {
      name: 'The auction',
      objective: 'Sell him the only exit at a price the city gets to watch him refuse.',
      actions: [
        'Offer settlement through counsel: the case dies, the shells go quiet, and the equipment manifests go to a defence committee.',
        'Let the offer leak. Let the public do the arithmetic on what he is worth protecting.',
        'If he accepts, he is ours. If he refuses, he is theirs. Either way the suit stays on the record.',
      ],
      asset: 'A committee chairman with a re-election problem',
      window: 'Week seven',
    },
  ],
  assets: [
    { name: 'Janus legal retainer', role: 'Files everything, forgets nothing, bills monthly', cost: 'Already paid' },
    { name: 'Three Delaware shells', role: 'Own the equipment on paper', cost: '$140,000 to stand up' },
    { name: 'The Narrows warehouse', role: 'The thing he saves', cost: '$2.1m, insured at $3m' },
    { name: 'One assistant US attorney', role: 'Turns theft into procedure', cost: 'One favour, collected later' },
  ],
  contingencies: [
    {
      trigger: 'He traces the shells inside a week.',
      response:
        'Collapse them. Let him find a fourth company buying the first three back, and restart the clock at a cost he cannot sue over.',
    },
    {
      trigger: 'Wayne counsel moves to seal the docket.',
      response:
        'Do not fight the seal. A sealed case is a rumour, and rumours compound faster than evidence.',
    },
    {
      trigger: 'He comes for the accountant instead of the warehouse.',
      response:
        'Let him take her. She is briefed, she is billed, and the second set of books is in a room she has never been shown.',
    },
  ],
  successProbability: 34,
  exposureRisk: 61,
  collateral: 22,
  failureMode:
    'He lets it stand. A Batman under subpoena is still a Batman, and this city has a twenty-year habit of forgiving him. We spend the fortune and buy a headline.',
  closingLine: 'Send the bill to the manor. He can afford it — that is rather the point.',
  origin: 'sample',
};
