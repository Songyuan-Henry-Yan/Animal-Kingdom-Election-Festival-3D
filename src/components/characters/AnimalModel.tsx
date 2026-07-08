import React from 'react';

/**
 * Every character is built from spheres, capsules, cylinders, cones and boxes —
 * no external 3D models, textures, or images anywhere.
 */

export type Species =
  | 'fox' | 'panda' | 'owl' | 'lion' | 'dolphin'
  | 'beaver' | 'turtle' | 'rabbit' | 'elephant' | 'raccoon'
  | 'parrot' | 'helper';

interface Props {
  species: Species;
  color?: string;
  accent?: string;
}

const Mat = ({ color, emissive }: { color: string; emissive?: string }) => (
  <meshStandardMaterial color={color} roughness={0.85} metalness={0} emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? 0.35 : 0} />
);

function Eyes({ y = 1.15, z = 0.26, gap = 0.13, r = 0.045 }: { y?: number; z?: number; gap?: number; r?: number }) {
  return (
    <>
      <mesh position={[-gap, y, z]}><sphereGeometry args={[r, 10, 10]} /><Mat color="#241d16" /></mesh>
      <mesh position={[gap, y, z]}><sphereGeometry args={[r, 10, 10]} /><Mat color="#241d16" /></mesh>
    </>
  );
}

function Feet({ color, x = 0.14 }: { color: string; x?: number }) {
  return (
    <>
      <mesh position={[-x, 0.09, 0.05]}><sphereGeometry args={[0.11, 10, 10]} /><Mat color={color} /></mesh>
      <mesh position={[x, 0.09, 0.05]}><sphereGeometry args={[0.11, 10, 10]} /><Mat color={color} /></mesh>
    </>
  );
}

