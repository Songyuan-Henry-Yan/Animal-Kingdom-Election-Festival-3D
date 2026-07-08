import React, { useState } from 'react';
import type { NeighborhoodSettings, Polarization } from '../../types/game';
import { PaperPanel, Btn } from './common';
import { useGame } from '../../state/store';
import { MODES, POLARIZATION_INFO } from '../../data/modes';
import { HOUSEHOLDS } from '../../data/neighborhood';
import { MixerControls } from './MixerControls';
import { audio } from '../../lib/audio';

export function WorkshopPanel(): React.JSX.Element {
  const s = useGame();
  const [draft, setDraft] = useState<NeighborhoodSettings>(s.neighborhood);
  const [showNeighbors, setShowNeighbors] = useState(false);
  const [seedDraft, setSeedDraft] = useState(s.seedInput);
  const voters = s.custom.voters ?? MODES[s.mode].voters;

  return (
    <PaperPanel title="🛠️ Election Workshop" wide>
      <h3>What is an election?</h3>
      <p>
        An election is how a group makes a choice together when not everyone agrees. Every voter
        gets a fair say, and a <strong>rule</strong> decides how all those says are counted. Each
        of today's voters fills in one ballot that speaks three languages at once: a
        <strong> ranking</strong> 🍃, <strong>smile stickers</strong> 🙂, and <strong>stars</strong> ⭐.
        Different counting machines read different parts of the very same ballot.
      </p>
      <div className="quote-box">
        Same voters. Same ballots. Different voting rules. Will the same animal win?
      </div>
      <div className="btn-row">
        <Btn kind="leaf" onClick={() => s.openPanelFor('setup')}>
          🎨 Open the full Festival Setup (candidates, issues, voters…)
        </Btn>
      </div>

      <h3>🌱 Magic Election Seed</h3>
      <p className="muted small">
        The same seed always grows the exact same election — same candidates, same families, same
        ballots — so a whole classroom can compare identical elections.
      </p>
      <div className="btn-row seed-row">
        <input
          className="seed-input"
          value={seedDraft}
          aria-label="Magic Election Seed"
          onChange={(e: { target: { value: string } }) => setSeedDraft(e.target.value)}
        />
        <Btn kind="plain" onClick={() => s.setSeed(seedDraft)}>🌱 Grow this seed</Btn>
        <Btn kind="plain" onClick={() => { s.randomizeSeed(); setSeedDraft(useGame.getState().seedInput); }}>🎲 Surprise seed</Btn>
      </div>

      <h3>🍂 How strongly do voters feel?</h3>
      <div className="btn-row">
        {(Object.keys(POLARIZATION_INFO) as Polarization[]).map((p) => (
          <Btn key={p} kind="plain" pressed={s.polarization === p} onClick={() => s.setPolarization(p)}>
            {POLARIZATION_INFO[p].emoji} {POLARIZATION_INFO[p].name}
          </Btn>
        ))}
      </div>
      <p className="muted small">{POLARIZATION_INFO[s.polarization].blurb}</p>

      <h3>🏘️ Forest Neighborhood mixer</h3>
      <p className="muted small">
        Decide who lives in the forest. Different families need different things — so changing the
        neighborhood changes the election. (Meet the families in person on the Neighborhood Green!)
      </p>
      <MixerControls draft={draft} onChange={setDraft} voters={voters} seed={s.seedInput} />
      <div className="btn-row">
        <Btn kind="leaf" onClick={() => { s.applyNeighborhood(draft); audio.leafFlip(); }}>
          ✅ Apply neighborhood (re-simulates today's ballots once)
        </Btn>
        <Btn kind="plain" pressed={showNeighbors} onClick={() => setShowNeighbors(!showNeighbors)}>
          {showNeighbors ? '▾ Hide the neighbors' : '▸ Meet the neighbors'}
        </Btn>
      </div>

      {showNeighbors && (
        <div className="metric-grid">
          {HOUSEHOLDS.map((h) => (
            <div key={h.id} className="metric-card">
              <h4>{h.emoji} {h.name}</h4>
              <p className="small">{h.blurb}</p>
              <p className="muted small"><strong>They need:</strong> {h.needs}</p>
            </div>
          ))}
        </div>
      )}

      <h3>Your festival plan</h3>
      <p>
        Walk the Issue Trail 🍃, chat with voter families on the Neighborhood Green 🏘️, meet the
        candidates on the Rally Stage 🎤, check the Parrot News Stand 📰, practice (or hold a real
        Classroom Vote!) in the Secret Ballot Booth 🗳️, choose counting machines in the Arcade
        🕹️, then run the big count in the Counting Theater 🎭 and reflect at the Campfire 🔥.
      </p>
    </PaperPanel>
  );
}
