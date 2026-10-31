import type { PropId } from '../types/game';

export const ROOM_WIDTH = 800;
export const ROOM_HEIGHT = 600;
export const WALL_THICKNESS = 24;
export const TILE_SIZE = 40;

export const PLAYER_SPEED = 220; // px per second
export const PLAYER_RADIUS = 13;
export const INTERACT_DISTANCE = 45;

export const DEFAULT_TORCH_RADIUS = 190;
export const MIN_TORCH_RADIUS = 75;
export const TORCH_PENALTY_STEP = 18;

export const PLAYER_SPAWN = { x: 400, y: 460 };

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PropDefinition {
  id: PropId;
  /** Bounding box exactly as specified in AGENTS.md. */
  rect: Rect;
  /** Where the player stands to use the prop. */
  approach: { x: number; y: number };
  label: string;
  /** Null for the gargoyle, which is the exit rather than one of the five relics. */
  runeIndex: number | null;
}

export const PROPS: PropDefinition[] = [
  {
    id: 'bookshelf',
    rect: { x: 60, y: 30, width: 150, height: 45 },
    approach: { x: 135, y: 110 },
    label: 'The Ledger Archive',
    runeIndex: 0,
  },
  {
    id: 'clock',
    rect: { x: 590, y: 30, width: 80, height: 55 },
    approach: { x: 630, y: 118 },
    label: 'The Vault Clock',
    runeIndex: 1,
  },
  {
    id: 'scale',
    rect: { x: 50, y: 260, width: 95, height: 110 },
    approach: { x: 182, y: 315 },
    label: 'The Weighing Table',
    runeIndex: 2,
  },
  {
    id: 'safe',
    rect: { x: 655, y: 260, width: 95, height: 100 },
    approach: { x: 620, y: 310 },
    label: 'The Iron Safe',
    runeIndex: 3,
  },
  {
    id: 'cauldron',
    rect: { x: 355, y: 255, width: 90, height: 90 },
    approach: { x: 400, y: 380 },
    label: 'The Chem Vat',
    runeIndex: 4,
  },
  {
    id: 'gargoyle',
    rect: { x: 330, y: 535, width: 140, height: 55 },
    approach: { x: 400, y: 498 },
    label: 'The Gargoyle Gate',
    runeIndex: null,
  },
];

export const PROP_MAP: Record<PropId, PropDefinition> = PROPS.reduce(
  (map, prop) => {
    map[prop.id] = prop;
    return map;
  },
  {} as Record<PropId, PropDefinition>,
);

/** The five locks that award a Syndicate Key. The gargoyle gate awards the sixth. */
export const RUNE_PROP_IDS: PropId[] = PROPS.filter((prop) => prop.runeIndex !== null).map(
  (prop) => prop.id,
);

export const TOTAL_RUNES = 6;

export function rectCenter(rect: Rect): { x: number; y: number } {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

/** Shortest distance from a point to a prop's bounding box (0 when inside). */
export function distanceToRect(x: number, y: number, rect: Rect): number {
  const dx = Math.max(rect.x - x, 0, x - (rect.x + rect.width));
  const dy = Math.max(rect.y - y, 0, y - (rect.y + rect.height));
  return Math.hypot(dx, dy);
}

export function hitTestProp(x: number, y: number, padding = 10): PropDefinition | null {
  for (const prop of PROPS) {
    if (distanceToRect(x, y, prop.rect) <= padding) return prop;
  }
  return null;
}
