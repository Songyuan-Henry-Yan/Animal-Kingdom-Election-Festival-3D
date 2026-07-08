import React from 'react';
import { INTROS } from '../../data/intros';
import { PaperPanel } from './common';

/** Sign boards open these friendly section introductions. */
export function IntroPanel({ introId }: { introId: string }): React.JSX.Element {
  const intro = INTROS[introId] ?? INTROS.trail;
  return (
    <PaperPanel title={`${intro.emoji} ${intro.title}`}>
      <p className="dialogue-line">{intro.what}</p>
      <div className="quote-box">
        <strong>What to do here:</strong> {intro.todo}
      </div>
      <p className="muted">💡 {intro.funFact}</p>
    </PaperPanel>
  );
}
