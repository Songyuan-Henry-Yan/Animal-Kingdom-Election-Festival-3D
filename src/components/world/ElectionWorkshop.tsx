import React from 'react';
import { LocationSign } from './LocationSign';

export function ElectionWorkshop(): React.JSX.Element {
  return (
    <group position={[-17, 0, 13]}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[3.4, 2.2, 2.6]} />
        <meshStandardMaterial color="#e8d8b8" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.75, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.9, 1.4, 4]} />
        <meshStandardMaterial color="#b8683f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.85, 1.32]}>
        <boxGeometry args={[0.9, 1.7, 0.08]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.9} />
      </mesh>
      <mesh position={[-1.1, 1.4, 1.31]}>
        <boxGeometry args={[0.7, 0.7, 0.06]} />
        <meshStandardMaterial color="#bfe8ee" roughness={0.4} />
      </mesh>
      {/* little study table with papers */}
      <mesh position={[2.4, 0.5, 1.4]}>
        <cylinderGeometry args={[0.7, 0.7, 0.1, 12]} />
        <meshStandardMaterial color="#a4713d" roughness={0.9} />
      </mesh>
      <mesh position={[2.4, 0.28, 1.4]}>
        <cylinderGeometry args={[0.12, 0.14, 0.45, 8]} />
        <meshStandardMaterial color="#7a5230" roughness={0.9} />
      </mesh>
      <mesh position={[2.3, 0.59, 1.35]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.7]} />
        <meshStandardMaterial color="#fdf6e3" roughness={0.8} />
      </mesh>
      <LocationSign
        id="workshop"
        kind="workshop"
        signText={'Election Workshop'}
        promptLabel="Learn how the festival works"
        position={[1.6, 0, 2.9]}
        radius={3.4}
        rotationY={0.35}
      />
    </group>
  );
}
