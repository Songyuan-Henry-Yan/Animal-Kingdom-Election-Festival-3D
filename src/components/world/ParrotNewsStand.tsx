import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimalModel } from '../characters/AnimalModel';
import { NameLabel } from '../characters/CandidateNPC';
import { useGame } from '../../state/store';
import { LocationSign } from './LocationSign';

export function ParrotNewsStand(): React.JSX.Element {
  const parrot = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!parrot.current) return;
    const reduced = useGame.getState().reducedMotion;
    parrot.current.rotation.y = reduced ? 0.4 : 0.4 + Math.sin(clock.elapsedTime * 0.9) * 0.5;
    parrot.current.position.y = 1.55 + (reduced ? 0 : Math.abs(Math.sin(clock.elapsedTime * 2.2)) * 0.05);
  });

  return (
    <group position={[13, 0, -13]}>
      {/* counter */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[2.4, 1.1, 1.2]} />
        <meshStandardMaterial color="#a06a38" roughness={0.9} />
      </mesh>
      {/* awning */}
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} position={[x, 1.6, 0.5]}>
          <cylinderGeometry args={[0.06, 0.07, 2.1, 8]} />
          <meshStandardMaterial color="#7a5230" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-1.05 + i * 0.42, 2.62, 0.35]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.42, 0.06, 1.5]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#d9534f' : '#fdf6e3'} roughness={0.85} />
        </mesh>
      ))}
      {/* newspapers */}
      <mesh position={[-0.6, 1.14, 0.2]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.55, 0.1, 0.75]} />
        <meshStandardMaterial color="#f5efdc" roughness={0.9} />
      </mesh>
      <mesh position={[0.55, 1.14, 0.15]} rotation={[0, -0.25, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.75]} />
        <meshStandardMaterial color="#efe6cc" roughness={0.9} />
      </mesh>
      {/* perch + parrot reporter */}
      <mesh position={[0, 1.32, -0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#5f3c1e" roughness={0.9} />
      </mesh>
      <group ref={parrot} position={[0, 1.55, -0.25]}>
        <AnimalModel species="parrot" />
      </group>
      <NameLabel text="Pip the Parrot Reporter" y={2.9} scale={0.8} />
      <LocationSign
        id="news"
        kind="news"
        signText={'Parrot News Stand'}
        promptLabel="Draw Today's Forest News"
        position={[2.2, 0, 1.6]}
        radius={3.2}
        rotationY={-0.5}
      />
    </group>
  );
}
