import { create } from 'zustand';
import type {
  AgeMode, Ballot, BallotSource, CandidateId, CustomSetup, ElectionRun, EventId, GeneratedGame,
  IssueId, NeighborhoodSettings, PanelState, Polarization, StickerId, SystemId,
} from '../types/game';
import { EVENT_ORDER } from '../data/events';
import { ISSUE_ORDER } from '../data/issues';
import { STICKERS } from '../data/stickers';
import { MODES } from '../data/modes';
import { DEFAULT_NEIGHBORHOOD } from '../data/neighborhood';
import { getTeachingBallots, ballotFromRanking } from '../data/teachingExample';
import { generateGame, gameKey, festivalSeedLabel, NO_CUSTOM } from '../lib/generateGame';
import { computeMetrics } from '../lib/metrics';
import { runSystems, SYSTEM_IDS } from '../lib/voting';
import { audio } from '../lib/audio';
import { loadJSON, saveJSON } from '../lib/storage';
import { pickDistinct, mulberry32, hashString } from '../lib/random';
import { CHALLENGES, type ChallengeId } from '../data/challenges';
import { playerPos } from './registry';
import { cameraFocus } from './registry';
import type { SharedSetup } from '../lib/shareCode';
import { encodeShareCode, decodeShareCode } from '../lib/shareCode';
import { net } from '../lib/net';
import type { NetPeer, NetRunMsg, NetSpecies } from '../lib/net';

export interface QuestStep {
  id: string;
  label: string;
}

export const QUEST_STEPS: QuestStep[] = [
  { id: 'gate', label: 'Enter the Forest Festival Gate' },
  { id: 'workshop', label: 'Visit the Election Workshop' },
  { id: 'issues', label: 'Read 3 leaves on the Issue Trail' },
  { id: 'rally', label: 'Meet 3 candidates at the Rally Stage' },
  { id: 'news', label: "Draw Today's Forest News at the Parrot Stand" },
  { id: 'booth', label: 'Practice voting in the Secret Ballot Booth' },
  { id: 'arcade', label: 'Pick counting rules in the Machine Arcade' },
  { id: 'theater', label: 'Run the Same Ballots in the Counting Theater' },
  { id: 'campfire', label: 'Reflect at the Campfire Circle' },
];

const MAX_CLASSROOM = 500;
const PREFS_KEY = 'akef3d-prefs-v3';

interface Prefs {
  mode: AgeMode;
  seedInput: string;
  polarization: Polarization;
  neighborhood: NeighborhoodSettings;
  stickers: StickerId[];
  custom: CustomSetup;
  challenges: ChallengeId[];
  hideLeanings: boolean;
}

const savedPrefs = loadJSON<Prefs>(PREFS_KEY, {
  mode: 'classroom',
  seedInput: 'FOREST-2026',
  polarization: 'windy',
  neighborhood: DEFAULT_NEIGHBORHOOD,
  stickers: [],
  custom: NO_CUSTOM,
  challenges: [],
  hideLeanings: false,
});

interface PracticeState {
  ranking: CandidateId[];
  approvals: CandidateId[];
  scores: Record<string, number>;
  modesTried: string[];
}

interface GameState {
  panel: PanelState | null;
  nearby: { id: string; label: string } | null;
  caption: string | null;
  reducedMotion: boolean;
  teacherMode: boolean;

  mode: AgeMode;
  seedInput: string;
  polarization: Polarization;
  neighborhood: NeighborhoodSettings;
  custom: CustomSetup;
  game: GeneratedGame;
  votersMet: string[];
  challenges: ChallengeId[];
  hideLeanings: boolean;
  reportShown: boolean;
  prevFestivalWinners: Record<string, CandidateId> | null;

  visited: Record<string, boolean>;
  issuesRead: IssueId[];
  candidatesMet: CandidateId[];
  machinesInspected: SystemId[];
  drawnEvents: EventId[];
  reflectionsFlipped: number[];
  stickers: StickerId[];
  stickerToast: { id: StickerId; at: number } | null;

  selectedSystems: SystemId[];
  ballotSource: BallotSource;
  classroomBallots: Ballot[];
  predictions: Partial<Record<SystemId, CandidateId>>;
  lastRun: ElectionRun | null;
  lastRunBallots: Ballot[] | null;
  running: boolean;
  theaterPulse: number;

  // 🌐 online Festival Room (multiplayer)
  netStatus: 'off' | 'connecting' | 'online';
  netRole: 'host' | 'guest' | null;
  netCode: string | null;
  netPeers: NetPeer[];
  netBallotCount: number;
  netError: string | null;

