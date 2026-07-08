import type { AxisId, IssueId, NeighborhoodSettings } from '../types/game';
import { mulberry32, hashString } from '../lib/random';

/**
 * The ten animal household groups of the forest ("who lives in the neighborhood").
 * The Forest Neighborhood mixer in the Election Workshop reshapes their sizes —
 * and because different families need different things, that changes the election.
 */

export interface HouseholdGroup {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  needs: string;
  /** Target position on each axis (-1..+1) — what this family tends to want. */
  prefs: Partial<Record<AxisId, number>>;
  /** How much each axis matters to this family (0..1). */
  weights: Partial<Record<AxisId, number>>;
  /** Issues this family cares about extra (multiplies event salience). */
  issueBoost: Partial<Record<IssueId, number>>;
  tags: {
    age: 'young' | 'elder' | 'mixed';
    pantry: 'low' | 'high' | 'mixed';
    roots: 'old' | 'new' | 'mixed';
    job: 'builders' | 'helpers' | 'facts' | 'other';
  };
}

export const HOUSEHOLDS: HouseholdGroup[] = [
  {
    id: 'meadowMice',
    name: 'Meadow Mice',
    emoji: '🐭',
    blurb: 'Big young families in tiny burrows, always counting seeds.',
    needs: 'Full pantries, safe paths to school, and kind sharing shelves.',
    prefs: { sharing: 0.8, services: 0.7, freedom: -0.1, compromise: 0.3 },
    weights: { sharing: 0.9, services: 0.7, freedom: 0.3, compromise: 0.3 },
    issueBoost: { snacks: 1.6, budget: 1.3 },
    tags: { age: 'young', pantry: 'low', roots: 'old', job: 'helpers' },
  },
  {
    id: 'bambooGrove',
    name: 'Bamboo Grove Families',
    emoji: '🎋',
    blurb: 'Gentle caretakers who cook for anyone who knocks.',
    needs: 'Nobody left behind — warm dens, shared meals, buddy benches.',
    prefs: { sharing: 0.9, compromise: 0.5, cooperation: 0.5, services: 0.6 },
    weights: { sharing: 0.9, compromise: 0.5, cooperation: 0.5, services: 0.5 },
    issueBoost: { snacks: 1.5, health: 1.2 },
    tags: { age: 'mixed', pantry: 'low', roots: 'old', job: 'helpers' },
  },
  {
    id: 'libraryOwls',
    name: 'Library Hollow Owls',
    emoji: '🦉',
    blurb: 'Readers and checkers who ask "how do we know?"',
    needs: 'True facts in the news, tested Robot Parrots, open libraries.',
    prefs: { facts: 0.95, change: 0.2, services: 0.3, nature: 0.3 },
    weights: { facts: 1.0, change: 0.3, services: 0.4, nature: 0.3 },
    issueBoost: { robot: 1.8, ads: 1.4 },
    tags: { age: 'mixed', pantry: 'mixed', roots: 'old', job: 'facts' },
  },
  {
    id: 'ridgeLions',
    name: 'Ridge Patrol Lions',
    emoji: '🦁',
    blurb: 'Steady families who walk the sunset trails and check the storm shelters.',
    needs: 'Clear rules, safe playgrounds, and drills before the storms come.',
    prefs: { freedom: -0.8, change: -0.3, facts: 0.3, compromise: -0.4 },
    weights: { freedom: 0.9, change: 0.4, facts: 0.3, compromise: 0.4 },
    issueBoost: { safety: 1.8 },
    tags: { age: 'elder', pantry: 'high', roots: 'old', job: 'other' },
  },
  {
    id: 'pondDolphins',
    name: 'Pond Circle Swimmers',
    emoji: '🐬',
    blurb: 'Cheerful pond families who invite everyone to the round-table picnic.',
    needs: 'Clean water, friendly compromise, and projects that team ponds with meadows.',
    prefs: { cooperation: 0.8, compromise: 0.8, nature: 0.5, sharing: 0.3 },
    weights: { cooperation: 0.8, compromise: 0.8, nature: 0.5, sharing: 0.3 },
    issueBoost: { nature: 1.5, traditions: 1.1 },
    tags: { age: 'young', pantry: 'mixed', roots: 'new', job: 'helpers' },
  },
  {
    id: 'damBeavers',
    name: 'Dam Builder Beavers',
    emoji: '🦫',
    blurb: 'Busy builders with sawdust in their fur and plans under each arm.',
    needs: 'Fixed bridges, building projects, and a tool shed that never runs out.',
    prefs: { nature: -0.6, services: 0.4, change: 0.3, facts: 0.2 },
    weights: { nature: 0.8, services: 0.5, change: 0.4, facts: 0.2 },
    issueBoost: { bridges: 1.8, budget: 1.2 },
    tags: { age: 'mixed', pantry: 'mixed', roots: 'old', job: 'builders' },
  },
  {
    id: 'burrowRabbits',
    name: 'Burrow Lane Rabbits',
    emoji: '🐇',
    blurb: 'Bouncy young households where breakfast is a carrot relay.',
    needs: 'Veggie gardens, morning stretches, and playgrounds with room to hop.',
    prefs: { services: 0.6, change: 0.4, sharing: 0.4, facts: -0.2 },
    weights: { services: 0.7, change: 0.5, sharing: 0.4, facts: 0.3 },
    issueBoost: { health: 1.7, snacks: 1.2 },
    tags: { age: 'young', pantry: 'low', roots: 'new', job: 'helpers' },
  },
  {
    id: 'elderTurtles',
    name: 'Elder Shell Turtles',
    emoji: '🐢',
    blurb: 'The forest\'s memory — slow walkers with long stories and longer savings.',
    needs: 'Story Circle traditions, rainy-day acorn savings, gentle slow lanes.',
    prefs: { change: -0.85, freedom: -0.2, facts: 0.2, compromise: 0.2 },
    weights: { change: 0.9, freedom: 0.4, facts: 0.3, compromise: 0.3 },
    issueBoost: { traditions: 1.8, budget: 1.4 },
    tags: { age: 'elder', pantry: 'mixed', roots: 'old', job: 'other' },
  },
  {
    id: 'marketRaccoons',
    name: 'Night Market Raccoons',
    emoji: '🦝',
    blurb: 'Clever traders who can swap three buttons for a working lantern.',
    needs: 'Free markets, light rules, tidy bins, and careful acorn books.',
    prefs: { freedom: 0.6, sharing: -0.4, services: -0.4, nature: 0.3 },
    weights: { freedom: 0.8, sharing: 0.6, services: 0.5, nature: 0.3 },
    issueBoost: { budget: 1.5, ads: 1.2 },
    tags: { age: 'mixed', pantry: 'high', roots: 'new', job: 'builders' },
  },
  {
    id: 'grandElephants',
    name: 'Grand Meadow Elephants',
    emoji: '🐘',
    blurb: 'New families with big ears and bigger welcome picnics.',
    needs: 'Listening days, welcome for newcomers, and promises that are remembered.',
    prefs: { compromise: 0.7, sharing: 0.5, cooperation: 0.6, change: 0.2 },
    weights: { compromise: 0.8, sharing: 0.5, cooperation: 0.6, change: 0.3 },
    issueBoost: { traditions: 1.2, ads: 1.2 },
    tags: { age: 'elder', pantry: 'high', roots: 'new', job: 'helpers' },
  },
];

