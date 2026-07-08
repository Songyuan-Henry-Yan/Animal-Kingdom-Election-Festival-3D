import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimalModel, type Species } from '../characters/AnimalModel';
import { NameLabel, GlowRing } from '../characters/CandidateNPC';
import { registerInteractable } from '../../state/registry';
import { useGame } from '../../state/store';

export interface VillagerDef {
  id: string;
  name: string;
  species: Species;
  color: string;
  accent: string;
  line: string;
  pos: [number, number];
}

export const VILLAGERS: VillagerDef[] = [
  {
    id: 'willow',
    name: 'Willow',
    species: 'rabbit',
    color: '#cfc4b2',
    accent: '#9b7fd4',
    line: 'I love festival season! Have you seen the counting machines? They each count the very same ballots in a different way!',
    pos: [8.5, 3.5],
  },
  {
    id: 'moss',
    name: 'Moss',
    species: 'turtle',
    color: '#7d9b6a',
    accent: '#c9b88a',
    line: 'Slow and steady... I read every promise card twice before I decide. The acorn budget only stretches so far, you know.',
    pos: [-9.5, 7],
  },
];

function Villager({ v }: { v: VillagerDef }): React.JSX.Element {
  const inner = useRef<THREE.Group>(null);
  const nearby = useGame((s) => s.nearby);
  const id = `villager-${v.id}`;

  useEffect(() => registerInteractable({
    id, kind: 'villager', targetId: v.id, label: `Chat with ${v.name}`, x: v.pos[0], z: v.pos[1], radius: 2.3,
  }), [id, v]);

  useFrame(({ clock }) => {
    if (!inner.current) return;
    const reduced = useGame.getState().reducedMotion;
    inner.current.position.y = reduced ? 0 : Math.abs(Math.sin(clock.elapsedTime * 1.4 + v.pos[0])) * 0.04;
  });

  return (
    <group position={[v.pos[0], 0, v.pos[1]]}>
      <group ref={inner}>
        <AnimalModel species={v.species} color={v.color} accent={v.accent} />
      </group>
      <NameLabel text={v.name} y={1.95} scale={0.8} />
      <GlowRing active={nearby?.id === id} radius={1.0} />
    </group>
  );
}

export function Villagers(): React.JSX.Element {
  return (
    <group>
      {VILLAGERS.map((v) => <Villager key={v.id} v={v} />)}
    </group>
  );
}
