import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimalModel } from '../characters/AnimalModel';
import { NameLabel, GlowRing } from '../characters/CandidateNPC';
import { WANDERERS, type WandererDef } from '../../data/wanderers';
import {
  registerInteractable, type Interactable, COLLIDERS, playerPos,
} from '../../state/registry';
import { useGame } from '../../state/store';

/** Gentle stroll speed — slower than the player, so they feel unhurried. */
const WALK_SPEED = 1.7;
/** Wanderers roam this green ring, staying off the crowded plaza centre. */
const ROAM_MIN = 7;
const ROAM_MAX = 23;

interface RoamState {
  x: number;
  z: number;
  tx: number;
  tz: number;
  heading: number;
  /** Seconds left to stand still before picking a new spot. */
  pause: number;
  walkT: number;
}

/** A random point in the walkable green ring. */
function pickTarget(): [number, number] {
  const a = Math.random() * Math.PI * 2;
  const r = ROAM_MIN + Math.random() * (ROAM_MAX - ROAM_MIN);
  return [Math.cos(a) * r, Math.sin(a) * r];
}

function Wanderer({ w, index }: { w: WandererDef; index: number }): React.JSX.Element {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const nearby = useGame((s) => s.nearby);
  const id = `wanderer-${w.id}`;

  // Spread starting positions evenly around the ring.
  const start = useMemo<[number, number]>(() => {
    const a = (index / WANDERERS.length) * Math.PI * 2;
    const r = ROAM_MIN + ((index * 5) % (ROAM_MAX - ROAM_MIN));
    return [Math.cos(a) * r, Math.sin(a) * r];
  }, [index]);

  const st = useRef<RoamState>({
    x: start[0], z: start[1], tx: start[0], tz: start[1], heading: 0,
    pause: 1 + Math.random() * 3, walkT: 0,
  });

  // One shared interactable object we keep mutating so the E-prompt follows along.
  const item = useRef<Interactable>({
    id, kind: 'wanderer', targetId: w.id, label: `Say hi to ${w.name}`,
    x: start[0], z: start[1], radius: 2.4,
  });

  useEffect(() => registerInteractable(item.current), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = st.current;
    const reduced = useGame.getState().reducedMotion;

    // Reduced motion: stand still at the start spot, but stay chattable.
    if (!reduced) {
      if (s.pause > 0) {
        s.pause -= dt;
      } else {
        const dx = s.tx - s.x;
        const dz = s.tz - s.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.3) {
          // Arrived — rest a moment, then pick a fresh destination.
          s.pause = 1.5 + Math.random() * 3.5;
          const [ntx, ntz] = pickTarget();
          s.tx = ntx;
          s.tz = ntz;
        } else {
          const step = Math.min(WALK_SPEED * dt, d);
          s.x += (dx / d) * step;
          s.z += (dz / d) * step;
          s.heading = Math.atan2(dx, dz);
          s.walkT += dt * 8;
        }
      }

      // Nudge out of any big props, just like the player does.
      for (const c of COLLIDERS) {
        const dx = s.x - c.x;
        const dz = s.z - c.z;
        const d = Math.hypot(dx, dz);
        const min = c.r + 0.4;
        if (d < min && d > 0.0001) {
          s.x = c.x + (dx / d) * min;
          s.z = c.z + (dz / d) * min;
        }
      }
    }

    // Publish position to the world + interactable registry.
    item.current.x = s.x;
    item.current.z = s.z;
    if (group.current) {
      group.current.position.set(s.x, 0, s.z);
      const diff = Math.atan2(Math.sin(s.heading - group.current.rotation.y), Math.cos(s.heading - group.current.rotation.y));
      group.current.rotation.y += diff * Math.min(1, dt * 8);
    }
    if (body.current) {
      const walking = !reduced && s.pause <= 0 && Math.hypot(s.tx - s.x, s.tz - s.z) >= 0.3;
      body.current.position.y = walking ? Math.abs(Math.sin(s.walkT)) * 0.08 : 0;
    }
  });

  return (
    <group ref={group} position={[start[0], 0, start[1]]} scale={[0.9, 0.9, 0.9]}>
      <group ref={body}>
        <AnimalModel species={w.species} color={w.color} accent={w.accent} />
      </group>
      <NameLabel text={w.name} y={1.85} scale={0.75} />
      <GlowRing active={nearby?.id === id} radius={1.0} />
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#20301c" transparent opacity={0.2} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** A little crowd of forest folk wandering the festival grounds. */
export function Wanderers(): React.JSX.Element {
  return (
    <group>
      {WANDERERS.map((w, i) => <Wanderer key={w.id} w={w} index={i} />)}
    </group>
  );
}
