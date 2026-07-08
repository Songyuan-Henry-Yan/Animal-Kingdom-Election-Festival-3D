import React, { useMemo } from 'react';
import { makeLabelTexture } from '../../lib/textTexture';
import { LocationSign } from './LocationSign';

const BUNTING = ['#d9534f', '#f2c035', '#4f9e56', '#7ba7d9', '#e58bb0', '#d9534f', '#4f9e56'];

export function FestivalGate(): React.JSX.Element {
  const banner = useMemo(
    () => makeLabelTexture('Animal Kingdom Election Festival', { fontPx: 52, bg: '#fdf0d5', border: '#8a5a2b' }),
    [],
  );
  return (
    <group>
      {[-3.2, 3.2].map((x) => (
        <mesh key={x} position={[x, 1.8, 23]}>
          <cylinderGeometry args={[0.18, 0.22, 3.6, 10]} />
          <meshStandardMaterial color="#8a5a2b" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 3.65, 23]}>
        <boxGeometry args={[7.6, 0.28, 0.28]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.05, 23]}>
        <planeGeometry args={[6.6, 0.9]} />
        <meshBasicMaterial map={banner.tex} transparent side={2} />
      </mesh>
      {BUNTING.map((c, i) => (
        <mesh key={i} position={[-2.7 + i * 0.9, 3.42, 23.05]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.14, 0.3, 4]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      <LocationSign
        id="gate"
        kind="gate"
        signText={'Forest Festival Gate'}
        promptLabel="Read the welcome board"
        position={[2.7, 0, 20.6]}
        radius={3.4}
        rotationY={-0.4}
      />
    </group>
  );
}
