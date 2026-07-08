import React, { useState } from 'react';
import { PaperPanel, Btn } from './common';
import { useGame, QUEST_STEPS, currentQuest, issuesInPlay } from '../../state/store';
import { CANDIDATES, CANDIDATE_ORDER } from '../../data/candidates';
import { ISSUES, ISSUE_ORDER } from '../../data/issues';
import { EVENTS } from '../../data/events';
import { MODES, POLARIZATION_INFO } from '../../data/modes';
import { SYSTEM_IDS, SYSTEM_INFO } from '../../lib/voting';
import { STICKERS, STICKER_ORDER } from '../../data/stickers';
import { CHARTER_LINES } from './StoryPanels';
import { CHALLENGES, CHALLENGE_ORDER } from '../../data/challenges';

type Tab = 'progress' | 'issues' | 'candidates' | 'machines' | 'results' | 'charter' | 'passport' | 'challenges';

const TABS: { id: Tab; label: string }[] = [
  { id: 'progress', label: '🧭 Progress' },
  { id: 'issues', label: '🍃 Issues' },
  { id: 'candidates', label: '🎤 Candidates' },
  { id: 'machines', label: '🕹️ Machines' },
  { id: 'results', label: '🎀 Results' },
  { id: 'charter', label: '📜 Charter' },
  { id: 'passport', label: '🛂 Passport' },
  { id: 'challenges', label: '🏆 Challenges' },
];

