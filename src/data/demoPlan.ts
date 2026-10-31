import type { BlackMaskPlan } from '../types/plan';

export const DEMO_OBJECTIVE = 'Break the Bat’s grip on the Gotham docks before the GCPD crowns him a saint.';

export const DEMO_PLAN: BlackMaskPlan = {
  codename: 'THE HOLLOW CROWN',
  thesis:
    'Batman wins because Gotham believes he cannot lose. We do not need to kill the man. We only need to make the city watch him choose between the mission and the myth.',
  targetWeaknessId: 'belt',
  successProbability: 78,
  exposure: 64,
  window: '02:00–04:00 / new moon / harbor fog',
  openingMove:
    'Leak a forged Bat-signal order that sends the GCPD’s tactical wing into our dock operation, then let the Bat arrive to “save” the wrong men.',
  phases: [
    {
      title: 'THE FALSE SIGNAL',
      timing: 'T–72 HOURS',
      objective:
        'Turn the GCPD’s worship of Batman into a liability. Make his signature appear on a crime he did not commit.',
      actions: [
        'Forge a Wayne Enterprises shipping manifest linking the docks to a black-market neurotoxin.',
        'Let three GCPD lieutenants “discover” the file and leak it to the Gotham Gazette.',
        'Stage a fake Bat-sighting at the East End evidence lockup while the real Bat is across town.',
      ],
      asset: 'A corrupt evidence clerk on the GCPD payroll',
      risk: 'low',
    },
    {
      title: 'THE EMPTY VAULT',
      timing: 'T–24 HOURS',
      objective:
        'Create a target too valuable to ignore and too clean to resist. Strip his field kit before he ever reaches the docks.',
      actions: [
        'Float a rumor that the docks contain the last intact copy of the mob’s black ledger.',
        'Replace the contents of Dock 9’s electrical room with a directional EMP array.',
        'Seed the roof with counterfeit grapple anchors rigged to detonate on contact.',
      ],
      asset: 'A stolen Wayne-tech power cell',
      risk: 'medium',
    },
    {
      title: 'THE FLOODLINE',
      timing: 'T–00:00',
      objective:
        'Force the Bat onto a narrow pier with no civilians, no high ground, and no working gadgets.',
      actions: [
        'Open the harbor sluice gates and turn the dock approach into a forty-foot drop.',
        'Trigger the EMP as he lands. Hold the belt’s frequency long enough to burn out its clasps.',
        'Send the False Face crew through the smoke with batons and wrist-locks, not guns.',
      ],
      asset: 'Twelve masked enforcers with stolen GCPD body armor',
      risk: 'high',
    },
    {
      title: 'THE OPEN GRAVE',
      timing: 'T+06 MINUTES',
      objective:
        'Hand the city a choice: the Bat’s body in the harbor, or the Bat’s guilt on every screen in Gotham.',
      actions: [
        'Run the forged manifest and the “dead” dockworkers on a citywide broadcast.',
        'Leave a second evidence trail pointing to Wayne Manor and Bruce Wayne’s private dock.',
        'Withdraw before dawn. Let the GCPD and the press do the rest.',
      ],
      asset: 'A pirated broadcast tower under the Kane Bridge',
      risk: 'high',
    },
  ],
  assets: [
    '12 disposable enforcers',
    'One forged Wayne Enterprises manifest',
    'A stolen Wayne-tech power cell',
    'Two GCPD evidence clerks',
  ],
  contingencies: [
    'If the Bat brings an ally, collapse the pier early and let the ally become the rescue.',
    'If the EMP fails, pin him with floodlights and take the belt by blade, not by fist.',
    'If the narrative turns, release the forged manifest and let Gotham do the wounding.',
  ],
};
