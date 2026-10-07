import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../../state/store';
import {
  planCountShow, showPhase, ribbonTally, sampleBallots, stageSlots, THEATER_CENTER,
  type CountShowState, type ShowPlan, type StageSlot,
} from '../../lib/countShow';
import { CANDIDATES } from '../../data/candidates';
import { AnimalModel, type Species } from '../characters/AnimalModel';
import { makeLabelTexture } from '../../lib/textTexture';
import type { CandidateId } from '../../types/game';

const FLIGHT_MS = 650;
const CONFETTI = 44;
const CONFETTI_MS = 1300;
const PEDESTAL_TOP = new THREE.Vector3(0, 1.08, 0);
const CONFETTI_COLORS = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#f78c6b', '#c792ea', '#ffffff'];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutBack = (k: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};

/** Name tag that grows a ribbon count as machines pick this animal. */
function ShowLabel({ cid, wins }: { cid: CandidateId; wins: number }): React.JSX.Element {
  const c = CANDIDATES[cid];
  const text = wins > 0 ? `${c.emoji} ${c.name}  🎀${wins > 1 ? `×${wins}` : ''}` : `${c.emoji} ${c.name}`;
  const { tex, aspect } = useMemo(
    () => makeLabelTexture(text, { fontPx: 44, bg: wins > 0 ? '#fff1c7' : undefined }),
    [text, wins],
  );
  const h = wins > 0 ? 0.36 : 0.3;
  return (
    <Billboard position={[0, 2.05, 0]}>
      <mesh renderOrder={5}>
        <planeGeometry args={[h * aspect, h]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} depthTest={false} />
      </mesh>
    </Billboard>
  );
}

