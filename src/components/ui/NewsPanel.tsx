import React, { useEffect } from 'react';
import { EVENTS } from '../../data/events';
import { audio } from '../../lib/audio';
import { PaperPanel, Btn } from './common';
import { useGame } from '../../state/store';

export function NewsPanel(): React.JSX.Element {
  const drawnEvents = useGame((s) => s.drawnEvents);
  const drawNews = useGame((s) => s.drawNews);
  const netRole = useGame((s) => s.netRole);

  useEffect(() => {
    audio.speak('parrot', 'Squawk! Hot off the branch! Read all about it!', 'Pip the Parrot');
  }, []);

  return (
    <PaperPanel title="📰 Parrot News Stand" wide>
      <p className="dialogue-line">
        “Squawk! I am Pip, your friendly Parrot Reporter! Every festival day brings fresh forest
        news — and news changes what voters care about most!”
      </p>

      {netRole === 'guest' ? (
        <p className="notice">🌐 In an online room, your teacher draws the news — it lands on every screen at once!</p>
      ) : (
        <div className="btn-row">
          <Btn kind="leaf" onClick={drawNews}>
            🗞️ {drawnEvents.length ? "Draw Fresh News (re-simulates today's ballots)" : "Draw Today's Forest News"}
          </Btn>
        </div>
      )}

      {drawnEvents.length > 0 && (
        <>
          <div className="two-sides">
            {drawnEvents.map((id) => {
              const ev = EVENTS[id];
              return (
                <div key={id} className="side-card news-card">
                  <h4>{ev.emoji} {ev.title}</h4>
                  <p>{ev.text}</p>
                  <p><strong>Effect:</strong> {ev.effectLine}</p>
                </div>
              );
            })}
          </div>
          <p className="muted">
            These events shape <strong>Today's Festival Ballots</strong> (the 100-voter, 10-candidate
            simulation you can pick in the Counting Theater). The fixed <strong>Teaching Example</strong>
            {' '}ballots never change, so your class can always reproduce the same lesson.
          </p>
        </>
      )}
    </PaperPanel>
  );
}