export function CivicNotebook(): React.JSX.Element {
  const [tab, setTab] = useState<Tab>('progress');
  const s = useGame();
  const quest = currentQuest(s);
  const cfg = MODES[s.mode];
  const issuesInMode = issuesInPlay(s);

  const stepDone: Record<string, boolean> = {
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

  return (
    <PaperPanel title="📓 Civic Notebook" wide>
      <div className="btn-row tabs" role="tablist" aria-label="Notebook sections">
        {TABS.map((t) => (
          <Btn key={t.id} kind="plain" pressed={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </Btn>
        ))}
      </div>

      {tab === 'progress' && (
        <div>
          <p>
            {cfg.emoji} <strong>{cfg.name}</strong> ({cfg.ages}) · 🌱 seed <strong>{s.seedInput}</strong> ·
            {' '}{POLARIZATION_INFO[s.polarization].emoji} {POLARIZATION_INFO[s.polarization].name}
          </p>
          <p><strong>Current step:</strong> {quest ? quest.label : 'Festival complete — explore freely!'}</p>
          <ul className="check-list">
            {QUEST_STEPS.map((q) => (
              <li key={q.id} className={stepDone[q.id] ? 'done' : ''}>
                {stepDone[q.id] ? '✅' : '⬜'} {q.label}
              </li>
            ))}
          </ul>
          {s.drawnEvents.length > 0 && (
            <p className="muted">Today's news: {s.drawnEvents.map((e) => `${EVENTS[e].emoji} ${EVENTS[e].title}`).join(' · ')}</p>
          )}
          {s.classroomBallots.length > 0 && (
            <p className="muted">🏫 Classroom ballot box: {s.classroomBallots.length} sealed ballots.</p>
          )}
          <p className="muted">🏘️ Voter families interviewed on the Green: {s.votersMet.length} of 5.</p>
          {!quest && (
            <div className="btn-row">
              <Btn kind="leaf" onClick={() => s.openPanelFor('report')}>🎓 Open my Festival Report Card</Btn>
            </div>
          )}
        </div>
      )}

      {tab === 'issues' && (
        <ul className="note-list">
          {issuesInMode.map((iid) => {
            const read = s.issuesRead.includes(iid);
            const issue = ISSUES[iid];
            return (
              <li key={iid}>
                <strong>{issue.emoji} {issue.title}:</strong>{' '}
                {read ? issue.question : 'Not read yet — find this leaf on the Issue Trail.'}
              </li>
            );
          })}
          {issuesInMode.length < ISSUE_ORDER.length && (
            <li className="muted">…{ISSUE_ORDER.length - issuesInMode.length} more issue leaves exist — add them in 🎨 Festival Setup.</li>
          )}
        </ul>
      )}

      {tab === 'candidates' && (
        <div className="metric-grid">
          {CANDIDATE_ORDER.map((cid) => {
            const running = s.game.roster.includes(cid);
            const met = s.candidatesMet.includes(cid);
            const c = CANDIDATES[cid];
            return (
              <div key={cid} className={`metric-card${running ? '' : ' resting'}`}>
                <h4>{c.emoji} {met ? c.name : running ? '???' : c.name}</h4>
                {!running && <p className="muted small">Resting this election — change the seed or age mode to see them run.</p>}
                {running && met && (
                  <>
                    <p className="slogan small">“{c.slogan}”</p>
                    <p className="muted small">💪 {c.strength}</p>
                    <p className="muted small">⚖️ {c.tradeoff}</p>
                  </>
                )}
                {running && !met && (
                  <p className="muted small">Running today! Meet them at the Rally Stage.</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'machines' && (
        <ul className="note-list">
          {SYSTEM_IDS.map((sid) => {
            const info = SYSTEM_INFO[sid];
            const on = s.selectedSystems.includes(sid);
            const awake = cfg.systems.includes(sid);
            const seen = s.machinesInspected.includes(sid);
            return (
              <li key={sid}>
                {on ? '🟢' : awake ? '⚪' : '🔒'} <strong>{info.emoji} {info.machineName}</strong> — {info.name}
                {' '}({'⭐'.repeat(info.difficulty)})
                {!awake && ' · asleep in this mode'}
                {awake && !seen ? ' · not inspected yet' : ''}
                {s.teacherMode && <span className="muted"> · {info.teacher.formalName}</span>}
              </li>
            );
          })}
        </ul>
      )}

      {tab === 'results' && (
        s.lastRun ? (
          <div>
            <p className="muted">
              {s.lastRun.source === 'teaching' ? 'Teaching Example' : s.lastRun.source === 'classroom' ? 'Classroom Ballots' : "Today's Festival Ballots"} ·
              {' '}{s.lastRun.voterCount} voters · seed {s.lastRun.seedLabel}
            </p>
            <ul className="note-list">
              {s.lastRun.results.map((r) => (
                <li key={r.systemId}>
                  <strong>{SYSTEM_INFO[r.systemId].emoji} {r.systemName}</strong> →
                  {' '}🎀 {CANDIDATES[r.winnerId].emoji} {CANDIDATES[r.winnerId].name}
                  {r.tieNote ? ' ⚖️' : ''}
                </li>
              ))}
            </ul>
            <p>{s.lastRun.differentWinners
              ? 'Same ballots — different winners. That is the whole lesson!'
              : 'All selected rules agreed this time. Try more machines!'}</p>
          </div>
        ) : (
          <p>No count yet. Visit the 🎭 Counting Theater and press “Run the Same Ballots”.</p>
        )
      )}

      {tab === 'charter' && (
        s.visited.charter ? (
          <ol className="charter-list">
            {CHARTER_LINES.map((line, i) => <li key={i}>{line}</li>)}
          </ol>
        ) : (
          <p>Visit the great tree at the center of the plaza to read the Forest Charter.</p>
        )
      )}

      {tab === 'passport' && (
        <div>
          <p className="muted">
            Stickers cheer you on — they never change election results.
          </p>
          <div className="passport-grid">
            {STICKER_ORDER.map((sid) => {
              const got = s.stickers.includes(sid);
              const st = STICKERS[sid];
              return (
                <div key={sid} className={`sticker-slot${got ? ' got' : ''}`}>
                  <span className="sticker-face" aria-hidden="true">{got ? st.emoji : '❔'}</span>
                  <strong>{st.name}</strong>
                  <p className="muted small">{got ? 'Earned!' : st.how}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tab === 'challenges' && (
        <div>
          <p className="muted">
            Detective challenges are solved automatically while you experiment — no pressure,
            all curiosity.
          </p>
          <div className="passport-grid">
            {CHALLENGE_ORDER.map((cid) => {
              const ch = CHALLENGES[cid];
              const got = s.challenges.includes(cid);
              return (
                <div key={cid} className={`sticker-slot${got ? ' got' : ''}`}>
                  <span className="sticker-face" aria-hidden="true">{got ? ch.emoji : '❔'}</span>
                  <strong>{ch.name}</strong>
                  <p className="muted small">{ch.how}</p>
                  {got && <p className="small">💡 {ch.lesson}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PaperPanel>
  );
}
