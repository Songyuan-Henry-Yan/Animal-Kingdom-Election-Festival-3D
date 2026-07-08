import type { Ballot, CandidateId, RoundInfo, SystemId, SystemResult } from '../types/game';
import { CANDIDATES } from '../data/candidates';

/* ------------------------------------------------------------------ */
/* System metadata                                                     */
/* ------------------------------------------------------------------ */

export interface TeacherNote {
  formalName: string;
  realWorld: string;
  pros: string;
  cons: string;
  prompt: string;
}

export interface SystemInfo {
  id: SystemId;
  name: string;
  machineName: string;
  emoji: string;
  difficulty: 1 | 2 | 3;
  rule: string;
  strength: string;
  weakness: string;
  teacher: TeacherNote;
}

export const SYSTEM_IDS: SystemId[] = [
  'plurality', 'runoff', 'irv', 'borda', 'condorcet', 'approval', 'score', 'star', 'council',
];

export const SYSTEM_INFO: Record<SystemId, SystemInfo> = {
  plurality: {
    id: 'plurality',
    name: 'Choose-One (Plurality)',
    machineName: 'Acorn Basket Machine',
    emoji: '🧺',
    difficulty: 1,
    rule: "Count only each ballot's first choice. The candidate with the most first-choice votes wins.",
    strength: 'Super simple and fast to count.',
    weakness: 'A candidate can win even when most voters wanted somebody else.',
    teacher: {
      formalName: 'Plurality / First-Past-The-Post (FPTP)',
      realWorld: 'Used for most single-winner elections in the United States, the United Kingdom, Canada, and India.',
      pros: 'Easy to explain, cheap to count, and produces a clear single winner quickly. Voters only need to know their favorite.',
      cons: 'With many candidates, the winner may have far less than half the votes. Similar candidates can split their supporters, and voters may feel pushed to vote strategically rather than sincerely.',
      prompt: 'In our Teaching Example, 72 of 100 voters ranked the plurality winner LAST. Is "most first-choice votes" the same thing as "most support"?',
    },
  },
  runoff: {
    id: 'runoff',
    name: 'Two-Round Runoff',
    machineName: 'Two Bridge Machine',
    emoji: '🌉',
    difficulty: 2,
    rule: 'Count first choices. The top two candidates cross the bridges to a final round, where every ballot counts for whichever finalist it ranks higher.',
    strength: 'The final winner always beats one other strong candidate head-to-head.',
    weakness: 'A candidate liked by everyone — but few voters\' number one — can miss the final round.',
    teacher: {
      formalName: 'Two-Round (Runoff) System',
      realWorld: 'Used for presidential elections in France, Brazil, and many other countries; some U.S. states use runoffs for primaries.',
      pros: 'Ensures the winner has majority support in the final round. Gives voters a chance to reconsider between rounds in real elections.',
      cons: 'Real runoffs need a second election day (cost, lower turnout). A broadly acceptable compromise candidate can be eliminated before the final.',
      prompt: 'Compare the runoff winner with the plurality winner on the same ballots. What changed, and why?',
    },
  },
  irv: {
    id: 'irv',
    name: 'Ranked Choice (IRV)',
    machineName: 'Leaf Transfer Machine',
    emoji: '🍃',
    difficulty: 3,
    rule: 'Count first active choices. If nobody has more than 50%, eliminate the candidate with the fewest leaves and move those ballots to their next active choice. Repeat until someone has a majority.',
    strength: 'The winner always ends up with more than half of the active votes.',
    weakness: 'It takes several rounds, and following the moving leaves can be tricky.',
    teacher: {
      formalName: 'Instant-Runoff Voting (IRV) / Ranked-Choice Voting (RCV)',
      realWorld: 'Used in Australia\'s House of Representatives, Ireland\'s presidential elections, and several U.S. states and cities.',
      pros: 'Majority support among remaining candidates; reduces "spoiler" effects; one election day instead of two.',
      cons: 'Counting is more complex and must be centralized; a compromise candidate can still be eliminated early (as approval or Condorcet methods would reveal).',
      prompt: 'Track one bloc\'s ballots through every IRV round. Where do their leaves travel, and why?',
    },
  },
  borda: {
    id: 'borda',
    name: 'Borda Count',
    machineName: 'Ranking Ladder Machine',
    emoji: '🪜',
    difficulty: 2,
    rule: 'With n candidates, 1st place earns n−1 points, 2nd earns n−2, and so on down to 0. The highest point total wins.',
    strength: 'It listens to your whole list, not just your favorite.',
    weakness: 'A candidate who is almost nobody\'s favorite can still win on points — which can feel surprising.',
    teacher: {
      formalName: 'Borda Count (positional voting)',
      realWorld: 'Used in Slovenia\'s minority seats, Nauru (modified), university committees, and many sports "most valuable player" awards.',
      pros: 'Rewards broad, consistent support; a strong compromise candidate does well; simple arithmetic.',
      cons: 'Sensitive to strategic "burying" (ranking a rival last on purpose) and to how many candidates run.',
      prompt: 'Why can a candidate with only 12 first-place votes win the Borda count? Is broad second-place support a kind of support?',
    },
  },
  condorcet: {
    id: 'condorcet',
    name: 'Condorcet Matchups',
    machineName: 'Friendly Matchup Arena',
    emoji: '🤝',
    difficulty: 3,
    rule: 'Compare every pair of candidates head-to-head using the rankings. If one candidate beats every other candidate one-on-one, that candidate wins. If nobody does, the most matchup wins (Copeland) decides.',
    strength: 'The winner can beat every other candidate in a one-on-one match.',
    weakness: 'Sometimes there is no such champion (a cycle), so a backup rule is needed.',
    teacher: {
      formalName: 'Condorcet method with Copeland fallback',
      realWorld: 'Condorcet-consistent rules are used by some professional societies and open-source communities (e.g., the Debian project uses a Schulze variant).',
      pros: 'Honors majority preference in every pairwise contest; strong theoretical fairness properties.',
      cons: 'Cycles (A beats B beats C beats A) can occur, requiring fallback rules; counting requires the full ranking matrix.',
      prompt: 'Look at the pairwise matrix. Can you find which single number would have to change to create a cycle?',
    },
  },
  approval: {
    id: 'approval',
    name: 'Approval Voting',
    machineName: 'Smile Sticker Machine',
    emoji: '🙂',
    difficulty: 1,
    rule: 'Every voter gives a smile sticker to each candidate they think is okay. The candidate with the most stickers wins.',
    strength: 'Very simple, and it finds candidates almost everyone can accept.',
    weakness: 'It cannot tell a voter\'s absolute favorite from their "just okay" choice.',
    teacher: {
      formalName: 'Approval Voting',
      realWorld: 'Used by the U.N. informally to select the Secretary-General shortlist, by several scientific societies, and adopted for city elections in Fargo and St. Louis (USA).',
      pros: 'Ballots stay simple; no spoiler effect between similar candidates; tends to elect broadly acceptable candidates.',
      cons: 'Voters must decide where to draw their "okay" line, which is itself a strategic choice; no way to express intensity.',
      prompt: 'One candidate in the Teaching Example is approved by all 100 voters, yet wins almost no first-choice votes. What does "winning" mean here?',
    },
  },
  score: {
    id: 'score',
    name: 'Score Voting',
    machineName: 'Star Jar Machine',
    emoji: '⭐',
    difficulty: 2,
    rule: 'Every voter gives each candidate 0 to 5 stars. All the stars go into jars, and the fullest jar wins.',
    strength: 'Voters can show exactly how strongly they feel about every candidate.',
    weakness: 'A few voters giving extreme scores can move the result more than calm voters.',
    teacher: {
      formalName: 'Score / Range Voting',
      realWorld: 'Familiar from Olympic-style judging, app-store ratings, and some online communities; rarely used in government elections.',
      pros: 'Expresses intensity of preference; smooth information-rich ballots; simple addition to count.',
      cons: 'Strategic voters may exaggerate (all 5s and 0s), collapsing it toward approval voting; honest voters can be disadvantaged.',
      prompt: 'If you loved one candidate and liked another, would you honestly give the second one 4 stars — knowing it might help them beat your favorite?',
    },
  },
  star: {
    id: 'star',
    name: 'STAR Voting',
    machineName: 'Star + Bridge Machine',
    emoji: '🌟',
    difficulty: 3,
    rule: 'First add all the stars. Then the two fullest jars go to an automatic runoff: each ballot gives its vote to whichever finalist it scored higher.',
    strength: 'Combines star power with a final head-to-head check.',
    weakness: 'Two steps make it harder to explain than one simple count.',
    teacher: {
      formalName: 'STAR Voting (Score Then Automatic Runoff)',
      realWorld: 'A modern proposal developed in Oregon (USA); used by some organizations and party primaries; adopted for some local elections.',
      pros: 'The runoff step blunts score-exaggeration strategies; keeps expressive 0-5 ballots; single election day.',
      cons: 'Newer and less tested than older rules; the two-step count needs careful explanation.',
      prompt: 'Compare the Star Jar winner with the Star + Bridge winner. When would the runoff step change the outcome?',
    },
  },
  council: {
    id: 'council',
    name: 'Proportional Forest Council',
    machineName: 'Council Tree Machine',
    emoji: '🌲',
    difficulty: 3,
    rule: "Instead of one winner, the 7 council seats are shared out using the D'Hondt method: each group's votes are divided by 1, 2, 3, … and the seven biggest shares win seats.",
    strength: 'Many groups get a voice — the council looks like the voters.',
    weakness: 'Nobody wins alone, so the council must cooperate to decide anything.',
    teacher: {
      formalName: "Party-List Proportional Representation (D'Hondt method)",
      realWorld: "Proportional systems elect most European parliaments; the D'Hondt divisor method is used in Spain, Belgium, the Netherlands, and for many European Parliament seats.",
      pros: 'Seat shares closely mirror vote shares; smaller groups win representation; fewer "wasted" votes.',
      cons: "Single-leader questions still need another rule; coalitions must negotiate, which can be slow; D'Hondt slightly favors larger groups over tiny ones.",
      prompt: 'In the Teaching Example every group wins at least one seat. Is a shared council fairer than one winner? When might a single leader be better?',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

export function candidatesIn(ballots: Ballot[]): CandidateId[] {
  const set = new Set<CandidateId>();
  for (const b of ballots) for (const c of b.ranking) set.add(c);
  return [...set].sort();
}

function zeroCounts(cands: CandidateId[]): Record<string, number> {
  const o: Record<string, number> = {};
  for (const c of cands) o[c] = 0;
  return o;
}

function firstChoiceCounts(ballots: Ballot[], active: CandidateId[]): Record<string, number> {
  const counts = zeroCounts(active);
  for (const b of ballots) {
    const first = b.ranking.find((c) => active.includes(c));
    if (first) counts[first] += 1;
  }
  return counts;
}

/** Number of ballots that rank a above b. */
function prefCount(ballots: Ballot[], a: CandidateId, b: CandidateId): number {
  let n = 0;
  for (const bl of ballots) {
    const ia = bl.ranking.indexOf(a);
    const ib = bl.ranking.indexOf(b);
    if (ia !== -1 && (ib === -1 || ia < ib)) n += 1;
  }
  return n;
}

function scoreTotals(ballots: Ballot[], cands: CandidateId[]): Record<string, number> {
  const t = zeroCounts(cands);
  for (const b of ballots) for (const c of cands) t[c] += b.scores[c] ?? 0;
  return t;
}

function approvalCounts(ballots: Ballot[], cands: CandidateId[]): Record<string, number> {
  const t = zeroCounts(cands);
  for (const b of ballots) for (const c of b.approvals) if (c in t) t[c] += 1;
  return t;
}

const nameOf = (id: CandidateId) => CANDIDATES[id].name;

interface TieStats {
  scores: Record<string, number>;
  firsts: Record<string, number>;
  approvals: Record<string, number>;
}

function tieStats(ballots: Ballot[]): TieStats {
  const all = candidatesIn(ballots);
  return {
    scores: scoreTotals(ballots, all),
    firsts: firstChoiceCounts(ballots, all),
    approvals: approvalCounts(ballots, all),
  };
}

/**
 * Deterministic tie-break chain:
 * 1. higher average score  2. more first-choice votes  3. more approvals  4. alphabetical id.
 * Returns the ids sorted from strongest to weakest.
 */
export function tieBreakOrder(ids: CandidateId[], ballots: Ballot[]): CandidateId[] {
  const s = tieStats(ballots);
  return [...ids].sort((a, b) => {
    if (s.scores[b] !== s.scores[a]) return s.scores[b] - s.scores[a];
    if (s.firsts[b] !== s.firsts[a]) return s.firsts[b] - s.firsts[a];
    if (s.approvals[b] !== s.approvals[a]) return s.approvals[b] - s.approvals[a];
    return a < b ? -1 : 1;
  });
}

/** Picks one winner from tied candidates and explains which criterion decided it. */
export function tieBreakPick(tied: CandidateId[], ballots: Ballot[]): { id: CandidateId; note: string } {
  const order = tieBreakOrder(tied, ballots);
  const [a, b] = [order[0], order[1]];
  const s = tieStats(ballots);
  let why = 'alphabetical order (last resort)';
  if (s.scores[a] !== s.scores[b]) why = 'higher average stars';
  else if (s.firsts[a] !== s.firsts[b]) why = 'more first-choice votes';
  else if (s.approvals[a] !== s.approvals[b]) why = 'more smile stickers';
  return {
    id: a,
    note: `It was a tie between ${tied.map(nameOf).join(' and ')} — broken by ${why}. (The tie-break chain is: average stars → first choices → smile stickers → alphabetical.)`,
  };
}

function best(ids: CandidateId[], ballots: Ballot[]): CandidateId {
  return tieBreakOrder(ids, ballots)[0];
}

function worst(ids: CandidateId[], ballots: Ballot[]): CandidateId {
  const order = tieBreakOrder(ids, ballots);
  return order[order.length - 1];
}

function topByCount(
  counts: Record<string, number>,
  ids: CandidateId[],
  ballots: Ballot[],
): { id: CandidateId; tieNote?: string } {
  const max = Math.max(...ids.map((c) => counts[c]));
  const tied = ids.filter((c) => counts[c] === max);
  if (tied.length === 1) return { id: tied[0] };
  const pick = tieBreakPick(tied, ballots);
  return { id: pick.id, tieNote: pick.note };
}

/* ------------------------------------------------------------------ */
/* The nine counting rules — all read the SAME ballots array.          */
/* ------------------------------------------------------------------ */

function base(
  systemId: SystemId,
  winnerId: CandidateId,
  rounds: RoundInfo[],
  counts: Record<string, number>,
  explanationForKids: string,
  tieNote?: string,
): SystemResult {
  const info = SYSTEM_INFO[systemId];
  return {
    systemId,
    systemName: info.name,
    machineName: info.machineName,
    winnerId,
    rounds,
    counts,
    explanationForKids,
    strength: info.strength,
    weakness: info.weakness,
    tieNote,
  };
}

export function runPlurality(ballots: Ballot[]): SystemResult {
  const cands = candidatesIn(ballots);
  const counts = firstChoiceCounts(ballots, cands);
  const winner = topByCount(counts, cands, ballots);
  const rounds: RoundInfo[] = [{
    title: 'First-choice acorns',
    counts,
    note: 'Each voter drops one acorn in the basket of their number-one favorite.',
  }];
  return base('plurality', winner.id, rounds, counts,
    `${nameOf(winner.id)} collected the most first-choice acorns: ${counts[winner.id]} of ${ballots.length}. Only favorites were counted — the rest of each ballot stayed folded.`,
    winner.tieNote);
}

export function runRunoff(ballots: Ballot[]): SystemResult {
  const cands = candidatesIn(ballots);
  const r1 = firstChoiceCounts(ballots, cands);
  const order = [...cands].sort((a, b) => r1[b] - r1[a] || (tieBreakOrder([a, b], ballots)[0] === a ? -1 : 1));
  const [fa, fb] = [order[0], order[1]];
  let tieNote: string | undefined;
  const thirdTie = cands.filter((c) => c !== fa && r1[c] === r1[fb]);
  if (thirdTie.length > 1) {
    tieNote = tieBreakPick(thirdTie, ballots).note + ' (This decided who crossed the second bridge.)';
  }
  const r2 = zeroCounts([fa, fb]);
  for (const b of ballots) {
    const ia = b.ranking.indexOf(fa);
    const ib = b.ranking.indexOf(fb);
    if (ia === -1 && ib === -1) continue;
    if (ib === -1 || (ia !== -1 && ia < ib)) r2[fa] += 1;
    else r2[fb] += 1;
  }
  const winner = topByCount(r2, [fa, fb], ballots);
  const rounds: RoundInfo[] = [
    { title: 'Round 1 — first choices', counts: r1, note: `${nameOf(fa)} and ${nameOf(fb)} cross the two bridges to the final round.` },
    { title: 'Round 2 — the runoff', counts: r2, note: 'Every ballot now counts for whichever finalist it ranks higher.' },
  ];
  return base('runoff', winner.id, rounds, r2,
    `${nameOf(fa)} and ${nameOf(fb)} had the most first choices, so they crossed to the final. Using every ballot's preference between just those two, ${nameOf(winner.id)} won ${r2[winner.id]} to ${r2[winner.id === fa ? fb : fa]}.`,
    winner.tieNote ?? tieNote);
}

export function runIRV(ballots: Ballot[]): SystemResult {
  const cands = candidatesIn(ballots);
  let active = [...cands];
  const rounds: RoundInfo[] = [];
  let winner: CandidateId | null = null;
  let tieNote: string | undefined;
  let lastCounts: Record<string, number> = {};
  let roundNo = 1;

  while (winner === null) {
    const counts = firstChoiceCounts(ballots, active);
    lastCounts = counts;
    const totalActive = active.reduce((s, c) => s + counts[c], 0);
    const leaderPick = topByCount(counts, active, ballots);
    const leader = leaderPick.id;

    if (counts[leader] * 2 > totalActive || active.length === 1) {
      winner = leader;
      if (leaderPick.tieNote) tieNote = leaderPick.tieNote;
      rounds.push({
        title: `Round ${roundNo}`,
        counts: { ...counts },
        note: `${nameOf(leader)} now holds ${counts[leader]} of ${totalActive} leaves — more than half. Winner!`,
      });
      break;
    }

    const min = Math.min(...active.map((c) => counts[c]));
    const lowestTied = active.filter((c) => counts[c] === min);
    const eliminated = lowestTied.length === 1 ? lowestTied[0] : worst(lowestTied, ballots);
    rounds.push({
      title: `Round ${roundNo}`,
      counts: { ...counts },
      note: `Nobody has more than half. ${nameOf(eliminated)} has the fewest leaves (${counts[eliminated]}) and is eliminated — those leaves fly to each voter's next active choice.${lowestTied.length > 1 ? ' (Several candidates tied for fewest; the tie-break chain chose who leaves.)' : ''}`,
    });
    active = active.filter((c) => c !== eliminated);
    roundNo += 1;
  }

  return base('irv', winner, rounds, lastCounts,
    `After ${rounds.length} round${rounds.length === 1 ? '' : 's'} of moving leaves, ${nameOf(winner)} gathered ${lastCounts[winner]} of ${ballots.length} — more than half of the active leaves.`,
    tieNote);
}

export function runBorda(ballots: Ballot[]): SystemResult {
  const cands = candidatesIn(ballots);
  const n = cands.length;
  const points = zeroCounts(cands);
  for (const b of ballots) {
    b.ranking.forEach((c, i) => {
      points[c] += n - 1 - i;
    });
  }
  const winner = topByCount(points, cands, ballots);
  const rounds: RoundInfo[] = [{
    title: 'Ladder points',
    counts: points,
    note: `With ${n} candidates: 1st place = ${n - 1} points, 2nd = ${n - 2}, … last = 0.`,
  }];
  return base('borda', winner.id, rounds, points,
    `${nameOf(winner.id)} climbed highest with ${points[winner.id]} ladder points by sitting near the top of almost every ballot — even ballots where ${nameOf(winner.id)} was not the favorite.`,
    winner.tieNote);
}

export function runCondorcet(ballots: Ballot[]): SystemResult {
  const cands = candidatesIn(ballots);
  const pairwise: Record<string, Record<string, number>> = {};
  for (const a of cands) {
    pairwise[a] = {};
    for (const b of cands) if (a !== b) pairwise[a][b] = prefCount(ballots, a, b);
  }
  const wins = zeroCounts(cands);
  const rounds: RoundInfo[] = [];
  for (let i = 0; i < cands.length; i++) {
    for (let j = i + 1; j < cands.length; j++) {
      const a = cands[i];
      const b = cands[j];
      const av = pairwise[a][b];
      const bv = pairwise[b][a];
      let note: string;
      if (av > bv) { wins[a] += 1; note = `${nameOf(a)} wins the friendly matchup.`; }
      else if (bv > av) { wins[b] += 1; note = `${nameOf(b)} wins the friendly matchup.`; }
      else { note = 'A perfect tie — no matchup point.'; }
      rounds.push({ title: `${nameOf(a)} vs ${nameOf(b)}`, counts: { [a]: av, [b]: bv }, note });
    }
  }
  const champion = cands.find((c) => wins[c] === cands.length - 1) ?? null;
  const winner = champion ? { id: champion, tieNote: undefined as string | undefined } : topByCount(wins, cands, ballots);
  rounds.push({
    title: 'Matchup wins (Copeland tally)',
    counts: wins,
    note: champion
      ? `${nameOf(champion)} beat every other candidate one-on-one — a true matchup champion.`
      : 'No candidate beat everyone, so the most matchup wins decides (Copeland backup rule).',
  });
  const result = base('condorcet', winner.id, rounds, wins,
    champion
      ? `${nameOf(winner.id)} won a friendly one-on-one matchup against every other candidate — ${cands.length - 1} wins out of ${cands.length - 1}.`
      : `No candidate beat everyone one-on-one, so the backup rule counted matchup wins, and ${nameOf(winner.id)} had the most.`,
    winner.tieNote);
  result.pairwise = pairwise;
  return result;
}

export function runApproval(ballots: Ballot[]): SystemResult {
  const cands = candidatesIn(ballots);
  const counts = approvalCounts(ballots, cands);
  const winner = topByCount(counts, cands, ballots);
  const rounds: RoundInfo[] = [{
    title: 'Smile stickers',
    counts,
    note: 'Every voter gives a sticker to each candidate they think is okay — as many or as few as they like.',
  }];
  return base('approval', winner.id, rounds, counts,
    `${nameOf(winner.id)} collected ${counts[winner.id]} smile stickers from ${ballots.length} voters — the candidate the most animals said was okay.`,
    winner.tieNote);
}

export function runScore(ballots: Ballot[]): SystemResult {
  const cands = candidatesIn(ballots);
  const totals = scoreTotals(ballots, cands);
  const winner = topByCount(totals, cands, ballots);
  const rounds: RoundInfo[] = [{
    title: 'Stars in each jar',
    counts: totals,
    note: 'Every voter pours 0-5 stars into every jar. Totals are out of a possible ' + ballots.length * 5 + '.',
  }];
  return base('score', winner.id, rounds, totals,
    `${nameOf(winner.id)}'s jar filled highest with ${totals[winner.id]} stars (average ${(totals[winner.id] / ballots.length).toFixed(1)} per voter).`,
    winner.tieNote);
}

export function runSTAR(ballots: Ballot[]): SystemResult {
  const cands = candidatesIn(ballots);
  const totals = scoreTotals(ballots, cands);
  const order = [...cands].sort((a, b) => totals[b] - totals[a] || (tieBreakOrder([a, b], ballots)[0] === a ? -1 : 1));
  const [fa, fb] = [order[0], order[1]];
  const runoff = zeroCounts([fa, fb]);
  let equal = 0;
  for (const b of ballots) {
    const sa = b.scores[fa] ?? 0;
    const sb = b.scores[fb] ?? 0;
    if (sa > sb) runoff[fa] += 1;
    else if (sb > sa) runoff[fb] += 1;
    else equal += 1;
  }
  const winner = topByCount(runoff, [fa, fb], ballots);
  const rounds: RoundInfo[] = [
    { title: 'Score round — stars', counts: totals, note: `${nameOf(fa)} and ${nameOf(fb)} have the fullest jars and cross to the automatic runoff.` },
    { title: 'Automatic runoff', counts: runoff, note: `Each ballot votes for the finalist it starred higher.${equal ? ` (${equal} ballots starred both the same.)` : ''}` },
  ];
  return base('star', winner.id, rounds, runoff,
    `Stars picked the two finalists (${nameOf(fa)} and ${nameOf(fb)}); then the head-to-head bridge check chose ${nameOf(winner.id)}, preferred on ${runoff[winner.id]} ballots.`,
    winner.tieNote);
}

export const COUNCIL_SEATS = 7;

/** Proportional Forest Council — D'Hondt divisor method, 7 seats. */
export function runCouncil(ballots: Ballot[]): SystemResult {
  const cands = candidatesIn(ballots);
  const votes = firstChoiceCounts(ballots, cands);
  const seats = zeroCounts(cands);
  let tieNote: string | undefined;

  for (let s = 0; s < COUNCIL_SEATS; s++) {
    let bestQ = -1;
    let holders: CandidateId[] = [];
    for (const c of cands) {
      const q = votes[c] / (seats[c] + 1);
      if (q > bestQ + 1e-9) { bestQ = q; holders = [c]; }
      else if (Math.abs(q - bestQ) <= 1e-9) holders.push(c);
    }
    let take: CandidateId;
    if (holders.length === 1) {
      take = holders[0];
    } else {
      const pick = tieBreakPick(holders, ballots);
      take = pick.id;
      if (!tieNote) tieNote = pick.note + ' (This decided a council seat.)';
    }
    seats[take] += 1;
  }

  const winner = topByCount(seats, cands, ballots);
  const rounds: RoundInfo[] = [
    {
      title: 'First-choice votes',
      counts: votes,
      note: "D'Hondt method: each group's votes are divided by 1, 2, 3, … and the seven biggest shares win the seats.",
    },
    {
      title: 'Council seats',
      counts: seats,
      note: 'Every seat is a voice on the Council Tree.',
    },
  ];
  const shared = cands.filter((c) => seats[c] > 0).length;
  const result = base('council', winner.id, rounds, seats,
    `Nobody wins alone here! The ${COUNCIL_SEATS} council seats were shared among ${shared} groups by the D'Hondt divisor method. ${nameOf(winner.id)}'s group is the largest voice on the council with ${seats[winner.id]} seat${seats[winner.id] === 1 ? '' : 's'}.`,
    winner.tieNote ?? tieNote);
  result.seats = seats;
  return result;
}

/* ------------------------------------------------------------------ */

const RUNNERS: Record<SystemId, (b: Ballot[]) => SystemResult> = {
  plurality: runPlurality,
  runoff: runRunoff,
  irv: runIRV,
  borda: runBorda,
  condorcet: runCondorcet,
  approval: runApproval,
  score: runScore,
  star: runSTAR,
  council: runCouncil,
};

/** Runs each selected system on the SAME ballots array — ballots are never regenerated here. */
export function runSystems(ballots: Ballot[], systems: SystemId[]): SystemResult[] {
  return systems.map((id) => RUNNERS[id](ballots));
}
