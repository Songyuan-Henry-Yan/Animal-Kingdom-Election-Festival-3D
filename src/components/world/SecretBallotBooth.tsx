import React from 'react';
import { LocationSign } from './LocationSign';

export function SecretBallotBooth(): React.JSX.Element {
  return (
    <group position={[19, 0, -4]} rotation={[0, -0.9, 0]}>
      {/* frame */}
      {([[-0.9, -0.6], [0.9, -0.6], [-0.9, 0.6], [0.9, 0.6]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 1.1, z]}>
          <boxGeometry args={[0.14, 2.2, 0.14]} />
          <meshStandardMaterial color="#8a5a2b" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 2.3, 0]}>
        <boxGeometry args={[2.1, 0.2, 1.5]} />
        <meshStandardMaterial color="#a4713d" roughness={0.9} />
      </mesh>
      {/* back + side walls */}
      <mesh position={[0, 1.35, -0.62]}>
        <boxGeometry args={[1.8, 1.7, 0.06]} />
        <meshStandardMaterial color="#b8834f" roughness={0.9} />
      </mesh>
      {[-0.92, 0.92].map((x) => (
        <mesh key={x} position={[x, 1.35, 0]}>
          <boxGeometry args={[0.06, 1.7, 1.24]} />
          <meshStandardMaterial color="#b8834f" roughness={0.9} />
        </mesh>
      ))}
      {/* curtain with gentle folds */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-0.75 + i * 0.3, 1.62, 0.62]} rotation={[0, 0, i % 2 === 0 ? 0.03 : -0.03]}>
          <boxGeometry args={[0.3, 1.15, 0.05]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#b8434f' : '#a63a45'} roughness={0.85} />
        </mesh>
      ))}
      {/* writing shelf + ballot slot box */}
      <mesh position={[0, 0.95, -0.35]}>
        <boxGeometry args={[1.6, 0.08, 0.5]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.9} />
      </mesh>
      <mesh position={[1.35, 0.75, 0.5]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#7a5230" roughness={0.9} />
      </mesh>
      <mesh position={[1.35, 1.02, 0.5]}>
        <boxGeometry args={[0.3, 0.03, 0.1]} />
        <meshStandardMaterial color="#2e2b28" roughness={0.9} />
      </mesh>
      <LocationSign
        id="booth"
        kind="booth"
        signText={'Secret Ballot Booth'}
        promptLabel="Try a practice ballot"
        position={[-1.6, 0, 1.7]}
        radius={3.2}
        rotationY={0.5}
      />
    </group>
  );
}
