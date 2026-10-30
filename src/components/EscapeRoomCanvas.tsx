import { useCallback, useEffect, useRef, useState } from 'react';
import { soundEngine } from '../services/soundEngine';
import type { PropId } from '../types/game';
import {
  DEFAULT_TORCH_RADIUS,
  INTERACT_DISTANCE,
  PLAYER_RADIUS,
  PLAYER_SPAWN,
  PLAYER_SPEED,
  PROPS,
  PROP_MAP,
  ROOM_HEIGHT,
  ROOM_WIDTH,
  type PropDefinition,
  type Rect,
  RUNE_PROP_IDS,
  TILE_SIZE,
  WALL_THICKNESS,
  distanceToRect,
  hitTestProp,
  rectCenter,
} from '../data/roomLayout';

const SOLVED_AURA = '#3ce2c0';
const UNSOLVED_BEACON = '#f2a33c';

const CANDLES = [
  { x: 262, y: 44 },
  { x: 520, y: 44 },
  { x: 38, y: 168 },
  { x: 38, y: 470 },
  { x: 762, y: 168 },
  { x: 762, y: 470 },
  { x: 190, y: 556 },
  { x: 610, y: 556 },
];

interface Ripple {
  x: number;
  y: number;
  age: number;
  blocked: boolean;
}

interface Runtime {
  player: { x: number; y: number };
  target: { x: number; y: number } | null;
  pendingProp: PropId | null;
  ripples: Ripple[];
  walkPhase: number;
  facing: number;
  time: number;
  lastFrame: number;
  stepTimer: number;
}

export interface EscapeRoomCanvasProps {
  solvedProps: ReadonlySet<PropId>;
  torchRadius?: number;
  /** Suppresses clicks while a modal or the endgame screen is open. */
  interactionLocked?: boolean;
  /** Villain accent colour, used for the warning banner tint. */
  accentColor?: string;
  /** Draws an FPS / position readout in the corner while developing. */
  debugOverlay?: boolean;
  onInteractProp: (propId: PropId) => void;
  onBlockedInteraction?: (propId: PropId, message: string) => void;
}

/* ------------------------------------------------------------------ *
 * Deterministic noise so the procedural room looks identical each frame
 * ------------------------------------------------------------------ */

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function roundRect(ctx: CanvasRenderingContext2D, rect: Rect, radius: number): void {
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
}

/* ------------------------------------------------------------------ *
 * Static layer: floor, rugs, walls, candle bases
 * ------------------------------------------------------------------ */

function drawFloor(ctx: CanvasRenderingContext2D): void {
  for (let row = 0; row * TILE_SIZE < ROOM_HEIGHT; row += 1) {
    for (let col = 0; col * TILE_SIZE < ROOM_WIDTH; col += 1) {
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;
      ctx.fillStyle = (row + col) % 2 === 0 ? '#181824' : '#14141f';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      // Weathering speckles carved into each slab.
      const seed = hash2(col, row);
      ctx.fillStyle = `rgba(255,255,255,${0.012 + seed * 0.014})`;
      for (let i = 0; i < 5; i += 1) {
        const sx = x + hash2(col * 7 + i, row * 13) * TILE_SIZE;
        const sy = y + hash2(col * 17, row * 23 + i) * TILE_SIZE;
        ctx.fillRect(sx, sy, 1.6, 1.6);
      }

      if (seed > 0.93) {
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 6, y + TILE_SIZE * seed);
        ctx.lineTo(x + TILE_SIZE - 7, y + TILE_SIZE * (1 - seed) + 4);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
    }
  }
}

