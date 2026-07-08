/**
 * Verifies the Teaching Example against the expected outcomes, on the SAME ballots,
 * for all nine voting systems — plus determinism checks for seeded festival elections.
 *
 * Run:  npx tsx scripts/verifyVoting.ts   (or: npm run verify:voting)
 */
import { getTeachingBallots } from '../src/data/teachingExample';
import { generateGame } from '../src/lib/generateGame';
import { DEFAULT_NEIGHBORHOOD } from '../src/data/neighborhood';
import { MODES, MODE_ORDER } from '../src/data/modes';
import { computeMetrics } from '../src/lib/metrics';
import { dropCandidate } from '../src/lib/whatIf';
import {
  runPlurality, runRunoff, runIRV, runBorda, runCondorcet,
  runApproval, runScore, runSTAR, runCouncil, runSystems, SYSTEM_IDS,
} from '../src/lib/voting';
import type { Ballot, EventId, NeighborhoodSettings } from '../src/types/game';

let failures = 0;

function check(label: string, actual: unknown, expected: unknown): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  PASS  ${label} = ${a}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${label}: expected ${e}, got ${a}`);
  }
}

function deepFreeze(ballots: Ballot[]): void {
  for (const b of ballots) {
    Object.freeze(b.ranking);
    Object.freeze(b.approvals);
    Object.freeze(b.scores);
    Object.freeze(b);
  }
  Object.freeze(ballots);
}

console.log('— Teaching Example (100 fixed voters, 5 candidates) —');
const ballots = getTeachingBallots();
deepFreeze(ballots); // any mutation by a counting rule would throw in strict mode
check('total ballots', ballots.length, 100);

const plurality = runPlurality(ballots);
check('Plurality winner', plurality.winnerId, 'flynn');
check('Plurality counts', plurality.counts, { dolly: 12, flynn: 28, leo: 16, olive: 20, penny: 24 });

const runoff = runRunoff(ballots);
check('Runoff winner', runoff.winnerId, 'penny');
check('Runoff final', runoff.counts, { flynn: 44, penny: 56 });

const irv = runIRV(ballots);
check('IRV winner', irv.winnerId, 'olive');
check('IRV rounds', irv.rounds.length, 4);
check('IRV final olive leaves', irv.counts['olive'], 56);

const borda = runBorda(ballots);
check('Borda winner', borda.winnerId, 'dolly');
check('Borda points', borda.counts, { dolly: 260, flynn: 144, leo: 204, olive: 232, penny: 160 });

const condorcet = runCondorcet(ballots);
check('Condorcet winner', condorcet.winnerId, 'dolly');
check('Condorcet dolly matchup wins', condorcet.counts['dolly'], 4);
check('Condorcet pairwise dolly>flynn', condorcet.pairwise?.['dolly']?.['flynn'], 72);

const approval = runApproval(ballots);
check('Approval winner', approval.winnerId, 'dolly');
check('Approval dolly stickers', approval.counts['dolly'], 100);

const score = runScore(ballots);
check('Score winner', score.winnerId, 'dolly');
check('Score dolly stars', score.counts['dolly'], 360);

const star = runSTAR(ballots);
check('STAR winner', star.winnerId, 'dolly');
check('STAR runoff', star.counts, { dolly: 56, olive: 44 });

const council = runCouncil(ballots);
check("Council seats (D'Hondt, 7)", council.seats, { dolly: 1, flynn: 2, leo: 1, olive: 1, penny: 2 });
check('Council largest voice (Flynn/Penny 2-2 tie → avg stars)', council.winnerId, 'penny');
check('Council tie was explained to players', typeof council.tieNote, 'string');

const metrics = computeMetrics(ballots);
const dollyM = metrics.find((m) => m.id === 'dolly')!;
check('Metrics: dolly avg stars', dollyM.avgScore, 3.6);
check('Metrics: dolly approval rate', dollyM.approvalRate, 100);
check('Metrics: dolly matchup wins', dollyM.matchupWins, 4);

console.log('\n— Same-ballots invariant —');
const again = getTeachingBallots();
check('getTeachingBallots returns the SAME array (no regeneration)', again === ballots, true);
const all = runSystems(ballots, SYSTEM_IDS);
check('all 9 systems ran on frozen ballots without mutating them', all.length, 9);

console.log('\n— Seeded festival elections (Magic Election Seed) —');
const hood: NeighborhoodSettings = DEFAULT_NEIGHBORHOOD;
const combos: EventId[][] = [[], ['heatwave', 'snackprices'], ['robotwrong', 'megaphone']];

for (const mode of MODE_ORDER) {
  const cfg = MODES[mode];
  for (const events of combos) {
    const tag = `${mode}/${events.length ? events.join('+') : 'no-news'}`;
    const a = generateGame('FOREST-2026', mode, hood, 'windy', events);
    const b = generateGame('FOREST-2026', mode, hood, 'windy', events);
    check(`[${tag}] voters`, a.ballots.length, cfg.voters);
    check(`[${tag}] roster size`, a.roster.length, cfg.candidates);
    const okShape = a.ballots.every((x) =>
      x.ranking.length === cfg.candidates &&
      new Set(x.ranking).size === cfg.candidates &&
      x.approvals.length >= 1 &&
      Object.keys(x.scores).length === cfg.candidates &&
      x.scores[x.ranking[0]] === 5);
    check(`[${tag}] valid rich ballots (top choice always 5 stars)`, okShape, true);
    check(`[${tag}] deterministic (same seed → same election)`, JSON.stringify(a) === JSON.stringify(b), true);
    const rs = runSystems(a.ballots, cfg.systems);
    check(`[${tag}] all mode rules produced winners`, rs.every((r) => a.roster.includes(r.winnerId)), true);
  }
  const noNews = generateGame('FOREST-2026', mode, hood, 'windy', []);
  const withNews = generateGame('FOREST-2026', mode, hood, 'windy', ['heatwave', 'snackprices']);
  check(`[${mode}] news never changes WHO runs (roster stable)`, noNews.roster, withNews.roster);
}

const surprise = generateGame('FOREST-2026', 'classroom', hood, 'windy', []);
const custom = generateGame('FOREST-2026', 'classroom', { mixMode: 'custom', ages: 90, pantry: 10, roots: 20, jobs: 'helpers' }, 'windy', []);
check('neighborhood mixer changes family sizes', JSON.stringify(surprise.groups) !== JSON.stringify(custom.groups), true);
check('custom neighborhood still sums to 100 voters', custom.groups.reduce((s, g) => s + g.count, 0), 100);

const calm = generateGame('FOREST-2026', 'classroom', hood, 'breeze', []);
const stormy = generateGame('FOREST-2026', 'classroom', hood, 'swirl', []);
const avgApprovals = (g: typeof calm) => g.ballots.reduce((s, b) => s + b.approvals.length, 0) / g.ballots.length;
check('gentle breeze voters approve more candidates than swirling-leaves voters', avgApprovals(calm) > avgApprovals(stormy), true);

console.log('\n— What-if drop-out lab (spoiler effect on the SAME ballots) —');
const noFlynn = dropCandidate(ballots, 'flynn');
check('drop-out keeps 100 ballots', noFlynn.length, 100);
check('drop-out shrinks rankings to 4', noFlynn.every((b) => b.ranking.length === 4 && !b.ranking.includes('flynn')), true);
check('original ballots untouched', ballots.every((b) => b.ranking.length === 5), true);
const pluralityNoFlynn = runPlurality(noFlynn);
check('spoiler effect: plurality winner changes when Flynn leaves', pluralityNoFlynn.winnerId, 'leo');
check('Leo inherits Flynn fans (28+16)', pluralityNoFlynn.counts['leo'], 44);

console.log(failures === 0 ? '\nALL CHECKS PASSED ✔' : `\n${failures} CHECK(S) FAILED ✘`);
process.exit(failures === 0 ? 0 : 1);
