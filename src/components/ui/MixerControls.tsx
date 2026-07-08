import React from 'react';
import type { NeighborhoodSettings } from '../../types/game';
import { Btn } from './common';
import { HOUSEHOLDS, computeNeighborhood } from '../../data/neighborhood';

function Slider({ label, low, high, value, onChange }: {
  label: string; low: string; high: string; value: number; onChange: (v: number) => void;
}): React.JSX.Element {
  return (
    <label className="slider-row">
      <span>{label}</span>
      <span className="muted small">{low}</span>
      <input
        type="range"
        min={0}
        max={100}
        step={10}
        value={value}
        aria-label={`${label}: 0 means ${low}, 100 means ${high}. Currently ${value}.`}
        onChange={(e: { target: { value: string } }) => onChange(Number(e.target.value))}
      />
      <span className="muted small">{high}</span>
    </label>
  );
}

/**
 * The Forest Neighborhood mixer: who lives in the forest?
 * Age, wealth (pantry), roots, and occupation dials — shared by the
 * Election Workshop and the Festival Setup wizard.
 */
export function MixerControls({ draft, onChange, voters, seed }: {
  draft: NeighborhoodSettings;
  onChange: (n: NeighborhoodSettings) => void;
  voters: number;
  seed: string;
}): React.JSX.Element {
  const preview = computeNeighborhood(draft, seed, voters);
  const maxCount = Math.max(...preview.map((p) => p.count), 1);

  return (
    <div>
      <div className="btn-row">
        <Btn kind="plain" pressed={draft.mixMode === 'surprise'} onClick={() => onChange({ ...draft, mixMode: 'surprise' })}>
          🎲 Surprise mix (the seed sizes the families)
        </Btn>
        <Btn kind="plain" pressed={draft.mixMode === 'custom'} onClick={() => onChange({ ...draft, mixMode: 'custom' })}>
          🎨 Design the neighborhood
        </Btn>
      </div>

      {draft.mixMode === 'custom' && (
        <div className="mixer-box">
          <Slider label="Ages" low="young cubs" high="wise elders" value={draft.ages} onChange={(v) => onChange({ ...draft, ages: v })} />
          <Slider label="Pantry (wealth)" low="nearly empty" high="full shelves" value={draft.pantry} onChange={(v) => onChange({ ...draft, pantry: v })} />
          <Slider label="Forest roots" low="long-time families" high="new families" value={draft.roots} onChange={(v) => onChange({ ...draft, roots: v })} />
          <div className="btn-row">
            <span className="muted small">Extra-common jobs:</span>
            <Btn kind="plain" pressed={draft.jobs === 'balanced'} onClick={() => onChange({ ...draft, jobs: 'balanced' })}>⚖️ Balanced</Btn>
            <Btn kind="plain" pressed={draft.jobs === 'builders'} onClick={() => onChange({ ...draft, jobs: 'builders' })}>🔨 Builders & Traders</Btn>
            <Btn kind="plain" pressed={draft.jobs === 'helpers'} onClick={() => onChange({ ...draft, jobs: 'helpers' })}>🤗 Helpers & Caretakers</Btn>
            <Btn kind="plain" pressed={draft.jobs === 'facts'} onClick={() => onChange({ ...draft, jobs: 'facts' })}>🔎 Fact-Checkers & Nature Watchers</Btn>
          </div>
        </div>
      )}

      <h4>Live preview — {voters} voters</h4>
      <div className="hood-preview">
        {preview.map((p) => {
          const fam = HOUSEHOLDS.find((h) => h.id === p.id)!;
          return (
            <div key={p.id} className="hood-row">
              <span className="hood-name">{fam.emoji} {fam.name}</span>
              <span className="hood-bar-track">
                <span className="hood-bar" style={{ width: `${(p.count / maxCount) * 100}%` }} />
              </span>
              <span className="num">{p.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