function Stage({ show, plan }: { show: CountShowState; plan: ShowPlan }): React.JSX.Element {
  const slots = useMemo(() => stageSlots(plan.roster.length), [plan.roster.length]);
  const slotOf = useMemo(() => {
    const m = new Map<CandidateId, StageSlot>();
    plan.roster.forEach((cid, i) => m.set(cid, slots[i]));
    return m;
  }, [plan.roster, slots]);

  const actors = useRef<(THREE.Group | null)[]>([]);
  const hoppers = useRef<(THREE.Group | null)[]>([]);
  const ballotsRef = useRef<THREE.InstancedMesh>(null);
  const confettiRef = useRef<THREE.InstancedMesh>(null);
  const spot = useRef<THREE.Group>(null);
  const spotCone = useRef<THREE.MeshBasicMaterial>(null);
  const spotDisc = useRef<THREE.MeshBasicMaterial>(null);
  const [shown, setShown] = useState(0);
  const lastStep = useRef(-1);
  const confettiAt = useRef(-1e9);
  const confettiOrigin = useRef(new THREE.Vector3());

  // Every k-th real ballot becomes a paper prop flying to that voter's FIRST choice.
  const flights = useMemo(() => {
    const sample = sampleBallots(show.ballots, 60);
    const pileCount = new Map<CandidateId, number>();
    const n = sample.length;
    const launchSpan = plan.ballotsTo - plan.ballotsFrom - FLIGHT_MS;
    return sample.map((b, i) => {
      const target = b.ranking[0];
      const slot = slotOf.get(target) ?? slots[0];
      const k = pileCount.get(target) ?? 0;
      pileCount.set(target, k + 1);
      const jitter = ((i * 7919) % 100) / 100;
      return {
        color: new THREE.Color('#fffaf0').lerp(new THREE.Color(CANDIDATES[target].color), 0.45),
        start: plan.ballotsFrom + (n <= 1 ? 0 : (i / (n - 1)) * launchSpan),
        end: new THREE.Vector3(slot.pileX + (jitter - 0.5) * 0.12, 0.035 + k * 0.034, slot.pileZ + (jitter - 0.5) * 0.1),
        lift: 1.3 + jitter * 0.7,
        yaw: jitter * 6.28,
      };
    });
  }, [show.ballots, plan, slotOf, slots]);

  const confetti = useMemo(() => Array.from({ length: CONFETTI }, (_, i) => {
    const a = (i / CONFETTI) * Math.PI * 2 + ((i * 37) % 10) * 0.05;
    const speed = 1.6 + ((i * 53) % 10) * 0.16;
    return {
      v: new THREE.Vector3(Math.cos(a) * speed * 0.55, 3.6 + ((i * 29) % 10) * 0.22, Math.sin(a) * speed * 0.55),
      spin: 4 + (i % 5),
      color: new THREE.Color(CONFETTI_COLORS[i % CONFETTI_COLORS.length]),
    };
  }), []);

  useLayoutEffect(() => {
    const b = ballotsRef.current;
    if (b) {
      flights.forEach((f, i) => b.setColorAt(i, f.color));
      if (b.instanceColor) b.instanceColor.needsUpdate = true;
    }
    const c = confettiRef.current;
    if (c) {
      confetti.forEach((p, i) => c.setColorAt(i, p.color));
      if (c.instanceColor) c.instanceColor.needsUpdate = true;
    }
  }, [flights, confetti]);

  const tmp = useMemo(() => ({
    m: new THREE.Matrix4(),
    q: new THREE.Quaternion(),
    e: new THREE.Euler(),
    p: new THREE.Vector3(),
    s: new THREE.Vector3(1, 1, 1),
    zero: new THREE.Vector3(0, 0, 0),
  }), []);

  useFrame(({ clock }, delta) => {
    const elapsed = performance.now() - show.startedAt;
    const phase = showPhase(plan, elapsed);
    const t = clock.elapsedTime;

    // --- step bookkeeping: ribbons, confetti, label refresh ---
    const stepIdx = phase.kind === 'step' ? phase.index : phase.kind === 'outro' ? plan.steps.length : -1;
    if (stepIdx !== lastStep.current) {
      lastStep.current = stepIdx;
      setShown(Math.max(0, phase.kind === 'step' ? phase.index + 1 : phase.kind === 'outro' ? plan.steps.length : 0));
      if (phase.kind === 'step') {
        const slot = slotOf.get(plan.steps[phase.index].winnerId);
        if (slot) {
          confettiOrigin.current.set(slot.x, 1.2, slot.z);
          confettiAt.current = performance.now();
        }
      }
    }

    const currentWinner = phase.kind === 'step' ? plan.steps[phase.index].winnerId : null;
    const tally = phase.kind === 'outro' ? ribbonTally(plan, plan.steps.length) : null;

    // --- candidates: pop in, idle, and hop when a machine picks them ---
    plan.roster.forEach((cid, i) => {
      const g = actors.current[i];
      const hop = hoppers.current[i];
      if (!g || !hop) return;
      const pop = easeOutBack(clamp01((elapsed - 120 - i * 95) / 420));
      g.scale.setScalar(Math.max(0.0001, pop));
      let y = Math.abs(Math.sin(t * 1.8 + i)) * 0.03;
      if (phase.kind === 'step' && cid === currentWinner) {
        const k = clamp01(phase.t / 520);
        y = Math.sin(k * Math.PI) * 0.6;
      } else if (tally && tally[cid]) {
        y = Math.abs(Math.sin(t * 5 + i * 1.3)) * 0.28;
      }
      hop.position.y = y;
    });

    // --- paper ballots in flight ---
    const b = ballotsRef.current;
    if (b) {
      flights.forEach((f, i) => {
        const k = clamp01((elapsed - f.start) / FLIGHT_MS);
        if (elapsed < f.start) {
          tmp.m.compose(PEDESTAL_TOP, tmp.q.identity(), tmp.zero);
        } else {
          tmp.p.lerpVectors(PEDESTAL_TOP, f.end, k);
          tmp.p.y += Math.sin(k * Math.PI) * f.lift;
          tmp.e.set((1 - k) * 7, f.yaw * k, (1 - k) * 3);
          tmp.q.setFromEuler(tmp.e);
          tmp.m.compose(tmp.p, tmp.q, tmp.s);
        }
        b.setMatrixAt(i, tmp.m);
      });
      b.instanceMatrix.needsUpdate = true;
    }

    // --- spotlight glides to each machine's winner ---
    const sp = spot.current;
    if (sp) {
      const target = currentWinner ? slotOf.get(currentWinner) : null;
      let strength = 0;
      if (phase.kind === 'step') strength = clamp01(phase.t / 180);
      if (phase.kind === 'outro') strength = 1 - clamp01(phase.t / 500);
      if (target) {
        const first = phase.kind === 'step' && phase.index === 0 && phase.t < 40;
        const lerp = first ? 1 : 1 - Math.pow(0.0005, Math.min(delta, 0.5));
        sp.position.x += (target.x - sp.position.x) * lerp;
        sp.position.z += (target.z - sp.position.z) * lerp;
      }
      sp.visible = strength > 0.01;
      if (spotCone.current) spotCone.current.opacity = 0.2 * strength;
      if (spotDisc.current) spotDisc.current.opacity = 0.55 * strength;
    }

    // --- confetti burst for every reveal ---
    const c = confettiRef.current;
    if (c) {
      const age = (performance.now() - confettiAt.current) / 1000;
      const live = age >= 0 && age < CONFETTI_MS / 1000;
      confetti.forEach((p, i) => {
        if (!live) {
          tmp.m.compose(tmp.zero, tmp.q.identity(), tmp.zero);
        } else {
          tmp.p.copy(confettiOrigin.current).addScaledVector(p.v, age);
          tmp.p.y -= 4.2 * age * age;
          tmp.e.set(age * p.spin, age * p.spin * 0.7, age * 2);
          tmp.q.setFromEuler(tmp.e);
          tmp.m.compose(tmp.p, tmp.q, tmp.s);
        }
        c.setMatrixAt(i, tmp.m);
      });
      c.instanceMatrix.needsUpdate = true;
    }
  });

  const wins = ribbonTally(plan, shown);

  return (
    <group position={[THEATER_CENTER[0], 0, THEATER_CENTER[1]]}>
      {plan.roster.map((cid, i) => {
        const slot = slots[i];
        const c = CANDIDATES[cid];
        return (
          <group key={cid} position={[slot.x, 0, slot.z]} rotation={[0, slot.ry, 0]}>
            <group ref={(g) => { actors.current[i] = g; }} scale={0.0001}>
              <group ref={(g) => { hoppers.current[i] = g; }}>
                <AnimalModel species={c.species as Species} color={c.color} accent={c.accent} />
              </group>
              <ShowLabel cid={cid} wins={wins[cid] ?? 0} />
            </group>
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.55, 24]} />
              <meshStandardMaterial color="#e9d6ad" roughness={0.9} />
            </mesh>
          </group>
        );
      })}

      <instancedMesh ref={ballotsRef} args={[undefined, undefined, flights.length]} frustumCulled={false}>
        <boxGeometry args={[0.3, 0.018, 0.21]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </instancedMesh>

      <instancedMesh ref={confettiRef} args={[undefined, undefined, CONFETTI]} frustumCulled={false}>
        <planeGeometry args={[0.09, 0.055]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </instancedMesh>

      <group ref={spot} visible={false}>
        <mesh position={[0, 2.6, 0]} renderOrder={3}>
          <cylinderGeometry args={[0.16, 1.0, 5.2, 28, 1, true]} />
          <meshBasicMaterial
            ref={spotCone}
            color="#fff2c2"
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
          <circleGeometry args={[1.0, 32]} />
          <meshBasicMaterial
            ref={spotDisc}
            color="#fff2c2"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

/** Mounted inside the Canvas; draws nothing unless a Count Show is playing. */
export function CountShow(): React.JSX.Element | null {
  const show = useGame((s) => s.countShow);
  const plan = useMemo(() => (show ? planCountShow(show.run, show.ballots) : null), [show]);
  if (!show || !plan) return null;
  return <Stage key={show.id} show={show} plan={plan} />;
}