  // actions
  openPanelFor: (kind: PanelState['kind'], id?: string, focus?: [number, number, number]) => void;
  closePanel: () => void;
  toggleNotebook: () => void;
  openSettings: () => void;
  setNearby: (n: { id: string; label: string } | null) => void;
  setCaption: (t: string | null) => void;
  setReducedMotion: (v: boolean) => void;
  setTeacherMode: (v: boolean) => void;

  setMode: (m: AgeMode) => void;
  setSeed: (s: string) => void;
  randomizeSeed: () => void;
  setPolarization: (p: Polarization) => void;
  applyNeighborhood: (n: NeighborhoodSettings) => void;
  setCustom: (c: Partial<CustomSetup>) => void;
  resetCustom: () => void;
  applySharedSetup: (shared: Omit<SharedSetup, 'v'>) => void;
  teleportTo: (x: number, z: number, label: string) => void;
  markChallenge: (id: ChallengeId) => void;
  setHideLeanings: (v: boolean) => void;
  loadTeachingExample: () => void;

  markIssueRead: (id: IssueId) => void;
  markCandidateMet: (id: CandidateId) => void;
  markMachineInspected: (id: SystemId) => void;
  markReflectionFlipped: (idx: number) => void;
  markPracticeMode: (mode: string) => void;
  drawNews: () => void;
  toggleSystem: (id: SystemId) => void;
  setBallotSource: (s: BallotSource) => void;
  runElection: () => void;

  sealClassroomBallot: (ranking: CandidateId[], approvals: CandidateId[], scores: Record<string, number>) => void;
  addClassroomBots: (k: number) => void;
  clearClassroom: () => void;
  setPrediction: (sys: SystemId, cid: CandidateId | null) => void;

  hostRoom: (url: string, name: string, species: NetSpecies) => void;
  joinRoom: (url: string, code: string, name: string, species: NetSpecies) => void;
  leaveRoom: () => void;

  practice: PracticeState;
  practiceRank: (id: CandidateId) => void;
  practiceClearRanking: () => void;
  practiceToggleApproval: (id: CandidateId) => void;
  practiceScore: (id: CandidateId, score: number) => void;
}

let captionTimer: number | undefined;

/** True while a room broadcast is being applied — bypasses the guest gates below. */
let netDriven = false;

/** Students in an online room follow the teacher's setup instead of changing their own. */
function guestBlocked(get: () => GameState): boolean {
  const s = get();
  if (netDriven || s.netRole !== 'guest') return false;
  s.setCaption('🌐 In an online room, your teacher steers the festival setup for everyone.');
  return true;
}

function persist(s: GameState): void {
  saveJSON(PREFS_KEY, {
    mode: s.mode,
    seedInput: s.seedInput,
    polarization: s.polarization,
    neighborhood: s.neighborhood,
    stickers: s.stickers,
    custom: s.custom,
    challenges: s.challenges,
    hideLeanings: s.hideLeanings,
  } satisfies Prefs);
  // Hosting an online room? Quietly re-broadcast the setup as a share code.
  net.syncSetupSoon(() => encodeShareCode({
    seed: s.seedInput, mode: s.mode, polarization: s.polarization, hood: s.neighborhood, custom: s.custom,
  }));
}

function award(get: () => GameState, set: (p: Partial<GameState>) => void, id: StickerId): void {
  const s = get();
  if (s.stickers.includes(id)) return;
  audio.collectSticker();
  const stickers = [...s.stickers, id];
  set({
    stickers,
    stickerToast: { id, at: Date.now() },
    caption: `🎉 Passport sticker earned: ${STICKERS[id].emoji} ${STICKERS[id].name}!`,
  });
  persist(get());
}

function regen(s: Pick<GameState, 'seedInput' | 'mode' | 'neighborhood' | 'polarization' | 'drawnEvents' | 'custom'>): GeneratedGame {
  return generateGame(s.seedInput, s.mode, s.neighborhood, s.polarization, s.drawnEvents, s.custom);
}

const initialGame = regen({
  seedInput: savedPrefs.seedInput,
  mode: savedPrefs.mode,
  neighborhood: savedPrefs.neighborhood,
  polarization: savedPrefs.polarization,
  drawnEvents: [],
  custom: savedPrefs.custom,
});

