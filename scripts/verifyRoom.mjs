/**
 * Simulated-classroom test for the Festival Room server core (no network, no ws).
 * Run:  node scripts/verifyRoom.mjs
 */
import assert from 'node:assert/strict';
import { createFestival, MAX_ROOM_PLAYERS } from '../server/room.mjs';

// Fake transport: every "handle" is an object that collects its messages.
const inbox = new Map();
const festival = createFestival((handle, msg) => {
  if (!inbox.has(handle)) inbox.set(handle, []);
  inbox.get(handle).push(msg);
});
const client = (label) => ({ label });
const msgs = (c) => inbox.get(c) ?? [];
const last = (c) => msgs(c)[msgs(c).length - 1];
const ofType = (c, t) => msgs(c).filter((m) => m.t === t);

let checks = 0;
function check(label, fn) {
  fn();
  checks++;
  console.log(`  PASS  ${label}`);
}

const teacher = client('teacher');
const amy = client('amy');
const ben = client('ben');

check('teacher hosts a room and gets a 4-letter code', () => {
  festival.message(teacher, { t: 'hello', role: 'host', name: 'Ms. Maple', species: 'owl' });
  const w = last(teacher);
  assert.equal(w.t, 'welcome');
  assert.match(w.code, /^[A-Z]{4}$/);
  assert.equal(w.host, true);
  assert.equal(w.ballots, 0);
});
const CODE = last(teacher).code;

check('joining a wrong code fails kindly', () => {
  festival.message(amy, { t: 'hello', role: 'join', code: 'ZZZZ', name: 'Amy', species: 'fox' });
  assert.equal(last(amy).t, 'error');
});

check('two students join with the right code (names sanitized)', () => {
  festival.message(amy, { t: 'hello', role: 'join', code: CODE.toLowerCase(), name: '  Amy 🦊<script>  ', species: 'fox' });
  festival.message(ben, { t: 'hello', role: 'join', code: CODE, name: 'Ben', species: 'dolphin' });
  const wAmy = ofType(amy, 'welcome')[0];
  assert.equal(wAmy.host, false);
  assert.equal(wAmy.peers.length, 2);
  assert.equal(wAmy.peers.find((p) => p.host).name, 'Ms. Maple');
  assert.ok(!wAmy.peers[1].name.includes('<'));
  assert.equal(ofType(teacher, 'peerJoin').length, 2);
  assert.equal(ofType(ben, 'welcome')[0].peers.length, 3);
});
const amyId = ofType(amy, 'welcome')[0].id;

check('positions flow through 10Hz snapshots', () => {
  festival.message(amy, { t: 'pos', x: 3.123456, y: 0, z: -14.5, ry: 1.57, m: 1 });
  festival.tick();
  const snap = ofType(teacher, 'peers').pop();
  const row = snap.p.find((r) => r[0] === amyId);
  assert.deepEqual(row, [amyId, 3.12, 0, -14.5, 1.57, 1]);
});

check('students cannot steer the election (host-only setup/news/run)', () => {
  festival.message(amy, { t: 'setup', code: 'FOREST-HACK' });
  assert.equal(last(amy).t, 'error');
  festival.message(amy, { t: 'news', events: ['heatwave'] });
  assert.equal(last(amy).t, 'error');
  festival.message(amy, { t: 'run', source: 'festival', systems: ['plurality'] });
  assert.equal(last(amy).t, 'error');
});

check('host setup broadcasts to students (not back to host)', () => {
  const before = ofType(teacher, 'setup').length;
  festival.message(teacher, { t: 'setup', code: 'FOREST-ABC123' });
  assert.equal(ofType(amy, 'setup').pop().code, 'FOREST-ABC123');
  assert.equal(ofType(ben, 'setup').pop().code, 'FOREST-ABC123');
  assert.equal(ofType(teacher, 'setup').length, before);
});

check('host news reaches everyone including the host', () => {
  festival.message(teacher, { t: 'news', events: ['heatwave', 'snackprices'] });
  assert.deepEqual(ofType(teacher, 'news').pop().events, ['heatwave', 'snackprices']);
  assert.deepEqual(ofType(amy, 'news').pop().events, ['heatwave', 'snackprices']);
});

