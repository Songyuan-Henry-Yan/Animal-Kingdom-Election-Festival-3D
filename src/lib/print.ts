import { CANDIDATES, CANDIDATE_ORDER } from '../data/candidates';
import { ISSUES, ISSUE_ORDER } from '../data/issues';
import { EVENTS } from '../data/events';
import { MODES, POLARIZATION_INFO } from '../data/modes';
import { HOUSEHOLDS } from '../data/neighborhood';
import { SYSTEM_INFO } from './voting';
import { STICKERS } from '../data/stickers';
import { audio } from './audio';
import { useGame } from '../state/store';
import { REFLECTION_QUESTIONS } from '../data/reflection';
import { CHARTER_LINES } from '../components/ui/StoryPanels';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Builds the printable class summary into #print-root and opens the print dialog. */
export function printSummary(): void {
  const s = useGame.getState();
  const el = document.getElementById('print-root');
  if (!el) return;

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const run = s.lastRun;

  const parts: string[] = [];
  parts.push(`<h1>Animal Kingdom Election Festival 3D — Class Summary</h1>`);
  parts.push(`<p class="p-muted">Printed ${esc(date)} · A nonpartisan civics game with fictional animal candidates.</p>`);
  parts.push(`<h2>Setup</h2><ul>`);
  parts.push(`<li><strong>Ballot set / seed:</strong> ${esc(run ? run.seedLabel : `${s.ballotSource} (not counted yet)`)}</li>`);
  parts.push(`<li><strong>Voters:</strong> ${run ? run.voterCount : 100} simulated forest animals — the same ballots for every counting rule</li>`);
  parts.push(`<li><strong>News events drawn:</strong> ${s.drawnEvents.length ? s.drawnEvents.map((e) => esc(EVENTS[e].title)).join(', ') : 'none'}</li>`);
  const cfg = MODES[s.mode];
  parts.push(`<li><strong>Age mode:</strong> ${esc(cfg.name)} (${esc(cfg.ages)}) — ${cfg.candidates} candidates, ${cfg.issues} issues, ${cfg.voters} voters</li>`);
  parts.push(`<li><strong>Magic Election Seed:</strong> ${esc(s.seedInput)} · <strong>Voter mood:</strong> ${esc(POLARIZATION_INFO[s.polarization].name)}</li>`);
  const hoodDesc = s.neighborhood.mixMode === 'surprise'
    ? 'Surprise mix (the seed sized the families)'
    : `Designed — ages ${s.neighborhood.ages}/100, pantry ${s.neighborhood.pantry}/100, roots ${s.neighborhood.roots}/100, jobs: ${esc(s.neighborhood.jobs)}`;
  parts.push(`<li><strong>Forest neighborhood:</strong> ${hoodDesc}. Families: ${s.game.groups.map((g) => `${esc(HOUSEHOLDS.find((h) => h.id === g.id)?.name ?? g.id)} ${g.count}`).join(', ')}</li>`);
  if (s.classroomBallots.length > 0) {
    parts.push(`<li><strong>Classroom ballot box:</strong> ${s.classroomBallots.length} sealed ballots</li>`);
  }
  const guessed = Object.keys(s.predictions).length;
  if (run && guessed > 0) {
    const hits = run.results.filter((r) => s.predictions[r.systemId] === r.winnerId).length;
    const judged = run.results.filter((r) => s.predictions[r.systemId]).length;
    parts.push(`<li><strong>Winner predictions:</strong> ${hits} of ${judged} machines called correctly</li>`);
  }
  parts.push(`<li><strong>Teacher Mode:</strong> ${s.teacherMode ? 'on' : 'off'} · <strong>Captions:</strong> ${audio.settings.captions ? 'on' : 'off'} · <strong>Volumes:</strong> music ${Math.round(audio.settings.music * 100)}%, effects ${Math.round(audio.settings.sfx * 100)}%, voices ${Math.round(audio.settings.voice * 100)}%${audio.settings.muteAll ? ' (all muted)' : ''}</li>`);
  parts.push(`<li><strong>Passport stickers earned:</strong> ${s.stickers.length}/8 — ${s.stickers.length ? s.stickers.map((id) => esc(STICKERS[id].name)).join(', ') : 'none yet'} (stickers never affect results)</li>`);
  parts.push(`</ul>`);

  parts.push(`<h2>Candidates</h2><ul>`);
  for (const cid of CANDIDATE_ORDER) {
    const c = CANDIDATES[cid];
    parts.push(`<li><strong>${esc(c.name)}</strong> — “${esc(c.slogan)}” (${esc(c.personality)})</li>`);
  }
  parts.push(`</ul>`);

  parts.push(`<h2>Issues on the Trail</h2><ul>`);
  for (const iid of ISSUE_ORDER) {
    parts.push(`<li><strong>${esc(ISSUES[iid].title)}:</strong> ${esc(ISSUES[iid].question)}</li>`);
  }
  parts.push(`</ul>`);

  parts.push(`<h2>Voting rules used</h2>`);
  if (run) {
    parts.push(`<table><tr><th>Rule</th><th>Machine</th><th>Winner</th><th>Why</th></tr>`);
    for (const r of run.results) {
      parts.push(`<tr><td>${esc(r.systemName)}${s.teacherMode ? `<br><em>${esc(SYSTEM_INFO[r.systemId].teacher.formalName)}</em>` : ''}</td><td>${esc(r.machineName)}</td><td><strong>${esc(CANDIDATES[r.winnerId].name)}</strong></td><td>${esc(r.explanationForKids)}${r.tieNote ? ` [${esc(r.tieNote)}]` : ''}</td></tr>`);
    }
    parts.push(`</table>`);
    parts.push(`<p><strong>${run.differentWinners
      ? 'Different rules chose different winners — with the same voters and the same ballots.'
      : 'This time every selected rule chose the same winner — try switching on more rules!'}</strong></p>`);
    parts.push(`<h2>Candidate numbers (same ballots)</h2>`);
    parts.push(`<table><tr><th>Candidate</th><th>Favorite fans</th><th>Say "okay"</th><th>Avg stars</th><th>Matchup wins</th></tr>`);
    for (const m of run.metrics) {
      parts.push(`<tr><td>${esc(CANDIDATES[m.id].name)}</td><td>${m.firstChoice}</td><td>${m.approvals} (${m.approvalRate}%)</td><td>${m.avgScore.toFixed(1)}</td><td>${m.matchupWins}</td></tr>`);
    }
    parts.push(`</table>`);
  } else {
    parts.push(`<p>The Counting Theater has not been run yet. Selected machines: ${s.selectedSystems.map((id) => esc(SYSTEM_INFO[id].machineName)).join(', ')}.</p>`);
  }

  parts.push(`<h2>Reflection questions</h2><ol>`);
  for (const q of REFLECTION_QUESTIONS) parts.push(`<li>${esc(q.q)}</li>`);
  parts.push(`</ol>`);

  parts.push(`<h2>The Forest Charter</h2><ol>`);
  for (const line of CHARTER_LINES) parts.push(`<li>${esc(line)}</li>`);
  parts.push(`</ol>`);

  parts.push(`<p class="p-muted">Core lesson: Same voters. Same ballots. Different voting rules — sometimes different winners. No rule is "always best"; each rewards a different democratic value. This game is nonpartisan: all characters, parties, and events are fictional animals with no reference to real politics.</p>`);

  el.innerHTML = parts.join('\n');
  window.print();
}
