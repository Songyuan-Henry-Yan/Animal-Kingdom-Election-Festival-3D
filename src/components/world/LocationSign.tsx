import React, { useEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { PanelKind } from '../../types/game';
import { makeLabelTexture } from '../../lib/textTexture';
import { registerInteractable } from '../../state/registry';
import { useGame } from '../../state/store';
import { GlowRing } from '../characters/CandidateNPC';

interface Props {
  id: string;
  kind: PanelKind;
  targetId?: string;
  signText: string;
  promptLabel: string;
  position: [number, number, number];
  radius?: number;
  rotationY?: number;
  ringRadius?: number;
}

/**
 * A wooden sign that doubles as the interaction trigger for a station.
 * The trigger registers its WORLD position (signs often live inside moved or
 * rotated station groups, so local coordinates would put the hotspot in the
 * wrong place — this fixes the news stand / ballot booth / theater triggers).
 */
export function LocationSign({
  id, kind, targetId, signText, promptLabel, position,
  radius = 3.2, rotationY = 0, ringRadius = 1.6,
}: Props): React.JSX.Element {
  const nearby = useGame((s) => s.nearby);
  const group = useRef<THREE.Group>(null);
  const { tex, aspect } = useMemo(() => makeLabelTexture(signText, { fontPx: 42 }), [signText]);

  useEffect(() => {
    const world = new THREE.Vector3();
    group.current?.getWorldPosition(world);
    return registerInteractable({
      id, kind, targetId, label: promptLabel, x: world.x, z: world.z, radius,
    });
  }, [id, kind, targetId, promptLabel, radius]);

  const h = 0.6;
  const w = Math.min(2.6, h * aspect);

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 1.4, 10]} />
        <meshStandardMaterial color="#7a5230" roughness={0.9} />
      </mesh>
      <RoundedBox args={[w + 0.25, h + 0.22, 0.1]} radius={0.05} position={[0, 1.62, 0]}>
        <meshStandardMaterial color="#a4713d" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 1.62, 0.06]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
      <GlowRing active={nearby?.id === id} radius={ringRadius} />
    </group>
  );
}
