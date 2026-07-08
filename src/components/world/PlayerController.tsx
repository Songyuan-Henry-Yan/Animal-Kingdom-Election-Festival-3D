import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimalModel } from '../characters/AnimalModel';
import {
  playerPos, nearestInteractable, COLLIDERS, PLAZA_RADIUS, cameraFocus, playerFx, poolFx,
} from '../../state/registry';
import { useGame } from '../../state/store';
import { audio } from '../../lib/audio';
import { net } from '../../lib/net';

const SPEED = 6.2;
const GRAVITY = 14;
const JUMP_VELOCITY = 5.2;

const POOL_LEVEL = 0.06;

/** Height of the ground under (x, z) — the stage top is walkable, the pool is wadable. */
function groundHeight(x: number, z: number): number {
  if (Math.hypot(x - 6.8, z + 13.8) <= 1.8) return POOL_LEVEL; // inside Dolly's pool
  return Math.hypot(x, z + 19.5) <= 4.4 ? 0.5 : 0;
}

/** The Junior Forest Helper: WASD/arrow movement, orbit follow camera, proximity checks, audio zones. */
export function PlayerController(): React.JSX.Element {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const keys = useRef<Set<string>>(new Set());
  const yaw = useRef(0);
  const pitch = useRef(0.62);
  const heading = useRef(Math.PI);
  const walkT = useRef(0);
  const vy = useRef(0);
  const jumpQueued = useRef(false);
  const lastGround = useRef(0);
  const proximityClock = useRef(0);
  const zoneClock = useRef(0);
  const { gl, camera } = useThree();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current.add(e.code);
      if (e.code === 'Space') {
        e.preventDefault(); // Space is for hopping, not page scrolling
        if (!e.repeat && !useGame.getState().panel) jumpQueued.current = true;
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const blur = () => keys.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  // Mouse / touch drag orbits the camera.
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const downH = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const moveH = (e: PointerEvent) => {
      if (!dragging) return;
      yaw.current -= (e.clientX - lastX) * 0.0055;
      pitch.current = THREE.MathUtils.clamp(pitch.current + (e.clientY - lastY) * 0.003, 0.3, 1.05);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const upH = () => { dragging = false; };
    el.addEventListener('pointerdown', downH);
    window.addEventListener('pointermove', moveH);
    window.addEventListener('pointerup', upH);
    return () => {
      el.removeEventListener('pointerdown', downH);
      window.removeEventListener('pointermove', moveH);
      window.removeEventListener('pointerup', upH);
    };
  }, [gl]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const state = useGame.getState();
    const frozen = state.panel !== null;
    const k = keys.current;

    let mx = 0;
    let mz = 0;
    if (!frozen) {
      if (k.has('KeyW') || k.has('ArrowUp')) mz -= 1;
      if (k.has('KeyS') || k.has('ArrowDown')) mz += 1;
      if (k.has('KeyA') || k.has('ArrowLeft')) mx -= 1;
      if (k.has('KeyD') || k.has('ArrowRight')) mx += 1;
    }

    const moving = mx !== 0 || mz !== 0;
    if (moving) {
      const len = Math.hypot(mx, mz);
      mx /= len;
      mz /= len;
      const sin = Math.sin(yaw.current);
      const cos = Math.cos(yaw.current);
      const wx = mx * cos + mz * sin;
      const wz = -mx * sin + mz * cos;
      const wading = lastGround.current === POOL_LEVEL && playerPos.y <= POOL_LEVEL + 0.05;
      const speedNow = SPEED * (wading ? 0.55 : 1);
      playerPos.x += wx * speedNow * dt;
      playerPos.z += wz * speedNow * dt;
      heading.current = Math.atan2(wx, wz);
      walkT.current += dt * 9;
    }

    // keep inside the plaza
    const r = Math.hypot(playerPos.x, playerPos.z);
    if (r > PLAZA_RADIUS) {
      playerPos.x *= PLAZA_RADIUS / r;
      playerPos.z *= PLAZA_RADIUS / r;
    }
    // push out of props (unless we are high enough to be on top of a climbable one)
    for (const c of COLLIDERS) {
      const dx = playerPos.x - c.x;
      const dz = playerPos.z - c.z;
      const d = Math.hypot(dx, dz);
      if (c.top !== undefined) {
        if (playerPos.y >= c.top - 0.12) continue; // sailing over the rim
        if (d <= c.r - 0.45) continue; // already inside (on the stage / in the pool)
      }
      const min = c.r + 0.35;
      if (d < min && d > 0.0001) {
        playerPos.x = c.x + (dx / d) * min;
        playerPos.z = c.z + (dz / d) * min;
      }
    }

    // ---- hop physics (Space) ----
    const ground = groundHeight(playerPos.x, playerPos.z);
    const grounded = playerPos.y <= ground + 0.02 && vy.current <= 0;
    if (jumpQueued.current) {
      jumpQueued.current = false;
      if (grounded && !frozen) {
        vy.current = JUMP_VELOCITY;
        playerPos.y = ground + 0.03;
        audio.hop();
      }
    }
    if (!grounded || playerPos.y > ground) {
      vy.current -= GRAVITY * dt;
      playerPos.y += vy.current * dt;
      if (playerPos.y <= ground) {
        if (ground === POOL_LEVEL && lastGround.current !== POOL_LEVEL) {
          audio.splash();
          poolFx.splashAt = performance.now();
          net.sendFx('splash');
        }
        playerPos.y = ground;
        vy.current = 0;
      }
    } else {
      playerPos.y = ground;
      vy.current = 0;
    }
    lastGround.current = ground;

    if (group.current) {
      group.current.position.set(playerPos.x, playerPos.y, playerPos.z);
      if (performance.now() < playerFx.spinUntil && !state.reducedMotion) {
        group.current.rotation.y += dt * 11; // happy wave spin!
      } else {
        const target = heading.current;
        let diff = target - group.current.rotation.y;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        group.current.rotation.y += diff * Math.min(1, dt * 10);
      }
    }
    if (body.current) {
      const reduced = state.reducedMotion;
      body.current.position.y = moving && !reduced ? Math.abs(Math.sin(walkT.current)) * 0.09 : 0;
      const lean = moving && !reduced ? Math.sin(walkT.current) * 0.05 : 0;
      body.current.rotation.z = lean;
    }

    // ---- camera: cozy elevated diorama follow ----
    const dist = 10.5;
    const h = 3.2 + Math.sin(pitch.current) * 7.5;
    const camX = playerPos.x + Math.sin(yaw.current) * dist * Math.cos(pitch.current * 0.6);
    const camZ = playerPos.z + Math.cos(yaw.current) * dist * Math.cos(pitch.current * 0.6);
    const desired = new THREE.Vector3(camX, h, camZ);
    const lerp = 1 - Math.pow(0.0001, dt);
    camera.position.lerp(desired, lerp);
    const look = new THREE.Vector3(playerPos.x, playerPos.y + 1.1, playerPos.z);
    if (cameraFocus.active) look.lerp(cameraFocus.point, 0.55);
    camera.lookAt(look);

    // ---- share our position with the Festival Room (throttled inside) ----
    net.maybeSendPos(
      playerPos.x, playerPos.y, playerPos.z,
      group.current ? group.current.rotation.y : heading.current,
      moving,
    );

    // ---- proximity prompt (10x/sec) ----
    proximityClock.current += dt;
    if (proximityClock.current > 0.1) {
      proximityClock.current = 0;
      const near = nearestInteractable(playerPos.x, playerPos.z);
      state.setNearby(near ? { id: near.id, label: near.label } : null);
    }

    // ---- area-based ambience levels ----
    zoneClock.current += dt;
    if (zoneClock.current > 0.15) {
      zoneClock.current = 0;
      const fall = (x: number, z: number, radius: number) => {
        const d = Math.hypot(playerPos.x - x, playerPos.z - z);
        const v = Math.max(0, 1 - d / radius);
        return v * v;
      };
      audio.setZoneLevels({
        fire: fall(-8, 17, 8),
        water: fall(6.8, -13.8, 8) * 0.6,
        crowd: fall(0, -19, 12) * 0.9,
        hum: fall(17.5, 8.5, 9),
        trees: Math.min(1, Math.max(0, (r - 15) / 11)) * 0.9,
      });
    }
  });

  return (
    <group ref={group} position={[0, 0, 27]}>
      <group ref={body}>
        <AnimalModel species="helper" color="#c9a06b" accent="#5aa04f" />
      </group>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 20]} />
        <meshBasicMaterial color="#20301c" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}
