import React from 'react';
import { PaperPanel } from './common';
import { useGame, currentQuest } from '../../state/store';
import { playerPos } from '../../state/registry';

interface Spot {
  id: string;
  label: string;
  emoji: string;
  x: number;
  z: number;
  questId?: string;
}

export const MAP_SPOTS: Spot[] = [
  { id: 'gate', label: 'Festival Gate', emoji: '🎪', x: 0, z: 21, questId: 'gate' },
  { id: 'workshop', label: 'Election Workshop', emoji: '🛠️', x: -15.5, z: 11, questId: 'workshop' },
  { id: 'trail', label: 'Issue Trail', emoji: '🍃', x: -19.5, z: 8, questId: 'issues' },
  { id: 'green', label: 'Neighborhood Green', emoji: '🏘️', x: -10.5, z: 1 },
  { id: 'tree', label: 'Charter Tree', emoji: '📜', x: 2.5, z: 3.5 },
  { id: 'rally', label: 'Rally Stage', emoji: '🎤', x: 0, z: -14.5, questId: 'rally' },
  { id: 'news', label: 'Parrot News Stand', emoji: '📰', x: 12, z: -10.8, questId: 'news' },
  { id: 'booth', label: 'Secret Ballot Booth', emoji: '🗳️', x: 16.8, z: -2.5, questId: 'booth' },
  { id: 'arcade', label: 'Machine Arcade', emoji: '🕹️', x: 14.5, z: 4.5, questId: 'arcade' },
  { id: 'theater', label: 'Counting Theater', emoji: '🎭', x: 7, z: 13.5, questId: 'theater' },
  { id: 'campfire', label: 'Campfire Circle', emoji: '🔥', x: -6.5, z: 15, questId: 'campfire' },
];

const pct = (v: number) => `${((v + 26) / 52) * 100}%`;

/** The Festival Map: see everything, and let a firefly carry you anywhere. */
export function MapPanel(): React.JSX.Element {
  const teleportTo = useGame((s) => s.teleportTo);
  const quest = useGame((s) => currentQuest(s));
  const px = playerPos.x;
  const pz = playerPos.z;

  return (
    <PaperPanel title="🗺️ Festival Map" wide>
      <p className="muted small">
        Press a place and a friendly firefly will carry you there. The ⭐ marks your
        recommended next stop. (Press <kbd>M</kbd> any time to open this map.)
      </p>
      <div className="map-board" role="group" aria-label="Festival map — pick a destination">
        {MAP_SPOTS.map((spot) => {
          const isQuest = quest && spot.questId === quest.id;
          return (
            <button
              key={spot.id}
              type="button"
              className={`map-spot${isQuest ? ' quest' : ''}`}
              style={{ left: pct(spot.x), top: pct(spot.z) }}
              onClick={() => teleportTo(spot.x, spot.z, spot.label)}
              aria-label={`Travel to ${spot.label}${isQuest ? ' (recommended next stop)' : ''}`}
            >
              <span className="map-emoji">{spot.emoji}</span>
              <span className="map-label">{isQuest ? '⭐ ' : ''}{spot.label}</span>
            </button>
          );
        })}
        <span className="map-player" style={{ left: pct(px), top: pct(pz) }} aria-label="You are here" title="You are here">🐿️</span>
      </div>
    </PaperPanel>
  );
}