export const useGame = create<GameState>((set, get) => ({
  panel: null,
  nearby: null,
  caption: null,
  reducedMotion: false,
  teacherMode: loadJSON<{ on: boolean }>('akef3d-teacher-v1', { on: false }).on,

  mode: savedPrefs.mode,
  seedInput: savedPrefs.seedInput,
  polarization: savedPrefs.polarization,
  neighborhood: savedPrefs.neighborhood,
  custom: savedPrefs.custom,
  game: initialGame,
  votersMet: [],
  challenges: savedPrefs.challenges,
  hideLeanings: savedPrefs.hideLeanings,
  reportShown: false,
  prevFestivalWinners: null,

  visited: {},
  issuesRead: [],
  candidatesMet: [],
  machinesInspected: [],
  drawnEvents: [],
  reflectionsFlipped: [],
  stickers: savedPrefs.stickers,
  stickerToast: null,

  selectedSystems: MODES[savedPrefs.mode].defaultSelected,
  ballotSource: 'teaching',
  classroomBallots: [],
  predictions: {},
  lastRun: null,
  lastRunBallots: null,
  running: false,
  theaterPulse: 0,

  netStatus: 'off',
  netRole: null,
  netCode: null,
  netPeers: [],
  netBallotCount: 0,
  netError: null,

  openPanelFor: (kind, id, focus) => {
    const s = get();
    const visited = { ...s.visited, [kind]: true };
    set({ panel: { kind, id }, visited });

    if (focus) {
      cameraFocus.active = true;
      cameraFocus.point.set(focus[0], focus[1], focus[2]);
    }

    switch (kind) {
      case 'booth': audio.curtain(); break;
      case 'charter': audio.scrollOpen(); break;
      default: audio.openPanel();
    }

    if (kind === 'gate') award(get, set, 'visitor');
    if (kind === 'voter' && id && !s.votersMet.includes(id)) set({ votersMet: [...s.votersMet, id] });
    if (kind === 'issue' && id) get().markIssueRead(id as IssueId);
    if (kind === 'candidate' && id) get().markCandidateMet(id as CandidateId);
    if (kind === 'machine' && id) get().markMachineInspected(id as SystemId);
    if (kind === 'theater') audio.duckMusic(0.35);
  },

  closePanel: () => {
    const s = get();
    if (!s.panel) return;
    cameraFocus.active = false;
    audio.closePanel();
    audio.duckMusic(1);
    // The festival wraps up: leaving the campfire with everything done opens the Report Card.
    if (s.panel.kind === 'campfire' && s.lastRun && !s.reportShown && currentQuest(s) === null) {
      set({ panel: { kind: 'report' }, reportShown: true });
      audio.resultRibbon();
      return;
    }
    set({ panel: null });
  },

  toggleNotebook: () => {
    const s = get();
    if (s.panel?.kind === 'notebook') {
      get().closePanel();
    } else {
      cameraFocus.active = false;
      audio.openPanel();
      set({ panel: { kind: 'notebook' } });
    }
  },

  openSettings: () => {
    audio.openPanel();
    set({ panel: { kind: 'settings' } });
  },

  setNearby: (n) => {
    const prev = get().nearby;
    if (prev?.id === n?.id) return;
    if (n && !prev) audio.hoverTick();
    set({ nearby: n });
  },

  setCaption: (t) => {
    window.clearTimeout(captionTimer);
    set({ caption: t });
    if (t) {
      captionTimer = window.setTimeout(() => set({ caption: null }), 3200);
    }
  },

  setReducedMotion: (v) => set({ reducedMotion: v }),

  setTeacherMode: (v) => {
    saveJSON('akef3d-teacher-v1', { on: v });
    set({ teacherMode: v });
  },

  /* ------------- election setup (mode / seed / neighborhood) ------------- */

  setMode: (m) => {
    if (guestBlocked(get)) return;
    const s = get();
    if (s.mode === m) return;
    audio.click();
    const next = { ...s, mode: m };
    set({
      mode: m,
      selectedSystems: MODES[m].defaultSelected,
      game: regen(next),
      classroomBallots: [],
      predictions: {},
      ballotSource: s.ballotSource === 'classroom' ? 'festival' : s.ballotSource,
      caption: `${MODES[m].emoji} ${MODES[m].name}: ${MODES[m].blurb}`,
    });
    persist(get());
  },

  setSeed: (seed) => {
    if (guestBlocked(get)) return;
    const s = get();
    const seedInput = seed.trim() || 'FOREST-2026';
    set({ seedInput, game: regen({ ...s, seedInput }), classroomBallots: [], predictions: {} });
    get().setCaption(`🌱 Magic Election Seed set to ${seedInput} — the forest regrew today's election.`);
    persist(get());
  },

  randomizeSeed: () => {
    const words = ['ACORN', 'FERN', 'MAPLE', 'BROOK', 'MOSS', 'CLOVER', 'PINE', 'BERRY', 'WILLOW', 'DEW'];
    const rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 0xffff)) >>> 0);
    const seed = `${words[Math.floor(rng() * words.length)]}-${100 + Math.floor(rng() * 900)}`;
    get().setSeed(seed);
  },

  setPolarization: (p) => {
    if (guestBlocked(get)) return;
    const s = get();
    audio.click();
    set({ polarization: p, game: regen({ ...s, polarization: p }), predictions: {} });
    persist(get());
  },

  applyNeighborhood: (n) => {
    if (guestBlocked(get)) return;
    const s = get();
    set({ neighborhood: n, game: regen({ ...s, neighborhood: n }), classroomBallots: [], predictions: {} });
    get().setCaption('🏘️ The forest neighborhood changed — today\'s ballots were re-simulated once.');
    persist(get());
  },

  setCustom: (c) => {
    if (guestBlocked(get)) return;
    const s = get();
    const custom: CustomSetup = { ...s.custom, ...c };
    set({ custom, game: regen({ ...s, custom }), classroomBallots: [], predictions: {} });
    get().setCaption('🎨 Festival setup applied — today\'s election regrew with your choices.');
    persist(get());
  },

  resetCustom: () => {
    if (guestBlocked(get)) return;
    const s = get();
    set({ custom: { roster: null, voters: null, issues: null }, game: regen({ ...s, custom: { roster: null, voters: null, issues: null } }), classroomBallots: [], predictions: {} });
    get().setCaption('↩️ Back to the age-mode defaults.');
    persist(get());
  },

  applySharedSetup: (shared) => {
    if (guestBlocked(get)) return;
    const s = get();
    const next = {
      seedInput: shared.seed,
      mode: shared.mode,
      polarization: shared.polarization,
      neighborhood: shared.hood,
      custom: shared.custom,
      drawnEvents: s.drawnEvents,
    };
    set({
      ...next,
      selectedSystems: MODES[shared.mode].defaultSelected,
      game: regen(next),
      classroomBallots: [],
      predictions: {},
    });
    get().setCaption('🤝 Share code planted! You are now playing the exact same election as your friend.');
    persist(get());
  },

  teleportTo: (x, z, label) => {
    playerPos.set(x, 0, z);
    audio.starSparkle();
    set({ panel: null });
    get().setCaption(`✨ A friendly firefly carries you to ${label}!`);
  },

  markChallenge: (id) => {
    const s = get();
    if (s.challenges.includes(id)) return;
    audio.collectSticker();
    set({
      challenges: [...s.challenges, id],
      caption: `🏆 Challenge complete: ${CHALLENGES[id].emoji} ${CHALLENGES[id].name}!`,
    });
    persist(get());
  },

  setHideLeanings: (v) => {
    set({ hideLeanings: v });
    persist(get());
  },

  loadTeachingExample: () => {
    audio.machineStart();
    set({
      ballotSource: 'teaching',
      selectedSystems: [...SYSTEM_IDS],
      predictions: {},
    });
    get().setCaption('📚 Teaching Example loaded: 100 fixed voters, all 9 machines switched on. Head to the Counting Theater!');
  },

  /* ------------------------- progress marking ------------------------- */

  markIssueRead: (id) => {
    const s = get();
    if (s.issuesRead.includes(id)) return;
    audio.leafFlip();
    const issuesRead = [...s.issuesRead, id];
    set({ issuesRead });
    const needed = issuesInPlay(s);
    if (needed.every((i) => issuesRead.includes(i))) award(get, set, 'issueExplorer');
  },

  markCandidateMet: (id) => {
    const s = get();
    if (s.candidatesMet.includes(id)) return;
    const candidatesMet = [...s.candidatesMet, id];
    set({ candidatesMet });
    const need = Math.min(5, s.game.roster.length);
    if (candidatesMet.length >= need) award(get, set, 'candidateListener');
  },

  markMachineInspected: (id) => {
    const s = get();
    if (s.machinesInspected.includes(id)) return;
    const machinesInspected = [...s.machinesInspected, id];
    set({ machinesInspected });
    if (machinesInspected.length >= 3) award(get, set, 'ruleTester');
  },

  markReflectionFlipped: (idx) => {
    const s = get();
    if (s.reflectionsFlipped.includes(idx)) return;
    const reflectionsFlipped = [...s.reflectionsFlipped, idx];
    set({ reflectionsFlipped });
    if (reflectionsFlipped.length >= 3) award(get, set, 'campfireThinker');
  },

  markPracticeMode: (mode) => {
    const s = get();
    if (s.practice.modesTried.includes(mode)) return;
    const practice = { ...s.practice, modesTried: [...s.practice.modesTried, mode] };
    set({ practice });
    if (practice.modesTried.length >= 3) award(get, set, 'ballotKeeper');
  },

  drawNews: () => {
    const s = get();
    if (s.netRole === 'guest') {
      get().setCaption('🌐 Pip waits for your teacher to draw the news for the whole room!');
      return;
    }
    const rng = mulberry32(Date.now() >>> 0);
    const drawnEvents = pickDistinct(rng, EVENT_ORDER, 2);
    if (s.netRole === 'host') {
      net.sendNews(drawnEvents); // comes back as a room broadcast, applied for everyone at once
      return;
    }
    audio.parrotJingle();
    // A fresh news day re-simulates today's festival ballots ONCE, right here.
    // Switching voting systems later never regenerates them.
    set({ drawnEvents, game: regen({ ...s, drawnEvents }), predictions: {} });
    award(get, set, 'newsWatcher');
  },

  toggleSystem: (id) => {
    const s = get();
    const has = s.selectedSystems.includes(id);
    const allowed = MODES[s.mode].systems.includes(id);
    if (!has && !allowed) {
      get().setCaption(`🔒 The ${id} machine is asleep in ${MODES[s.mode].name}. Try a bigger age mode — or load the Teaching Example!`);
      return;
    }
    if (has && s.selectedSystems.length === 1) {
      get().setCaption('At least one counting machine must stay switched on.');
      return;
    }
    audio.click();
    if (!has) audio.machineStart();
    set({
      selectedSystems: has
        ? s.selectedSystems.filter((x) => x !== id)
        : [...s.selectedSystems, id],
    });
  },

  setBallotSource: (src) => {
    audio.click();
    set({ ballotSource: src, predictions: {} });
  },

  runElection: () => {
    const s = get();
    if (s.running) return;
    if (s.netRole === 'guest' && !netDriven) {
      get().setCaption('🌐 Only your teacher can start the counting machines in an online room.');
      return;
    }
    if (s.netRole === 'host' && !netDriven) {
      if (s.ballotSource === 'classroom' && s.netBallotCount === 0) {
        get().setCaption('🗳️ The room ballot box is empty — everyone can seal a ballot in the Secret Ballot Booth!');
        return;
      }
      net.sendRun(s.ballotSource, [...s.selectedSystems].sort());
      return; // the room broadcast starts the count for everyone at the same moment
    }
    if (s.ballotSource === 'classroom' && s.classroomBallots.length === 0) {
      get().setCaption('🗳️ The classroom ballot box is empty — seal at least one ballot in the Secret Ballot Booth first.');
      return;
    }
    audio.machineStart();
    set({ running: true, theaterPulse: Date.now() });

    const finish = () => {
      const st = get();
      let ballots: Ballot[];
      let seedLabel: string;
      if (st.ballotSource === 'festival') {
        ballots = st.game.ballots; // stored once — reused for every rule
        seedLabel = `festival-${festivalSeedLabel(gameKey(st.seedInput, st.mode, st.neighborhood, st.polarization, st.drawnEvents, st.custom))}`;
      } else if (st.ballotSource === 'classroom') {
        ballots = st.classroomBallots;
        seedLabel = `classroom-${st.classroomBallots.length}-ballots`;
      } else {
        ballots = getTeachingBallots();
        seedLabel = 'teaching-example-fixed';
      }
      const ordered = [...st.selectedSystems].sort();
      const results = runSystems(ballots, ordered);
      const metrics = computeMetrics(ballots);
      const winnerSet = new Set(results.map((r) => r.winnerId));
      const run: ElectionRun = {
        source: st.ballotSource,
        seedLabel,
        voterCount: ballots.length,
        results,
        metrics,
        differentWinners: winnerSet.size > 1,
        eventIds: st.ballotSource === 'festival' ? st.drawnEvents : [],
      };
      audio.machineFinish();
      audio.resultRibbon();
      set({ lastRun: run, lastRunBallots: ballots, running: false });

      // 🏆 challenge detection
      const winners = results.map((r) => r.winnerId);
      const distinct = new Set(winners).size;
      if (results.length >= 4 && distinct === 1) get().markChallenge('agreement');
      if (distinct >= 4) get().markChallenge('disagreement');
      const hits = results.filter((r) => st.predictions[r.systemId] === r.winnerId).length;
      if (st.votersMet.length >= 5 && hits >= 3) get().markChallenge('pollster');
      if (st.ballotSource === 'festival') {
        const prev = st.prevFestivalWinners;
        if (prev && results.some((r) => prev[r.systemId] && prev[r.systemId] !== r.winnerId)) {
          get().markChallenge('flip');
        }
        const nextPrev: Record<string, CandidateId> = { ...(prev ?? {}) };
        for (const r of results) nextPrev[r.systemId] = r.winnerId;
        set({ prevFestivalWinners: nextPrev });
      }
    };

    window.setTimeout(finish, get().reducedMotion ? 60 : 900);
  },

  /* ------------------------- classroom vote ------------------------- */

  sealClassroomBallot: (ranking, approvals, scores) => {
    const s = get();
    if (s.netStatus === 'online') {
      net.sendBallot({
        voterId: `net-${net.myId ?? 'me'}`,
        voterGroupId: 'classroom',
        ranking: [...ranking],
        approvals: [...approvals],
        scores: { ...scores },
      });
      audio.sealBallot();
      get().setCaption('🗳️ Sealed! Your secret ballot flew to the room ballot box. (Sealing again replaces it.)');
      return;
    }
    if (s.classroomBallots.length >= MAX_CLASSROOM) {
      get().setCaption(`The ballot box is full (${MAX_CLASSROOM} ballots).`);
      return;
    }
    const ballot: Ballot = {
      voterId: `class-${s.classroomBallots.length + 1}`,
      voterGroupId: 'classroom',
      ranking: [...ranking],
      approvals: [...approvals],
      scores: { ...scores },
    };
    audio.sealBallot();
    set({ classroomBallots: [...s.classroomBallots, ballot] });
    get().setCaption(`🗳️ Ballot #${s.classroomBallots.length + 1} sealed. Next student's turn — the form is fresh and private.`);
  },

  addClassroomBots: (k) => {
    const s = get();
    if (s.netStatus === 'online') {
      if (s.netRole !== 'host') {
        get().setCaption('🌐 Only your teacher can add bot voters in an online room.');
        return;
      }
      const take = Math.max(0, Math.min(k, MAX_CLASSROOM - s.netBallotCount));
      if (take === 0) {
        get().setCaption(`The ballot box is full (${MAX_CLASSROOM} ballots).`);
        return;
      }
      const rngN = mulberry32(hashString(`bots-${s.seedInput}-${s.netBallotCount}-${Date.now()}`));
      const poolN = s.game.ballots;
      const stamp = Date.now();
      for (let i = 0; i < take; i++) {
        const src = poolN[Math.floor(rngN() * poolN.length)];
        net.sendBallot({
          voterId: `net-bot-${s.netBallotCount + i + 1}`,
          voterGroupId: 'classroom-bot',
          ranking: [...src.ranking],
          approvals: [...src.approvals],
          scores: { ...src.scores },
        }, `bot-${stamp}-${i}`);
      }
      audio.stickerPop();
      get().setCaption(`🤖 ${take} bot voter${take === 1 ? '' : 's'} sent to the room ballot box.`);
      return;
    }
    const room = MAX_CLASSROOM - s.classroomBallots.length;
    const take = Math.max(0, Math.min(k, room));
    if (take === 0) {
      get().setCaption(`The ballot box is full (${MAX_CLASSROOM} ballots).`);
      return;
    }
    const rng = mulberry32(hashString(`bots-${s.seedInput}-${s.classroomBallots.length}`));
    const pool = s.game.ballots;
    const bots: Ballot[] = [];
    for (let i = 0; i < take; i++) {
      const src = pool[Math.floor(rng() * pool.length)];
      bots.push({
        voterId: `class-bot-${s.classroomBallots.length + i + 1}`,
        voterGroupId: 'classroom-bot',
        ranking: [...src.ranking],
        approvals: [...src.approvals],
        scores: { ...src.scores },
      });
    }
    audio.stickerPop();
    set({ classroomBallots: [...s.classroomBallots, ...bots] });
    get().setCaption(`🤖 ${take} bot voter${take === 1 ? '' : 's'} copied ballots from the simulated forest animals.`);
  },

  clearClassroom: () => {
    const s = get();
    if (s.netStatus === 'online') {
      if (s.netRole !== 'host') {
        get().setCaption('🌐 Only your teacher can empty the room ballot box.');
        return;
      }
      net.sendClearBallots();
      audio.click();
      return;
    }
    audio.click();
    set({ classroomBallots: [] });
    get().setCaption('The classroom ballot box was emptied.');
  },

  setPrediction: (sys, cid) => {
    const s = get();
    const predictions = { ...s.predictions };
    if (cid === null) delete predictions[sys];
    else predictions[sys] = cid;
    audio.badgePlace();
    set({ predictions });
  },

  /* ---------------------- online festival room ---------------------- */

  hostRoom: (url, name, species) => {
    audio.click();
    set({ netStatus: 'connecting', netRole: 'host', netError: null });
    net.connect({ url, role: 'host', name, species });
  },

  joinRoom: (url, code, name, species) => {
    audio.click();
    set({ netStatus: 'connecting', netRole: 'guest', netError: null });
    net.connect({ url, role: 'join', code: code.trim().toUpperCase(), name, species });
  },

  leaveRoom: () => {
    net.leave();
    set({ netStatus: 'off', netRole: null, netCode: null, netPeers: [], netBallotCount: 0, netError: null });
    get().setCaption('👋 You left the online room. The festival is all yours again!');
  },

  /* ------------------------- practice booth ------------------------- */

  practice: { ranking: [], approvals: [], scores: {}, modesTried: [] },

  practiceRank: (id) => {
    const s = get();
    const r = s.practice.ranking;
    const ranking = r.includes(id) ? r.filter((x) => x !== id) : [...r, id];
    audio.badgePlace();
    set({ practice: { ...s.practice, ranking } });
    get().markPracticeMode('ranking');
  },

  practiceClearRanking: () => {
    const s = get();
    audio.click();
    set({ practice: { ...s.practice, ranking: [] } });
  },

  practiceToggleApproval: (id) => {
    const s = get();
    const a = s.practice.approvals;
    const approvals = a.includes(id) ? a.filter((x) => x !== id) : [...a, id];
    audio.stickerPop();
    set({ practice: { ...s.practice, approvals } });
    get().markPracticeMode('approval');
  },

  practiceScore: (id, score) => {
    const s = get();
    audio.starSparkle();
    set({ practice: { ...s.practice, scores: { ...s.practice.scores, [id]: score } } });
    get().markPracticeMode('score');
  },
}));

