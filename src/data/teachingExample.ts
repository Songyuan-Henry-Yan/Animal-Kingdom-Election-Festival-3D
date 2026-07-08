import type { Ballot, CandidateId } from '../types/game';

/**
 * The fixed Teaching Example: exactly 100 voters in 5 blocs.
 * Expected outcomes (verified by scripts/verifyVoting.ts):
 *   Plurality → Flynn Fox, IRV → Olive Owl, Borda → Dolly Dolphin, Condorcet → Dolly Dolphin,
 *   Two-Round Runoff → Penny Panda, Approval/Score/STAR → Dolly Dolphin.
 */
interface Bloc {
  count: number;
  groupId: string;
  ranking: CandidateId[];
}

const BLOCS: Bloc[] = [
  { count: 28, groupId: 'meadow', ranking: ['flynn', 'leo', 'dolly', 'olive', 'penny'] },
  { count: 24, groupId: 'bamboo', ranking: ['penny', 'olive', 'dolly', 'leo', 'flynn'] },
  { count: 20, groupId: 'library', ranking: ['olive', 'dolly', 'penny', 'leo', 'flynn'] },
  { count: 16, groupId: 'ridge', ranking: ['leo', 'dolly', 'flynn', 'olive', 'penny'] },
  { count: 12, groupId: 'pond', ranking: ['dolly', 'olive', 'penny', 'leo', 'flynn'] },
];

/** Rank position → stars. Rank 1 = 5 stars, 2 = 4, 3 = 3, 4 = 1, 5 = 0. Ranks beyond 5th = 0. */
export const RANK_STARS = [5, 4, 3, 1, 0];

/** Ranks 1-3 count as "approved". */
export const APPROVE_TOP = 3;

export function ballotFromRanking(voterId: string, groupId: string, ranking: CandidateId[]): Ballot {
  const scores: Record<string, number> = {};
  ranking.forEach((cid, i) => {
    scores[cid] = i < RANK_STARS.length ? RANK_STARS[i] : 0;
  });
  return {
    voterId,
    voterGroupId: groupId,
    ranking: [...ranking],
    approvals: ranking.slice(0, APPROVE_TOP),
    scores,
  };
}

let cached: Ballot[] | null = null;

/** Builds (once) and returns the same 100 teaching ballots every time. */
export function getTeachingBallots(): Ballot[] {
  if (!cached) {
    const out: Ballot[] = [];
    let n = 0;
    for (const bloc of BLOCS) {
      for (let i = 0; i < bloc.count; i++) {
        n += 1;
        out.push(ballotFromRanking(`teach-${n}`, bloc.groupId, bloc.ranking));
      }
    }
    cached = out;
  }
  return cached;
}

export const TEACHING_BLOCS = BLOCS;
