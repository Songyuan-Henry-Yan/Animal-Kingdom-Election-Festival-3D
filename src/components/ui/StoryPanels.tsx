import React, { useEffect, useMemo } from 'react';
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

  return (
    <PaperPanel title="🎪 Welcome to the Animal Kingdom Election Festival!" wide>
      <p>
        Hello, <strong>Junior Forest Helper</strong>! Tonight the forest chooses its next
        <strong> Festival Leader</strong>. Friendly animal candidates are running, the forest
        voters are filling out their ballots, and the famous counting machines are polished
        and ready.
      </p>
      <div className="quote-box big">
        Same voters. Same ballots. Different voting rules.<br />Will the same animal win?
      </div>

      <h3>Pick your age mode</h3>
      <div className="mode-grid">
        {MODE_ORDER.map((m) => {
          const cfg = MODES[m];
          return (
            <button
              key={m}
              type="button"
              className={`mode-card${mode === m ? ' active' : ''}`}
              aria-pressed={mode === m}
              onMouseEnter={() => audio.hoverTick()}
              onClick={() => setMode(m)}
            >
              <span className="mode-emoji">{cfg.emoji}</span>
              <strong>{cfg.name}</strong>
              <span className="muted small">{cfg.ages}</span>
              <span className="small">{cfg.blurb}</span>
            </button>
          );
        })}
      </div>

      <div className="btn-row">
        <Btn kind="wood" onClick={() => openPanelFor('setup')}>
          🎨 Festival Setup — pick candidates, issues, voters & families
        </Btn>
        <Btn kind="plain" onClick={loadTeachingExample}>
          📚 Load the Teaching Example (100 fixed voters, all 9 machines)
        </Btn>
      </div>
      <p className="muted small">
        The Teaching Example works in every age mode and reliably shows different rules crowning
        different winners. Today's festival election grows from Magic Seed <strong>{seedInput}</strong>
        {' '}— change it in the Election Workshop.
      </p>

      <h3>How to play</h3>
      <p>
        Walk with <kbd>WASD</kbd> or the arrow keys. Drag the mouse to look around. When you see a
        glowing ring, press <kbd>E</kbd> to interact. Press <kbd>Space</kbd> to hop (you can jump right onto the Rally Stage!), <kbd>F</kbd> to
        wave hello, <kbd>Tab</kbd> for your Civic Notebook, and <kbd>Esc</kbd> to close any panel.
        Everything important is always written down — sound is just for coziness.
      </p>
      <div className="btn-row">
        <Btn kind="leaf" onClick={closePanel}>✨ Okay, let's explore the festival!</Btn>
      </div>
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
