/** Core shared types for Animal Kingdom Election Festival 3D. */

export type CandidateId =
  | 'bella'
  | 'dolly'
  | 'ella'
  | 'flynn'
  | 'leo'
  | 'olive'
  | 'penny'
  | 'rocky'
  | 'ruby'
  | 'tata';

export type IssueId =
  | 'snacks' | 'nature' | 'robot' | 'safety' | 'budget'
  | 'ads' | 'health' | 'traditions' | 'bridges';

export type SystemId =
  | 'plurality'
  | 'runoff'
  | 'irv'
  | 'borda'
  | 'condorcet'
  | 'approval'
  | 'score'
  | 'star'
  | 'council';

export type EventId = 'heatwave' | 'snackprices' | 'robotwrong' | 'megaphone';

export type VoiceId = CandidateId | 'parrot' | 'villager';

/** The three age modes, matching the Forest-Election-Festival design. */
export type AgeMode = 'story' | 'classroom' | 'lab';

/** The eight internal value axes candidates and voters care about (-1..+1). */
export type AxisId =
  | 'freedom'      // clear rules (-1) ↔ free choice (+1)
  | 'sharing'      // reward effort (-1) ↔ shared support (+1)
  | 'change'       // tradition (-1) ↔ change (+1)
  | 'cooperation'  // local first (-1) ↔ work together (+1)
  | 'nature'       // build more (-1) ↔ protect nature (+1)
  | 'services'     // individual choice (-1) ↔ public services (+1)
  | 'facts'        // feelings (-1) ↔ facts (+1)
  | 'compromise';  // strong leader (-1) ↔ compromise (+1)

/** How strongly voters feel: gentle breeze / windy / swirling leaves. */
export type Polarization = 'breeze' | 'windy' | 'swirl';

/** Forest Neighborhood mixer settings (Election Workshop). */
export interface NeighborhoodSettings {
  mixMode: 'surprise' | 'custom';
  /** 0 = young cubs ↔ 100 = wise elders */
  ages: number;
  /** 0 = nearly-empty pantries ↔ 100 = full pantries */
  pantry: number;
  /** 0 = long-time families ↔ 100 = new families moving in */
  roots: number;
  /** which job families are extra common */
  jobs: 'balanced' | 'builders' | 'helpers' | 'facts';
}

/** One simulated voter's full ballot. Every voting system reads from this same object. */
export interface Ballot {
  voterId: string;
  voterGroupId: string;
  /** Candidate ids from most preferred to least preferred. */
  ranking: CandidateId[];
  /** Candidate ids this voter approves of. */
  approvals: CandidateId[];
  /** 0-5 stars for each candidate on the ballot. */
  scores: Record<string, number>;
}

export interface PromiseCard {
  title: string;
  text: string;
  helps: string;
  cost: number;
  tradeoff: string;
}

export interface Candidate {
  id: CandidateId;
  name: string;
  species: string;
  emoji: string;
  slogan: string;
  personality: string;
  colorNote: string;
  color: string;
  accent: string;
  strength: string;
  tradeoff: string;
  greeting: string;
  answers: { costs: string; helps: string; worries: string };
  promises: PromiseCard[];
  /** True for the five core candidates used in the fixed Teaching Example. */
  core: boolean;
}

export interface Issue {
  id: IssueId;
  title: string;
  emoji: string;
  question: string;
  sideA: string;
  sideB: string;
  think: string;
  /** Teacher Mode: how this connects to real civic life (nonpartisan). */
  realWorld: string;
}

export interface NewsEvent {
  id: EventId;
  title: string;
  emoji: string;
  text: string;
  effectLine: string;
}

export interface RoundInfo {
  title: string;
  counts: Partial<Record<CandidateId, number>>;
  note?: string;
}

export interface SystemResult {
  systemId: SystemId;
  systemName: string;
  machineName: string;
  winnerId: CandidateId;
  rounds: RoundInfo[];
  counts: Record<string, number>;
  explanationForKids: string;
  strength: string;
  weakness: string;
  /** Set whenever the deterministic tie-break chain had to decide something. */
  tieNote?: string;
  /** Condorcet only: pairwise[a][b] = ballots preferring a over b. */
  pairwise?: Record<string, Record<string, number>>;
  /** Council only: seats per candidate group. */
  seats?: Record<string, number>;
}

export interface CandidateMetrics {
  id: CandidateId;
  firstChoice: number;
  approvals: number;
  approvalRate: number;
  avgScore: number;
  matchupWins: number;
}

export type BallotSource = 'teaching' | 'festival' | 'classroom';

export interface ElectionRun {
  source: BallotSource;
  seedLabel: string;
  voterCount: number;
  results: SystemResult[];
  metrics: CandidateMetrics[];
  differentWinners: boolean;
  eventIds: EventId[];
}

/** A fully generated festival election (one seed → always the same election). */
export interface GeneratedGame {
  seed: string;
  mode: AgeMode;
  roster: CandidateId[];
  groups: { id: string; count: number }[];
  ballots: Ballot[];
}

export type StickerId =
  | 'visitor'
  | 'issueExplorer'
  | 'candidateListener'
  | 'newsWatcher'
  | 'ballotKeeper'
  | 'ruleTester'
  | 'resultDetective'
  | 'campfireThinker';

export interface StickerDef {
  id: StickerId;
  name: string;
  emoji: string;
  how: string;
}

/** Player-chosen election parameters from the Festival Setup wizard (null = mode default). */
export interface CustomSetup {
  roster: CandidateId[] | null;
  voters: number | null;
  issues: IssueId[] | null;
}

export type PanelKind =
  | 'map'
  | 'report'
  | 'setup'
  | 'intro'
  | 'voter'
  | 'gate'
  | 'workshop'
  | 'issue'
  | 'candidate'
  | 'news'
  | 'booth'
  | 'machine'
  | 'theater'
  | 'charter'
  | 'campfire'
  | 'notebook'
  | 'settings'
  | 'villager'
  | 'online';

export interface PanelState {
  kind: PanelKind;
  id?: string;
}
