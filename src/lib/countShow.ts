import type { Ballot, CandidateId, ElectionRun, SystemResult } from '../types/game';
import { SYSTEM_IDS } from './voting';
import { CANDIDATE_ORDER } from '../data/candidates';

/**
 * The Count Show: a short cinematic at the Counting Theater.
 *  1. The candidates step onto the theater floor.
 *  2. Ballots fly to each voter's FIRST choice — the piles show plain "most favorites".
 *  3. One machine at a time, a spotlight lands on that machine's winner.
 *  4. Finale: same ballots, how many different winners?
 * Timing lives here so the 3D scene, the on-screen captions, and the music
 * all read from one clock.
 */

export interface CountShowState {
  id: number;
  /** performance.now() when the show began. */
  startedAt: number;
  run: ElectionRun;
  ballots: Ballot[];
  /** True when re-watching an old count (nothing new is recorded at the end). */
  replay: boolean;
}

export interface ShowPlan {
  steps: SystemResult[];
  roster: CandidateId[];
  ballotsFrom: number;
  ballotsTo: number;
  firstStep: number;
  stepMs: number;
  outroAt: number;
  total: number;
  distinctWinners: number;
}

export type ShowPhase =
  | { kind: 'intro' }
  | { kind: 'ballots' }
  | { kind: 'pause' }
  | { kind: 'step'; index: number; t: number }
  | { kind: 'outro'; t: number };

/** Each machine in teaching order: simplest rule first, council last. */
export function planCountShow(run: ElectionRun, ballots: Ballot[]): ShowPlan {
  const steps = [...run.results].sort(
    (a, b) => SYSTEM_IDS.indexOf(a.systemId) - SYSTEM_IDS.indexOf(b.systemId),
  );
  const onBallots = new Set<CandidateId>();
  for (const b of ballots) for (const c of b.ranking) onBallots.add(c);
  for (const m of run.metrics) onBallots.add(m.id);
  const roster = CANDIDATE_ORDER.filter((c) => onBallots.has(c));

  const stepMs = steps.length > 5 ? 1300 : 1600;
  const ballotsFrom = 900;
  const ballotsTo = 2900;
  const firstStep = 3600;
  const outroAt = firstStep + steps.length * stepMs;
  return {
    steps,
    roster,
    ballotsFrom,
    ballotsTo,
    firstStep,
    stepMs,
    outroAt,
    total: outroAt + 1900,
    distinctWinners: new Set(steps.map((s) => s.winnerId)).size,
  };
}

export function showPhase(plan: ShowPlan, elapsed: number): ShowPhase {
  if (elapsed < plan.ballotsFrom) return { kind: 'intro' };
  if (elapsed < plan.ballotsTo) return { kind: 'ballots' };
  if (elapsed < plan.firstStep) return { kind: 'pause' };
  if (elapsed < plan.outroAt) {
    const index = Math.min(plan.steps.length - 1, Math.floor((elapsed - plan.firstStep) / plan.stepMs));
    return { kind: 'step', index, t: elapsed - plan.firstStep - index * plan.stepMs };
  }
  return { kind: 'outro', t: elapsed - plan.outroAt };
}

/** How many machines each animal has won after `stepsShown` reveals. */
export function ribbonTally(plan: ShowPlan, stepsShown: number): Partial<Record<CandidateId, number>> {
  const out: Partial<Record<CandidateId, number>> = {};
  plan.steps.slice(0, stepsShown).forEach((s) => {
    out[s.winnerId] = (out[s.winnerId] ?? 0) + 1;
  });
  return out;
}

/** A handful of paper ballots stands in for the whole stack (every k-th ballot). */
export function sampleBallots(ballots: Ballot[], max = 60): Ballot[] {
  if (ballots.length <= max) return ballots;
  const out: Ballot[] = [];
  for (let i = 0; i < max; i++) out.push(ballots[Math.floor((i * ballots.length) / max)]);
  return out;
}

/* ---------------- stage layout (world units; theater center is x 9, z 16) ---------------- */

export const THEATER_CENTER: [number, number] = [9, 16];
/** The show camera sits up in the seats and looks across the stage toward the plaza. */
export const SHOW_CAMERA_POS: [number, number, number] = [9, 6.2, 23.4];
export const SHOW_CAMERA_LOOK: [number, number, number] = [9, 1.75, 13.9];

export interface StageSlot {
  /** Local to the theater center. */
  x: number;
  z: number;
  /** Facing toward the show camera. */
  ry: number;
  /** Where this animal's pile of first-choice ballots lands (local). */
  pileX: number;
  pileZ: number;
}

/** Candidates stand in a gentle arc on the open (north) side of the theater floor. */
export function stageSlots(n: number): StageSlot[] {
  const R = 3.05;
  const PILE_R = 2.05;
  const spread = n <= 1 ? 0 : Math.min(0.44, 2.35 / (n - 1));
  const camX = SHOW_CAMERA_POS[0] - THEATER_CENTER[0];
  const camZ = SHOW_CAMERA_POS[2] - THEATER_CENTER[1];
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * spread;
    const x = Math.cos(a) * R;
    const z = Math.sin(a) * R;
    return {
      x,
      z,
      ry: Math.atan2(camX - x, camZ - z),
      pileX: Math.cos(a) * PILE_R,
      pileZ: Math.sin(a) * PILE_R,
    };
  });
}
