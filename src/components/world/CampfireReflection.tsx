import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CANDIDATES } from '../../data/candidates';
import { CandidateNPC } from '../characters/CandidateNPC';
import { useGame } from '../../state/store';
import { LocationSign } from './LocationSign';

export function CampfireReflection(): React.JSX.Element {
  const flame = useRef<THREE.Group>(null);
  const done = useGame((s) => s.lastRun !== null);
  const roster = useGame((s) => s.game.roster);

  useFrame(({ clock }) => {
    if (!flame.current) return;
    const reduced = useGame.getState().reducedMotion;
    if (reduced) {
      flame.current.scale.setScalar(1);
      return;
    }
    const t = clock.elapsedTime;
    flame.current.scale.set(
      1 + Math.sin(t * 9) * 0.08,
      1 + Math.sin(t * 12.3) * 0.16,
      1 + Math.cos(t * 10.1) * 0.08,
    );
  });

  return (
    <group position={[-8, 0, 17]}>
      {/* stone ring + logs */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.95, 0.12, Math.sin(a) * 0.95]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial color="#9aa3b0" roughness={1} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.14, 0]} rotation={[0, 0.5, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 1.1, 8]} />
        <meshStandardMaterial color="#5f3c1e" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0.4, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 1.1, 8]} />
        <meshStandardMaterial color="#6d4520" roughness={0.95} />
      </mesh>
      {/* flames */}
      <group ref={flame} position={[0, 0.28, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <coneGeometry args={[0.3, 0.7, 8]} />
          <meshStandardMaterial color="#f2842f" emissive="#c9531a" emissiveIntensity={1.1} />
        </mesh>
        <mesh position={[0.08, 0.42, 0.04]}>
          <coneGeometry args={[0.15, 0.45, 8]} />
          <meshStandardMaterial color="#ffd94f" emissive="#e8a52a" emissiveIntensity={1.2} />
        </mesh>
      </group>
      <pointLight position={[0, 1, 0]} color="#ffb45e" intensity={done ? 14 : 8} distance={9} decay={2} />

      {/* sitting logs for visitors */}
      {[[-2.2, 1.4, 0.6], [2.3, 1.2, -0.5], [0.4, 2.6, 0.1]].map(([x, z, ry], i) => (
        <mesh key={i} position={[x, 0.2, z]} rotation={[0, ry, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 1.5, 10]} />
          <meshStandardMaterial color="#7a5230" roughness={0.95} />
        </mesh>
      ))}

      {/* after the count, today's candidates rest here together */}
      {done && roster.map((cid, i) => {
        const a = -0.4 + (i / Math.max(1, roster.length - 1)) * (Math.PI + 0.8);
        const r = 3.3;
        return (
          <CandidateNPC
            key={cid}
            candidate={CANDIDATES[cid]}
            position={[Math.cos(a) * r, 0, Math.sin(a) * r]}
            rotationY={-a - Math.PI / 2}
            idSuffix="camp"
            seated
          />
        );
      })}

      <LocationSign
        id="campfire"
        kind="campfire"
        signText={'Campfire Reflection Circle'}
        promptLabel="Sit and reflect by the fire"
        position={[2.9, 0, 2.3]}
        radius={3.4}
        rotationY={-0.8}
      />
    </group>
  );
}
