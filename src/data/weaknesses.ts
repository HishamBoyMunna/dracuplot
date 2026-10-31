import type { Weakness, WeaknessId } from '../types/plan';

export const WEAKNESSES: Weakness[] = [
  {
    id: 'cowl',
    index: '01',
    label: 'The Cowl',
    shortLabel: 'COWL',
    bodyPart: 'Cranial sensor array',
    severity: 8,
    summary:
      'A hardened shell wrapped around the most sensitive equipment he owns. The lenses feed him the night. Blind them and the night turns on him.',
    exploit:
      'Open with a magnesium flash and a directional sonic burst. His lenses auto-dim; his ears do not. Strip his awareness for four seconds, then move.',
    tell: 'He tilts his head toward sound before he moves.',
  },
  {
    id: 'jaw',
    index: '02',
    label: 'The Jaw',
    shortLabel: 'JAW',
    bodyPart: 'Exposed mandible',
    severity: 9,
    summary:
      'The one inch of skin the Batman leaves unarmored. It is not confidence. It is vanity. He wants the city to see a man beneath the myth.',
    exploit:
      'Do not trade punches. Use a short blade, a knuckleweight, or the butt of a rifle at conversational range. Let the myth taste iron.',
    tell: 'He speaks through his teeth when the fight turns personal.',
  },
  {
    id: 'chest',
    index: '03',
    label: 'The Chest Plate',
    shortLabel: 'CHEST',
    bodyPart: 'Kevlar weave / sternum',
    severity: 4,
    summary:
      'The armor stops bullets and knives. It does not stop weight, shock, or a man who knows how to fall. The plate is a wall with a seam beneath it.',
    exploit:
      'Bring him down on a hard edge or a forty-foot drop. Concussive force travels through the plate. The suit redistributes the impact, not the damage.',
    tell: 'He rolls his shoulder after every heavy landing.',
  },
  {
    id: 'belt',
    index: '04',
    label: 'The Utility Belt',
    shortLabel: 'BELT',
    bodyPart: 'Field arsenal / waist',
    severity: 8,
    summary:
      'Every contingency he has ever needed, hanging at his waist in a row of little black boxes. Take the belt and he is just a man with good posture.',
    exploit:
      'EMP first, knives second. Acid the clasps, jam the quick-release, and force him to fight for the tools he brought. A plan inside a pouch can be stolen.',
    tell: 'His hand drops to a pouch before his eyes finish reading the room.',
  },
  {
    id: 'gauntlets',
    index: '05',
    label: 'The Gauntlets',
    shortLabel: 'GAUNTLETS',
    bodyPart: 'Forearm / wrist joint',
    severity: 6,
    summary:
      'The fins stop a blade, absorb a bullet, and make him look like something carved out of the dark. They do not protect the hinge at the wrist.',
    exploit:
      'Attack the seam at the glove line. A baton across the wrist, a door frame, a pair of cuffs. Disarm the hands and the rest of the myth follows.',
    tell: 'He blocks with the flat of the gauntlet, never the fingers.',
  },
  {
    id: 'knees',
    index: '06',
    label: 'The Knees',
    shortLabel: 'KNEES',
    bodyPart: 'Lower body / joints',
    severity: 7,
    summary:
      'He lands from rooftops like a man who has never met a health plan. The armor is heavy. The cartilage is finite. He has two knees and one bad night.',
    exploit:
      'Take the stairs. Force angled landings, low ledges, wet steel. When the left knee goes, the grapple becomes a crutch instead of an escape.',
    tell: 'He favors his left leg on the second landing.',
  },
  {
    id: 'cape',
    index: '07',
    label: 'The Cape',
    shortLabel: 'CAPE',
    bodyPart: 'Memory cloth / harness',
    severity: 5,
    summary:
      'It catches air, bullets, and the eye. Memory cloth is a miracle until it snags. Every wing is a handle if you are close enough to grab it.',
    exploit:
      'Salt the rooftops with hooks and monofilament. Pull him off his line mid-glide. Set the cape alight where it meets the harness and watch him choose between flame and fall.',
    tell: 'He spreads the cape before the grapple line fully catches.',
  },
];

export const WEAKNESS_BY_ID = Object.fromEntries(
  WEAKNESSES.map((weakness) => [weakness.id, weakness]),
) as Record<WeaknessId, Weakness>;

export const WEAKNESS_IDS = WEAKNESSES.map((weakness) => weakness.id);

export function isWeaknessId(value: unknown): value is WeaknessId {
  return typeof value === 'string' && WEAKNESS_IDS.includes(value as WeaknessId);
}