/** Award used from UI (e.g. Result Detective when a replay is opened). */
export function awardSticker(id: StickerId): void {
  const s = useGame.getState();
  if (s.stickers.includes(id)) return;
  audio.collectSticker();
  useGame.setState({
    stickers: [...s.stickers, id],
    stickerToast: { id, at: Date.now() },
    caption: `🎉 Passport sticker earned: ${STICKERS[id].emoji} ${STICKERS[id].name}!`,
  });
  const st = useGame.getState();
  saveJSON('akef3d-prefs-v2', {
    mode: st.mode,
    seedInput: st.seedInput,
    polarization: st.polarization,
    neighborhood: st.neighborhood,
    stickers: st.stickers,
  });
}

/** Builds a quick-fill classroom ballot from a ranking (rank 1 = 5★ …). */
export function classroomQuickFill(ranking: CandidateId[]): { approvals: CandidateId[]; scores: Record<string, number> } {
  const b = ballotFromRanking('tmp', 'tmp', ranking);
  return { approvals: b.approvals, scores: b.scores };
}

/** The issues actually on the trail today: custom picks, or the age mode's default set. */
export function issuesInPlay(s: Pick<GameState, 'custom' | 'mode'>): IssueId[] {
  return s.custom.issues ?? ISSUE_ORDER.slice(0, MODES[s.mode].issues);
}

