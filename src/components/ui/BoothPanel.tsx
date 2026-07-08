import React, { useState } from 'react';
import type { CandidateId } from '../../types/game';
import { CANDIDATES } from '../../data/candidates';
import { PaperPanel, Btn } from './common';
import { useGame, classroomQuickFill } from '../../state/store';

type Mode = 'ranking' | 'approval' | 'score' | 'classroom';

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

function StarPicker({ cid, value, onPick }: { cid: CandidateId; value: number; onPick: (n: number) => void }): React.JSX.Element {
  const c = CANDIDATES[cid];
  return (
    <div className="score-row">
      <span className="score-name">{c.emoji} {c.name}</span>
      <div role="group" aria-label={`Stars for ${c.name}, currently ${value}`}>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`star-btn${value === n ? ' on' : ''}`}
            aria-label={`${n} stars for ${c.name}`}
            aria-pressed={value === n}
            onClick={() => onPick(n)}
          >
            {n === 0 ? '0' : '★'.repeat(n)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** One student's private classroom ballot — resets after sealing. */
function ClassroomVote(): React.JSX.Element {
  const roster = useGame((s) => s.game.roster);
  const count = useGame((s) => s.classroomBallots.length);
  const seal = useGame((s) => s.sealClassroomBallot);
  const addBots = useGame((s) => s.addClassroomBots);
  const clear = useGame((s) => s.clearClassroom);
  const setBallotSource = useGame((s) => s.setBallotSource);
  const ballotSource = useGame((s) => s.ballotSource);
  const netStatus = useGame((s) => s.netStatus);
  const netRole = useGame((s) => s.netRole);
  const netBallotCount = useGame((s) => s.netBallotCount);
  const online = netStatus === 'online';
  const boxCount = online ? netBallotCount : count;

  const [ranking, setRanking] = useState<CandidateId[]>([]);
  const [approvals, setApprovals] = useState<CandidateId[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});

  const rank = (cid: CandidateId) => {
    setRanking(ranking.includes(cid) ? ranking.filter((x) => x !== cid) : [...ranking, cid]);
  };
  const complete = ranking.length === roster.length;

  const quickFill = () => {
    const filled = classroomQuickFill(ranking);
    setApprovals(filled.approvals);
    setScores(filled.scores);
  };

  const doSeal = () => {
    seal(ranking, approvals.length ? approvals : [ranking[0]], scores);
    setRanking([]);
    setApprovals([]);
    setScores({});
  };

  return (
    <div>
      {online ? (
        <p>
          <strong>Everyone votes from their own seat!</strong> Fill your whole secret ballot and
          press <em>Seal ballot</em> — it flies straight to the room ballot box. Sealing again
          replaces your earlier ballot, so you can change your mind.
        </p>
      ) : (
        <p>
          <strong>Students vote for real!</strong> Take turns at this screen. Fill your whole secret
          ballot, press <em>Seal ballot</em>, then pass to the next student — the form resets so
          every ballot stays private.
        </p>
      )}
      <p className="muted small">{online ? '🌐 Room ballot box' : 'Ballot box'}: <strong>{boxCount}</strong> sealed ballot{boxCount === 1 ? '' : 's'} (up to 500).</p>

      <h4>1 · Rank every candidate</h4>
      <div className="booth-grid">
        {roster.map((cid) => {
          const c = CANDIDATES[cid];
          const pos = ranking.indexOf(cid);
          return (
            <Btn key={cid} kind="plain" pressed={pos !== -1} onClick={() => rank(cid)}
              ariaLabel={pos === -1 ? `Rank ${c.name} next` : `Remove ${ORDINALS[pos]} badge from ${c.name}`}>
              <span className="badge-slot">{pos === -1 ? '·' : ORDINALS[pos]}</span> {c.emoji} {c.name}
            </Btn>
          );
        })}
      </div>

      <h4>2 · Smile stickers & stars</h4>
      <div className="btn-row">
        <Btn kind="plain" disabled={!complete} onClick={quickFill}>
          ⚡ Quick-fill stickers & stars from my ranking
        </Btn>
      </div>
      <div className="booth-grid">
        {roster.map((cid) => {
          const c = CANDIDATES[cid];
          const on = approvals.includes(cid);
          return (
            <Btn key={cid} kind="plain" pressed={on}
              onClick={() => setApprovals(on ? approvals.filter((x) => x !== cid) : [...approvals, cid])}
              ariaLabel={`${on ? 'Remove smile sticker from' : 'Give smile sticker to'} ${c.name}`}>
              <span className="badge-slot">{on ? '🙂' : '·'}</span> {c.emoji} {c.name}
            </Btn>
          );
        })}
      </div>
      <div className="score-rows">
        {roster.map((cid) => (
          <StarPicker key={cid} cid={cid} value={scores[cid] ?? 0} onPick={(n) => setScores({ ...scores, [cid]: n })} />
        ))}
      </div>

      <h4>3 · Seal it</h4>
      <div className="btn-row">
        <Btn kind="leaf" disabled={!complete} onClick={doSeal}>
          {online ? '🔒 Seal my secret ballot' : '🔒 Seal ballot & pass to the next student'}
        </Btn>
        {!complete && <span className="muted small">Rank all {roster.length} candidates first.</span>}
      </div>

      {(!online || netRole === 'host') && (
        <>
          <h4>Bot voters (optional)</h4>
          <p className="muted small">Bots copy ballots from the simulated forest animals, so a small class can still fill a big election.</p>
          <div className="btn-row">
            <Btn kind="plain" onClick={() => addBots(1)}>🤖 +1 bot</Btn>
            <Btn kind="plain" onClick={() => addBots(10)}>🤖 +10 bots</Btn>
            <Btn kind="plain" onClick={() => addBots(100)}>🤖 +100 bots</Btn>
            <Btn kind="danger" disabled={boxCount === 0} onClick={clear}>🗑️ Empty the ballot box</Btn>
          </div>
        </>
      )}

      <h4>Count these ballots</h4>
      <div className="btn-row">
        <Btn kind={ballotSource === 'classroom' ? 'leaf' : 'wood'} pressed={ballotSource === 'classroom'}
          disabled={boxCount === 0}
          onClick={() => setBallotSource('classroom')}>
          🎭 Counting Theater will count the CLASSROOM ballots
        </Btn>
      </div>
      {ballotSource === 'classroom' && (
        <p className="notice">All nine rules will re-count this same class ballot box in the Counting Theater.</p>
      )}
    </div>
  );
}

export function BoothPanel(): React.JSX.Element {
  const [mode, setMode] = useState<Mode>('ranking');
  const roster = useGame((s) => s.game.roster);
  const practice = useGame((s) => s.practice);
  const practiceRank = useGame((s) => s.practiceRank);
  const practiceClearRanking = useGame((s) => s.practiceClearRanking);
  const practiceToggleApproval = useGame((s) => s.practiceToggleApproval);
  const practiceScore = useGame((s) => s.practiceScore);

  return (
    <PaperPanel title="🗳️ Secret Ballot Booth" wide>
      <p className="notice">
        Practice ballot only. The forest's simulated ballots are already ready.
      </p>
      <p className="muted">
        Try all three ballot languages — every control works with the keyboard (Tab to move,
        Enter or Space to press). Or hold a real <strong>Classroom Vote</strong>!
      </p>

      <div className="btn-row" role="tablist" aria-label="Ballot booth modes">
        <Btn pressed={mode === 'ranking'} onClick={() => setMode('ranking')}>🍃 Ranking</Btn>
        <Btn pressed={mode === 'approval'} onClick={() => setMode('approval')}>🙂 Approval</Btn>
        <Btn pressed={mode === 'score'} onClick={() => setMode('score')}>⭐ Score</Btn>
        <Btn pressed={mode === 'classroom'} onClick={() => setMode('classroom')}>🏫 Classroom Vote</Btn>
      </div>

      {mode === 'ranking' && (
        <div>
          <p>Press a candidate to give them your <strong>next</strong> rank badge. Press again to take the badge back.</p>
          <div className="booth-grid">
            {roster.map((cid) => {
              const c = CANDIDATES[cid];
              const pos = practice.ranking.indexOf(cid);
              return (
                <Btn
                  key={cid}
                  kind="plain"
                  pressed={pos !== -1}
                  onClick={() => practiceRank(cid)}
                  ariaLabel={pos === -1 ? `Rank ${c.name} next` : `Remove ${ORDINALS[pos]} badge from ${c.name}`}
                >
                  <span className="badge-slot">{pos === -1 ? '·' : ORDINALS[pos]}</span> {c.emoji} {c.name}
                </Btn>
              );
            })}
          </div>
          <div className="btn-row">
            <Btn kind="danger" onClick={practiceClearRanking}>Clear ranking</Btn>
          </div>
        </div>
      )}

      {mode === 'approval' && (
        <div>
          <p>Give a smile sticker to every candidate you think is okay — as many or as few as you like.</p>
          <div className="booth-grid">
            {roster.map((cid) => {
              const c = CANDIDATES[cid];
              const on = practice.approvals.includes(cid);
              return (
                <Btn
                  key={cid}
                  kind="plain"
                  pressed={on}
                  onClick={() => practiceToggleApproval(cid)}
                  ariaLabel={`${on ? 'Remove smile sticker from' : 'Give smile sticker to'} ${c.name}`}
                >
                  <span className="badge-slot">{on ? '🙂' : '·'}</span> {c.emoji} {c.name}
                </Btn>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'score' && (
        <div>
          <p>Give every candidate 0 to 5 stars. Strong feelings are allowed!</p>
          <div className="score-rows">
            {roster.map((cid) => (
              <StarPicker key={cid} cid={cid} value={practice.scores[cid] ?? 0} onPick={(n) => practiceScore(cid, n)} />
            ))}
          </div>
        </div>
      )}

      {mode === 'classroom' && <ClassroomVote />}
    </PaperPanel>
  );
}
