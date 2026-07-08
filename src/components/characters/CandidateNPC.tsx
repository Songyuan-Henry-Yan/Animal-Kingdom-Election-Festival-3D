import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { Candidate } from '../../types/game';
import { AnimalModel, type Species } from './AnimalModel';
import { makeLabelTexture } from '../../lib/textTexture';
import { registerInteractable, playerPos } from '../../state/registry';
import { useGame } from '../../state/store';
import { hashString } from '../../lib/random';

interface Props {
  candidate: Candidate;
  position: [number, number, number];
  rotationY?: number;
  idSuffix?: string;
  seated?: boolean;
}

export function NameLabel({ text, y = 2.1, scale = 1 }: { text: string; y?: number; scale?: number }): React.JSX.Element {
  const { tex, aspect } = useMemo(() => makeLabelTexture(text, { fontPx: 44 }), [text]);
  const h = 0.34 * scale;
  return (
    <Billboard position={[0, y, 0]}>
      <mesh>
        <planeGeometry args={[h * aspect, h]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} />
      </mesh>
    </Billboard>
  );
}

export function GlowRing({ active, radius = 0.85 }: { active: boolean; radius?: number }): React.JSX.Element {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshBasicMaterial;
    const reduced = useGame.getState().reducedMotion;
    const pulse = reduced ? 0.5 : 0.45 + Math.sin(clock.elapsedTime * 3.2) * 0.25;
    m.opacity = active ? pulse : 0.12;
  });
  return (
    <mesh ref={ref} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.72, radius, 32]} />
      <meshBasicMaterial color="#ffe08a" transparent opacity={0.12} depthWrite={false} />
    </mesh>
  );
}

export function CandidateNPC({ candidate, position, rotationY = 0, idSuffix = 'stage', seated = false }: Props): React.JSX.Element {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const worldRef = useRef(new THREE.Vector3());
  const [hover, setHover] = useState(false);
  const nearby = useGame((s) => s.nearby);
  const openPanelFor = useGame((s) => s.openPanelFor);
  const id = `cand-${candidate.id}-${idSuffix}`;
  const phase = useMemo(() => (hashString(candidate.id) % 100) / 100 * Math.PI * 2, [candidate.id]);

  // Register at WORLD coordinates (Dolly's pool and the campfire circle are nested groups).
  useEffect(() => {
    const world = new THREE.Vector3();
    group.current?.getWorldPosition(world);
    worldRef.current.copy(world);
    return registerInteractable({
      id,
      kind: 'candidate',
      targetId: candidate.id,
      label: `Talk to ${candidate.name}`,
      x: world.x,
      z: world.z,
      radius: 2.6,
    });
  }, [id, candidate.id, candidate.name]);

  useFrame(({ clock }) => {
    if (!inner.current) return;
    const reduced = useGame.getState().reducedMotion;
    const t = clock.elapsedTime;
    const bob = reduced ? 0 : Math.sin(t * 1.7 + phase) * 0.045;
    inner.current.position.y = (seated ? -0.25 : 0) + Math.abs(bob);
    inner.current.rotation.y = reduced ? 0 : Math.sin(t * 0.6 + phase) * 0.08;
    const s = 1 + (reduced ? 0 : Math.sin(t * 2.3 + phase) * 0.012);
    inner.current.scale.set(s, 1 / s, s);
  });

  const onClick = () => {
    const w = worldRef.current;
    const d = Math.hypot(playerPos.x - w.x, playerPos.z - w.z);
    if (d < 7) openPanelFor('candidate', candidate.id, [w.x, 1.2, w.z]);
  };

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      <group
        ref={inner}
        onPointerOver={(e: { stopPropagation: () => void }) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
        onClick={onClick}
      >
        <AnimalModel species={candidate.species as Species} color={candidate.color} accent={candidate.accent} />
      </group>
      <NameLabel text={candidate.name} scale={hover ? 1.25 : 1} />
      {/* soft blob shadow */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 20]} />
        <meshBasicMaterial color="#20301c" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <GlowRing active={nearby?.id === id} />
    </group>
  );
}
