import type {
  AgeMode, AxisId, Ballot, CandidateId, CustomSetup, EventId, GeneratedGame, IssueId,
  NeighborhoodSettings, Polarization,
} from '../types/game';
import { CANDIDATE_ORDER } from '../data/candidates';
import { CANDIDATE_AXES, CANDIDATE_FLASH, AXIS_ORDER } from '../data/axes';
import { HOUSEHOLDS, computeNeighborhood } from '../data/neighborhood';
import { MODES } from '../data/modes';
import { hashString, mulberry32 } from './random';

/**
 * The Magic Election Seed system: one seed (plus mode, neighborhood, polarization
 * and news events) always grows the exact same election — same roster, same
 * families, same ballots — so a whole classroom can compare identical elections.
 *
 * Ballots are generated ONCE and stored in game state. Every counting rule reads
 * that same stack; switching rules never regenerates ballots.
 */

/** How much each candidate's platform speaks to each issue (0..1). */
const ALIGN: Record<CandidateId, Record<IssueId, number>> = {
  flynn: { snacks: 0.55, nature: 0.3, robot: 0.2, safety: 0.2, budget: 0.25, ads: 0.6, health: 0.4, traditions: 0.2, bridges: 0.3 },
  penny: { snacks: 0.95, nature: 0.45, robot: 0.3, safety: 0.5, budget: 0.5, ads: 0.5, health: 0.6, traditions: 0.4, bridges: 0.4 },
  olive: { snacks: 0.35, nature: 0.55, robot: 0.95, safety: 0.4, budget: 0.6, ads: 0.8, health: 0.4, traditions: 0.5, bridges: 0.4 },
  leo:   { snacks: 0.3, nature: 0.4, robot: 0.4, safety: 0.95, budget: 0.6, ads: 0.5, health: 0.4, traditions: 0.6, bridges: 0.5 },
  dolly: { snacks: 0.6, nature: 0.75, robot: 0.5, safety: 0.5, budget: 0.65, ads: 0.5, health: 0.5, traditions: 0.5, bridges: 0.5 },
  bella: { snacks: 0.35, nature: 0.5, robot: 0.25, safety: 0.6, budget: 0.55, ads: 0.3, health: 0.4, traditions: 0.3, bridges: 0.95 },
  tata:  { snacks: 0.4, nature: 0.6, robot: 0.35, safety: 0.5, budget: 0.9, ads: 0.4, health: 0.4, traditions: 0.95, bridges: 0.5 },
  ruby:  { snacks: 0.7, nature: 0.5, robot: 0.2, safety: 0.45, budget: 0.35, ads: 0.4, health: 0.95, traditions: 0.3, bridges: 0.3 },
  ella:  { snacks: 0.6, nature: 0.6, robot: 0.45, safety: 0.55, budget: 0.5, ads: 0.6, health: 0.5, traditions: 0.6, bridges: 0.4 },
  rocky: { snacks: 0.5, nature: 0.7, robot: 0.3, safety: 0.35, budget: 0.75, ads: 0.5, health: 0.4, traditions: 0.4, bridges: 0.5 },
};

/** News events multiply how much certain issues matter to everyone. */
const EVENT_MULT: Record<EventId, Partial<Record<IssueId, number>>> = {
  heatwave: { nature: 2.1 },
  snackprices: { snacks: 1.8, budget: 1.7 },
  robotwrong: { robot: 2.2 },
  megaphone: { ads: 1.7 },
};

/** Star spread per polarization: gamma <1 lifts middles, >1 crushes them. */
const POLARIZATION_GAMMA: Record<Polarization, number> = { breeze: 0.65, windy: 1.0, swirl: 1.8 };
/** Minimum stars a candidate needs to earn a smile sticker. */
const APPROVE_AT: Record<Polarization, number> = { breeze: 2, windy: 3, swirl: 4 };

export const NO_CUSTOM: CustomSetup = { roster: null, voters: null, issues: null };

export function gameKey(
  seed: string,
  mode: AgeMode,
  hood: NeighborhoodSettings,
  polarization: Polarization,
  events: EventId[],
  custom: CustomSetup = NO_CUSTOM,
): string {
  return [
    'game', seed, mode,
    hood.mixMode, hood.ages, hood.pantry, hood.roots, hood.jobs,
    polarization, ...[...events].sort(),
    custom.roster ? 'r:' + [...custom.roster].sort().join(',') : 'r:auto',
    custom.voters ? 'v:' + custom.voters : 'v:auto',
    custom.issues ? 'i:' + [...custom.issues].sort().join(',') : 'i:auto',
  ].join('|');
}

export function festivalSeedLabel(key: string): string {
  return String(hashString(key) % 1000000).padStart(6, '0');
}

