import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { SystemId } from '../../types/game';
import { SYSTEM_IDS, SYSTEM_INFO } from '../../lib/voting';
import { CANDIDATES } from '../../data/candidates';
import { MODES } from '../../data/modes';
import { registerInteractable } from '../../state/registry';
import { useGame } from '../../state/store';
import { NameLabel, GlowRing } from '../characters/CandidateNPC';
import { LocationSign } from './LocationSign';

const BODY_COLORS: Record<SystemId, string> = {
  plurality: '#b8683f', runoff: '#7ba7d9', irv: '#4f9e56', borda: '#d9a441',
  condorcet: '#9b7fd4', approval: '#f2c035', score: '#59b7c9', star: '#e58bb0', council: '#578a45',
};

function Topper({ systemId }: { systemId: SystemId }): React.JSX.Element {
  const wood = <meshStandardMaterial color="#8a5a2b" roughness={0.9} />;
  switch (systemId) {
    case 'plurality':
      return (
        <group>
          <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.34, 0.26, 0.36, 14, 1, true]} /><meshStandardMaterial color="#a4713d" roughness={0.9} side={2} /></mesh>
          <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.34, 0.045, 8, 18]} />{wood}</mesh>
          {[-0.1, 0.08, 0].map((x, i) => (
            <mesh key={i} position={[x, 0.28 + i * 0.02, i * 0.08 - 0.04]}><sphereGeometry args={[0.09, 8, 8]} /><meshStandardMaterial color="#6d4520" roughness={0.8} /></mesh>
          ))}
        </group>
      );
    case 'runoff':
      return (
        <group>
          {[-0.18, 0.18].map((z) => (
            <mesh key={z} position={[0, 0.12, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.32, 0.05, 8, 16, Math.PI]} />{wood}
            </mesh>
          ))}
        </group>
      );
    case 'irv':
      return (
        <group>
          <mesh position={[-0.2, 0.22, 0]} rotation={[0, 0, 0.5]}><cylinderGeometry args={[0.07, 0.07, 0.5, 8]} /><meshStandardMaterial color="#cfa26b" roughness={0.8} /></mesh>
          <mesh position={[0.2, 0.22, 0]} rotation={[0, 0, -0.5]}><cylinderGeometry args={[0.07, 0.07, 0.5, 8]} /><meshStandardMaterial color="#cfa26b" roughness={0.8} /></mesh>
          <mesh position={[0, 0.42, 0]} scale={[1, 0.12, 1.4]}><sphereGeometry args={[0.22, 10, 10]} /><meshStandardMaterial color="#69a84f" roughness={0.7} /></mesh>
        </group>
      );
    case 'borda':
      return (
        <group rotation={[0, 0, -0.25]}>
          {[-0.14, 0.14].map((x) => (
            <mesh key={x} position={[x, 0.25, 0]}><boxGeometry args={[0.05, 0.62, 0.05]} />{wood}</mesh>
          ))}
          {[0.06, 0.24, 0.42].map((y) => (
            <mesh key={y} position={[0, y, 0]}><boxGeometry args={[0.34, 0.045, 0.045]} />{wood}</mesh>
          ))}
        </group>
      );
    case 'condorcet':
      return (
        <group>
          <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.32, 0.05, 8, 20]} /><meshStandardMaterial color="#cfa26b" roughness={0.85} /></mesh>
          {[-0.14, 0.14].map((x) => (
            <mesh key={x} position={[x, 0.16, 0]}><cylinderGeometry args={[0.07, 0.09, 0.16, 8]} />{wood}</mesh>
          ))}
        </group>
      );
    case 'approval':
      return (
        <group>
          <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.3, 0.3, 0.07, 18]} /><meshStandardMaterial color="#ffd94f" roughness={0.6} /></mesh>
          <mesh position={[-0.1, 0.28, 0.02]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#4a3218" /></mesh>
          <mesh position={[0.1, 0.28, 0.02]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#4a3218" /></mesh>
          <mesh position={[0, 0.26, 0.02]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.12, 0.025, 6, 14, Math.PI]} /><meshStandardMaterial color="#4a3218" /></mesh>
        </group>
      );
    case 'score':
      return (
        <group>
          <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.24, 0.2, 0.42, 14]} /><meshStandardMaterial color="#bfe8ee" transparent opacity={0.55} roughness={0.2} /></mesh>
          <mesh position={[0, 0.24, 0]} rotation={[0.4, 0.3, 0]}><octahedronGeometry args={[0.13]} /><meshStandardMaterial color="#ffd94f" emissive="#8a6a00" emissiveIntensity={0.4} /></mesh>
        </group>
      );
    case 'star':
      return (
        <group>
          <mesh position={[-0.16, 0.18, 0]}><cylinderGeometry args={[0.16, 0.13, 0.34, 12]} /><meshStandardMaterial color="#bfe8ee" transparent opacity={0.55} roughness={0.2} /></mesh>
          <mesh position={[-0.16, 0.24, 0]} rotation={[0.4, 0.3, 0]}><octahedronGeometry args={[0.09]} /><meshStandardMaterial color="#ffd94f" emissive="#8a6a00" emissiveIntensity={0.4} /></mesh>
          <mesh position={[0.18, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.18, 0.035, 8, 14, Math.PI]} />{wood}</mesh>
        </group>
      );
    case 'council':
    default:
      return (
        <group>
          <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.05, 0.07, 0.3, 8]} />{wood}</mesh>
          <mesh position={[0, 0.42, 0]}><sphereGeometry args={[0.26, 12, 12]} /><meshStandardMaterial color="#4e7d3f" roughness={0.85} /></mesh>
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.28, 0.42 + Math.sin(a * 2) * 0.08, Math.sin(a) * 0.28]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#ffd94f" emissive="#6a5200" emissiveIntensity={0.3} />
              </mesh>
            );
          })}
        </group>
      );
  }
}

