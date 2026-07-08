import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../../state/store';
import { LocationSign } from './LocationSign';

/** Round outdoor theater with one glowing stack of leaf ballots at its heart. */
export function CountingTheater(): React.JSX.Element {
  const stack = useRef<THREE.Group>(null);
  const running = useGame((s) => s.running);

  useFrame(({ clock }, dt) => {
    if (!stack.current) return;
    const reduced = useGame.getState().reducedMotion;
    const target = running && !reduced ? 1.18 : 1;
    const s = stack.current.scale.x + (target - stack.current.scale.x) * Math.min(1, dt * 6);
    stack.current.scale.setScalar(s);
    if (!reduced) stack.current.rotation.y = clock.elapsedTime * (running ? 1.6 : 0.25);
  });

  const seats: React.JSX.Element[] = [];
  for (let ring = 0; ring < 2; ring++) {
    const r = 3.3 + ring * 1.3;
    const n = 7 + ring * 3;
    for (let i = 0; i < n; i++) {
      const a = Math.PI * 0.15 + (i / (n - 1)) * Math.PI * 1.2;
      seats.push(
        <mesh key={`${ring}-${i}`} position={[Math.cos(a) * r, 0.22 + ring * 0.16, Math.sin(a) * r]} rotation={[0, -a + Math.PI / 2, 0]}>
          <boxGeometry args={[1.0, 0.44 + ring * 0.3, 0.5]} />
          <meshStandardMaterial color={ring === 0 ? '#b0a18c' : '#a29377'} roughness={0.95} />
        </mesh>,
      );
    }
  }

  return (
    <group position={[9, 0, 16]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <circleGeometry args={[5.4, 30]} />
        <meshStandardMaterial color="#d8c39a" roughness={1} />
      </mesh>
      {seats}
      {/* central pedestal with glowing leaf ballots */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.62, 0.75, 0.6, 14]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.9} />
      </mesh>
      <group ref={stack} position={[0, 0.75, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, i * 0.07, 0]} rotation={[0, i * 0.5, 0]}>
            <boxGeometry args={[0.75, 0.045, 0.5]} />
            <meshStandardMaterial
              color="#a8d987"
              emissive="#3f7a2a"
              emissiveIntensity={0.65}
              roughness={0.6}
            />
          </mesh>
        ))}
      </group>
      <LocationSign
        id="theater"
        kind="theater"
        signText={'Counting Theater'}
        promptLabel="Run the Same Ballots"
        position={[-2.4, 0, -3.4]}
        radius={3.6}
        rotationY={2.6}
      />
    </group>
  );
}
