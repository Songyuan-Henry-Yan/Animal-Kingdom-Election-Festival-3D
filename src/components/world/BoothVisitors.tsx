import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { AnimalModel, type Species } from '../characters/AnimalModel';
import { VOTER_CHARACTERS } from '../../data/voters';
import { playerPos } from '../../state/registry';
import { useGame } from '../../state/store';
import { audio } from '../../lib/audio';

/** Where ambient voters appear, vote, and leave. */
const SPAWN: [number, number] = [12.5, 2.8];
const BOOTH_FRONT: [number, number] = [17.4, -2.1];
const EXIT: [number, number] = [13.2, 3.8];
const WALK_SPEED = 2.1;

type Phase = 'waiting' | 'walkIn' | 'voting' | 'walkOut';

interface Visitor {
  species: Species;
  color: string;
  accent: string;
}

function pickVisitor(): Visitor {
  const all = Object.values(VOTER_CHARACTERS);
  const v = all[Math.floor(Math.random() * all.length)];
  return { species: v.species, color: v.color, accent: v.accent };
}

/**
 * Every so often a forest animal strolls up to the Secret Ballot Booth, slips
 * behind the curtain to vote (privately!), and trots away. Purely ambient —
 * a gentle reminder that the whole forest is voting today.
 */
export function BoothVisitors(): React.JSX.Element | null {
  const group = useRef<any>(null);
  const state = useRef({ phase: 'waiting' as Phase, t: 3 + Math.random() * 8, x: SPAWN[0], z: SPAWN[1] });
  const [visitor, setVisitor] = useState<Visitor>(pickVisitor);
  const [visible, setVisible] = useState(false);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const st = state.current;
    const reduced = useGame.getState().reducedMotion;
    const nearPlayer = Math.hypot(playerPos.x - BOOTH_FRONT[0], playerPos.z - BOOTH_FRONT[1]) < 11;

    const walkToward = (tx: number, tz: number): boolean => {
      const dx = tx - st.x;
      const dz = tz - st.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.15) return true;
      const step = WALK_SPEED * dt;
      st.x += (dx / d) * Math.min(step, d);
      st.z += (dz / d) * Math.min(step, d);
      if (group.current) {
        group.current.position.set(st.x, 0, st.z);
        group.current.rotation.y = Math.atan2(dx, dz);
      }
      return false;
    };

    st.t -= dt;
    switch (st.phase) {
      case 'waiting':
        if (st.t <= 0) {
          setVisitor(pickVisitor());
          st.x = SPAWN[0];
          st.z = SPAWN[1];
          if (reduced) {
            st.x = BOOTH_FRONT[0];
            st.z = BOOTH_FRONT[1];
            st.phase = 'voting';
            st.t = 2.6;
          } else {
            st.phase = 'walkIn';
          }
          setVisible(true);
          if (group.current) group.current.position.set(st.x, 0, st.z);
        }
        break;
      case 'walkIn':
        if (walkToward(BOOTH_FRONT[0], BOOTH_FRONT[1])) {
          st.phase = 'voting';
          st.t = 2.6;
          setVisible(false); // slips behind the curtain
          if (nearPlayer) audio.curtain();
        }
        break;
      case 'voting':
        if (st.t <= 0) {
          setVisible(true);
          if (nearPlayer) audio.stickerPop();
          if (reduced) {
            st.phase = 'waiting';
            st.t = 16 + Math.random() * 18;
            setVisible(false);
          } else {
            st.phase = 'walkOut';
          }
        }
        break;
      case 'walkOut':
        if (walkToward(EXIT[0], EXIT[1])) {
          st.phase = 'waiting';
          st.t = 14 + Math.random() * 20;
          setVisible(false);
        }
        break;
    }
  });

  return (
    <group ref={group} position={[SPAWN[0], 0, SPAWN[1]]} visible={visible} scale={[0.85, 0.85, 0.85]}>
      <AnimalModel species={visitor.species} color={visitor.color} accent={visitor.accent} />
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#20301c" transparent opacity={0.2} depthWrite={false} />
      </mesh>
    </group>
  );
}
