import React, { useState } from 'react';
import { REFLECTION_QUESTIONS } from '../../data/reflection';
import { PaperPanel, Btn } from './common';
import { useGame } from '../../state/store';
import { printSummary } from '../../lib/print';
import { audio } from '../../lib/audio';
import { mulberry32 } from '../../lib/random';

export function CampfirePanel(): React.JSX.Element {
  const flipped = useGame((s) => s.reflectionsFlipped);
  const markFlipped = useGame((s) => s.markReflectionFlipped);
  const teacherMode = useGame((s) => s.teacherMode);
  const lastRun = useGame((s) => s.lastRun);
  const [acornPick, setAcornPick] = useState<number | null>(null);

  const passTheAcorn = () => {
    const rng = mulberry32(Date.now() >>> 0);
    let next = Math.floor(rng() * REFLECTION_QUESTIONS.length);
    if (next === acornPick) next = (next + 1) % REFLECTION_QUESTIONS.length;
    audio.passAcorn();
    setAcornPick(next);
    markFlipped(next);
  };

  return (
    <PaperPanel title="🔥 Campfire Reflection Circle" wide>
      <p>
        The fire crackles softly. {lastRun ? 'The candidates rest side by side — rivals on stage, friends at the fire.' : 'Come back after the Counting Theater for the coziest talk of the night.'}
        {' '}Flip a log-card and think it over. There are no wrong answers here.
      </p>
      {teacherMode && (
        <div className="btn-row">
          <Btn kind="leaf" onClick={passTheAcorn}>
            🌰 Pass the Acorn — random discussion question
          </Btn>
          <span className="muted small">Whoever holds the acorn answers first!</span>
        </div>
      )}
      <div className="reflection-grid">
        {REFLECTION_QUESTIONS.map((rq, i) => {
          const open = flipped.includes(i);
          const spotlight = acornPick === i;
          return (
            <div key={i} className={`reflect-card${open ? ' open' : ''}${spotlight ? ' acorn' : ''}`}>
              <p className="reflect-q">{spotlight ? '🌰' : '🪵'} {rq.q}</p>
              {open ? (
                <>
                  <p className="reflect-a">{rq.a}</p>
                  {teacherMode && rq.teacher && (
                    <p className="teacher-inline">🎓 {rq.teacher}</p>
                  )}
                </>
              ) : (
                <Btn
                  kind="plain"
                  onClick={() => {
                    audio.leafFlip();
                    markFlipped(i);
                  }}
                >
                  Flip the card
                </Btn>
              )}
            </div>
          );
        })}
      </div>
      <div className="quote-box big">
        Voting rules shape results. Good citizens ask how the rules work.
      </div>
      <div className="btn-row">
        <Btn kind="plain" onClick={printSummary}>🖨️ Print Summary</Btn>
      </div>
    </PaperPanel>
  );
}