function drawRug(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  base: string,
  trim: string,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = 0.85;

  ctx.fillStyle = base;
  roundRect(ctx, { x: -width / 2, y: -height / 2, width, height }, 10);
  ctx.fill();

  ctx.strokeStyle = trim;
  ctx.lineWidth = 3;
  roundRect(ctx, { x: -width / 2 + 9, y: -height / 2 + 9, width: width - 18, height: height - 18 }, 6);
  ctx.stroke();

  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  roundRect(
    ctx,
    { x: -width / 2 + 18, y: -height / 2 + 18, width: width - 36, height: height - 36 },
    4,
  );
  ctx.stroke();

  // Woven diamond motif.
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(0, -height / 2 + 26);
  ctx.lineTo(width / 2 - 26, 0);
  ctx.lineTo(0, height / 2 - 26);
  ctx.lineTo(-width / 2 + 26, 0);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

function drawWalls(ctx: CanvasRenderingContext2D): void {
  const w = WALL_THICKNESS;

  ctx.fillStyle = '#0c0c15';
  ctx.fillRect(0, 0, ROOM_WIDTH, w);
  ctx.fillRect(0, ROOM_HEIGHT - w, ROOM_WIDTH, w);
  ctx.fillRect(0, 0, w, ROOM_HEIGHT);
  ctx.fillRect(ROOM_WIDTH - w, 0, w, ROOM_HEIGHT);

  // Stone block courses along every wall run.
  const block = 46;
  ctx.lineWidth = 1;
  for (let i = 0; i < ROOM_WIDTH; i += block) {
    const shade = 0.05 + hash2(i, 1) * 0.07;
    ctx.fillStyle = `rgba(190,185,210,${shade})`;
    ctx.fillRect(i + 1, 1, block - 3, w - 2);
    ctx.fillStyle = `rgba(190,185,210,${0.05 + hash2(i, 2) * 0.07})`;
    ctx.fillRect(i + 1, ROOM_HEIGHT - w + 1, block - 3, w - 2);
  }
  for (let i = 0; i < ROOM_HEIGHT; i += block) {
    ctx.fillStyle = `rgba(190,185,210,${0.05 + hash2(3, i) * 0.07})`;
    ctx.fillRect(1, i + 1, w - 2, block - 3);
    ctx.fillStyle = `rgba(190,185,210,${0.05 + hash2(4, i) * 0.07})`;
    ctx.fillRect(ROOM_WIDTH - w + 1, i + 1, w - 2, block - 3);
  }

  // Inner lip where the wall meets the floor.
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = 3;
  ctx.strokeRect(w - 1, w - 1, ROOM_WIDTH - w * 2 + 2, ROOM_HEIGHT - w * 2 + 2);
  ctx.strokeStyle = 'rgba(150,140,180,0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(w + 1.5, w + 1.5, ROOM_WIDTH - w * 2 - 3, ROOM_HEIGHT - w * 2 - 3);
}

function drawCandleBase(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#2a2436';
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 9, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#6d6350';
  ctx.beginPath();
  ctx.ellipse(x, y, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.arc(x, y - 1, 3.6, 0, Math.PI * 2);
  ctx.fill();
}

function buildStaticLayer(): HTMLCanvasElement {
  const layer = document.createElement('canvas');
  layer.width = ROOM_WIDTH;
  layer.height = ROOM_HEIGHT;
  const ctx = layer.getContext('2d');
  if (!ctx) return layer;

  drawFloor(ctx);
  drawRug(ctx, 400, 300, 290, 250, '#3a0e1b', '#8d6b2f');
  drawRug(ctx, 150, 180, 170, 110, '#1d2436', '#45617a');
  drawRug(ctx, 648, 455, 160, 120, '#2b1a35', '#6b4d86');
  drawWalls(ctx);
  for (const candle of CANDLES) drawCandleBase(ctx, candle.x, candle.y);

  return layer;
}

/* ------------------------------------------------------------------ *
 * Props
 * ------------------------------------------------------------------ */

function drawBookshelf(ctx: CanvasRenderingContext2D, rect: Rect): void {
  ctx.fillStyle = '#2d1a12';
  roundRect(ctx, rect, 4);
  ctx.fill();

  ctx.fillStyle = '#4a2b1c';
  ctx.fillRect(rect.x + 4, rect.y + 4, rect.width - 8, rect.height - 8);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(rect.x + 6, rect.y + 6, rect.width - 12, rect.height - 12);

  const spineColors = [
    '#8d2230',
    '#2f6b5a',
    '#7a5c1f',
    '#3b3f7a',
    '#6b2f6b',
    '#1f5e7a',
    '#8a4a1c',
    '#4a6b27',
  ];
  let x = rect.x + 9;
  let index = 0;
  while (x < rect.x + rect.width - 12) {
    const seed = hash2(x, rect.y);
    const spineWidth = 5 + Math.floor(seed * 5);
    const lean = seed > 0.88 ? 0.18 : 0;
    const height = rect.height - 16 - Math.floor(hash2(x, 9) * 6);

    ctx.save();
    ctx.translate(x, rect.y + rect.height - 8);
    ctx.rotate(lean);
    ctx.fillStyle = spineColors[index % spineColors.length];
    ctx.fillRect(0, -height, spineWidth, height);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(spineWidth - 1.5, -height, 1.5, height);
    ctx.fillStyle = 'rgba(232,216,168,0.55)';
    ctx.fillRect(1, -height + 4, spineWidth - 2, 1.2);
    ctx.fillRect(1, -height + height * 0.45, spineWidth - 2, 1);
    ctx.restore();

    x += spineWidth + 2;
    index += 1;
  }

  ctx.strokeStyle = '#6b4226';
  ctx.lineWidth = 2;
  roundRect(ctx, rect, 4);
  ctx.stroke();
}

function drawClock(ctx: CanvasRenderingContext2D, rect: Rect, time: number): void {
  const { x, y, width, height } = rect;

  ctx.fillStyle = '#3a2416';
  roundRect(ctx, rect, 5);
  ctx.fill();
  ctx.strokeStyle = '#c99a3f';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#20150d';
  ctx.fillRect(x + 5, y + 5, width - 10, height - 10);

  const faceX = x + width / 2;
  const faceY = y + 20;
  const faceR = 14;

  const faceGradient = ctx.createRadialGradient(faceX, faceY, 1, faceX, faceY, faceR);
  faceGradient.addColorStop(0, '#f0e0b4');
  faceGradient.addColorStop(1, '#b89a5e');
  ctx.fillStyle = faceGradient;
  ctx.beginPath();
  ctx.arc(faceX, faceY, faceR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e0b85c';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#2a1c0f';
  ctx.font = '6px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const numerals = ['XII', 'III', 'VI', 'IX'];
  numerals.forEach((numeral, index) => {
    const angle = (index * Math.PI) / 2 - Math.PI / 2;
    ctx.fillText(numeral, faceX + Math.cos(angle) * (faceR - 4), faceY + Math.sin(angle) * (faceR - 4));
  });

  ctx.strokeStyle = '#1a1008';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(faceX, faceY);
  ctx.lineTo(faceX + Math.cos(time * 0.6 - Math.PI / 2) * 8, faceY + Math.sin(time * 0.6 - Math.PI / 2) * 8);
  ctx.stroke();
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(faceX, faceY);
  ctx.lineTo(faceX + Math.cos(time * 2.1 - Math.PI / 2) * 11, faceY + Math.sin(time * 2.1 - Math.PI / 2) * 11);
  ctx.stroke();
  ctx.lineCap = 'butt';

  // Pendulum swinging behind glass.
  const swing = Math.sin(time * 1.9) * 0.42;
  const pivotY = y + 36;
  ctx.save();
  ctx.translate(faceX, pivotY);
  ctx.rotate(swing);
  ctx.strokeStyle = '#8d7a46';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 13);
  ctx.stroke();

  ctx.shadowBlur = 10;
  ctx.shadowColor = '#f2c76a';
  ctx.fillStyle = '#f2c76a';
  ctx.beginPath();
  ctx.arc(0, 15, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawScale(ctx: CanvasRenderingContext2D, rect: Rect, time: number): void {
  const { x, y, width, height } = rect;

  ctx.fillStyle = '#39251a';
  roundRect(ctx, rect, 5);
  ctx.fill();
  ctx.fillStyle = '#543824';
  ctx.fillRect(x + 4, y + 4, width - 8, height - 8);
  ctx.strokeStyle = '#7a5334';
  ctx.lineWidth = 1.5;
  roundRect(ctx, rect, 5);
  ctx.stroke();

  // Glowing vials along the top of the desk.
  const vialColors = ['#3ce2c0', '#a06ce8', '#f2a33c'];
  vialColors.forEach((color, index) => {
    const vx = x + 18 + index * 23;
    const vy = y + 18;
    const pulse = 0.6 + Math.sin(time * 2.2 + index) * 0.25;
    ctx.shadowBlur = 9 * pulse;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(vx - 3.5, vy - 7, 7, 14, 3);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(vx - 2.5, vy - 5, 1.4, 5);
  });

  // Balance beam with twin pans.
  const beamY = y + 62;
  const tilt = Math.sin(time * 1.1) * 0.1;
  ctx.strokeStyle = '#d4af47';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y + 44);
  ctx.lineTo(x + width / 2, beamY);
  ctx.stroke();

  ctx.save();
  ctx.translate(x + width / 2, beamY);
  ctx.rotate(tilt);
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(30, 0);
  ctx.stroke();

  for (const side of [-30, 30]) {
    ctx.beginPath();
    ctx.moveTo(side, 0);
    ctx.lineTo(side, 10);
    ctx.stroke();

    const panGradient = ctx.createLinearGradient(side - 12, 10, side + 12, 20);
    panGradient.addColorStop(0, '#f0d37a');
    panGradient.addColorStop(1, '#9c7a24');
    ctx.fillStyle = panGradient;
    ctx.beginPath();
    ctx.ellipse(side, 13, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4af47';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.lineWidth = 2;
  }
  ctx.restore();

  ctx.fillStyle = '#d4af47';
  ctx.beginPath();
  ctx.arc(x + width / 2, y + 44, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSafe(ctx: CanvasRenderingContext2D, rect: Rect, time: number): void {
  const { x, y, width, height } = rect;

  const body = ctx.createLinearGradient(x, y, x + width, y + height);
  body.addColorStop(0, '#454b57');
  body.addColorStop(0.5, '#2d323c');
  body.addColorStop(1, '#1c2029');
  ctx.fillStyle = body;
  roundRect(ctx, rect, 6);
  ctx.fill();
  ctx.strokeStyle = '#6b7384';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = '#141820';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 9, y + 9, width - 18, height - 18);

  // Rivets around the frame.
  ctx.fillStyle = '#8b93a4';
  const rivetInset = 5;
  for (let rx = x + rivetInset + 3; rx < x + width - rivetInset; rx += 14) {
    ctx.beginPath();
    ctx.arc(rx, y + rivetInset, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rx, y + height - rivetInset, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let ry = y + rivetInset + 10; ry < y + height - rivetInset; ry += 14) {
    ctx.beginPath();
    ctx.arc(x + rivetInset, ry, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width - rivetInset, ry, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gold combination dial.
  const dialX = x + width / 2;
  const dialY = y + height / 2;
  const dial = ctx.createRadialGradient(dialX - 3, dialY - 3, 2, dialX, dialY, 17);
  dial.addColorStop(0, '#f7dd96');
  dial.addColorStop(1, '#9a7520');
  ctx.fillStyle = dial;
  ctx.beginPath();
  ctx.arc(dialX, dialY, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2a2008';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.save();
  ctx.translate(dialX, dialY);
  ctx.rotate(Math.sin(time * 0.5) * 0.5);
  ctx.strokeStyle = '#3a2d0d';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.lineTo(13, 0);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = '#2a2008';
  ctx.beginPath();
  ctx.arc(dialX, dialY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Handle.
  ctx.strokeStyle = '#c9a53c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(dialX, y + height - 17, 8, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
}

function drawCauldron(ctx: CanvasRenderingContext2D, rect: Rect, time: number): void {
  const { x, y } = rectCenter(rect);
  const radius = rect.width / 2;

  // Stone hearth ring.
  ctx.fillStyle = '#242029';
  ctx.beginPath();
  ctx.arc(x, y + 4, radius + 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#121016';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  const iron = ctx.createRadialGradient(x - 10, y - 12, 4, x, y, radius);
  iron.addColorStop(0, '#3c3a46');
  iron.addColorStop(1, '#17161d');
  ctx.fillStyle = iron;
  ctx.beginPath();
  ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
  ctx.fill();

  // Bubbling brew: concentric neon-green rings.
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius - 11, 0, Math.PI * 2);
  ctx.clip();

  const brew = ctx.createRadialGradient(x, y, 2, x, y, radius - 11);
  brew.addColorStop(0, '#d8ffb0');
  brew.addColorStop(0.45, '#4ad66a');
  brew.addColorStop(1, '#0d4f2a');
  ctx.fillStyle = brew;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

  ctx.strokeStyle = 'rgba(216,255,176,0.45)';
  ctx.lineWidth = 1.4;
  for (let ring = 0; ring < 4; ring += 1) {
    const phase = (time * 0.55 + ring * 0.25) % 1;
    ctx.globalAlpha = 1 - phase;
    ctx.beginPath();
    ctx.arc(x, y, phase * (radius - 11), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Rising bubbles.
  for (let i = 0; i < 9; i += 1) {
    const seed = hash2(i * 3.7, 11);
    const life = (time * (0.35 + seed * 0.4) + seed) % 1;
    const bx = x + (seed - 0.5) * (radius - 18) * 1.6;
    const by = y + (radius - 14) - life * (radius * 1.7);
    ctx.globalAlpha = 0.65 * (1 - life);
    ctx.fillStyle = '#eaffd0';
    ctx.beginPath();
    ctx.arc(bx, by, 1.2 + seed * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.strokeStyle = '#4a4756';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, radius - 9, 0, Math.PI * 2);
  ctx.stroke();

  // Escaping vapour.
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#9cffb8';
  for (let i = 0; i < 3; i += 1) {
    const life = (time * 0.3 + i * 0.33) % 1;
    ctx.beginPath();
    ctx.arc(
      x + Math.sin(time * 1.3 + i * 2) * 10,
      y - life * 34,
      5 + life * 13,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGargoyleDoor(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  runesCollected: number,
  unlocked: boolean,
  time: number,
): void {
  const { x, y, width, height } = rect;

  ctx.fillStyle = '#0a0a11';
  ctx.fillRect(x - 6, y - 4, width + 12, height + 4);

  const doorGradient = ctx.createLinearGradient(x, y, x, y + height);
  doorGradient.addColorStop(0, '#2b2f3a');
  doorGradient.addColorStop(1, '#171a22');
  ctx.fillStyle = doorGradient;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = unlocked ? SOLVED_AURA : '#59606f';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

  // Central split and iron bands.
  ctx.strokeStyle = '#0a0c11';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width / 2, y + height);
  ctx.stroke();

  ctx.strokeStyle = '#444c5c';
  ctx.lineWidth = 3;
  for (const bandY of [y + 14, y + height - 14]) {
    ctx.beginPath();
    ctx.moveTo(x + 4, bandY);
    ctx.lineTo(x + width - 4, bandY);
    ctx.stroke();
  }

  ctx.fillStyle = '#6b7384';
  for (const handleX of [x + width / 2 - 11, x + width / 2 + 11]) {
    ctx.beginPath();
    ctx.arc(handleX, y + height / 2 + 6, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Five rune sockets across the lintel.
  for (let i = 0; i < 5; i += 1) {
    const sx = x + 18 + i * ((width - 36) / 4);
    const sy = y + 7;
    const lit = i < runesCollected;
    if (lit) {
      ctx.shadowBlur = 10 + Math.sin(time * 3 + i) * 3;
      ctx.shadowColor = SOLVED_AURA;
      ctx.fillStyle = SOLVED_AURA;
    } else {
      ctx.fillStyle = '#262b35';
    }
    ctx.beginPath();
    ctx.moveTo(sx, sy - 4.5);
    ctx.lineTo(sx + 4, sy);
    ctx.lineTo(sx, sy + 4.5);
    ctx.lineTo(sx - 4, sy);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Flanking horned gargoyles.
  for (const side of [-1, 1]) {
    const gx = x + (side < 0 ? -16 : width + 16);
    const gy = y + height / 2 - 4;

    ctx.fillStyle = '#4b4a56';
    ctx.beginPath();
    ctx.ellipse(gx, gy, 12, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5d5c6a';
    ctx.beginPath();
    ctx.ellipse(gx, gy - 4, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Horns.
    ctx.strokeStyle = '#6f6e7d';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const horn of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(gx + horn * 5, gy - 9);
      ctx.quadraticCurveTo(gx + horn * 11, gy - 16, gx + horn * 8, gy - 21);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';

    // Wings folded against the wall.
    ctx.fillStyle = 'rgba(60,59,70,0.9)';
    ctx.beginPath();
    ctx.moveTo(gx, gy + 2);
    ctx.quadraticCurveTo(gx + side * 17, gy + 2, gx + side * 13, gy + 16);
    ctx.quadraticCurveTo(gx + side * 5, gy + 11, gx, gy + 12);
    ctx.closePath();
    ctx.fill();

    // Eyes: amber while sealed, emerald once the runes are gathered.
    const eyeColor = unlocked ? SOLVED_AURA : '#e2453c';
    ctx.shadowBlur = 8 + Math.sin(time * 4 + side) * 2.5;
    ctx.shadowColor = eyeColor;
    ctx.fillStyle = eyeColor;
    for (const eye of [-3.2, 3.2]) {
      ctx.beginPath();
      ctx.arc(gx + eye, gy - 5, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
}

function drawProp(
  ctx: CanvasRenderingContext2D,
  prop: PropDefinition,
  time: number,
  runesCollected: number,
  gargoyleUnlocked: boolean,
): void {
  ctx.save();
  // Soft contact shadow underneath every object.
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.filter = 'blur(0px)';
  roundRect(
    ctx,
    { x: prop.rect.x + 3, y: prop.rect.y + 5, width: prop.rect.width, height: prop.rect.height },
    6,
  );
  ctx.fill();
  ctx.restore();

  switch (prop.id) {
    case 'bookshelf':
      drawBookshelf(ctx, prop.rect);
      break;
    case 'clock':
      drawClock(ctx, prop.rect, time);
      break;
    case 'scale':
      drawScale(ctx, prop.rect, time);
      break;
    case 'safe':
      drawSafe(ctx, prop.rect, time);
      break;
    case 'cauldron':
      drawCauldron(ctx, prop.rect, time);
      break;
    case 'gargoyle':
      drawGargoyleDoor(ctx, prop.rect, runesCollected, gargoyleUnlocked, time);
      break;
  }
}

function drawPropAura(
  ctx: CanvasRenderingContext2D,
  prop: PropDefinition,
  solved: boolean,
  time: number,
): void {
  const { x, y } = rectCenter(prop.rect);
  const radius = Math.max(prop.rect.width, prop.rect.height) * 0.62 + 12;
  const pulse = 0.55 + Math.sin(time * (solved ? 1.6 : 2.4) + x) * 0.22;
  const color = solved ? SOLVED_AURA : UNSOLVED_BEACON;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const glow = ctx.createRadialGradient(x, y, radius * 0.25, x, y, radius);
  glow.addColorStop(0, solved ? `rgba(60,226,192,${0.2 * pulse})` : `rgba(242,163,60,${0.14 * pulse})`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.globalAlpha = solved ? 0.5 + pulse * 0.3 : 0.18 + pulse * 0.18;
  ctx.lineWidth = solved ? 2 : 1.2;
  ctx.setLineDash(solved ? [] : [5, 7]);
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/* ------------------------------------------------------------------ *
 * Player, candles, ripples
 * ------------------------------------------------------------------ */

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: number,
  walkPhase: number,
  moving: boolean,
): void {
  const bob = moving ? Math.sin(walkPhase * 2) * 1.8 : Math.sin(walkPhase * 0.6) * 0.6;
  const sway = moving ? Math.sin(walkPhase) * 0.12 : 0;

  ctx.save();
  ctx.translate(x, y + bob);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(1, 9 - bob, 12, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(facing + Math.PI / 2 + sway);

  // Boots peeking out of the cloak as the scholar strides.
  if (moving) {
    ctx.fillStyle = '#2a1f16';
    const stride = Math.sin(walkPhase) * 5;
    ctx.beginPath();
    ctx.ellipse(-5, stride, 3, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, -stride, 3, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cloak.
  const cloak = ctx.createRadialGradient(-3, -4, 2, 0, 0, PLAYER_RADIUS);
  cloak.addColorStop(0, '#4b3f6b');
  cloak.addColorStop(1, '#241d38');
  ctx.fillStyle = cloak;
  ctx.beginPath();
  ctx.ellipse(0, 0, PLAYER_RADIUS - 1, PLAYER_RADIUS, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6f5fa0';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Hood and the hint of a face below it.
  ctx.fillStyle = '#5a4b80';
  ctx.beginPath();
  ctx.arc(0, -3, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8d4b0';
  ctx.beginPath();
  ctx.arc(0, -5.5, 3.4, 0, Math.PI * 2);
  ctx.fill();

  // Hand lantern.
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#ffcf7a';
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath();
  ctx.arc(9, -4, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawCandleFlames(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  CANDLES.forEach((candle, index) => {
    const flicker = 0.75 + Math.sin(time * 7.3 + index * 2.1) * 0.15 + hash2(index, Math.floor(time * 11)) * 0.1;
    const glow = ctx.createRadialGradient(candle.x, candle.y - 4, 1, candle.x, candle.y - 4, 34 * flicker);
    glow.addColorStop(0, `rgba(255,198,112,${0.42 * flicker})`);
    glow.addColorStop(0.4, `rgba(226,120,52,${0.14 * flicker})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(candle.x, candle.y - 4, 34 * flicker, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,224,160,${0.9 * flicker})`;
    ctx.beginPath();
    ctx.ellipse(candle.x, candle.y - 7, 2.1 * flicker, 4.6 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawRipples(ctx: CanvasRenderingContext2D, ripples: Ripple[]): void {
  ctx.save();
  for (const ripple of ripples) {
    const progress = Math.min(ripple.age / 0.75, 1);
    const alpha = (1 - progress) * 0.75;
    const color = ripple.blocked ? '226,60,85' : '242,163,60';
    ctx.strokeStyle = `rgba(${color},${alpha})`;
    ctx.lineWidth = 2 - progress;
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, 5 + progress * 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${color},${alpha * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(ripple.x - 6, ripple.y);
    ctx.lineTo(ripple.x + 6, ripple.y);
    ctx.moveTo(ripple.x, ripple.y - 6);
    ctx.lineTo(ripple.x, ripple.y + 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLabelBadge(
  ctx: CanvasRenderingContext2D,
  prop: PropDefinition,
  solved: boolean,
  alpha: number,
): void {
  const center = rectCenter(prop.rect);
  const status = solved ? 'RUNE CLAIMED' : 'UNSOLVED';
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 11px ui-sans-serif, system-ui, sans-serif';
  const titleWidth = ctx.measureText(prop.label).width;
  ctx.font = '9px ui-sans-serif, system-ui, sans-serif';
  const statusWidth = ctx.measureText(status).width;
  const boxWidth = Math.max(titleWidth, statusWidth) + 20;
  const boxHeight = 32;

  let boxX = center.x - boxWidth / 2;
  boxX = Math.max(6, Math.min(ROOM_WIDTH - boxWidth - 6, boxX));
  const above = prop.rect.y > 110;
  const boxY = above ? prop.rect.y - boxHeight - 12 : prop.rect.y + prop.rect.height + 12;

  ctx.fillStyle = 'rgba(8,8,14,0.92)';
  roundRect(ctx, { x: boxX, y: boxY, width: boxWidth, height: boxHeight }, 6);
  ctx.fill();
  ctx.strokeStyle = solved ? 'rgba(60,226,192,0.65)' : 'rgba(242,163,60,0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Pointer toward the prop.
  ctx.beginPath();
  const tipY = above ? boxY + boxHeight : boxY;
  const dir = above ? 1 : -1;
  ctx.moveTo(center.x - 5, tipY);
  ctx.lineTo(center.x + 5, tipY);
  ctx.lineTo(center.x, tipY + dir * 6);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8,8,14,0.92)';
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 11px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = '#ece7f5';
  ctx.fillText(prop.label, boxX + boxWidth / 2, boxY + 11);
  ctx.font = '9px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = solved ? SOLVED_AURA : UNSOLVED_BEACON;
  ctx.fillText(status, boxX + boxWidth / 2, boxY + 23);
  ctx.restore();
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function EscapeRoomCanvas({
  solvedProps,
  torchRadius = DEFAULT_TORCH_RADIUS,
  interactionLocked = false,
  accentColor = '#c2213a',
  debugOverlay = false,
  onInteractProp,
  onBlockedInteraction,
}: EscapeRoomCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticLayerRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<Runtime>({
    player: { ...PLAYER_SPAWN },
    target: null,
    pendingProp: null,
    ripples: [],
    walkPhase: 0,
    facing: -Math.PI / 2,
    time: 0,
    lastFrame: 0,
    stepTimer: 0,
  });

  const [hoveredProp, setHoveredProp] = useState<PropId | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Latest values the animation loop reads without re-subscribing.
  const solvedRef = useRef(solvedProps);
  const torchRef = useRef(torchRadius);
  const lockedRef = useRef(interactionLocked);
  const hoveredRef = useRef<PropId | null>(null);
  const interactRef = useRef(onInteractProp);
  const debugRef = useRef(debugOverlay);

  useEffect(() => {
    solvedRef.current = solvedProps;
    torchRef.current = torchRadius;
    lockedRef.current = interactionLocked;
    hoveredRef.current = hoveredProp;
    interactRef.current = onInteractProp;
    debugRef.current = debugOverlay;
  });

  const warningTimer = useRef<number | null>(null);

  const raiseWarning = useCallback(
    (propId: PropId, message: string) => {
      setWarning(message);
      onBlockedInteraction?.(propId, message);
      if (warningTimer.current) window.clearTimeout(warningTimer.current);
      warningTimer.current = window.setTimeout(() => setWarning(null), 4200);
    },
    [onBlockedInteraction],
  );

  useEffect(
    () => () => {
      if (warningTimer.current) window.clearTimeout(warningTimer.current);
    },
    [],
  );

  const toRoomCoords = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * ROOM_WIDTH,
      y: ((event.clientY - bounds.top) / bounds.height) * ROOM_HEIGHT,
    };
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (lockedRef.current) return;
      const { x, y } = toRoomCoords(event);
      const runtime = runtimeRef.current;
      const prop = hitTestProp(x, y);
      const solved = solvedRef.current;

      if (prop) {
        runtime.target = { ...prop.approach };

        if (prop.id === 'gargoyle') {
          const runes = RUNE_PROP_IDS.filter((id) => solved.has(id)).length;
          if (runes < RUNE_PROP_IDS.length) {
            runtime.pendingProp = null;
            runtime.ripples.push({ x, y, age: 0, blocked: true });
            raiseWarning(
              'gargoyle',
              `The Gargoyle's jaws remain sealed. Collect all 5 Elder Runes from the study first! (${runes}/5 claimed)`,
            );
            return;
          }
        } else if (solved.has(prop.id)) {
          runtime.pendingProp = null;
          runtime.ripples.push({ x, y, age: 0, blocked: true });
          raiseWarning(prop.id, `${prop.label} has already surrendered its Elder Rune.`);
          return;
        }

        runtime.pendingProp = prop.id;
        runtime.ripples.push({ x: prop.approach.x, y: prop.approach.y, age: 0, blocked: false });
        return;
      }

      const margin = WALL_THICKNESS + PLAYER_RADIUS;
      runtime.target = {
        x: Math.max(margin, Math.min(ROOM_WIDTH - margin, x)),
        y: Math.max(margin, Math.min(ROOM_HEIGHT - margin, y)),
      };
      runtime.pendingProp = null;
      runtime.ripples.push({ x: runtime.target.x, y: runtime.target.y, age: 0, blocked: false });
    },
    [raiseWarning, toRoomCoords],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = toRoomCoords(event);
      const prop = hitTestProp(x, y);
      setHoveredProp((current) => {
        const next = prop?.id ?? null;
        return current === next ? current : next;
      });
    },
    [toRoomCoords],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    staticLayerRef.current ??= buildStaticLayer();
    const staticLayer = staticLayerRef.current;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = ROOM_WIDTH * dpr;
    canvas.height = ROOM_HEIGHT * dpr;

    let frame = 0;
    const runtime = runtimeRef.current;
    runtime.lastFrame = 0;

    let fps = 0;
    let fpsAccumulator = 0;
    let fpsFrames = 0;

    const render = (timestamp: number) => {
      frame = requestAnimationFrame(render);

      const dt = runtime.lastFrame ? Math.min((timestamp - runtime.lastFrame) / 1000, 0.05) : 0;
      runtime.lastFrame = timestamp;
      runtime.time += dt;

      const solved = solvedRef.current;
      const runes = RUNE_PROP_IDS.filter((id) => solved.has(id)).length;
      const gargoyleUnlocked = runes >= RUNE_PROP_IDS.length;

      /* ---- Update ---- */
      let moving = false;
      if (runtime.target) {
        const dx = runtime.target.x - runtime.player.x;
        const dy = runtime.target.y - runtime.player.y;
        const distance = Math.hypot(dx, dy);
        const step = PLAYER_SPEED * dt;

        if (distance <= Math.max(step, 0.5)) {
          runtime.player.x = runtime.target.x;
          runtime.player.y = runtime.target.y;
          runtime.target = null;
        } else {
          runtime.player.x += (dx / distance) * step;
          runtime.player.y += (dy / distance) * step;
          runtime.facing = Math.atan2(dy, dx);
          runtime.walkPhase += dt * 9;
          moving = true;
        }
      }
      if (!moving) runtime.walkPhase += dt * 1.6;

      // Footfalls on cold flagstone, roughly in time with the stride.
      if (moving) {
        runtime.stepTimer += dt;
        if (runtime.stepTimer >= 0.34) {
          runtime.stepTimer = 0;
          soundEngine.footstep();
        }
      } else {
        runtime.stepTimer = 0.34;
      }

      if (runtime.pendingProp) {
        const prop = PROP_MAP[runtime.pendingProp];
        const reach = distanceToRect(runtime.player.x, runtime.player.y, prop.rect);
        if (reach <= INTERACT_DISTANCE) {
          const propId = runtime.pendingProp;
          runtime.pendingProp = null;
          runtime.target = null;
          interactRef.current(propId);
        }
      }

      runtime.ripples = runtime.ripples.filter((ripple) => {
        ripple.age += dt;
        return ripple.age < 0.75;
      });

      /* ---- Draw ---- */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
      ctx.drawImage(staticLayer, 0, 0);

      drawRipples(ctx, runtime.ripples);

      for (const prop of PROPS) {
        drawPropAura(ctx, prop, solved.has(prop.id), runtime.time);
      }
      for (const prop of PROPS) {
        drawProp(ctx, prop, runtime.time, runes, gargoyleUnlocked);
      }

      drawCandleFlames(ctx, runtime.time);
      drawPlayer(
        ctx,
        runtime.player.x,
        runtime.player.y,
        runtime.facing,
        runtime.walkPhase,
        moving,
      );

      /* ---- Warm torch pool: lights the stone the scholar is standing on ---- */
      const flicker = 1 + Math.sin(runtime.time * 6.1) * 0.015 + Math.sin(runtime.time * 13.7) * 0.009;
      const radius = Math.max(40, torchRef.current * flicker);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const pool = ctx.createRadialGradient(
        runtime.player.x,
        runtime.player.y,
        6,
        runtime.player.x,
        runtime.player.y,
        radius,
      );
      pool.addColorStop(0, 'rgba(255,196,124,0.42)');
      pool.addColorStop(0.35, 'rgba(236,158,84,0.24)');
      pool.addColorStop(0.72, 'rgba(176,104,56,0.09)');
      pool.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = pool;
      ctx.fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
      ctx.restore();

      /* ---- Torchlight darkness mask ---- */
      const darkness = ctx.createRadialGradient(
        runtime.player.x,
        runtime.player.y,
        20,
        runtime.player.x,
        runtime.player.y,
        radius,
      );
      darkness.addColorStop(0, 'rgba(0,0,0,0)');
      darkness.addColorStop(0.55, 'rgba(3,3,8,0.12)');
      darkness.addColorStop(0.82, 'rgba(4,4,9,0.55)');
      darkness.addColorStop(1, 'rgba(5,5,10,0.94)');
      ctx.fillStyle = darkness;
      ctx.fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

      /* ---- Beacons that pierce the dark so props stay findable ---- */
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Distant candle flames still carry across the dark room.
      CANDLES.forEach((candle, index) => {
        const sputter = 0.7 + Math.sin(runtime.time * 7.3 + index * 2.1) * 0.2;
        const halo = ctx.createRadialGradient(candle.x, candle.y - 4, 1, candle.x, candle.y - 4, 30);
        halo.addColorStop(0, `rgba(255,186,104,${0.3 * sputter})`);
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(candle.x, candle.y - 4, 30, 0, Math.PI * 2);
        ctx.fill();
      });

      for (const prop of PROPS) {
        const center = rectCenter(prop.rect);
        const isSolved = solved.has(prop.id);
        const locked = prop.id === 'gargoyle' && !gargoyleUnlocked;
        const pulse = 0.5 + Math.sin(runtime.time * 2 + center.x * 0.03) * 0.3;
        const tint = isSolved ? '60,226,192' : locked ? '226,60,85' : '242,163,60';
        const reach = Math.max(prop.rect.width, prop.rect.height) * 0.75 + 26;
        const beacon = ctx.createRadialGradient(center.x, center.y, 1, center.x, center.y, reach);
        beacon.addColorStop(0, `rgba(${tint},${(isSolved ? 0.42 : 0.3) * pulse})`);
        beacon.addColorStop(0.5, `rgba(${tint},${(isSolved ? 0.14 : 0.1) * pulse})`);
        beacon.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = beacon;
        ctx.beginPath();
        ctx.arc(center.x, center.y, reach, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      /* ---- Corner vignette ---- */
      const vignette = ctx.createRadialGradient(400, 300, 300, 400, 300, 580);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

      /* ---- Labels sit above the darkness so they stay legible ---- */
      for (const prop of PROPS) {
        const center = rectCenter(prop.rect);
        const near = Math.hypot(center.x - runtime.player.x, center.y - runtime.player.y) < 150;
        const hovered = hoveredRef.current === prop.id;
        if (!near && !hovered) continue;
        drawLabelBadge(ctx, prop, solved.has(prop.id), hovered ? 1 : 0.8);
      }

      if (debugRef.current) {
        fpsAccumulator += dt;
        fpsFrames += 1;
        if (fpsAccumulator >= 0.5) {
          fps = fpsFrames / fpsAccumulator;
          fpsAccumulator = 0;
          fpsFrames = 0;
        }
        ctx.save();
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const boxY = ROOM_HEIGHT - 62;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(30, boxY, 150, 30);
        ctx.fillStyle = fps >= 55 ? SOLVED_AURA : UNSOLVED_BEACON;
        ctx.fillText(`${fps.toFixed(0)} fps`, 36, boxY + 5);
        ctx.fillStyle = '#9d96b0';
        ctx.fillText(
          `x ${runtime.player.x.toFixed(0)}  y ${runtime.player.y.toFixed(0)}  torch ${torchRef.current.toFixed(0)}`,
          36,
          boxY + 17,
        );
        ctx.restore();
      }
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[900px]">
      <div
        className="relative overflow-hidden rounded-xl border-2 border-crypt-600/80 shadow-[0_0_80px_rgba(0,0,0,0.85)]"
        style={{ aspectRatio: '4 / 3' }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredProp(null)}
          className="block h-full w-full touch-none"
          style={{ cursor: interactionLocked ? 'default' : hoveredProp ? 'pointer' : 'crosshair' }}
        />

        {warning && (
          <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center px-4">
            <div
              className="animate-flicker max-w-md rounded-lg border bg-crypt-950/95 px-5 py-3 text-center text-sm text-[#f0e6ea] shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-sm"
              style={{ borderColor: `${accentColor}99` }}
            >
              {warning}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