/** The first quest step not yet finished, or null when the festival is complete. */
export function currentQuest(s: GameState): QuestStep | null {
  const done: Record<string, boolean> = {
    gate: !!s.visited.gate,
    workshop: !!s.visited.workshop,
    issues: s.issuesRead.length >= 3,
    rally: s.candidatesMet.length >= 3,
    news: s.drawnEvents.length > 0,
    booth: !!s.visited.booth,
    arcade: s.machinesInspected.length > 0,
    theater: !!s.lastRun,
    campfire: !!s.visited.campfire,
  };
  return QUEST_STEPS.find((q) => !done[q.id]) ?? null;
}

/* ------------------- 🌐 Festival Room network wiring ------------------- */

function netAward(id: StickerId): void {
  const s = useGame.getState();
  if (s.stickers.includes(id)) return;
  audio.collectSticker();
  useGame.setState({ stickers: [...s.stickers, id], stickerToast: { id, at: Date.now() } });
  persist(useGame.getState());
}

/** The teacher's settings arrive as a share code — regrow the identical election. */
function applyNetSetup(code: string): void {
  const shared = decodeShareCode(code);
  if (!shared) return;
  netDriven = true;
  try {
    useGame.getState().applySharedSetup(shared);
  } finally {
    netDriven = false;
  }
  useGame.getState().setCaption('🌐 Your teacher updated the festival setup for the whole room.');
}

