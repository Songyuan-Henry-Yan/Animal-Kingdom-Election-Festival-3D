import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../state/store';
import { planCountShow, showPhase } from '../../lib/countShow';
import { SYSTEM_INFO } from '../../lib/voting';
import { CANDIDATES } from '../../data/candidates';

/**
 * Cinema bars + big friendly captions for the Count Show. Every moment of the
 * show is written on screen, so it works with the sound off, too.
 */
export function CountShowOverlay(): React.JSX.Element | null {
  const show = useGame((s) => s.countShow);
  const finish = useGame((s) => s.finishCountShow);
  const plan = useMemo(() => (show ? planCountShow(show.run, show.ballots) : null), [show]);
  const [now, setNow] = useState(() => performance.now());

  useEffect(() => {
    if (!show) return;
    const id = window.setInterval(() => setNow(performance.now()), 90);
    return () => window.clearInterval(id);
  }, [show]);

  if (!show || !plan) return null;
  const phase = showPhase(plan, now - show.startedAt);
  const total = plan.steps.length;

  let kicker = '🎭 The Count Show';
  let title = 'The candidates take the stage…';
  let sub = `${show.run.voterCount} voters · ${total} counting machine${total === 1 ? '' : 's'} · one stack of ballots`;
  let winner: string | null = null;

  if (phase.kind === 'ballots') {
    title = '📨 Every ballot flies to its FAVORITE animal';
    sub = 'Each paper lands on the pile of that voter’s first choice.';
  } else if (phase.kind === 'pause') {
    title = 'The biggest pile has the most favorites…';
    sub = '…but each machine reads the SAME ballots in its own way. Watch!';
  } else if (phase.kind === 'step') {
    const r = plan.steps[phase.index];
    const info = SYSTEM_INFO[r.systemId];
    kicker = `Machine ${phase.index + 1} of ${total}`;
    title = `${info.emoji} ${info.machineName}`;
    sub = info.rule;
    if (phase.t > 260) winner = `🎀 ${CANDIDATES[r.winnerId].emoji} ${CANDIDATES[r.winnerId].name} wins!`;
  } else if (phase.kind === 'outro') {
    kicker = '🎉 Same voters. Same ballots.';
    title = plan.distinctWinners > 1
      ? `${plan.distinctWinners} different winners!`
      : 'Every machine agreed this time!';
    sub = plan.distinctWinners > 1
      ? 'The counting rule is part of the election.'
      : 'Try switching on more machines in the Arcade — will they still agree?';
  }

  const stepNow = phase.kind === 'step' ? phase.index : phase.kind === 'outro' ? total : -1;

  return (
    <div className="count-show" role="region" aria-label="Count Show">
      <div className="cs-bar cs-top" />
      <div className="cs-bar cs-bottom" />
      <div className="cs-card" aria-live="polite">
        <div className="cs-kicker">{kicker}</div>
        <div className="cs-title">{title}</div>
        {winner && <div className="cs-winner" key={winner}>{winner}</div>}
        <div className="cs-sub">{sub}</div>
        {total > 0 && (
          <div className="cs-dots" aria-hidden="true">
            {plan.steps.map((r, i) => (
              <span
                key={r.systemId}
                className={`cs-dot${i < stepNow ? ' done' : ''}${i === stepNow ? ' now' : ''}`}
                title={SYSTEM_INFO[r.systemId].machineName}
              >
                {i <= stepNow ? CANDIDATES[r.winnerId].emoji : SYSTEM_INFO[r.systemId].emoji}
              </span>
            ))}
          </div>
        )}
      </div>
      <button type="button" className="cs-skip" onClick={() => finish()}>
        ⏭ Skip <kbd>Esc</kbd>
      </button>
    </div>
  );
}
