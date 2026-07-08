/**
 * Festival Room logic — pure and transport-free, so it can be unit-tested
 * without any network. The ws wiring lives in festival-server.mjs.
 *
 * One room = one classroom. The host (usually the teacher) steers the shared
 * election: setup, news draws, and counting runs. Students send their
 * positions, fun effects (wave/splash), and sealed secret ballots.
 *
 * Privacy by design: nicknames only, no accounts, nothing written to disk,
 * rooms evaporate when the last player leaves.
 */

const CODE_LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ'; // no I / L / O look-alikes
export const MAX_ROOM_PLAYERS = 40;
export const MAX_ROOM_BALLOTS = 500;

const SPECIES = new Set([
  'fox', 'panda', 'owl', 'lion', 'dolphin',
  'beaver', 'turtle', 'rabbit', 'elephant', 'raccoon',
]);
const FX_KINDS = new Set(['wave', 'splash', 'hop']);
const RUN_SOURCES = new Set(['teaching', 'festival', 'classroom']);

function sanitizeName(x) {
  const s = String(x ?? '').replace(/[^\p{L}\p{N} '._-]/gu, '').trim().slice(0, 16).trim();
  return s || 'Explorer';
}

function sanitizeSpecies(x) {
  return SPECIES.has(x) ? x : 'rabbit';
}

function num(x, min, max) {
  const v = Number(x);
  if (!Number.isFinite(v)) return 0;
  return Math.max(min, Math.min(max, Math.round(v * 100) / 100));
}

/** Very light shape check — the game itself validates candidate ids. */
function looksLikeBallot(b) {
  return !!b && typeof b === 'object'
    && Array.isArray(b.ranking) && b.ranking.length >= 1 && b.ranking.length <= 12
    && b.ranking.every((c) => typeof c === 'string' && c.length <= 24)
    && Array.isArray(b.approvals) && b.approvals.length <= 12
    && !!b.scores && typeof b.scores === 'object';
}

/**
 * Creates the festival server core.
 * @param {(handle: unknown, msg: object) => void} send — transport callback.
 */
export function createFestival(send) {
  let nextId = 1;
  const players = new Map(); // handle -> player
  const rooms = new Map();   // code -> room

  const roomOf = (p) => (p ? rooms.get(p.code) : undefined);

  function makeCode() {
    for (let tries = 0; tries < 200; tries++) {
      let code = '';
      for (let i = 0; i < 4; i++) code += CODE_LETTERS[Math.floor(Math.random() * CODE_LETTERS.length)];
      if (!rooms.has(code)) return code;
    }
    return null;
  }

  function broadcast(room, msg, exceptId) {
    for (const p of room.players.values()) {
      if (p.id !== exceptId) send(p.handle, msg);
    }
  }

  function rosterOf(room) {
    return [...room.players.values()].map((p) => ({
      id: p.id, name: p.name, species: p.species, host: p.id === room.hostId,
    }));
  }

  function error(handle, message) {
    send(handle, { t: 'error', message });
  }

  function hello(handle, msg) {
    if (players.has(handle)) return; // already greeted
    const name = sanitizeName(msg.name);
    const species = sanitizeSpecies(msg.species);

    let room;
    if (msg.role === 'host') {
      const code = makeCode();
      if (!code) return error(handle, 'The forest is very busy — please try again.');
      room = {
        code, hostId: null, players: new Map(),
        setup: null, events: null, lastRun: null,
        ballots: new Map(),
      };
      rooms.set(code, room);
    } else if (msg.role === 'join') {
      const code = String(msg.code ?? '').trim().toUpperCase();
      room = rooms.get(code);
      if (!room) return error(handle, `No room called ${code || '(blank)'} is open right now. Check the code with your teacher!`);
      if (room.players.size >= MAX_ROOM_PLAYERS) return error(handle, 'That room is full — ask your teacher to open a second room.');
    } else {
      return error(handle, 'Unknown hello.');
    }

    const player = { handle, id: `p${nextId++}`, name, species, code: room.code, x: 0, y: 0, z: 27, ry: 0, m: 0 };
    players.set(handle, player);
    room.players.set(player.id, player);
    if (room.hostId === null) room.hostId = player.id;

    send(handle, {
      t: 'welcome',
      id: player.id,
      code: room.code,
      host: player.id === room.hostId,
      peers: rosterOf(room),
      setup: room.setup,
      events: room.events,
      ballots: room.ballots.size,
      lastRun: room.lastRun,
    });
    broadcast(room, { t: 'peerJoin', peer: { id: player.id, name: player.name, species: player.species, host: false } }, player.id);
  }

  function message(handle, msg) {
    if (!msg || typeof msg !== 'object' || typeof msg.t !== 'string') return;
    if (msg.t === 'hello') return hello(handle, msg);

    const p = players.get(handle);
    const room = roomOf(p);
    if (!p || !room) return;
    const isHost = p.id === room.hostId;

    switch (msg.t) {
      case 'ping':
        return send(handle, { t: 'pong' });

      case 'pos':
        p.x = num(msg.x, -60, 60);
        p.y = num(msg.y, 0, 12);
        p.z = num(msg.z, -60, 60);
        p.ry = num(msg.ry, -10, 10);
        p.m = msg.m ? 1 : 0;
        return;

      case 'fx':
        if (!FX_KINDS.has(msg.kind)) return;
        return broadcast(room, { t: 'fx', id: p.id, kind: msg.kind }, p.id);

      case 'ballot': {
        if (!looksLikeBallot(msg.ballot)) return error(handle, 'That ballot looked crumpled — please try sealing it again.');
        const key = isHost && typeof msg.key === 'string' ? msg.key.slice(0, 32) : p.id;
        if (!room.ballots.has(key) && room.ballots.size >= MAX_ROOM_BALLOTS) {
          return error(handle, `The ballot box is full (${MAX_ROOM_BALLOTS} ballots).`);
        }
        room.ballots.set(key, msg.ballot);
        return broadcast(room, { t: 'ballots', n: room.ballots.size });
      }

      case 'clearBallots':
        if (!isHost) return error(handle, 'Only the room host can empty the ballot box.');
        room.ballots.clear();
        return broadcast(room, { t: 'ballots', n: 0 });

      case 'setup':
        if (!isHost) return error(handle, 'Only the room host can change the festival setup.');
        if (typeof msg.code !== 'string' || msg.code.length > 4000) return;
        room.setup = msg.code;
        return broadcast(room, { t: 'setup', code: room.setup }, p.id);

      case 'news':
        if (!isHost) return error(handle, 'Only the room host can draw the forest news.');
        if (!Array.isArray(msg.events) || msg.events.length > 6) return;
        room.events = msg.events.map((e) => String(e).slice(0, 24));
        return broadcast(room, { t: 'news', events: room.events });

      case 'run': {
        if (!isHost) return error(handle, 'Only the room host can start the counting machines.');
        if (!RUN_SOURCES.has(msg.source)) return;
        const systems = Array.isArray(msg.systems)
          ? msg.systems.slice(0, 12).map((s) => String(s).slice(0, 24))
          : [];
        const out = { t: 'run', source: msg.source, systems };
        if (msg.source === 'classroom') {
          if (room.ballots.size === 0) {
            return error(handle, 'The classroom ballot box is empty — ask everyone to seal a ballot first.');
          }
          out.ballots = [...room.ballots.values()];
        }
        room.lastRun = out;
        return broadcast(room, out);
      }

      default:
        return;
    }
  }

  function disconnect(handle) {
    const p = players.get(handle);
    if (!p) return;
    players.delete(handle);
    const room = roomOf(p);
    if (!room) return;
    room.players.delete(p.id);

    if (room.players.size === 0) {
      rooms.delete(room.code); // the room evaporates — nothing is kept
      return;
    }
    broadcast(room, { t: 'peerLeave', id: p.id, name: p.name });
    if (room.hostId === p.id) {
      const heir = room.players.values().next().value;
      room.hostId = heir.id;
      broadcast(room, { t: 'hostChange', id: heir.id, name: heir.name });
    }
  }

  /** Broadcast one compact position snapshot per room (call ~10x/second). */
  function tick() {
    for (const room of rooms.values()) {
      if (room.players.size < 2) continue;
      const snap = [...room.players.values()].map((p) => [p.id, p.x, p.y, p.z, p.ry, p.m]);
      broadcast(room, { t: 'peers', p: snap });
    }
  }

  return {
    message,
    disconnect,
    tick,
    roomCount: () => rooms.size,
    playerCount: () => players.size,
  };
}
