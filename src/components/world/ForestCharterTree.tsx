import React from 'react';
import { LocationSign } from './LocationSign';

/** The great Charter Tree at the center of the plaza, with the charter scroll pinned to it. */
export function ForestCharterTree(): React.JSX.Element {
  return (
    <group>
      <mesh position={[0, 2.6, 0]}>
        <cylinderGeometry args={[1.15, 1.85, 5.2, 12]} />
        <meshStandardMaterial color="#7a5230" roughness={0.95} />
      </mesh>
      {/* roots */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.7, 0.3, Math.sin(a) * 1.7]} rotation={[0, -a, 1.15]}>
            <coneGeometry args={[0.35, 1.4, 6]} />
            <meshStandardMaterial color="#6d4823" roughness={0.95} />
          </mesh>
        );
      })}
      {/* canopy */}
      <mesh position={[0, 6.4, 0]}><sphereGeometry args={[3.4, 14, 14]} /><meshStandardMaterial color="#4e7d3f" roughness={0.9} /></mesh>
      <mesh position={[2.1, 5.6, 0.8]}><sphereGeometry args={[2.1, 12, 12]} /><meshStandardMaterial color="#578a45" roughness={0.9} /></mesh>
      <mesh position={[-2.2, 5.9, -0.6]}><sphereGeometry args={[2.2, 12, 12]} /><meshStandardMaterial color="#5d924a" roughness={0.9} /></mesh>
      <mesh position={[0.4, 7.6, -1.6]}><sphereGeometry args={[1.7, 12, 12]} /><meshStandardMaterial color="#6aa254" roughness={0.9} /></mesh>
      {/* the charter scroll, pinned to the trunk */}
      <group position={[0, 1.7, 1.72]} rotation={[0.1, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.95, 10]} />
          <meshStandardMaterial color="#fdf6e3" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color="#8a5a2b" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.2, 0.07]}>
          <boxGeometry args={[0.3, 0.1, 0.04]} />
          <meshStandardMaterial color="#d9534f" roughness={0.8} />
        </mesh>
      </group>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.6, 24]} />
        <meshBasicMaterial color="#20301c" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <LocationSign
        id="charter"
        kind="charter"
        signText={'The Forest Charter Tree'}
        promptLabel="Read the Forest Charter scroll"
        position={[1.4, 0, 3.4]}
        radius={3.4}
        rotationY={-0.35}
      />
    </group>
  );
}