export function AnimalModel({ species, color = '#b58a5a', accent = '#4f9e56' }: Props): React.JSX.Element {
  switch (species) {
    case 'fox':
      return (
        <group>
          <mesh position={[0, 0.55, 0]}><capsuleGeometry args={[0.32, 0.35, 6, 14]} /><Mat color={color} /></mesh>
          <mesh position={[0, 1.15, 0]}><sphereGeometry args={[0.34, 18, 18]} /><Mat color={color} /></mesh>
          <mesh position={[0, 1.08, 0.32]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.11, 0.24, 12]} /><Mat color="#f3e3cf" /></mesh>
          <mesh position={[-0.16, 1.45, 0]}><coneGeometry args={[0.1, 0.28, 10]} /><Mat color={color} /></mesh>
          <mesh position={[0.16, 1.45, 0]}><coneGeometry args={[0.1, 0.28, 10]} /><Mat color={color} /></mesh>
          <Eyes y={1.22} z={0.27} />
          <mesh position={[0, 0.48, -0.45]} rotation={[-1.9, 0, 0]}><coneGeometry args={[0.15, 0.55, 12]} /><Mat color={color} /></mesh>
          <mesh position={[0, 0.42, -0.68]}><sphereGeometry args={[0.11, 12, 12]} /><Mat color="#f3e3cf" /></mesh>
          <mesh position={[0, 0.93, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.24, 0.07, 10, 20]} /><Mat color={accent} /></mesh>
          <Feet color="#8a4d22" />
        </group>
      );

    case 'panda':
      return (
        <group>
          <mesh position={[0, 0.52, 0]} scale={[1, 1.1, 0.95]}><sphereGeometry args={[0.4, 18, 18]} /><Mat color={color} /></mesh>
          <mesh position={[0, 1.2, 0]}><sphereGeometry args={[0.34, 18, 18]} /><Mat color={color} /></mesh>
          <mesh position={[-0.2, 1.48, 0]}><sphereGeometry args={[0.11, 12, 12]} /><Mat color={accent} /></mesh>
          <mesh position={[0.2, 1.48, 0]}><sphereGeometry args={[0.11, 12, 12]} /><Mat color={accent} /></mesh>
          <mesh position={[-0.13, 1.25, 0.26]} scale={[1, 1.4, 0.6]}><sphereGeometry args={[0.085, 12, 12]} /><Mat color={accent} /></mesh>
          <mesh position={[0.13, 1.25, 0.26]} scale={[1, 1.4, 0.6]}><sphereGeometry args={[0.085, 12, 12]} /><Mat color={accent} /></mesh>
          <mesh position={[-0.13, 1.25, 0.31]}><sphereGeometry args={[0.032, 8, 8]} /><Mat color="#ffffff" /></mesh>
          <mesh position={[0.13, 1.25, 0.31]}><sphereGeometry args={[0.032, 8, 8]} /><Mat color="#ffffff" /></mesh>
          <mesh position={[0, 1.08, 0.31]}><sphereGeometry args={[0.05, 8, 8]} /><Mat color={accent} /></mesh>
          <mesh position={[-0.38, 0.66, 0.05]} rotation={[0, 0, 0.5]}><capsuleGeometry args={[0.11, 0.25, 6, 12]} /><Mat color={accent} /></mesh>
          <mesh position={[0.38, 0.66, 0.05]} rotation={[0, 0, -0.5]}><capsuleGeometry args={[0.11, 0.25, 6, 12]} /><Mat color={accent} /></mesh>
          <mesh position={[0, 0.72, 0.38]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.075, 0.075, 0.035, 12]} /><Mat color="#4f9e56" /></mesh>
          <Feet color={accent} x={0.18} />
        </group>
      );

    case 'owl':
      return (
        <group>
          <mesh position={[0, 0.75, 0]}><capsuleGeometry args={[0.34, 0.45, 6, 16]} /><Mat color={color} /></mesh>
          <mesh position={[0, 0.68, 0.16]} scale={[0.85, 1, 0.65]}><sphereGeometry args={[0.28, 14, 14]} /><Mat color={accent} /></mesh>
          <mesh position={[-0.14, 1.16, 0.22]}><sphereGeometry args={[0.115, 14, 14]} /><Mat color="#ffffff" /></mesh>
          <mesh position={[0.14, 1.16, 0.22]}><sphereGeometry args={[0.115, 14, 14]} /><Mat color="#ffffff" /></mesh>
          <mesh position={[-0.14, 1.16, 0.32]}><sphereGeometry args={[0.05, 8, 8]} /><Mat color="#241d16" /></mesh>
          <mesh position={[0.14, 1.16, 0.32]}><sphereGeometry args={[0.05, 8, 8]} /><Mat color="#241d16" /></mesh>
          <mesh position={[-0.14, 1.16, 0.3]}><torusGeometry args={[0.13, 0.016, 8, 20]} /><Mat color="#5a4632" /></mesh>
          <mesh position={[0.14, 1.16, 0.3]}><torusGeometry args={[0.13, 0.016, 8, 20]} /><Mat color="#5a4632" /></mesh>
          <mesh position={[0, 1.16, 0.3]}><boxGeometry args={[0.08, 0.02, 0.02]} /><Mat color="#5a4632" /></mesh>
          <mesh position={[0, 1.02, 0.32]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.055, 0.13, 8]} /><Mat color="#d98e2b" /></mesh>
          <mesh position={[-0.17, 1.42, 0]}><coneGeometry args={[0.06, 0.16, 8]} /><Mat color={color} /></mesh>
          <mesh position={[0.17, 1.42, 0]}><coneGeometry args={[0.06, 0.16, 8]} /><Mat color={color} /></mesh>
          <mesh position={[-0.36, 0.8, 0]} scale={[0.45, 1, 0.7]}><sphereGeometry args={[0.22, 12, 12]} /><Mat color="#6d5236" /></mesh>
          <mesh position={[0.36, 0.8, 0]} scale={[0.45, 1, 0.7]}><sphereGeometry args={[0.22, 12, 12]} /><Mat color="#6d5236" /></mesh>
          <Feet color="#d98e2b" x={0.12} />
        </group>
      );

    case 'lion':
      return (
        <group>
          <mesh position={[0, 0.55, 0]}><capsuleGeometry args={[0.34, 0.35, 6, 16]} /><Mat color={color} /></mesh>
          <mesh position={[0, 0.72, -0.3]} rotation={[0.25, 0, 0]}><boxGeometry args={[0.66, 0.55, 0.04]} /><Mat color={accent} /></mesh>
          <mesh position={[0, 1.18, -0.04]} scale={[1, 1, 0.75]}><sphereGeometry args={[0.44, 18, 18]} /><Mat color="#9c6a2f" /></mesh>
          <mesh position={[0, 1.18, 0.1]}><sphereGeometry args={[0.3, 18, 18]} /><Mat color={color} /></mesh>
          <mesh position={[-0.2, 1.5, 0]}><sphereGeometry args={[0.08, 10, 10]} /><Mat color={color} /></mesh>
          <mesh position={[0.2, 1.5, 0]}><sphereGeometry args={[0.08, 10, 10]} /><Mat color={color} /></mesh>
          <Eyes y={1.24} z={0.34} gap={0.12} />
          <mesh position={[0, 1.12, 0.38]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.05, 0.08, 8]} /><Mat color="#6d4520" /></mesh>
          <mesh position={[0.3, 0.4, -0.35]} rotation={[-1.2, 0, 0.4]}><cylinderGeometry args={[0.035, 0.035, 0.45, 8]} /><Mat color={color} /></mesh>
          <mesh position={[0.42, 0.28, -0.52]}><sphereGeometry args={[0.07, 8, 8]} /><Mat color="#9c6a2f" /></mesh>
          <Feet color="#b8862f" />
        </group>
      );

    case 'dolphin':
      // A proper little dolphin: streamlined horizontal body arched in a gentle
      // leap — melon head, rostrum, swept dorsal fin, pectorals, and HORIZONTAL
      // tail flukes (dolphins are mammals — flukes lie flat, unlike fish tails!).
      return (
        <group position={[0, 0.62, 0]} rotation={[-0.3, 0, 0]}>
          {/* body */}
          <mesh rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.26, 0.6, 10, 18]} /><Mat color={color} /></mesh>
          {/* lighter belly */}
          <mesh position={[0, -0.1, 0.08]} scale={[0.82, 0.55, 1.25]}><sphereGeometry args={[0.26, 14, 14]} /><Mat color={accent} /></mesh>
          {/* melon head */}
          <mesh position={[0, 0.02, 0.42]}><sphereGeometry args={[0.24, 16, 16]} /><Mat color={color} /></mesh>
          {/* rostrum (snout) */}
          <mesh position={[0, -0.03, 0.66]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.75]}><coneGeometry args={[0.1, 0.3, 12]} /><Mat color={color} /></mesh>
          {/* smile hint */}
          <mesh position={[0, -0.1, 0.58]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.08, 0.012, 6, 12, Math.PI]} /><Mat color="#2b4a52" /></mesh>
          {/* dorsal fin, swept back */}
          <mesh position={[0, 0.32, -0.02]} rotation={[-0.55, 0, 0]} scale={[0.32, 1, 1]}><coneGeometry args={[0.16, 0.38, 10]} /><Mat color={color} /></mesh>
          {/* pectoral fins */}
          <mesh position={[-0.24, -0.1, 0.18]} rotation={[0.4, 0.5, 1.25]} scale={[0.3, 1, 0.8]}><coneGeometry args={[0.11, 0.3, 8]} /><Mat color={color} /></mesh>
          <mesh position={[0.24, -0.1, 0.18]} rotation={[0.4, -0.5, -1.25]} scale={[0.3, 1, 0.8]}><coneGeometry args={[0.11, 0.3, 8]} /><Mat color={color} /></mesh>
          {/* tail stock narrowing to the flukes */}
          <mesh position={[0, 0.03, -0.5]} rotation={[-Math.PI / 2, 0, 0]}><coneGeometry args={[0.14, 0.34, 10]} /><Mat color={color} /></mesh>
          {/* horizontal flukes */}
          <mesh position={[-0.15, 0.06, -0.68]} rotation={[0, 0.5, 0]} scale={[1, 0.16, 0.55]}><sphereGeometry args={[0.17, 10, 10]} /><Mat color={color} /></mesh>
          <mesh position={[0.15, 0.06, -0.68]} rotation={[0, -0.5, 0]} scale={[1, 0.16, 0.55]}><sphereGeometry args={[0.17, 10, 10]} /><Mat color={color} /></mesh>
          {/* eyes + blowhole */}
          <mesh position={[-0.17, 0.03, 0.47]}><sphereGeometry args={[0.035, 8, 8]} /><Mat color="#1d2a2e" /></mesh>
          <mesh position={[0.17, 0.03, 0.47]}><sphereGeometry args={[0.035, 8, 8]} /><Mat color="#1d2a2e" /></mesh>
          <mesh position={[0, 0.24, 0.3]}><sphereGeometry args={[0.03, 8, 8]} /><Mat color="#2b4a52" /></mesh>
        </group>
      );

    case 'beaver':
      return (
        <group>
          <mesh position={[0, 0.55, 0]}><capsuleGeometry args={[0.36, 0.3, 6, 16]} /><Mat color={color} /></mesh>
          <mesh position={[0, 1.14, 0]}><sphereGeometry args={[0.32, 18, 18]} /><Mat color={color} /></mesh>
          <mesh position={[-0.17, 1.4, 0]}><sphereGeometry args={[0.08, 10, 10]} /><Mat color={color} /></mesh>
          <mesh position={[0.17, 1.4, 0]}><sphereGeometry args={[0.08, 10, 10]} /><Mat color={color} /></mesh>
          <Eyes y={1.2} z={0.26} gap={0.12} />
          <mesh position={[-0.04, 1.0, 0.3]}><boxGeometry args={[0.055, 0.09, 0.03]} /><Mat color="#ffffff" /></mesh>
          <mesh position={[0.04, 1.0, 0.3]}><boxGeometry args={[0.055, 0.09, 0.03]} /><Mat color="#ffffff" /></mesh>
          <mesh position={[0, 0.14, -0.5]} rotation={[0.35, 0, 0]}><boxGeometry args={[0.32, 0.06, 0.48]} /><Mat color="#5f3c1e" /></mesh>
          <mesh position={[0, 1.47, 0]}><cylinderGeometry args={[0.22, 0.24, 0.14, 14]} /><Mat color={accent} /></mesh>
          <mesh position={[0, 1.41, 0]}><cylinderGeometry args={[0.31, 0.31, 0.03, 14]} /><Mat color={accent} /></mesh>
          <Feet color="#5f3c1e" />
        </group>
      );

    case 'turtle':
      return (
        <group>
          <mesh position={[0, 0.42, 0.02]} scale={[1, 0.72, 1]}><sphereGeometry args={[0.36, 16, 16]} /><Mat color={color} /></mesh>
          <mesh position={[0, 0.52, -0.06]} scale={[1, 0.72, 1]}><sphereGeometry args={[0.43, 16, 16]} /><Mat color="#7a5b34" /></mesh>
          <mesh position={[0, 0.56, -0.06]} scale={[1, 0.5, 1]}><sphereGeometry args={[0.4, 8, 8]} /><Mat color="#6a4e2c" /></mesh>
          <mesh position={[0, 0.86, 0.3]}><sphereGeometry args={[0.18, 14, 14]} /><Mat color={color} /></mesh>
          <Eyes y={0.9} z={0.44} gap={0.08} r={0.035} />
          <mesh position={[0, 1.02, 0.3]}><coneGeometry args={[0.28, 0.14, 14]} /><Mat color={accent} /></mesh>
          <mesh position={[0, 0.96, 0.3]}><cylinderGeometry args={[0.34, 0.34, 0.025, 14]} /><Mat color={accent} /></mesh>
          <mesh position={[-0.28, 0.14, 0.2]}><cylinderGeometry args={[0.09, 0.1, 0.22, 10]} /><Mat color={color} /></mesh>
          <mesh position={[0.28, 0.14, 0.2]}><cylinderGeometry args={[0.09, 0.1, 0.22, 10]} /><Mat color={color} /></mesh>
          <mesh position={[-0.28, 0.14, -0.24]}><cylinderGeometry args={[0.09, 0.1, 0.22, 10]} /><Mat color={color} /></mesh>
          <mesh position={[0.28, 0.14, -0.24]}><cylinderGeometry args={[0.09, 0.1, 0.22, 10]} /><Mat color={color} /></mesh>
        </group>
      );

    case 'rabbit':
      return (
        <group>
          <mesh position={[0, 0.5, 0]}><capsuleGeometry args={[0.3, 0.3, 6, 16]} /><Mat color={color} /></mesh>
          <mesh position={[0, 1.05, 0]}><sphereGeometry args={[0.28, 18, 18]} /><Mat color={color} /></mesh>
          <mesh position={[-0.11, 1.5, 0]} rotation={[0, 0, 0.12]}><capsuleGeometry args={[0.07, 0.4, 6, 10]} /><Mat color={color} /></mesh>
          <mesh position={[0.11, 1.5, 0]} rotation={[0, 0, -0.12]}><capsuleGeometry args={[0.07, 0.4, 6, 10]} /><Mat color={color} /></mesh>
          <mesh position={[-0.07, 1.32, 0.06]} rotation={[0, 0, 0.8]}><coneGeometry args={[0.07, 0.14, 8]} /><Mat color={accent} /></mesh>
          <mesh position={[0.07, 1.32, 0.06]} rotation={[0, 0, -0.8]}><coneGeometry args={[0.07, 0.14, 8]} /><Mat color={accent} /></mesh>
          <mesh position={[0, 1.32, 0.08]}><sphereGeometry args={[0.05, 8, 8]} /><Mat color={accent} /></mesh>
          <Eyes y={1.1} z={0.22} gap={0.1} />
          <mesh position={[0, 1.0, 0.26]}><sphereGeometry args={[0.035, 8, 8]} /><Mat color="#d97b8f" /></mesh>
          <mesh position={[0, 0.42, -0.32]}><sphereGeometry args={[0.12, 10, 10]} /><Mat color="#ffffff" /></mesh>
          <Feet color={color} />
        </group>
      );

    case 'elephant':
      return (
        <group>
          <mesh position={[0, 0.58, 0]} scale={[1, 1.05, 0.95]}><sphereGeometry args={[0.44, 18, 18]} /><Mat color={color} /></mesh>
          <mesh position={[0, 1.28, 0.02]}><sphereGeometry args={[0.36, 18, 18]} /><Mat color={color} /></mesh>
          <mesh position={[-0.42, 1.32, -0.02]} scale={[0.25, 1, 0.7]}><sphereGeometry args={[0.3, 14, 14]} /><Mat color={color} /></mesh>
          <mesh position={[0.42, 1.32, -0.02]} scale={[0.25, 1, 0.7]}><sphereGeometry args={[0.3, 14, 14]} /><Mat color={color} /></mesh>
          <mesh position={[0, 1.1, 0.36]} rotation={[0.5, 0, 0]}><cylinderGeometry args={[0.07, 0.09, 0.4, 10]} /><Mat color={color} /></mesh>
          <mesh position={[0, 0.92, 0.46]}><sphereGeometry args={[0.075, 10, 10]} /><Mat color={color} /></mesh>
          <Eyes y={1.36} z={0.3} gap={0.13} />
          <mesh position={[0.42, 1.52, 0.05]}><sphereGeometry args={[0.07, 10, 10]} /><Mat color={accent} /></mesh>
          <mesh position={[0.34, 1.56, 0.05]}><sphereGeometry args={[0.045, 8, 8]} /><Mat color="#f7cede" /></mesh>
          <mesh position={[0.5, 1.56, 0.05]}><sphereGeometry args={[0.045, 8, 8]} /><Mat color="#f7cede" /></mesh>
          <mesh position={[0.42, 1.6, 0.02]}><sphereGeometry args={[0.045, 8, 8]} /><Mat color="#f7cede" /></mesh>
          <mesh position={[-0.18, 0.16, 0.1]}><cylinderGeometry args={[0.12, 0.13, 0.3, 10]} /><Mat color={color} /></mesh>
          <mesh position={[0.18, 0.16, 0.1]}><cylinderGeometry args={[0.12, 0.13, 0.3, 10]} /><Mat color={color} /></mesh>
        </group>
      );

    case 'raccoon':
      return (
        <group>
          <mesh position={[0, 0.52, 0]}><capsuleGeometry args={[0.32, 0.3, 6, 16]} /><Mat color={color} /></mesh>
          <mesh position={[0, 1.1, 0]}><sphereGeometry args={[0.3, 18, 18]} /><Mat color={color} /></mesh>
          <mesh position={[0, 1.16, 0.2]} scale={[1.4, 0.5, 0.7]}><sphereGeometry args={[0.17, 14, 14]} /><Mat color={accent} /></mesh>
          <mesh position={[-0.11, 1.16, 0.3]}><sphereGeometry args={[0.035, 8, 8]} /><Mat color="#ffffff" /></mesh>
          <mesh position={[0.11, 1.16, 0.3]}><sphereGeometry args={[0.035, 8, 8]} /><Mat color="#ffffff" /></mesh>
          <mesh position={[-0.16, 1.36, 0]}><coneGeometry args={[0.09, 0.16, 8]} /><Mat color={accent} /></mesh>
          <mesh position={[0.16, 1.36, 0]}><coneGeometry args={[0.09, 0.16, 8]} /><Mat color={accent} /></mesh>
          <mesh position={[0, 1.02, 0.29]}><sphereGeometry args={[0.04, 8, 8]} /><Mat color={accent} /></mesh>
          <mesh position={[0, 0.5, -0.42]} rotation={[0.9, 0, 0]}><cylinderGeometry args={[0.1, 0.08, 0.5, 10]} /><Mat color={color} /></mesh>
          <mesh position={[0, 0.62, -0.52]} rotation={[0.9, 0, 0]}><torusGeometry args={[0.1, 0.035, 8, 16]} /><Mat color={accent} /></mesh>
          <mesh position={[0, 0.42, -0.36]} rotation={[0.9, 0, 0]}><torusGeometry args={[0.1, 0.035, 8, 16]} /><Mat color={accent} /></mesh>
          <mesh position={[0.28, 0.6, 0.16]}><boxGeometry args={[0.16, 0.14, 0.07]} /><Mat color="#8a5a2b" /></mesh>
          <mesh position={[0.1, 0.85, 0]} rotation={[0, 0, -0.9]}><boxGeometry args={[0.5, 0.03, 0.03]} /><Mat color="#8a5a2b" /></mesh>
          <Feet color={accent} />
        </group>
      );

    case 'parrot':
      return (
        <group>
          <mesh position={[0, 0.28, 0]}><capsuleGeometry args={[0.16, 0.18, 6, 12]} /><Mat color="#d94f3f" /></mesh>
          <mesh position={[0, 0.56, 0.02]}><sphereGeometry args={[0.14, 14, 14]} /><Mat color="#d94f3f" /></mesh>
          <mesh position={[0, 0.56, 0.15]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.05, 0.12, 8]} /><Mat color="#f2b035" /></mesh>
          <mesh position={[-0.15, 0.3, 0]} scale={[0.4, 1, 0.7]}><sphereGeometry args={[0.14, 10, 10]} /><Mat color="#3f9e4f" /></mesh>
          <mesh position={[0.15, 0.3, 0]} scale={[0.4, 1, 0.7]}><sphereGeometry args={[0.14, 10, 10]} /><Mat color="#3f9e4f" /></mesh>
          <mesh position={[0, 0.08, -0.16]} rotation={[1.1, 0, 0]}><coneGeometry args={[0.06, 0.3, 8]} /><Mat color="#2f7fb8" /></mesh>
          <mesh position={[-0.06, 0.6, 0.1]}><sphereGeometry args={[0.028, 8, 8]} /><Mat color="#241d16" /></mesh>
          <mesh position={[0.06, 0.6, 0.1]}><sphereGeometry args={[0.028, 8, 8]} /><Mat color="#241d16" /></mesh>
        </group>
      );

    case 'helper':
    default:
      return (
        <group>
          <mesh position={[0, 0.45, 0]}><sphereGeometry args={[0.3, 18, 18]} /><Mat color={color} /></mesh>
          <mesh position={[0, 0.95, 0]}><sphereGeometry args={[0.26, 18, 18]} /><Mat color={color} /></mesh>
          <mesh position={[-0.12, 1.16, 0]}><sphereGeometry args={[0.09, 10, 10]} /><Mat color={color} /></mesh>
          <mesh position={[0.12, 1.16, 0]}><sphereGeometry args={[0.09, 10, 10]} /><Mat color={color} /></mesh>
          <Eyes y={1.0} z={0.2} gap={0.1} r={0.04} />
          <mesh position={[0, 1.24, 0]} rotation={[0, 0, 0.15]}><coneGeometry args={[0.2, 0.2, 12]} /><Mat color={accent} /></mesh>
          <mesh position={[0.05, 1.38, 0]} rotation={[0, 0, 0.4]}><cylinderGeometry args={[0.015, 0.015, 0.1, 6]} /><Mat color="#3d7a44" /></mesh>
          <mesh position={[0, 0.55, -0.3]}><boxGeometry args={[0.26, 0.3, 0.14]} /><Mat color="#a24f35" /></mesh>
          <Feet color="#8a6a42" x={0.12} />
        </group>
      );
  }
}
