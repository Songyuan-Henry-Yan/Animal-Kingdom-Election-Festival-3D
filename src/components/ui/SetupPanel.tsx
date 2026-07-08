import React, { useState } from 'react';
import type { CandidateId, IssueId, NeighborhoodSettings, Polarization } from '../../types/game';
import { PaperPanel, Btn } from './common';
import { useGame } from '../../state/store';
import { MODES, MODE_ORDER, POLARIZATION_INFO } from '../../data/modes';
import { CANDIDATES, CANDIDATE_ORDER } from '../../data/candidates';
import { ISSUES, ISSUE_ORDER } from '../../data/issues';
import { MixerControls } from './MixerControls';
import { audio } from '../../lib/audio';
import { encodeShareCode, decodeShareCode } from '../../lib/shareCode';

/**
 * The Festival Setup wizard — design your whole election before you play:
 * age mode, magic seed, WHO runs, WHICH issues are on the trail, HOW MANY
 * voters, what kinds of families live in the forest (age / wealth / roots /
 * occupation dials), and how strongly everyone feels.
 */
export function SetupPanel(): React.JSX.Element {
  const s = useGame();
  const cfg = MODES[s.mode];
  const [roster, setRoster] = useState<CandidateId[] | null>(s.custom.roster);
  const [issues, setIssues] = useState<IssueId[] | null>(s.custom.issues);
  const [voters, setVoters] = useState<number | null>(s.custom.voters);
  const [hood, setHood] = useState<NeighborhoodSettings>(s.neighborhood);
  const [seedDraft, setSeedDraft] = useState(s.seedInput);
  const [friendCode, setFriendCode] = useState('');

  const toggleCandidate = (cid: CandidateId) => {
    audio.click();
    const base = roster ?? s.game.roster;
    const next = base.includes(cid) ? base.filter((x) => x !== cid) : [...base, cid];
    setRoster(next);
  };
  const toggleIssue = (iid: IssueId) => {
    audio.click();
    const base = issues ?? ISSUE_ORDER.slice(0, cfg.issues);
    const next = base.includes(iid) ? base.filter((x) => x !== iid) : [...base, iid];
    setIssues(next);
  };

  const rosterShown = roster ?? s.game.roster;
  const issuesShown = issues ?? ISSUE_ORDER.slice(0, cfg.issues);
  const rosterOk = rosterShown.length >= 2;
  const issuesOk = issuesShown.length >= 2;

  const start = () => {
    if (seedDraft.trim() !== s.seedInput) s.setSeed(seedDraft);
    s.applyNeighborhood(hood);
    s.setCustom({ roster, issues, voters });
    audio.resultRibbon();
    s.closePanel();
  };

  return (
    <PaperPanel title="🎨 Festival Setup — design your election!" wide>
      <p className="muted">
        Everything here is optional — the seed happily picks for you. Change anything, press
        Start, and the whole forest regrows around your choices.
      </p>

      <h3>1 · Age mode</h3>
      <div className="mode-grid">
        {MODE_ORDER.map((m) => {
          const mc = MODES[m];
          return (
            <button
              key={m}
              type="button"
              className={`mode-card${s.mode === m ? ' active' : ''}`}
              aria-pressed={s.mode === m}
              onMouseEnter={() => audio.hoverTick()}
              onClick={() => s.setMode(m)}
            >
              <span className="mode-emoji">{mc.emoji}</span>
              <strong>{mc.name}</strong>
              <span className="muted small">{mc.ages}</span>
              <span className="small">{mc.blurb}</span>
            </button>
          );
        })}
      </div>

      <h3>2 · Magic Election Seed</h3>
      <div className="btn-row seed-row">
        <input
          className="seed-input"
          value={seedDraft}
          aria-label="Magic Election Seed"
          onChange={(e: { target: { value: string } }) => setSeedDraft(e.target.value)}
        />
        <Btn kind="plain" onClick={() => { s.randomizeSeed(); setSeedDraft(useGame.getState().seedInput); }}>🎲 Surprise seed</Btn>
      </div>

      <h3>3 · Who runs today? <span className="muted small">({rosterShown.length} candidates{roster ? ', your picks' : ', seed picks'})</span></h3>
      <div className="chip-row">
        {CANDIDATE_ORDER.map((cid) => {
          const c = CANDIDATES[cid];
          const on = rosterShown.includes(cid);
          return (
            <button
              key={cid}
              type="button"
              className={`chip-toggle${on ? ' on' : ''}`}
              aria-pressed={on}
              onClick={() => toggleCandidate(cid)}
            >
              {c.emoji} {c.name}
            </button>
          );
        })}
      </div>
      <div className="btn-row">
        <Btn kind="plain" onClick={() => { audio.click(); setRoster(null); }}>🎲 Let the seed pick {cfg.candidates}</Btn>
        {!rosterOk && <span className="notice small">Pick at least 2 candidates!</span>}
      </div>

      <h3>4 · Which issues are on the trail? <span className="muted small">({issuesShown.length} issues{issues ? ', your picks' : ', mode default'})</span></h3>
      <div className="chip-row">
        {ISSUE_ORDER.map((iid) => {
          const issue = ISSUES[iid];
          const on = issuesShown.includes(iid);
          return (
            <button
              key={iid}
              type="button"
              className={`chip-toggle${on ? ' on' : ''}`}
              aria-pressed={on}
              onClick={() => toggleIssue(iid)}
            >
              {issue.emoji} {issue.title}
            </button>
          );
        })}
      </div>
      <div className="btn-row">
        <Btn kind="plain" onClick={() => { audio.click(); setIssues(null); }}>🎲 Mode default ({cfg.issues})</Btn>
        {!issuesOk && <span className="notice small">Pick at least 2 issues!</span>}
      </div>

      <h3>5 · How many voters?</h3>
      <label className="slider-row">
        <span>Voters</span>
        <span className="muted small">20</span>
        <input
          type="range"
          min={20}
          max={200}
          step={10}
          value={voters ?? cfg.voters}
          aria-label={`Number of voters, currently ${voters ?? cfg.voters}`}
          onChange={(e: { target: { value: string } }) => setVoters(Number(e.target.value))}
        />
        <span className="muted small">200</span>
        <span className="num"><strong>{voters ?? cfg.voters}</strong></span>
      </label>
      <div className="btn-row">
        <Btn kind="plain" onClick={() => { audio.click(); setVoters(null); }}>🎲 Mode default ({cfg.voters})</Btn>
      </div>

      <h3>6 · Who lives in the forest? <span className="muted small">(ages · wealth · roots · jobs)</span></h3>
      <MixerControls draft={hood} onChange={setHood} voters={voters ?? cfg.voters} seed={seedDraft} />

      <h3>7 · How strongly do voters feel?</h3>
      <div className="btn-row">
        {(Object.keys(POLARIZATION_INFO) as Polarization[]).map((p) => (
          <Btn key={p} kind="plain" pressed={s.polarization === p} onClick={() => s.setPolarization(p)}>
            {POLARIZATION_INFO[p].emoji} {POLARIZATION_INFO[p].name}
          </Btn>
        ))}
      </div>
      <p className="muted small">{POLARIZATION_INFO[s.polarization].blurb}</p>

      <div className="btn-row">
        <Btn kind="leaf" disabled={!rosterOk || !issuesOk} onClick={start}>
          🎉 Start the Festival with these settings!
        </Btn>
        <Btn kind="danger" onClick={() => { s.resetCustom(); setRoster(null); setIssues(null); setVoters(null); }}>
          ↩️ Reset to mode defaults
        </Btn>
      </div>
      <p className="muted small">
        The Teaching Example is never affected by setup — it always keeps its fixed 100 voters
        and 5 candidates, so the classroom lesson stays reproducible.
      </p>

      <h3>🤝 Share this election</h3>
      <p className="muted small">
        Copy a share code and send it to a friend (or write it on the board) — pasting it grows
        the EXACT same election on their computer. No internet needed.
      </p>
      <div className="btn-row">
        <Btn
          kind="plain"
          onClick={() => {
            const code = encodeShareCode({
              seed: s.seedInput, mode: s.mode, polarization: s.polarization,
              hood: s.neighborhood, custom: s.custom,
            });
            if (navigator.clipboard?.writeText) {
              void navigator.clipboard.writeText(code);
              s.setCaption('📋 Share code copied! Send it to a friend.');
            } else {
              window.prompt('Copy your share code:', code);
            }
          }}
        >
          📋 Copy my share code
        </Btn>
      </div>
      <div className="btn-row seed-row">
        <input
          className="seed-input wide-input"
          value={friendCode}
          placeholder="Paste a friend's code here…"
          aria-label="Paste a share code"
          onChange={(e: { target: { value: string } }) => setFriendCode(e.target.value)}
        />
        <Btn
          kind="leaf"
          disabled={friendCode.trim().length < 8}
          onClick={() => {
            const shared = decodeShareCode(friendCode);
            if (shared) {
              s.applySharedSetup(shared);
              setFriendCode('');
              setSeedDraft(shared.seed);
              setRoster(shared.custom.roster);
              setIssues(shared.custom.issues);
              setVoters(shared.custom.voters);
              setHood(shared.hood);
            } else {
              s.setCaption('🤔 That code did not sprout — check for missing letters and try again.');
            }
          }}
        >
          🌱 Plant friend's code
        </Btn>
      </div>
    </PaperPanel>
  );
}
