import React, { useReducer } from 'react';
import { PaperPanel, Btn } from './common';
import { audio, type AudioSettings } from '../../lib/audio';
import { useGame } from '../../state/store';

function VolumeSlider({ label, k }: { label: string; k: 'music' | 'sfx' | 'voice' }): React.JSX.Element {
  const [, force] = useReducer((x: number) => x + 1, 0);
  const value = Math.round(audio.settings[k] * 100);
  return (
    <label className="slider-row">
      <span>{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        aria-label={`${label} volume, ${value} percent`}
        onChange={(e: { target: { value: string } }) => {
          audio.setSetting(k, Number(e.target.value) / 100);
          force();
        }}
      />
      <span className="num">{value}%</span>
    </label>
  );
}

function Toggle({ label, k, note }: { label: string; k: keyof AudioSettings; note?: string }): React.JSX.Element {
  const [, force] = useReducer((x: number) => x + 1, 0);
  const on = Boolean(audio.settings[k]);
  return (
    <div className="toggle-row">
      <Btn
        kind="plain"
        pressed={on}
        onClick={() => {
          audio.setSetting(k, !on as never);
          force();
        }}
      >
        {on ? '🔘 On' : '⚪ Off'} — {label}
      </Btn>
      {note && <p className="muted small">{note}</p>}
    </div>
  );
}

export function SettingsPanel(): React.JSX.Element {
  const teacherMode = useGame((s) => s.teacherMode);
  const setTeacherMode = useGame((s) => s.setTeacherMode);
  const reducedMotion = useGame((s) => s.reducedMotion);
  const hideLeanings = useGame((s) => s.hideLeanings);
  const setHideLeanings = useGame((s) => s.setHideLeanings);

  return (
    <PaperPanel title="⚙️ Settings">
      <h3>Audio (saved on this device)</h3>
      <VolumeSlider label="🎵 Music" k="music" />
      <VolumeSlider label="🔔 Sound effects" k="sfx" />
      <VolumeSlider label="💬 Voice sounds" k="voice" />
      <Toggle label="Mute all audio" k="muteAll" note="Everything in the game is also written as text — sound is never required." />
      <Toggle label="Captions for sounds and voices" k="captions" note="Shows lines like “Flynn Fox chirps brightly” at the bottom of the screen." />

      <h3>Classroom</h3>
      <div className="toggle-row">
        <Btn kind="plain" pressed={teacherMode} onClick={() => setTeacherMode(!teacherMode)}>
          {teacherMode ? '🔘 On' : '⚪ Off'} — 🎓 Teacher Mode
        </Btn>
        <p className="muted small">
          Adds formal voting-system names, real-world connections, longer strengths and
          weaknesses, and classroom reflection prompts. Nonpartisan note: every candidate,
          party, and event in this game is fictional; no real politicians, parties, or elections
          are referenced.
        </p>
      </div>

      <div className="toggle-row">
        <Btn kind="plain" pressed={hideLeanings} onClick={() => setHideLeanings(!hideLeanings)}>
          {hideLeanings ? '🔘 On' : '⚪ Off'} — 🤫 Hide voter leanings (for real Classroom Votes)
        </Btn>
        <p className="muted small">
          Hides the "Who are you leaning toward?" answers on the Neighborhood Green so student
          voters are not influenced before a real classroom election.
        </p>
      </div>

      <h3>Motion</h3>
      <p className="muted small">
        Your system setting “reduce motion” is {reducedMotion ? 'ON — idle bobbing, spinning machines, and pulse animations are calmed automatically.' : 'off — full cozy animations are shown. Turn it on in your device accessibility settings to calm them.'}
      </p>
    </PaperPanel>
  );
}
