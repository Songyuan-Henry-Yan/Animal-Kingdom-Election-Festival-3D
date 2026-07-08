import type { Ballot, CandidateId } from '../types/game';

/**
 * The "What if somebody waves goodbye?" experiment (the spoiler-effect lab).
 * Returns NEW ballots with one candidate removed — rankings close up, their
 * stickers and stars disappear — while every other preference stays identical.
 * The original ballots are never touched.
 */
export function dropCandidate(ballots: Ballot[], out: CandidateId): Ballot[] {
  return ballots.map((b) => {
    const scores: Record<string, number> = {};
    for (const [cid, v] of Object.entries(b.scores)) {
      if (cid !== out) scores[cid] = v;
    }
    return {
      voterId: b.voterId,
      voterGroupId: b.voterGroupId,
      ranking: b.ranking.filter((c) => c !== out),
      approvals: b.approvals.filter((c) => c !== out),
      scores,
    };
  });
}
