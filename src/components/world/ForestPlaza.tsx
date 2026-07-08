import React, { useMemo } from 'react';
import { Sparkles } from '@react-three/drei';
import { mulberry32 } from '../../lib/random';
import { FestivalGate } from './FestivalGate';
import { ElectionWorkshop } from './ElectionWorkshop';
import { IssueTrail } from './IssueTrail';
import { CandidateRallyStage } from './CandidateRallyStage';
import { ParrotNewsStand } from './ParrotNewsStand';
import { SecretBallotBooth } from './SecretBallotBooth';
import { CountingMachineArcade } from './CountingMachineArcade';
import { CountingTheater } from './CountingTheater';
import { CampfireReflection } from './CampfireReflection';
import { ForestCharterTree } from './ForestCharterTree';
import { Villagers } from './Villagers';
import { VoterMeadow } from './VoterMeadow';
import { BoothVisitors } from './BoothVisitors';
import { FireflyGuide } from './FireflyGuide';
import { RemotePlayers } from './RemotePlayers';

function Tree({ x, z, s, kind }: { x: number; z: number; s: number; kind: number }): React.JSX.Element {
  return (
    <group position={[x, 0, z]} scale={[s, s, s]}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 1.8, 8]} />
        <meshStandardMaterial color="#7a5230" roughness={0.95} />
      </mesh>
      {kind === 0 ? (
        <>
          <mesh position={[0, 2.3, 0]}><coneGeometry args={[1.35, 2.2, 9]} /><meshStandardMaterial color="#4e7d3f" roughness={0.9} /></mesh>
          <mesh position={[0, 3.5, 0]}><coneGeometry args={[0.95, 1.7, 9]} /><meshStandardMaterial color="#578a45" roughness={0.9} /></mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 2.6, 0]}><sphereGeometry args={[1.35, 12, 12]} /><meshStandardMaterial color="#5d924a" roughness={0.9} /></mesh>
          <mesh position={[0.7, 3.2, 0.2]}><sphereGeometry args={[0.8, 10, 10]} /><meshStandardMaterial color="#6aa254" roughness={0.9} /></mesh>
        </>
      )}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 16]} />
        <meshBasicMaterial color="#20301c" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Flower({ x, z, tint }: { x: number; z: number; tint: string }): React.JSX.Element {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.015, 0.02, 0.24, 5]} /><meshStandardMaterial color="#3d7a44" /></mesh>
      <mesh position={[0, 0.27, 0]}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color={tint} /></mesh>
    </group>
  );
}

function Cloud({ x, y, z, s }: { x: number; y: number; z: number; s: number }): React.JSX.Element {
  return (
    <group position={[x, y, z]} scale={[s, s * 0.6, s]}>
      <mesh><sphereGeometry args={[1.6, 10, 10]} /><meshStandardMaterial color="#fff4e2" roughness={1} /></mesh>
      <mesh position={[1.4, -0.1, 0.2]}><sphereGeometry args={[1.1, 10, 10]} /><meshStandardMaterial color="#fff4e2" roughness={1} /></mesh>
      <mesh position={[-1.3, -0.15, -0.1]}><sphereGeometry args={[1.0, 10, 10]} /><meshStandardMaterial color="#fff4e2" roughness={1} /></mesh>
    </group>
  );
}

const STATION_SPOTS: [number, number][] = [
  [0, 23], [-17, 13], [-17, -6], [0, -19], [13, -13], [19, -4], [17.2, 8.2], [9, 16], [-8, 17], [-12, -1],
];

export function ForestPlaza(): React.JSX.Element {
  const trees = useMemo(() => {
    const rng = mulberry32(20260707);
    const list: { x: number; z: number; s: number; kind: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2 + rng() * 0.12;
      // leave the gate opening (south, +z) clear
      if (Math.abs(a - Math.PI / 2) < 0.001) continue;
      const dirX = Math.cos(a);
      const dirZ = Math.sin(a);
      if (dirZ > 0.88) continue;
      const r = 26.5 + rng() * 6;
      list.push({ x: dirX * r, z: dirZ * r, s: 0.85 + rng() * 0.7, kind: rng() < 0.6 ? 0 : 1 });
    }
    return list;
  }, []);

  const flowers = useMemo(() => {
    const rng = mulberry32(77);
    const tints = ['#e58bb0', '#f2c035', '#d9534f', '#9b7fd4', '#f0f0f0'];
    return Array.from({ length: 26 }, () => {
      const a = rng() * Math.PI * 2;
      const r = 6 + rng() * 17;
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, tint: tints[Math.floor(rng() * tints.length)] };
    });
  }, []);

  return (
    <group>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[34, 48]} />
        <meshStandardMaterial color="#7fae66" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[46, 48]} />
        <meshStandardMaterial color="#6a9757" roughness={1} />
      </mesh>
      {/* center plaza disc + paths to stations */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <circleGeometry args={[6.4, 36]} />
        <meshStandardMaterial color="#cfa26b" roughness={1} />
      </mesh>
      {STATION_SPOTS.map(([sx, sz], i) => {
        const len = Math.hypot(sx, sz);
        const ang = Math.atan2(sx, sz);
        return (
          <group key={i} rotation={[0, ang, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, len / 2]}>
              <planeGeometry args={[1.7, len]} />
              <meshStandardMaterial color="#c69a63" roughness={1} />
            </mesh>
          </group>
        );
      })}
      {STATION_SPOTS.map(([sx, sz], i) => (
        <mesh key={`pad-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[sx, 0.005, sz]}>
          <circleGeometry args={[3.1, 28]} />
          <meshStandardMaterial color="#cfa26b" roughness={1} />
        </mesh>
      ))}

      {trees.map((t, i) => <Tree key={i} {...t} />)}
      {flowers.map((f, i) => <Flower key={i} {...f} />)}
      <Cloud x={-16} y={20} z={-24} s={2.4} />
      <Cloud x={20} y={23} z={-10} s={3} />
      <Cloud x={4} y={21} z={26} s={2.2} />

      {/* glowing fireflies */}
      <Sparkles count={100} scale={[52, 6, 52]} position={[0, 3, 0]} size={2.8} speed={0.25} opacity={0.85} color="#ffe9a0" noise={1} />
      <Sparkles count={24} scale={[8, 5, 8]} position={[0, 4, 0]} size={3.4} speed={0.35} opacity={0.9} color="#fff2b8" noise={1} />

      {/* stations */}
      <FestivalGate />
      <ElectionWorkshop />
      <IssueTrail />
      <CandidateRallyStage />
      <ParrotNewsStand />
      <SecretBallotBooth />
      <CountingMachineArcade />
      <CountingTheater />
      <CampfireReflection />
      <ForestCharterTree />
      <Villagers />
      <VoterMeadow />
      <BoothVisitors />
      <FireflyGuide />
      <RemotePlayers />
    </group>
  );
}
