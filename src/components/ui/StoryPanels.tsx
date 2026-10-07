import React, { useEffect, useMemo, useRef } from 'react';
import { PaperPanel, Btn } from './common';
import { audio } from '../../lib/audio';
import { VILLAGERS } from '../world/Villagers';
import { WANDERERS } from '../../data/wanderers';
import { MODES, MODE_ORDER } from '../../data/modes';
import { useGame } from '../../state/store';

export function GatePanel(): React.JSX.Element {
  const mode = useGame((s) => s.mode);
  const setMode = useGame((s) => s.setMode);
  const loadTeachingExample = useGame((s) => s.loadTeachingExample);
  const seedInput = useGame((s) => s.seedInput);
  const closePanel = useGame((s) => s.closePanel);
  const openPanelFor = useGame((s) => s.openPanelFor);
  const startRef = useRef<HTMLButtonElement>(null);
  const cfg = MODES[mode];

  // Put focus on the big button so Enter starts the festival right away.
  useEffect(() => {
    const id = window.setTimeout(() => startRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <PaperPanel title="🎪 Welcome to the Animal Kingdom Election Festival!" wide>
      <p className="gate-hello">
        Hello, <strong>Junior Forest Helper</strong>! Tonight the forest picks its next
        <strong> Festival Leader</strong> — and you get to see how the votes are counted.
      </p>
      <div className="quote-box big">
        Same voters. Same ballots. Different voting rules.<br />Will the same animal win?
      </div>

      <div className="start-wrap">
        <button
          ref={startRef}
          type="button"
          className="big-start"
          onMouseEnter={() => audio.hoverTick()}
          onClick={() => {
            audio.click();
            closePanel();
          }}
        >
          ▶ Start the Festival!
        </button>
        <p className="muted small">A friendly firefly ✨ will float ahead and show you where to go.</p>
      </div>

      <div className="key-strip" aria-label="How to move">
        <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> walk</span>
        <span><kbd>Space</kbd> hop</span>
        <span><kbd>E</kbd> talk &amp; use</span>
        <span><kbd>M</kbd> map</span>
        <span><kbd>F</kbd> wave</span>
        <span><kbd>Esc</kbd> close</span>
      </div>

      <details className="grownups">
        <summary>🧑‍🏫 For teachers &amp; grown-ups — age mode, festival setup, Teaching Example</summary>
        <p className="muted small">
          Playing now: {cfg.emoji} <strong>{cfg.name}</strong> ({cfg.ages}). Pick a different age
          mode any time:
        </p>
        <div className="mode-grid">
          {MODE_ORDER.map((m) => {
            const c = MODES[m];
            return (
              <button
                key={m}
                type="button"
                className={`mode-card${mode === m ? ' active' : ''}`}
                aria-pressed={mode === m}
                onMouseEnter={() => audio.hoverTick()}
                onClick={() => setMode(m)}
              >
                <span className="mode-emoji">{c.emoji}</span>
                <strong>{c.name}</strong>
                <span className="muted small">{c.ages}</span>
                <span className="small">{c.blurb}</span>
              </button>
            );
          })}
        </div>
        <div className="btn-row">
          <Btn kind="wood" onClick={() => openPanelFor('setup')}>
            🎨 Festival Setup — pick candidates, issues, voters &amp; families
          </Btn>
          <Btn kind="plain" onClick={loadTeachingExample}>
            📚 Load the Teaching Example (100 fixed voters, all 9 machines)
          </Btn>
        </div>
        <p className="muted small">
          The Teaching Example works in every age mode and reliably shows different rules crowning
          different winners. Today's festival election grows from Magic Seed <strong>{seedInput}</strong>
          {' '}— change it in the Election Workshop. Sound is optional: everything important is
          also written on screen.
        </p>
      </details>
    </PaperPanel>
  );
}

export const CHARTER_LINES = [
  'No animal can be banned from school just because of what kind of animal they are.',
  'No group of animals can have all of their snacks taken away.',
  'Candidates cannot threaten voters.',
  'Ballots should be private.',
  'The voting rule must be explained before the election.',
  'News animals can share opinions, but facts should be checked.',
  'A candidate who loses can try again next time.',
  'The majority can make choices, but it cannot erase basic safety for smaller groups.',
];

export function CharterPanel({ teacherMode }: { teacherMode: boolean }): React.JSX.Element {
  return (
    <PaperPanel title="📜 The Forest Charter">
      <p className="muted">In our forest democracy:</p>
      <ol className="charter-list">
        {CHARTER_LINES.map((line, i) => <li key={i}>{line}</li>)}
      </ol>
      <p>
        The Charter is the forest's promise to itself. Elections decide <em>who leads</em>,
        but the Charter protects what <em>no election is allowed to take away</em>.
      </p>
      {teacherMode && (
        <div className="teacher-box">
          <strong>🎓 Teacher note:</strong> This models constitutional limits and minority
          protections — courts, rights charters, and rule-of-law traditions in real democracies.
          Ask: which charter rule protects voters? Which protects candidates? Which protects
          smaller groups from the majority?
        </div>
      )}
    </PaperPanel>
  );
}

export function VillagerPanel({ villagerId }: { villagerId: string }): React.JSX.Element {
  const v = VILLAGERS.find((x) => x.id === villagerId) ?? VILLAGERS[0];
  useEffect(() => {
    audio.speak('villager', v.line, v.name);
  }, [v]);
  return (
    <PaperPanel title={`💬 ${v.name}`}>
      <p className="dialogue-line">“{v.line}”</p>
    </PaperPanel>
  );
}

export function WandererPanel({ wandererId }: { wandererId: string }): React.JSX.Element {
  const w = WANDERERS.find((x) => x.id === wandererId) ?? WANDERERS[0];
  // Pick one of this character's lines fresh each time you strike up a chat.
  const line = useMemo(() => w.lines[Math.floor(Math.random() * w.lines.length)], [w]);
  useEffect(() => {
    audio.speak('villager', line, w.name);
  }, [line, w]);
  return (
    <PaperPanel title={`💬 ${w.name}`}>
      <p className="dialogue-line">“{line}”</p>
    </PaperPanel>
  );
}