function applyNetNews(events: EventId[], live: boolean): void {
  const s = useGame.getState();
  const valid = events.filter((e) => EVENT_ORDER.includes(e));
  if (valid.length === 0) return;
  if (live) audio.parrotJingle();
  useGame.setState({
    drawnEvents: valid,
    game: regen({ ...s, drawnEvents: valid }),
    predictions: {},
  });
  if (live) {
    useGame.getState().setCaption('🗞️ Squawk! Fresh forest news for the whole room!');
    netAward('newsWatcher');
  }
}

/** The teacher pressed Run — every client counts the SAME ballots locally. */
function applyNetRun(msg: NetRunMsg, live: boolean): void {
  const systems = (msg.systems ?? []).filter((x): x is SystemId => (SYSTEM_IDS as readonly string[]).includes(x));
  if (systems.length === 0) return;
  const patch: Partial<GameState> = { selectedSystems: systems, ballotSource: msg.source };
  if (msg.source === 'classroom') {
    patch.classroomBallots = (msg.ballots ?? []).filter((b) => Array.isArray(b.ranking) && b.ranking.length > 0);
  }
  useGame.setState(patch);
  const st = useGame.getState();
  if (live && !st.panel) st.openPanelFor('theater');
  if (live) st.setCaption('🎭 Your teacher started the counting machines — same ballots for everyone!');
  netDriven = true;
  try {
    st.runElection();
  } finally {
    netDriven = false;
  }
}

