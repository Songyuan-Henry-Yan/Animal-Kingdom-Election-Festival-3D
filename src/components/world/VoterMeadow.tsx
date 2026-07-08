import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimalModel } from '../characters/AnimalModel';
import { NameLabel, GlowRing } from '../characters/CandidateNPC';
import { VOTER_CHARACTERS } from '../../data/voters';
import { HOUSEHOLDS } from '../../data/neighborhood';
import { registerInteractable } from '../../state/registry';
import { useGame } from '../../state/store';
import { LocationSign } from './LocationSign';

const CENTER: [number, number] = [-12, -1];

function MeadowVoter({ householdId, x, z, phase }: { householdId: string; x: number; z: number; phase: number }): React.JSX.Element | null {
  const inner = useRef<THREE.Group>(null);
  const nearby = useGame((s) => s.nearby);
  const v = VOTER_CHARACTERS[householdId];
  const fam = HOUSEHOLDS.find((h) => h.id === householdId);
  const id = `voter-${householdId}`;

  useEffect(() => {
    if (!v) return undefined;
    return registerInteractable({
      id, kind: 'voter', targetId: householdId, label: `Chat with ${v.name}`, x, z, radius: 2.4,
    });
  }, [id, householdId, v, x, z]);

  useFrame(({ clock }) => {
    if (!inner.current) return;
    const reduced = useGame.getState().reducedMotion;
    inner.current.position.y = reduced ? 0 : Math.abs(Math.sin(clock.elapsedTime * 1.3 + phase)) * 0.04;
    inner.current.rotation.y = reduced ? 0 : Math.sin(clock.elapsedTime * 0.5 + phase) * 0.15;
  });

  if (!v || !fam) return null;
  return (
    <group position={[x, 0, z]} rotation={[0, Math.atan2(CENTER[0] - x, CENTER[1] - z), 0]}>
      <group ref={inner}>
        <AnimalModel species={v.species} color={v.color} accent={v.accent} />
      </group>
      <NameLabel text={`${fam.emoji} ${v.name}`} y={1.95} scale={0.8} />
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 18]} />
        <meshBasicMaterial color="#20301c" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <GlowRing active={nearby?.id === id} radius={1.0} />
    </group>
  );
}

/**
 * The Neighborhood Green: a picnic meadow where the biggest voter families of
 * TODAY'S election hang out and chat. Talk to them to learn their needs,
 * worries, and leanings before you predict any winners.
 */
export function VoterMeadow(): React.JSX.Element {
  const groups = useGame((s) => s.game.groups);
  const top = [...groups].sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <group>
      {/* picnic blankets */}
      <mesh position={[CENTER[0] + 0.6, 0.015, CENTER[1] + 0.4]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <planeGeometry args={[2.4, 1.8]} />
        <meshStandardMaterial color="#d97b8f" roughness={0.95} />
      </mesh>
      <mesh position={[CENTER[0] - 1.4, 0.015, CENTER[1] - 1.2]} rotation={[-Math.PI / 2, 0, -0.5]}>
        <planeGeometry args={[2.0, 1.6]} />
        <meshStandardMaterial color="#7ba7d9" roughness={0.95} />
      </mesh>
      {/* picnic basket + acorn pile */}
      <mesh position={[CENTER[0] + 0.5, 0.22, CENTER[1] + 0.3]}>
        <cylinderGeometry args={[0.28, 0.22, 0.3, 10]} />
        <meshStandardMaterial color="#a4713d" roughness={0.9} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[CENTER[0] - 1.3 + i * 0.16, 0.08, CENTER[1] - 1.1]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#6d4520" roughness={0.85} />
        </mesh>
      ))}

      {top.map((g, i) => {
        const a = -0.9 + (i / Math.max(1, top.length - 1)) * 1.8;
        const r = 2.9;
        return (
          <MeadowVoter
            key={g.id}
            householdId={g.id}
            x={CENTER[0] + Math.sin(a) * r}
            z={CENTER[1] + Math.cos(a) * r}
            phase={i * 1.7}
          />
        );
      })}

      <LocationSign
        id="meadow-sign"
        kind="intro"
        targetId="meadow"
        signText={'Neighborhood Green'}
        promptLabel="What is the Neighborhood Green?"
        position={[CENTER[0] + 2.6, 0, CENTER[1] + 2.6]}
        radius={2.4}
        rotationY={-0.6}
      />
    </group>
  );
}
