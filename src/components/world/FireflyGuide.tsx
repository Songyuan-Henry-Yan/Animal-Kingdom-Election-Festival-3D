import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame, currentQuest } from '../../state/store';
import { playerPos } from '../../state/registry';

/** Where the guide firefly leads for each quest step. */
const QUEST_TARGETS: Record<string, [number, number]> = {
  gate: [0, 21],
  workshop: [-15.5, 11],
  issues: [-19.5, 4],
  rally: [0, -14.5],
  news: [12, -10.8],
  booth: [16.8, -2.5],
  arcade: [14.5, 4.5],
  theater: [7, 13.5],
  campfire: [-6.5, 15],
};

/**
 * A bright guide firefly that always drifts a few steps ahead of you,
 * toward the recommended next stop. Young players just follow the light.
 */
export function FireflyGuide(): React.JSX.Element | null {
  const group = useRef<THREE.Group>(null);
  const quest = useGame((s) => currentQuest(s));

  useFrame(({ clock }, dt) => {
    if (!group.current || !quest) return;
    const target = QUEST_TARGETS[quest.id];
    if (!target) return;
    const reduced = useGame.getState().reducedMotion;
    const t = clock.elapsedTime;

    let gx: number;
    let gz: number;
    if (reduced) {
      // calm mode: hover steadily above the destination
      gx = target[0];
      gz = target[1];
    } else {
      const dx = target[0] - playerPos.x;
      const dz = target[1] - playerPos.z;
      const d = Math.hypot(dx, dz);
      const lead = Math.min(5, d);
      gx = d < 0.5 ? target[0] : playerPos.x + (dx / d) * lead;
      gz = d < 0.5 ? target[1] : playerPos.z + (dz / d) * lead;
      gx += Math.sin(t * 1.7) * 0.4;
      gz += Math.cos(t * 1.3) * 0.4;
    }
    const gy = 2.2 + (reduced ? 0 : Math.sin(t * 2.2) * 0.25);
    group.current.position.x += (gx - group.current.position.x) * Math.min(1, dt * 2.5);
    group.current.position.z += (gz - group.current.position.z) * Math.min(1, dt * 2.5);
    group.current.position.y += (gy - group.current.position.y) * Math.min(1, dt * 3);
  });

  if (!quest) return null;
  return (
    <group ref={group} position={[playerPos.x, 2.2, playerPos.z]}>
      <mesh>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial color="#fff6c8" emissive="#ffd94f" emissiveIntensity={2.2} />
      </mesh>
      <pointLight color="#ffe08a" intensity={5} distance={5} decay={2} />
    </group>
  );
}