export const DEFAULT_NEIGHBORHOOD: NeighborhoodSettings = {
  mixMode: 'surprise',
  ages: 50,
  pantry: 50,
  roots: 50,
  jobs: 'balanced',
};

function dialMult(tag: 'young' | 'elder' | 'mixed', value: number): number {
  // value 0..100; 0 favors the first tag family, 100 favors the second.
  if (tag === 'mixed') return 1;
  const lean = (value - 50) / 50; // -1..+1 toward "elder"/"high"/"new"
  return tag === 'young' ? 1 - lean * 0.7 : 1 + lean * 0.7;
}

function pantryMult(tag: 'low' | 'high' | 'mixed', value: number): number {
  if (tag === 'mixed') return 1;
  const lean = (value - 50) / 50; // + = full pantries
  return tag === 'low' ? 1 - lean * 0.7 : 1 + lean * 0.7;
}

function rootsMult(tag: 'old' | 'new' | 'mixed', value: number): number {
  if (tag === 'mixed') return 1;
  const lean = (value - 50) / 50; // + = new families
  return tag === 'old' ? 1 - lean * 0.7 : 1 + lean * 0.7;
}

function jobsMult(tag: HouseholdGroup['tags']['job'], jobs: NeighborhoodSettings['jobs']): number {
  if (jobs === 'balanced') return 1;
  const map = { builders: 'builders', helpers: 'helpers', facts: 'facts' } as const;
  return tag === map[jobs] ? 1.65 : 1;
}

/**
 * Turns mixer settings + seed into family sizes that sum exactly to `voters`.
 * Surprise mix lets the seed size the families; custom mode uses the dials.
 */
export function computeNeighborhood(
  settings: NeighborhoodSettings,
  seed: string,
  voters: number,
): { id: string; count: number }[] {
  const rng = mulberry32(hashString(`hood-${seed}`));
  const raw = HOUSEHOLDS.map((g) => {
    let w = 1;
    if (settings.mixMode === 'surprise') {
      w = 0.55 + rng() * 1.1;
    } else {
      w *= dialMult(g.tags.age, settings.ages);
      w *= pantryMult(g.tags.pantry, settings.pantry);
      w *= rootsMult(g.tags.roots, settings.roots);
      w *= jobsMult(g.tags.job, settings.jobs);
      w *= 0.9 + rng() * 0.2; // tiny natural variation
    }
    return { id: g.id, w: Math.max(0.08, w) };
  });
  const totalW = raw.reduce((s, r) => s + r.w, 0);
  const counts = raw.map((r) => ({ id: r.id, count: Math.floor((r.w / totalW) * voters) }));
  let used = counts.reduce((s, c) => s + c.count, 0);
  // hand out remaining voters to the largest fractional shares, deterministically
  const fracs = raw
    .map((r, i) => ({ i, f: (r.w / totalW) * voters - counts[i].count }))
    .sort((a, b) => b.f - a.f || a.i - b.i);
  for (let k = 0; used < voters; k = (k + 1) % fracs.length, used++) {
    counts[fracs[k].i].count += 1;
  }
  return counts;
}
