import type { Ballot, BallotSource, EventId, SystemId } from '../types/game';
import { audio } from './audio';
import { poolFx, playerPos } from '../state/registry';

/**
 * Festival Room networking — plain browser WebSocket, no extra libraries.
 *
 * Philosophy: the world is DETERMINISTIC (Magic Election Seed), so we never
 * ship the whole election over the wire. The host broadcasts tiny facts —
 * a share code, the drawn news ids, a "run" command — and every client
 * regrows the identical election locally. Only two things truly travel:
 * player positions (about 10x/second) and sealed classroom ballots.
 */

export type NetSpecies =
  | 'fox' | 'panda' | 'owl' | 'lion' | 'dolphin'
  | 'beaver' | 'turtle' | 'rabbit' | 'elephant' | 'raccoon';

export const NET_SPECIES: { id: NetSpecies; emoji: string; label: string }[] = [
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'owl', emoji: '🦉', label: 'Owl' },
  { id: 'lion', emoji: '🦁', label: 'Lion' },
  { id: 'dolphin', emoji: '🐬', label: 'Dolphin' },
  { id: 'beaver', emoji: '🦫', label: 'Beaver' },
  { id: 'turtle', emoji: '🐢', label: 'Turtle' },
  { id: 'rabbit', emoji: '🐰', label: 'Rabbit' },
  { id: 'elephant', emoji: '🐘', label: 'Elephant' },
  { id: 'raccoon', emoji: '🦝', label: 'Raccoon' },
];

export const SPECIES_EMOJI: Record<string, string> = Object.fromEntries(
  NET_SPECIES.map((s) => [s.id, s.emoji]),
);

/** Friendly avatar tints so classmates look distinct. */
const AVATAR_COLORS: [string, string][] = [
  ['#c96f3b', '#f3d9b1'], ['#8a8f98', '#f0f0f0'], ['#8c6f4b', '#f2e3c0'],
  ['#d9a13b', '#8a5a2b'], ['#7fb6c9', '#dceff5'], ['#7a5230', '#a9805a'],
  ['#5d8a4a', '#c9b063'], ['#bfae9f', '#f5efe6'], ['#9aa3b0', '#d8dde5'],
  ['#6f6a75', '#cfc9d6'],
];

export interface NetPeer {
  id: string;
  name: string;
  species: NetSpecies;
  host: boolean;
}

export interface RemoteAvatar {
  id: string;
  name: string;
  species: NetSpecies;
  color: string;
  accent: string;
  /** Interpolated (rendered) position. */
  x: number; y: number; z: number; ry: number;
  /** Latest network target. */
  tx: number; ty: number; tz: number; try: number;
  moving: boolean;
  hasPos: boolean;
  emote: { kind: 'wave' | 'splash' | 'hop'; at: number } | null;
}

export interface NetRunMsg {
  source: BallotSource;
  systems: SystemId[];
  ballots?: Ballot[];
}

export interface NetWelcome {
  id: string;
  code: string;
  host: boolean;
  peers: NetPeer[];
  setup: string | null;
  events: EventId[] | null;
  ballots: number;
  lastRun: NetRunMsg | null;
}

/** Assigned by the store — keeps net.ts free of store imports (no cycles). */
export interface NetHandlers {
  onWelcome: (w: NetWelcome) => void;
  onClose: (reason: string | null) => void;
  onError: (message: string) => void;
  onRoster: (peers: NetPeer[]) => void;
  onPeerJoin: (name: string) => void;
  onPeerLeave: (name: string) => void;
  onHostChange: (id: string, name: string) => void;
  onSetup: (code: string) => void;
  onNews: (events: EventId[]) => void;
  onBallots: (n: number) => void;
  onRun: (msg: NetRunMsg, live: boolean) => void;
}

export interface ConnectOptions {
  url: string;
  role: 'host' | 'join';
  code?: string;
  name: string;
  species: NetSpecies;
}