net.handlers = {
  onWelcome: (w) => {
    useGame.setState({
      netStatus: 'online',
      netRole: w.host ? 'host' : 'guest',
      netCode: w.code,
      netPeers: w.peers,
      netBallotCount: w.ballots,
      netError: null,
    });
    audio.collectSticker();
    const st = useGame.getState();
    if (w.host) {
      // Broadcast the current setup right away so joiners regrow this exact election.
      net.syncSetupSoon(() => encodeShareCode({
        seed: st.seedInput, mode: st.mode, polarization: st.polarization, hood: st.neighborhood, custom: st.custom,
      }));
      st.setCaption(`🌳 Room ${w.code} is open! Share the code — classmates pick an animal and hop in.`);
    } else {
      if (w.setup) applyNetSetup(w.setup);
      if (w.events && w.events.length > 0) applyNetNews(w.events, false);
      if (w.lastRun) applyNetRun(w.lastRun, false);
      st.setCaption(`🎉 Welcome to room ${w.code}! Press F to wave hello.`);
    }
  },
  onClose: (reason) => {
    const s = useGame.getState();
    if (s.netStatus === 'off' && reason === null) return; // we chose to leave
    useGame.setState({ netStatus: 'off', netRole: null, netCode: null, netPeers: [], netBallotCount: 0 });
    if (reason === 'unreachable') {
      useGame.setState({ netError: 'Could not reach the room server. Is it running? (npm run server)' });
    } else if (reason === 'lost') {
      useGame.getState().setCaption('🌫️ The room connection drifted away — you can rejoin from the 🌐 panel.');
    }
  },
  onError: (message) => {
    useGame.setState({ netError: message });
    useGame.getState().setCaption(`🌐 ${message}`);
  },
  onRoster: (peers) => useGame.setState({ netPeers: peers }),
  onPeerJoin: (name) => {
    audio.stickerPop();
    useGame.getState().setCaption(`🎉 ${name} hopped into the festival!`);
  },
  onPeerLeave: (name) => useGame.getState().setCaption(`👋 ${name} left the festival.`),
  onHostChange: (id, name) => {
    const mine = net.myId === id;
    if (mine) useGame.setState({ netRole: 'host' });
    useGame.getState().setCaption(mine
      ? '👑 You are the room host now — you steer the news and the counting!'
      : `👑 ${name} is the room host now.`);
  },
  onSetup: applyNetSetup,
  onNews: (events) => applyNetNews(events, true),
  onBallots: (n) => useGame.setState({ netBallotCount: n }),
  onRun: applyNetRun,
};