export function generateGame(
  seed: string,
  mode: AgeMode,
  hood: NeighborhoodSettings,
  polarization: Polarization,
  events: EventId[],
  custom: CustomSetup = NO_CUSTOM,
): GeneratedGame {
  const key = gameKey(seed, mode, hood, polarization, events, custom);
  const rng = mulberry32(hashString(key));
  const cfg = MODES[mode];
  const voterTotal = custom.voters ?? cfg.voters;
  const issuesInPlay = custom.issues; // null = every issue may matter

  // 1. Draw the roster from the pool of ten animals. The roster depends ONLY on
  // seed + mode, so drawing news or remixing the neighborhood never changes
  // who is running — only how voters feel about them.
  const rosterRng = mulberry32(hashString(`roster|${seed}|${mode}`));
  let roster: CandidateId[];
  if (custom.roster && custom.roster.length >= 2) {
    roster = [...custom.roster];
  } else {
    const pool = [...CANDIDATE_ORDER];
    roster = [];
    while (roster.length < cfg.candidates && pool.length > 0) {
      roster.push(pool.splice(Math.floor(rosterRng() * pool.length), 1)[0]);
    }
  }
  roster.sort((a, b) => CANDIDATE_ORDER.indexOf(a) - CANDIDATE_ORDER.indexOf(b));

  // 2. Decide who lives in the forest (the Neighborhood mixer).
  const groups = computeNeighborhood(hood, seed, voterTotal);

  // 3. Issue salience after today's news.
  const mult: Record<IssueId, number> = {
    snacks: 1, nature: 1, robot: 1, safety: 1, budget: 1, ads: 1, health: 1, traditions: 1, bridges: 1,
  };
  for (const ev of events) {
    const m = EVENT_MULT[ev];
    (Object.keys(m) as IssueId[]).forEach((k) => { mult[k] *= m[k] as number; });
  }
  const megaphone = events.includes('megaphone');

  // 4. Every simulated voter fills one rich ballot from their family's values.
  const gamma = POLARIZATION_GAMMA[polarization];
  const approveAt = APPROVE_AT[polarization];
  const ballots: Ballot[] = [];
  let n = 0;

  for (const g of groups) {
    const family = HOUSEHOLDS.find((h) => h.id === g.id)!;
    for (let i = 0; i < g.count; i++) {
      n += 1;
      // personal twist on the family's values
      const prefs: Partial<Record<AxisId, number>> = {};
      const weights: Partial<Record<AxisId, number>> = {};
      for (const a of AXIS_ORDER) {
        const p = family.prefs[a];
        const w = family.weights[a];
        if (p !== undefined) prefs[a] = Math.max(-1, Math.min(1, p + (rng() - 0.5) * 0.6));
        if (w !== undefined) weights[a] = w * (0.7 + rng() * 0.6);
      }

      const utilities = roster.map((cid) => {
        const cand = CANDIDATE_AXES[cid];
        let wSum = 0;
        let axisScore = 0;
        for (const a of AXIS_ORDER) {
          const w = weights[a];
          const p = prefs[a];
          if (w === undefined || p === undefined) continue;
          wSum += w;
          axisScore += w * (1 - Math.abs(p - cand[a]) / 2);
        }
        let u = wSum > 0 ? axisScore / wSum : 0.5;
        // issues this family watches, made louder by today's news
        (Object.keys(family.issueBoost) as IssueId[]).forEach((iss) => {
          if (issuesInPlay && !issuesInPlay.includes(iss)) return; // not in play today
          u += (family.issueBoost[iss] ?? 0) * mult[iss] * ALIGN[cid][iss] * 0.055;
        });
        // megaphone ads sway some voters toward flashy slogans
        if (megaphone) u += CANDIDATE_FLASH[cid] * 0.5 * rng();
        // compromise-minded candidates earn broad-but-shallow support
        u += Math.max(0, CANDIDATE_AXES[cid].compromise) * 0.11;
        // personal taste
        u += (rng() - 0.5) * 0.22;
        return { cid, u };
      });

      utilities.sort((a, b) => b.u - a.u || (a.cid < b.cid ? -1 : 1));
      const ranking = utilities.map((x) => x.cid);
      const min = utilities[utilities.length - 1].u;
      const max = utilities[0].u;
      const span = Math.max(1e-6, max - min);
      const scores: Record<string, number> = {};
      const approvals: CandidateId[] = [];
      for (const { cid, u } of utilities) {
        const v = Math.pow((u - min) / span, gamma);
        const stars = Math.round(v * 5);
        scores[cid] = stars;
        if (stars >= approveAt) approvals.push(cid);
      }
      if (approvals.length === 0) approvals.push(ranking[0]);

      ballots.push({
        voterId: `f-${n}`,
        voterGroupId: g.id,
        ranking,
        approvals,
        scores,
      });
    }
  }

  return { seed, mode, roster, groups, ballots };
}
