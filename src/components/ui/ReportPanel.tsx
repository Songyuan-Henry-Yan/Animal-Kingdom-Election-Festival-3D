import React from 'react';
import { PaperPanel, Btn } from './common';
import { useGame, issuesInPlay } from '../../state/store';
import { CANDIDATES } from '../../data/candidates';
import { SYSTEM_INFO } from '../../lib/voting';
import { CHALLENGE_ORDER } from '../../data/challenges';
import { printSummary } from '../../lib/print';

/** The Festival Report Card — a cozy celebration when the whole loop is complete. */
export function ReportPanel(): React.JSX.Element {
  const s = useGame();
  const reduced = s.reducedMotion;
  const run = s.lastRun;
  const guesses = run ? run.results.filter((r) => s.predictions[r.systemId]).length : 0;
  const hits = run ? run.results.filter((r) => s.predictions[r.systemId] === r.winnerId).length : 0;
  const issueTotal = issuesInPlay(s).length;

  return (
    <PaperPanel title="🎓 Your Festival Report Card" wide>
      {!reduced && (
        <div className="confetti" aria-hidden="true">
          {['🎉', '🍃', '⭐', '🌰', '🎀', '🍂', '✨', '🎊', '🍃', '⭐', '🌰', '✨'].map((c, i) => (
            <span key={i} style={{ left: `${6 + i * 8}%`, animationDelay: `${(i % 5) * 0.35}s` }}>{c}</span>
          ))}
        </div>
      )}
      <p className="dialogue-line">
        Junior Forest Helper, you did it! You walked the whole festival, listened to voters and
        candidates, and watched the counting machines work their magic. The forest is proud of you. 🌲
      </p>

      <div className="metric-grid">
        <div className="metric-card">
          <h4>🛂 Passport</h4>
          <p><strong>{s.stickers.length} of 8</strong> stickers earned</p>
        </div>
        <div className="metric-card">
          <h4>🏆 Challenges</h4>
          <p><strong>{s.challenges.length} of {CHALLENGE_ORDER.length}</strong> detective challenges solved</p>
        </div>
        <div className="metric-card">
          <h4>🔭 Predictions</h4>
          <p>{guesses > 0 ? <><strong>{hits} of {guesses}</strong> machines called correctly</> : 'No guesses yet — try the prediction panel!'}</p>
        </div>
        <div className="metric-card">
          <h4>🏘️ Voters interviewed</h4>
          <p><strong>{s.votersMet.length} of 5</strong> families on the Green</p>
        </div>
        <div className="metric-card">
          <h4>🍃 Issues read</h4>
          <p><strong>{Math.min(s.issuesRead.length, issueTotal)} of {issueTotal}</strong> issue leaves</p>
        </div>
        <div className="metric-card">
          <h4>🎤 Candidates met</h4>
          <p><strong>{s.candidatesMet.length}</strong> friendly animals</p>
        </div>
      </div>

      {run && (
        <>
          <h3>Your final count</h3>
          <ul className="note-list">
            {run.results.map((r) => (
              <li key={r.systemId}>
                <strong>{SYSTEM_INFO[r.systemId].emoji} {r.machineName}</strong> →
                {' '}🎀 {CANDIDATES[r.winnerId].emoji} {CANDIDATES[r.winnerId].name}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="quote-box big">
        Voting rules shape results. Good citizens ask how the rules work — and now YOU know how.
      </div>

      <div className="btn-row">
        <Btn kind="leaf" onClick={s.closePanel}>🌟 Keep exploring the festival!</Btn>
        <Btn kind="plain" onClick={printSummary}>🖨️ Print my summary</Btn>
      </div>
      <p className="muted small">
        Ideas to keep playing: solve the remaining 🏆 challenges, try a new 🌱 seed, remix the
        🏘️ neighborhood, or hold a real 🏫 Classroom Vote.
      </p>
    </PaperPanel>
  );
}
