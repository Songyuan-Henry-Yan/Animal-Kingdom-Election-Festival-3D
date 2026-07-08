export type ChallengeId = 'agreement' | 'disagreement' | 'pollster' | 'flip' | 'spoiler';

export interface ChallengeDef {
  id: ChallengeId;
  name: string;
  emoji: string;
  how: string;
  lesson: string;
}

/** Detective challenges — auto-detected puzzles that reward experimenting. */
export const CHALLENGE_ORDER: ChallengeId[] = ['agreement', 'disagreement', 'pollster', 'flip', 'spoiler'];

export const CHALLENGES: Record<ChallengeId, ChallengeDef> = {
  agreement: {
    id: 'agreement',
    name: 'The Great Agreement',
    emoji: '🤝',
    how: 'Run a count where 4 or more machines all crown the SAME winner.',
    lesson: 'When a candidate is strong in every way, most fair rules agree.',
  },
  disagreement: {
    id: 'disagreement',
    name: 'The Great Disagreement',
    emoji: '🌪️',
    how: 'Run a count where the machines crown 4 DIFFERENT winners.',
    lesson: 'Close elections are exactly where the counting rule matters most.',
  },
  pollster: {
    id: 'pollster',
    name: 'Star Pollster',
    emoji: '🔭',
    how: 'Interview all 5 families on the Green, then predict 3+ machines correctly in one count.',
    lesson: 'Listening to voters first makes your predictions much sharper.',
  },
  flip: {
    id: 'flip',
    name: 'The Forest Changed Its Mind',
    emoji: '🔄',
    how: 'Change the seed, news, or neighborhood so a machine crowns a DIFFERENT winner than your last festival count.',
    lesson: 'Elections depend on who votes and what they care about that day.',
  },
  spoiler: {
    id: 'spoiler',
    name: 'Spoiler Spotter',
    emoji: '👋',
    how: 'In the Counting Theater, use "What if somebody waves goodbye?" and catch a machine changing its winner.',
    lesson: 'Removing a candidate can flip a result — the famous spoiler effect.',
  },
};
