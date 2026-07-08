import React, { useState } from 'react';
import type { CandidateId, CandidateMetrics, SystemResult } from '../../types/game';
import { CANDIDATES } from '../../data/candidates';
import { SYSTEM_INFO, COUNCIL_SEATS, runSystems } from '../../lib/voting';
import { dropCandidate } from '../../lib/whatIf';
import { MODES } from '../../data/modes';
import { PaperPanel, Btn, Stars } from './common';
import { useGame, awardSticker } from '../../state/store';
import type { SystemId } from '../../types/game';
import { printSummary } from '../../lib/print';
import { audio } from '../../lib/audio';

function name(id: CandidateId): string {
  return CANDIDATES[id].name;
}

function CountsTable({ counts, note, title }: { counts: Partial<Record<CandidateId, number>>; note?: string; title: string }): React.JSX.Element {
  const entries = (Object.entries(counts) as [CandidateId, number][]).sort((a, b) => b[1] - a[1]);
  return (
    <div className="round-block">
      <h5>{title}</h5>
      <table className="mini-table">
        <tbody>
          {entries.map(([cid, v]) => (
            <tr key={cid}>
              <td>{CANDIDATES[cid].emoji} {name(cid)}</td>
              <td className="num">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="muted small">{note}</p>}
    </div>
  );
}

function PairwiseMatrix({ r }: { r: SystemResult }): React.JSX.Element | null {
  if (!r.pairwise) return null;
  const ids = Object.keys(r.pairwise) as CandidateId[];
  const total = useGame.getState().lastRun?.voterCount ?? 100;
  return (
    <div className="round-block">
      <h5>Friendly matchup matrix (row vs column: ballots preferring the row animal)</h5>
      <table className="mini-table matrix">
        <thead>
          <tr>
            <th aria-label="candidate" />
            {ids.map((c) => <th key={c}>{CANDIDATES[c].emoji}</th>)}
          </tr>
        </thead>
        <tbody>
          {ids.map((row) => (
            <tr key={row}>
              <th>{CANDIDATES[row].emoji} {name(row)}</th>
              {ids.map((col) => {
                if (row === col) return <td key={col} className="self">—</td>;
                const v = r.pairwise![row][col];
                const win = v > (r.pairwise![col][row] ?? 0);
                return <td key={col} className={`num${win ? ' win' : ''}`}>{v}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted small">Green cells are matchup wins (more than half of {total} ballots).</p>
    </div>
  );
}

function CouncilSeats({ r }: { r: SystemResult }): React.JSX.Element | null {
  if (!r.seats) return null;
  const seated: CandidateId[] = [];
  (Object.entries(r.seats) as [CandidateId, number][])
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .forEach(([cid, n]) => {
      for (let i = 0; i < n; i++) seated.push(cid);
    });
  return (
    <div className="round-block">
      <h5>The Council Tree — {COUNCIL_SEATS} shared seats (D'Hondt method)</h5>
      <div className="council-tree" role="img" aria-label={seated.map((c) => name(c)).join(', ')}>
        {seated.map((cid, i) => (
          <span key={i} className="council-seat" style={{ background: CANDIDATES[cid].color }} title={name(cid)}>
            {CANDIDATES[cid].emoji}
          </span>
        ))}
      </div>
      <p className="muted small">Every seat is a voice. Groups must cooperate to decide.</p>
    </div>
  );
}

function ResultCard({ r, metrics, delay, simplified, predicted }: {
  r: SystemResult;
  metrics: CandidateMetrics[];
  delay: number;
  simplified: boolean;
  predicted?: CandidateId;
}): React.JSX.Element {
  const [replay, setReplay] = useState(false);
  const reduced = useGame((s) => s.reducedMotion);
  const m = metrics.find((x) => x.id === r.winnerId);
  const info = SYSTEM_INFO[r.systemId];
  return (
    <div className="result-card" style={reduced ? undefined : { animationDelay: `${delay}ms` }}>
      <div className="result-head">
        <span className="result-emoji" aria-hidden="true">{info.emoji}</span>
        <div>
          <h4>{r.systemName}</h4>
          <p className="muted small">{r.machineName}</p>
        </div>
      </div>
      <div className={`ribbon${reduced ? ' still' : ''}`}>
        🎀 Winner: {CANDIDATES[r.winnerId].emoji} {name(r.winnerId)}
      </div>
      {predicted && (
        <p className={predicted === r.winnerId ? 'predict-hit' : 'predict-miss'}>
          {predicted === r.winnerId
            ? `🎯 You predicted it! (${name(predicted)})`
            : `🔭 Your guess: ${name(predicted)} — the machine disagreed!`}
        </p>
      )}
      <p><strong>Why:</strong> {r.explanationForKids}</p>
      {r.tieNote && <p className="notice small">⚖️ {r.tieNote}</p>}
      {!simplified && m && (
        <ul className="metric-list">
          <li>💚 Favorite fans: <strong>{m.firstChoice}</strong></li>
          <li>🙂 Approval rate: <strong>{m.approvalRate}%</strong></li>
          <li>⭐ Average stars: <strong>{m.avgScore.toFixed(1)}</strong> <Stars n={m.avgScore} /></li>
        </ul>
      )}
      <p className="muted small">💪 {r.strength} · ⚖️ {r.weakness}</p>
      <Btn
        kind="plain"
        pressed={replay}
        onClick={() => {
          const next = !replay;
          setReplay(next);
          if (next) {
            audio.machineStart();
            awardSticker('resultDetective');
          }
        }}
      >
        {replay ? '▾ Hide the replay' : '▸ Replay Count (round by round)'}
      </Btn>
      {replay && (
        <div className="replay-area">
          {r.rounds.map((round, i) => (
            <CountsTable key={i} title={round.title} counts={round.counts} note={round.note} />
          ))}
          {!simplified && <PairwiseMatrix r={r} />}
          <CouncilSeats r={r} />
        </div>
      )}
    </div>
  );
}

/** The spoiler-effect lab: remove one candidate and re-count the SAME ballots. */
function WhatIfLab(): React.JSX.Element | null {
  const lastRun = useGame((s) => s.lastRun);
  const lastRunBallots = useGame((s) => s.lastRunBallots);
  const markChallenge = useGame((s) => s.markChallenge);
  const [dropped, setDropped] = useState<CandidateId | null>(null);

  if (!lastRun || !lastRunBallots) return null;
  const runners = lastRun.metrics.map((m) => m.id);
  if (runners.length <= 2) return null;

  const systems = lastRun.results.map((r) => r.systemId) as SystemId[];
  let compare: { sys: SystemId; before: CandidateId; after: CandidateId }[] | null = null;
  if (dropped) {
    const redone = runSystems(dropCandidate(lastRunBallots, dropped), systems);
    compare = lastRun.results.map((r, i) => ({
      sys: r.systemId,
      before: r.winnerId,
      after: redone[i].winnerId,
    }));
  }
  const anyChange = compare?.some((c) => c.before !== c.after) ?? false;

  return (
    <div className="whatif-box">
      <h3>👋 What if somebody waves goodbye?</h3>
      <p className="muted small">
        Pick a candidate to (pretend!) drop out. The very same ballots are counted again —
        rankings just close up the gap. Watch for winners that change: that is the famous
        <strong> spoiler effect</strong>.
      </p>
      <div className="chip-row">
        {runners.map((cid) => (
          <button
            key={cid}
            type="button"
            className={`chip-toggle${dropped === cid ? ' on' : ''}`}
            aria-pressed={dropped === cid}
            onClick={() => {
              audio.click();
              const next = dropped === cid ? null : cid;
              setDropped(next);
              if (next) {
                const redone = runSystems(dropCandidate(lastRunBallots, next), systems);
                if (lastRun.results.some((r, i) => r.winnerId !== redone[i].winnerId)) {
                  markChallenge('spoiler');
                }
              }
            }}
          >
            {CANDIDATES[cid].emoji} {name(cid)} waves goodbye
          </button>
        ))}
      </div>
      {compare && dropped && (
        <>
          <table className="mini-table">
            <thead>
              <tr><th>Machine</th><th>With {name(dropped)}</th><th>Without</th></tr>
            </thead>
            <tbody>
              {compare.map((c) => (
                <tr key={c.sys} className={c.before !== c.after ? 'flip-row' : ''}>
                  <td>{SYSTEM_INFO[c.sys].emoji} {SYSTEM_INFO[c.sys].machineName}</td>
                  <td>{CANDIDATES[c.before].emoji} {name(c.before)}</td>
                  <td>{c.before !== c.after ? '➡️ ' : ''}{CANDIDATES[c.after].emoji} {name(c.after)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={anyChange ? 'predict-hit' : 'muted small'}>
            {anyChange
              ? 'A winner changed! Nobody voted differently — one candidate simply left the race.'
              : 'No winner changed this time. Try waving goodbye to a candidate whose fans have a clear second choice!'}
          </p>
        </>
      )}
    </div>
  );
}

function PredictionPanel(): React.JSX.Element {
  const selected = useGame((s) => s.selectedSystems);
  const predictions = useGame((s) => s.predictions);
  const setPrediction = useGame((s) => s.setPrediction);
  const ballotSource = useGame((s) => s.ballotSource);
  const roster = useGame((s) => s.game.roster);
  const [open, setOpen] = useState(false);

  const pool: CandidateId[] = ballotSource === 'teaching'
    ? ['flynn', 'penny', 'olive', 'leo', 'dolly']
    : roster;
  const ordered = [...selected].sort();
  const made = ordered.filter((sys) => predictions[sys]).length;

  return (
    <div className="predict-box">
      <Btn kind="plain" pressed={open} onClick={() => setOpen(!open)}>
        🔭 Predict the winners first ({made}/{ordered.length} guesses made)
      </Btn>
      {open && (
        <div>
          <p className="muted small">Before you run the count: which animal will each rule crown? Guessing is half the fun of being a Result Detective.</p>
          {ordered.map((sys) => (
            <div key={sys} className="predict-row">
              <span className="predict-sys">{SYSTEM_INFO[sys].emoji} {SYSTEM_INFO[sys].machineName}</span>
              <span>
                {pool.map((cid) => (
                  <button
                    key={cid}
                    type="button"
                    className={`predict-chip${predictions[sys] === cid ? ' on' : ''}`}
                    aria-pressed={predictions[sys] === cid}
                    aria-label={`Predict ${name(cid)} wins ${SYSTEM_INFO[sys].name}`}
                    title={name(cid)}
                    onClick={() => setPrediction(sys, predictions[sys] === cid ? null : cid)}
                  >
                    {CANDIDATES[cid].emoji}
                  </button>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TheaterPanel(): React.JSX.Element {
  const s = useGame();
  const cfg = MODES[s.mode];
  const ordered = [...s.selectedSystems].sort();
  const classroomCount = s.netStatus === 'online' ? s.netBallotCount : s.classroomBallots.length;
  const hits = s.lastRun
    ? s.lastRun.results.filter((r) => s.predictions[r.systemId] === r.winnerId).length
    : 0;
  const guesses = s.lastRun
    ? s.lastRun.results.filter((r) => s.predictions[r.systemId]).length
    : 0;

  return (
    <PaperPanel title="🎭 Counting Theater" wide>
      <div className="quote-box big">
        Same voters. Same ballots. Different counting rules.
      </div>

      <h3>1 · Choose the ballot stack</h3>
      <div className="btn-row">
        <Btn pressed={s.ballotSource === 'teaching'} onClick={() => s.setBallotSource('teaching')}>
          📚 Teaching Example (100 voters, 5 candidates — fixed)
        </Btn>
        <Btn
          pressed={s.ballotSource === 'festival'}
          onClick={() => s.setBallotSource('festival')}
        >
          🌱 Today's Festival Ballots ({cfg.voters} voters, {s.game.roster.length} candidates, seed {s.seedInput})
        </Btn>
        <Btn
          pressed={s.ballotSource === 'classroom'}
          disabled={classroomCount === 0}
          onClick={() => s.setBallotSource('classroom')}
          title={classroomCount === 0 ? 'Seal ballots in the Secret Ballot Booth first!' : undefined}
        >
          🏫 Classroom Ballots ({classroomCount} sealed)
        </Btn>
      </div>
      {s.drawnEvents.length === 0 && s.ballotSource === 'festival' && (
        <p className="muted small">Tip: visit the Parrot News Stand — today's news reshapes how the festival voters feel.</p>
      )}

      <h3>2 · Machines switched on ({ordered.length})</h3>
      <div className="chip-row">
        {ordered.map((id) => (
          <span key={id} className="chip">{SYSTEM_INFO[id].emoji} {SYSTEM_INFO[id].machineName}</span>
        ))}
      </div>
      <p className="muted small">Switch machines on or off in the Counting Machine Arcade. {MODES[s.mode].emoji} {cfg.name} wakes {cfg.systems.length} of 9 machines — the Teaching Example button wakes them all.</p>

      <PredictionPanel />

      <h3>3 · Run the count</h3>
      <div className="btn-row">
        <Btn kind="leaf" disabled={s.running || s.netRole === 'guest'} onClick={s.runElection}>
          {s.running
            ? '⏳ The machines are counting…'
            : s.netRole === 'guest'
              ? '🌐 Your teacher runs the count for the room'
              : '▶ Run the Same Ballots'}
        </Btn>
        {s.lastRun && <Btn kind="plain" onClick={printSummary}>🖨️ Print Summary</Btn>}
      </div>

      {s.lastRun && !s.running && (
        <div className="results-area">
          <p className="muted">
            Counted: <strong>{s.lastRun.source === 'teaching' ? 'Teaching Example' : s.lastRun.source === 'classroom' ? 'Classroom Ballots' : "Today's Festival Ballots"}</strong>
            {' '}· {s.lastRun.voterCount} voters · seed {s.lastRun.seedLabel}
            {' '}· one shared ballot stack went through every machine.
          </p>

          {guesses > 0 && (
            <p className="notice">🔭 Predictions: you called <strong>{hits} of {guesses}</strong> machines right!</p>
          )}

          {s.lastRun.differentWinners ? (
            <div className="notice celebrate">
              Look what happened! The voters stayed the same, and the ballots stayed the same,
              but different voting rules chose different winners.
            </div>
          ) : (
            <div className="notice">
              This time, every selected rule agreed on the winner. Try switching on more machines
              in the Arcade — will they still agree?
            </div>
          )}

          <p className="values-note">
            This does not mean one voting rule is always best. Different rules reward different
            democratic values: simplicity, majority support, broad acceptability, strong feelings,
            compromise, or representation.
          </p>

          <div className="result-grid">
            {s.lastRun.results.map((r, i) => (
              <ResultCard
                key={r.systemId}
                r={r}
                metrics={s.lastRun!.metrics}
                delay={i * 240}
                simplified={cfg.simplifiedResults}
                predicted={s.predictions[r.systemId]}
              />
            ))}
          </div>

          {!cfg.simplifiedResults && (
            <>
              <h3>Candidate scoreboard (same ballots, every number)</h3>
              <div className="metric-grid">
                {s.lastRun.metrics.map((m) => (
                  <div key={m.id} className="metric-card">
                    <h4>{CANDIDATES[m.id].emoji} {name(m.id)}</h4>
                    <ul className="metric-list">
                      <li>💚 Favorite fans: <strong>{m.firstChoice}</strong></li>
                      <li>🙂 Animals who say okay: <strong>{m.approvals}</strong> ({m.approvalRate}%)</li>
                      <li>⭐ Average stars: <strong>{m.avgScore.toFixed(1)}</strong></li>
                      <li>🤝 Friendly matchup wins: <strong>{m.matchupWins}</strong></li>
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}

          <WhatIfLab />

          {s.teacherMode && s.lastRun.source === 'teaching' && (
            <div className="teacher-box">
              <strong>🎓 Teacher note:</strong> On the Teaching Example, expect —
              Acorn Basket → Flynn Fox; Two Bridge → Penny Panda; Leaf Transfer (IRV) → Olive Owl;
              Ranking Ladder (Borda), Matchup Arena (Condorcet), Smile Sticker (Approval),
              Star Jar (Score) and Star + Bridge (STAR) → Dolly Dolphin; Council Tree (D'Hondt) →
              a shared council (Flynn 2, Penny 2, Olive 1, Leo 1, Dolly 1 — the largest voice
              decided by the tie-break chain). Five rules, four different "winners" — from identical ballots.
            </div>
          )}
        </div>
      )}
    </PaperPanel>
  );
}