const ballotOf = (first) => ({
  voterId: `net-${first}`, voterGroupId: 'classroom',
  ranking: [first, 'olive', 'dolly', 'penny', 'leo'],
  approvals: [first], scores: { [first]: 5 },
});

check('sealed ballots count up; resealing replaces, not duplicates', () => {
  festival.message(amy, { t: 'ballot', ballot: ballotOf('flynn') });
  festival.message(ben, { t: 'ballot', ballot: ballotOf('olive') });
  assert.equal(ofType(teacher, 'ballots').pop().n, 2);
  festival.message(amy, { t: 'ballot', ballot: ballotOf('dolly') }); // Amy changes her mind
  assert.equal(ofType(teacher, 'ballots').pop().n, 2);
});

check('host can add keyed bot ballots', () => {
  festival.message(teacher, { t: 'ballot', ballot: ballotOf('leo'), key: 'bot-1' });
  assert.equal(ofType(amy, 'ballots').pop().n, 3);
});

check('crumpled ballots are rejected', () => {
  festival.message(ben, { t: 'ballot', ballot: { ranking: 'not-an-array' } });
  assert.equal(last(ben).t, 'error');
});

check('classroom run ships all ballots to every player', () => {
  festival.message(teacher, { t: 'run', source: 'classroom', systems: ['plurality', 'irv'] });
  for (const c of [teacher, amy, ben]) {
    const run = ofType(c, 'run').pop();
    assert.deepEqual(run.systems, ['plurality', 'irv']);
    assert.equal(run.ballots.length, 3);
    assert.ok(run.ballots.some((b) => b.ranking[0] === 'dolly')); // Amy's reseal won
  }
});

check('a late joiner catches up (setup, news, ballots, last run)', () => {
  const cleo = client('cleo');
  festival.message(cleo, { t: 'hello', role: 'join', code: CODE, name: 'Cleo', species: 'turtle' });
  const w = ofType(cleo, 'welcome')[0];
  assert.equal(w.setup, 'FOREST-ABC123');
  assert.deepEqual(w.events, ['heatwave', 'snackprices']);
  assert.equal(w.ballots, 3);
  assert.equal(w.lastRun.source, 'classroom');
  festival.disconnect(cleo);
});

check('festival run with no ballot payload', () => {
  festival.message(teacher, { t: 'run', source: 'festival', systems: ['borda'] });
  const run = ofType(amy, 'run').pop();
  assert.equal(run.source, 'festival');
  assert.equal(run.ballots, undefined);
});

check('when the host leaves, the crown passes on', () => {
  festival.disconnect(teacher);
  const hc = ofType(amy, 'hostChange').pop();
  assert.equal(hc.id, amyId);
  festival.message(amy, { t: 'clearBallots' }); // new host may clear
  assert.equal(ofType(ben, 'ballots').pop().n, 0);
  festival.message(ben, { t: 'clearBallots' }); // Ben still may not
  assert.equal(last(ben).t, 'error');
});

check('empty rooms evaporate', () => {
  festival.disconnect(amy);
  festival.disconnect(ben);
  assert.equal(festival.roomCount(), 0);
  assert.equal(festival.playerCount(), 0);
});

check('full rooms turn students away', () => {
  const host = client('host2');
  festival.message(host, { t: 'hello', role: 'host', name: 'H', species: 'owl' });
  const code2 = last(host).code;
  for (let i = 0; i < MAX_ROOM_PLAYERS - 1; i++) {
    festival.message(client(`kid${i}`), { t: 'hello', role: 'join', code: code2, name: `Kid${i}`, species: 'rabbit' });
  }
  const extra = client('extra');
  festival.message(extra, { t: 'hello', role: 'join', code: code2, name: 'Extra', species: 'fox' });
  assert.equal(last(extra).t, 'error');
});

console.log(`\nALL ${checks} ROOM CHECKS PASSED ✔`);
