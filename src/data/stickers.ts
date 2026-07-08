import type { StickerDef, StickerId } from '../types/game';

export const STICKER_ORDER: StickerId[] = [
  'visitor', 'issueExplorer', 'candidateListener', 'newsWatcher',
  'ballotKeeper', 'ruleTester', 'resultDetective', 'campfireThinker',
];

/** Forest Passport stickers — motivational only. They NEVER affect election results. */
export const STICKERS: Record<StickerId, StickerDef> = {
  visitor: { id: 'visitor', name: 'Festival Visitor', emoji: '🎪', how: 'Walk through the Forest Festival Gate.' },
  issueExplorer: { id: 'issueExplorer', name: 'Issue Explorer', emoji: '🍃', how: 'Read all 5 issue leaves on the Issue Trail.' },
  candidateListener: { id: 'candidateListener', name: 'Candidate Listener', emoji: '👂', how: 'Meet at least 5 candidates at the Rally Stage.' },
  newsWatcher: { id: 'newsWatcher', name: 'News Watcher', emoji: '📰', how: "Draw Today's Forest News at the Parrot News Stand." },
  ballotKeeper: { id: 'ballotKeeper', name: 'Secret Ballot Keeper', emoji: '🗳️', how: 'Try all three practice ballots in the Secret Ballot Booth.' },
  ruleTester: { id: 'ruleTester', name: 'Rule Tester', emoji: '🔧', how: 'Inspect at least 3 counting machines in the Arcade.' },
  resultDetective: { id: 'resultDetective', name: 'Result Detective', emoji: '🔎', how: 'Run the ballots, then replay a count round-by-round.' },
  campfireThinker: { id: 'campfireThinker', name: 'Campfire Thinker', emoji: '🔥', how: 'Flip at least 3 reflection cards at the Campfire Circle.' },
};
