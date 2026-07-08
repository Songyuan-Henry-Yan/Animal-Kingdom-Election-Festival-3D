import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { poolFx } from '../../state/registry';
import { makeLabelTexture } from '../../lib/textTexture';
import { CANDIDATES } from '../../data/candidates';
import { CandidateNPC } from '../characters/CandidateNPC';
import { useGame } from '../../state/store';
import { LocationSign } from './LocationSign';

const SPLASH_MS = 650;

/** Expanding ring + flying droplets when someone cannonballs into the pool. */
function PoolSplash(): React.JSX.Element {
  const ring = useRef<THREE.Mesh>(null);
  const drops = useRef<THREE.Group>(null);

  useFrame(() => {
    const age = performance.now() - poolFx.splashAt;
    const active = poolFx.splashAt > 0 && age < SPLASH_MS;
    const k = Math.min(1, age / SPLASH_MS);
    if (ring.current) {
      ring.current.visible = active;
      const m = ring.current.material as THREE.MeshBasicMaterial;
      if (active) {
        const sc = 0.4 + k * 1.5;
        ring.current.scale.set(sc, sc, sc);
        m.opacity = 0.75 * (1 - k);
      }
    }
    if (drops.current) {
      drops.current.visible = active;
      if (active) {
        drops.current.children.forEach((d, i) => {
          const a = (i / 7) * Math.PI * 2;
          const rr = 0.25 + k * 0.9;
          d.position.set(Math.cos(a) * rr, 0.15 + Math.sin(k * Math.PI) * (0.6 + (i % 3) * 0.18), Math.sin(a) * rr);
        });
      }
    }
  });

  return (
    <group position={[0, 0.26, 0]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.55, 0.72, 26]} />
        <meshBasicMaterial color="#eafcff" transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={drops} visible={false}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshBasicMaterial color="#cdeef5" transparent opacity={0.9} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * The wooden rally stage. Today's roster (from the Magic Election Seed and age
 * mode) stands on stage; Dolly greets voters from her pool when she is running.
 * After the election has been counted, the candidates move to the campfire.
 */
export function CandidateRallyStage(): React.JSX.Element {
  const done = useGame((s) => s.lastRun !== null);
  const roster = useGame((s) => s.game.roster);
  const banner = useMemo(() => makeLabelTexture('Candidate Rally Stage', { fontPx: 46, bg: '#f6e2bd' }), []);

  const dollyRuns = roster.includes('dolly');
  const onStage = roster.filter((c) => c !== 'dolly');
  const frontRow = onStage.length <= 4 ? onStage : onStage.slice(0, Math.ceil(onStage.length / 2));
  const backRow = onStage.length <= 4 ? [] : onStage.slice(Math.ceil(onStage.length / 2));

  const spread = (row: typeof onStage, z: number) =>
    row.map((cid, i) => ({
      cid,
      pos: [(i - (row.length - 1) / 2) * 2.1, 0.5, z] as [number, number, number],
    }));

  return (
    <group>
      {/* platform */}
      <mesh position={[0, 0.25, -19.5]}>
        <cylinderGeometry args={[4.3, 4.5, 0.5, 24]} />
        <meshStandardMaterial color="#9c6a3f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.51, -19.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.3, 24]} />
        <meshStandardMaterial color="#b8834f" roughness={0.85} />
      </mesh>
      {/* backdrop banner */}
      {[-3.4, 3.4].map((x) => (
        <mesh key={x} position={[x, 1.9, -22.6]}>
          <cylinderGeometry args={[0.1, 0.12, 3.4, 8]} />
          <meshStandardMaterial color="#7a5230" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 3.1, -22.6]}>
        <planeGeometry args={[6.6, 0.85]} />
        <meshBasicMaterial map={banner.tex} transparent side={2} />
      </mesh>

      {!done && (
        <>
          {spread(frontRow, -17.6).map(({ cid, pos }) => (
            <CandidateNPC key={cid} candidate={CANDIDATES[cid]} position={pos} idSuffix="stage" />
          ))}
          {spread(backRow, -20.9).map(({ cid, pos }) => (
            <CandidateNPC key={cid} candidate={CANDIDATES[cid]} position={pos} idSuffix="stage" />
          ))}
        </>
      )}

      {/* Dolly's pool, beside the stage (she swims even when resting) */}
      <group position={[6.8, 0, -13.8]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[1.9, 2.05, 0.25, 22]} />
          <meshStandardMaterial color="#59b7c9" transparent opacity={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.98, 0.14, 10, 24]} />
          <meshStandardMaterial color="#9aa3b0" roughness={0.95} />
        </mesh>
        {!done && dollyRuns && (
          <CandidateNPC candidate={CANDIDATES.dolly} position={[0, 0.2, 0]} idSuffix="stage" />
        )}
        <PoolSplash />
      </group>

      <LocationSign
        id="rally-sign"
        kind="intro"
        targetId="rally"
        signText={'Candidate Rally Stage'}
        promptLabel="What happens at the Rally Stage?"
        position={[-4.6, 0, -14.6]}
        radius={2.4}
        rotationY={0.7}
      />
    </group>
  );
}