function Machine({ systemId, position }: { systemId: SystemId; position: [number, number, number] }): React.JSX.Element {
  const info = SYSTEM_INFO[systemId];
  const selected = useGame((s) => s.selectedSystems.includes(systemId));
  const running = useGame((s) => s.running);
  const nearby = useGame((s) => s.nearby);
  const mode = useGame((s) => s.mode);
  const awake = MODES[mode].systems.includes(systemId);
  const winnerId = useGame((s) => s.lastRun?.results.find((r) => r.systemId === systemId)?.winnerId ?? null);
  const topper = useRef<THREE.Group>(null);
  const id = `machine-${systemId}`;

  useEffect(() => registerInteractable({
    id, kind: 'machine', targetId: systemId, label: `Inspect the ${info.machineName}`,
    x: position[0], z: position[2], radius: 2.3,
  }), [id, systemId, info.machineName, position]);

  useFrame(({ clock }, dt) => {
    if (!topper.current) return;
    const reduced = useGame.getState().reducedMotion;
    if (reduced) {
      // reduced-motion friendly: no spinning or bobbing, selection shown by lamp color only
      topper.current.rotation.y = 0;
      topper.current.position.y = 1.25;
      return;
    }
    const speed = running && selected ? 4 : selected ? 0.8 : 0;
    topper.current.rotation.y += dt * speed;
    topper.current.position.y = 1.25 + (selected ? Math.sin(clock.elapsedTime * 2 + position[0]) * 0.04 : 0);
  });

  return (
    <group position={position}>
      <RoundedBox args={[1.7, 1.15, 1.25]} radius={0.12} position={[0, 0.58, 0]}>
        <meshStandardMaterial color={BODY_COLORS[systemId]} roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 0.68, 0.64]}>
        <planeGeometry args={[1.1, 0.55]} />
        <meshStandardMaterial color="#fdf6e3" roughness={0.7} />
      </mesh>
      <group ref={topper} position={[0, 1.25, 0]}>
        <Topper systemId={systemId} />
      </group>
      {/* selection lamp */}
      <mesh position={[0.72, 1.28, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial
          color={selected ? '#7dde6e' : awake ? '#8f8578' : '#b8574a'}
          emissive={selected ? '#2f8a22' : awake ? '#000000' : '#5c1f16'}
          emissiveIntensity={selected ? 0.9 : awake ? 0 : 0.5}
        />
      </mesh>
      <NameLabel text={`${awake ? '' : '🔒 '}${info.emoji} ${info.machineName}`} y={2.25} scale={0.78} />
      {winnerId && (
        <>
          <mesh position={[0, 1.62, 0.55]}>
            <planeGeometry args={[1.0, 0.22]} />
            <meshStandardMaterial color={CANDIDATES[winnerId].color} roughness={0.6} side={2} />
          </mesh>
          <NameLabel text={`🎀 ${CANDIDATES[winnerId].name}`} y={1.9} scale={0.6} />
        </>
      )}
      <GlowRing active={nearby?.id === id} radius={1.35} />
    </group>
  );
}

/** 3×3 arcade of the nine counting machines. */
export function CountingMachineArcade(): React.JSX.Element {
  return (
    <group>
      <LocationSign
        id="arcade-sign"
        kind="intro"
        targetId="arcade"
        signText={'Counting Machine Arcade'}
        promptLabel="What is the Counting Machine Arcade?"
        position={[12.6, 0, 4.2]}
        radius={2.6}
        rotationY={-0.7}
      />
      {SYSTEM_IDS.map((sid, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <Machine
            key={sid}
            systemId={sid}
            position={[14.2 + col * 3.3, 0, 6.2 + row * 3.4]}
          />
        );
      })}
    </group>
  );
}
