import type { Ballot, CandidateId, CandidateMetrics } from '../types/game';
import { candidatesIn } from './voting';

/** Friendly per-candidate numbers shown on result cards. Uses the same shared ballots. */
export function computeMetrics(ballots: Ballot[]): CandidateMetrics[] {
  const cands = candidatesIn(ballots);
  const n = ballots.length || 1;

  const first: Record<string, number> = {};
  const approvals: Record<string, number> = {};
  const stars: Record<string, number> = {};
  for (const c of cands) { first[c] = 0; approvals[c] = 0; stars[c] = 0; }

  for (const b of ballots) {
    if (b.ranking[0]) first[b.ranking[0]] += 1;
    for (const c of b.approvals) if (c in approvals) approvals[c] += 1;
    for (const c of cands) stars[c] += b.scores[c] ?? 0;
  }

  const matchupWins: Record<string, number> = {};
  for (const c of cands) matchupWins[c] = 0;
  for (let i = 0; i < cands.length; i++) {
    for (let j = i + 1; j < cands.length; j++) {
      const a = cands[i];
      const b = cands[j];
      let av = 0;
      let bv = 0;
      for (const bl of ballots) {
        const ia = bl.ranking.indexOf(a);
        const ib = bl.ranking.indexOf(b);
        if (ia !== -1 && (ib === -1 || ia < ib)) av += 1;
        else if (ib !== -1) bv += 1;
      }
      if (av > bv) matchupWins[a] += 1;
      else if (bv > av) matchupWins[b] += 1;
    }
  }

  return cands.map((id): CandidateMetrics => ({
    id: id as CandidateId,
    firstChoice: first[id],
    approvals: approvals[id],
    approvalRate: Math.round((approvals[id] / n) * 100),
    avgScore: Math.round((stars[id] / n) * 10) / 10,
    matchupWins: matchupWins[id],
  }));
}