/** "192.168.1.7:8787" / "http://…" / bare hostname → a proper ws(s) URL. */
export function normalizeServerUrl(input: string): string {
  let u = input.trim().replace(/\/+$/, '');
  if (!u) u = defaultServerUrl();
  if (/^https:/i.test(u)) u = u.replace(/^https/i, 'wss');
  else if (/^http:/i.test(u)) u = u.replace(/^http/i, 'ws');
  else if (!/^wss?:\/\//i.test(u)) u = `ws://${u}`;
  return u;
}

/** Best guess: same machine as the page (LAN teachers) on the server port. */
export function defaultServerUrl(): string {
  const secure = window.location.protocol === 'https:';
  const scheme = secure ? 'wss' : 'ws';
  if (window.location.port === '8787') return `${scheme}://${window.location.host}`;
  return `${scheme}://${window.location.hostname || 'localhost'}:8787`;
}

const POS_INTERVAL_MS = 100;

class NetClient {
  handlers: NetHandlers | null = null;

  /** Live remote avatars, keyed by player id — read by RemotePlayers each frame. */
  readonly remote = new Map<string, RemoteAvatar>();

  peers: NetPeer[] = [];
  myId: string | null = null;
  isHost = false;
  code: string | null = null;

  private ws: WebSocket | null = null;
  private wantClose = false;
  private lastPosSent = 0;
  private lastPos = { x: 0, y: 0, z: 0, ry: 0, m: false };
  private setupTimer: number | undefined;
  private lastSetupSent: string | null = null;

  get online(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.myId !== null;
  }

  connect(opts: ConnectOptions): void {
    this.leave();
    this.wantClose = false;
    let ws: WebSocket;
    try {
      ws = new WebSocket(normalizeServerUrl(opts.url));
    } catch {
      this.handlers?.onError('That server address does not look right. Try something like ws://192.168.1.20:8787');
      this.handlers?.onClose('bad-url');
      return;
    }
    this.ws = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({
        t: 'hello', role: opts.role, code: opts.code, name: opts.name, species: opts.species,
      }));
    };
    ws.onmessage = (ev) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(String(ev.data)); } catch { return; }
      this.dispatch(msg);
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      const reason = this.wantClose ? null : (this.myId ? 'lost' : 'unreachable');
      this.reset();
      this.handlers?.onClose(reason);
    };
    ws.onerror = () => { /* onclose follows and reports */ };
  }

  leave(): void {
    this.wantClose = true;
    window.clearTimeout(this.setupTimer);
    if (this.ws) {
      const ws = this.ws;
      this.ws = null;
      try { ws.close(); } catch { /* already closed */ }
    }
    this.reset();
  }

  private reset(): void {
    this.ws = null;
    this.myId = null;
    this.isHost = false;
    this.code = null;
    this.peers = [];
    this.remote.clear();
    this.lastSetupSent = null;
    window.clearTimeout(this.setupTimer);
  }

  private send(msg: object): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  /* --------------------------- outgoing --------------------------- */

  /** Called every frame by the player controller; throttles itself. */
  maybeSendPos(x: number, y: number, z: number, ry: number, moving: boolean): void {
    if (!this.online) return;
    const now = performance.now();
    if (now - this.lastPosSent < POS_INTERVAL_MS) return;
    const p = this.lastPos;
    const still = !moving && !p.m && Math.abs(p.x - x) < 0.01 && Math.abs(p.z - z) < 0.01 && Math.abs(p.y - y) < 0.01;
    if (still && now - this.lastPosSent < 2000) return; // idle heartbeat every 2s
    this.lastPosSent = now;
    this.lastPos = { x, y, z, ry, m: moving };
    this.send({ t: 'pos', x, y, z, ry, m: moving ? 1 : 0 });
  }

  sendFx(kind: 'wave' | 'splash' | 'hop'): void {
    if (this.online) this.send({ t: 'fx', kind });
  }

  sendBallot(ballot: Ballot, key?: string): void {
    if (this.online) this.send({ t: 'ballot', ballot, key });
  }

  sendClearBallots(): void {
    if (this.online && this.isHost) this.send({ t: 'clearBallots' });
  }

  sendNews(events: EventId[]): void {
    if (this.online && this.isHost) this.send({ t: 'news', events });
  }

  sendRun(source: BallotSource, systems: SystemId[]): void {
    if (this.online && this.isHost) this.send({ t: 'run', source, systems });
  }

  /**
   * Debounced setup broadcast — the store calls this after ANY settings save,
   * so whatever the teacher touches (seed, mode, mixer, custom roster…)
   * quietly reaches every student as a share code.
   */
  syncSetupSoon(makeCode: () => string): void {
    if (!this.online || !this.isHost) return;
    window.clearTimeout(this.setupTimer);
    this.setupTimer = window.setTimeout(() => {
      if (!this.online || !this.isHost) return;
      const code = makeCode();
      if (code === this.lastSetupSent) return;
      this.lastSetupSent = code;
      this.send({ t: 'setup', code });
    }, 250);
  }

  /* --------------------------- incoming --------------------------- */

  private addAvatar(peer: NetPeer): void {
    if (peer.id === this.myId || this.remote.has(peer.id)) return;
    const [color, accent] = AVATAR_COLORS[
      Math.abs(peer.id.split('').reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7)) % AVATAR_COLORS.length
    ];
    this.remote.set(peer.id, {
      id: peer.id, name: peer.name, species: peer.species, color, accent,
      x: 0, y: 0, z: 27, ry: 0, tx: 0, ty: 0, tz: 27, try: 0,
      moving: false, hasPos: false, emote: null,
    });
  }

  private dispatch(msg: Record<string, unknown>): void {
    const h = this.handlers;
    switch (msg.t) {
      case 'welcome': {
        const w = msg as unknown as NetWelcome;
        this.myId = w.id;
        this.isHost = w.host;
        this.code = w.code;
        this.peers = w.peers;
        for (const p of w.peers) this.addAvatar(p);
        h?.onWelcome(w);
        h?.onRoster(this.peers);
        break;
      }
      case 'error':
        h?.onError(String(msg.message ?? 'Something went wrong.'));
        break;
      case 'peerJoin': {
        const peer = msg.peer as NetPeer;
        this.peers = [...this.peers, peer];
        this.addAvatar(peer);
        h?.onPeerJoin(peer.name);
        h?.onRoster(this.peers);
        break;
      }
      case 'peerLeave': {
        const id = String(msg.id);
        this.peers = this.peers.filter((p) => p.id !== id);
        this.remote.delete(id);
        h?.onPeerLeave(String(msg.name ?? 'A friend'));
        h?.onRoster(this.peers);
        break;
      }
      case 'hostChange': {
        const id = String(msg.id);
        if (id === this.myId) this.isHost = true;
        this.peers = this.peers.map((p) => ({ ...p, host: p.id === id }));
        h?.onHostChange(id, String(msg.name ?? ''));
        h?.onRoster(this.peers);
        break;
      }
      case 'peers': {
        const rows = msg.p as [string, number, number, number, number, number][];
        for (const [id, x, y, z, ry, m] of rows) {
          if (id === this.myId) continue;
          const a = this.remote.get(id);
          if (!a) continue;
          if (!a.hasPos) { a.x = x; a.y = y; a.z = z; a.ry = ry; }
          a.tx = x; a.ty = y; a.tz = z; a.try = ry;
          a.moving = m === 1;
          a.hasPos = true;
        }
        break;
      }
      case 'fx': {
        const a = this.remote.get(String(msg.id));
        const kind = msg.kind as 'wave' | 'splash' | 'hop';
        if (!a) break;
        a.emote = { kind, at: performance.now() };
        const dist = Math.hypot(a.x - playerPos.x, a.z - playerPos.z);
        if (kind === 'splash') {
          poolFx.splashAt = performance.now();
          if (dist < 14) audio.splash();
        } else if (kind === 'wave' && dist < 12) {
          audio.starSparkle();
        }
        break;
      }
      case 'setup':
        h?.onSetup(String(msg.code));
        break;
      case 'news':
        h?.onNews(msg.events as EventId[]);
        break;
      case 'ballots':
        h?.onBallots(Number(msg.n) || 0);
        break;
      case 'run':
        h?.onRun(msg as unknown as NetRunMsg, true);
        break;
      default:
        break;
    }
  }
}

/** The one shared client — safe to import anywhere (does nothing until connected). */
export const net = new NetClient();
