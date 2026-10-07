import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../../lib/random';
import { COLLIDERS } from '../../state/registry';
import { useGame } from '../../state/store';

/**
 * Festival dressing: string lanterns around the plaza, grass tufts and bushes,
 * and a few butterflies. All procedural — no models or image files.
 */

/** Where the stations sit (kept in sync with ForestPlaza's path layout). */
export const STATION_SPOTS: [number, number][] = [
  [0, 23], [-17, 13], [-17, -6], [0, -19], [13, -13], [19, -4], [17.2, 8.2], [9, 16], [-8, 17], [-12, -1],
];

/** Big props that need a little elbow room (x, z, radius). */
const KEEP_CLEAR: [number, number, number][] = [
  [9, 16, 5.9],      // counting theater
  [0, -19.5, 5.2],   // rally stage
  [6.8, -13.8, 2.6], // dolly's pool
  [17.2, 8.2, 6.2],  // machine arcade
  [-12, -1, 5.2],    // neighborhood green
  [-17, 13, 3.8],    // workshop hut
  [-8, 17, 3.6],     // campfire
  [-19.5, 9.5, 1.6], // issue trailhead sign
  // issue-trail leaf posts
  [-21.5, 6.5, 1.5], [-21, 2.5, 1.5], [-20, -1.5, 1.5], [-19, -5.5, 1.5], [-17.5, -9, 1.5],
  [-15.5, -12, 1.5], [-13, -14.5, 1.5], [-10.5, -16.5, 1.5], [-8, -18, 1.5],
];

function nearPath(x: number, z: number, pad: number): boolean {
  for (const [sx, sz] of STATION_SPOTS) {
    const len = Math.hypot(sx, sz);
    const ux = sx / len;
    const uz = sz / len;
    const along = x * ux + z * uz;
    if (along < 0 || along > len) continue;
    const off = Math.abs(x * uz - z * ux);
    if (off < pad) return true;
  }
  return false;
}

function blocked(x: number, z: number, stationPad: number, pathPad: number): boolean {
  for (const [sx, sz] of STATION_SPOTS) if (Math.hypot(x - sx, z - sz) < stationPad) return true;
  for (const [kx, kz, kr] of KEEP_CLEAR) if (Math.hypot(x - kx, z - kz) < kr) return true;
  return nearPath(x, z, pathPad);
}

/* ------------------------------ lanterns ------------------------------ */

const LANTERN_RADIUS = 7.6;
const POLE_HEIGHT = 3.2;
const LANTERN_COLORS = ['#ffcf6b', '#ff9f7f', '#9fdcff', '#c6f29a', '#f7a9d6', '#ffe7a3'];

let haloTexture: THREE.CanvasTexture | null = null;
function getHalo(): THREE.CanvasTexture {
  if (haloTexture) return haloTexture;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  haloTexture = new THREE.CanvasTexture(c);
  haloTexture.colorSpace = THREE.SRGBColorSpace;
  return haloTexture;
}

/** Pole angles sit halfway between the paths, so nobody walks into one. */
function poleAngles(): number[] {
  const path = STATION_SPOTS.map(([x, z]) => Math.atan2(z, x)).sort((a, b) => a - b);
  const out: number[] = [];
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = i + 1 < path.length ? path[i + 1] : path[0] + Math.PI * 2;
    if (b - a < THREE.MathUtils.degToRad(20)) continue; // two paths too close — skip this gap
    out.push((a + b) / 2);
  }
  return out;
}

const POLES = poleAngles().map((a) => [Math.cos(a) * LANTERN_RADIUS, Math.sin(a) * LANTERN_RADIUS] as [number, number]);

// Thin poles still deserve a collider, so explorers bump instead of ghosting through.
for (const [x, z] of POLES) {
  if (!COLLIDERS.some((c) => c.x === x && c.z === z)) COLLIDERS.push({ x, z, r: 0.18 });
}

function Lanterns(): React.JSX.Element {
  const bobs = useRef<(THREE.Group | null)[]>([]);
  const halo = useMemo(() => getHalo(), []);

  const spans = useMemo(() => {
    return POLES.map((p, i) => {
      const q = POLES[(i + 1) % POLES.length];
      const sag = 0.42;
      const at = (t: number) => new THREE.Vector3(
        p[0] + (q[0] - p[0]) * t,
        POLE_HEIGHT - 0.05 - sag * 4 * t * (1 - t),
        p[1] + (q[1] - p[1]) * t,
      );
      const curve = new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, k) => at(k / 8)));
      const tube = new THREE.TubeGeometry(curve, 24, 0.014, 4, false);
      const lights = [0.2, 0.4, 0.6, 0.8].map((t, k) => ({
        pos: at(t),
        color: LANTERN_COLORS[(i * 4 + k) % LANTERN_COLORS.length],
      }));
      return { tube, lights };
    });
  }, []);

  useFrame(({ clock }) => {
    if (useGame.getState().reducedMotion) return;
    const t = clock.elapsedTime;
    bobs.current.forEach((g, i) => {
      if (!g) return;
      g.rotation.z = Math.sin(t * 1.3 + i * 0.7) * 0.08;
      g.rotation.x = Math.cos(t * 1.1 + i * 0.9) * 0.06;
    });
  });

  let n = 0;
  return (
    <group>
      {POLES.map(([x, z], i) => (
        <group key={`pole-${i}`} position={[x, 0, z]}>
          <mesh position={[0, POLE_HEIGHT / 2, 0]}>
            <cylinderGeometry args={[0.055, 0.075, POLE_HEIGHT, 7]} />
            <meshStandardMaterial color="#7a5230" roughness={0.9} />
          </mesh>
          <mesh position={[0, POLE_HEIGHT + 0.06, 0]}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#f2c035" roughness={0.5} />
          </mesh>
        </group>
      ))}
      {spans.map((s, i) => (
        <group key={`span-${i}`}>
          <mesh geometry={s.tube}>
            <meshStandardMaterial color="#5b4630" roughness={0.9} />
          </mesh>
          {s.lights.map((l, k) => {
            const idx = n++;
            return (
              <group key={k} position={l.pos}>
                <group ref={(g) => { bobs.current[idx] = g; }}>
                  <mesh position={[0, -0.05, 0]}>
                    <cylinderGeometry args={[0.006, 0.006, 0.1, 4]} />
                    <meshStandardMaterial color="#5b4630" />
                  </mesh>
                  <mesh position={[0, -0.2, 0]} scale={[1, 1.25, 1]} userData={{ noShadow: true }}>
                    <sphereGeometry args={[0.11, 12, 10]} />
                    <meshStandardMaterial color={l.color} emissive={l.color} emissiveIntensity={1.15} roughness={0.4} />
                  </mesh>
                  <sprite position={[0, -0.2, 0]} scale={[0.95, 0.95, 0.95]}>
                    <spriteMaterial
                      map={halo}
                      color={l.color}
                      transparent
                      opacity={0.5}
                      depthWrite={false}
                      blending={THREE.AdditiveBlending}
                    />
                  </sprite>
                </group>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

/* ------------------------------ greenery ------------------------------ */

function makeTuftGeometry(): THREE.BufferGeometry {
  const blades = [-0.35, 0, 0.35].map((tilt, i) => {
    const g = new THREE.ConeGeometry(0.045, 0.34 - Math.abs(tilt) * 0.12, 3);
    g.translate(0, 0.17, 0);
    g.rotateZ(tilt);
    g.rotateY(i * 2.1);
    return g;
  });
  const merged = mergeGeometries(blades, false) ?? blades[1];
  return merged;
}

function Greenery({ dense }: { dense: boolean }): React.JSX.Element {
  const grassRef = useRef<THREE.InstancedMesh>(null);
  const bushRef = useRef<THREE.InstancedMesh>(null);
  const tuft = useMemo(() => makeTuftGeometry(), []);
  const bushGeo = useMemo(() => new THREE.IcosahedronGeometry(0.62, 1), []);

  const grass = useMemo(() => {
    const rng = mulberry32(4242);
    const out: { x: number; z: number; s: number; r: number; c: number }[] = [];
    const want = dense ? 760 : 260;
    let guard = 0;
    while (out.length < want && guard++ < want * 12) {
      const a = rng() * Math.PI * 2;
      const r = 7.4 + Math.sqrt(rng()) * 23;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (blocked(x, z, 3.5, 1.15)) continue;
      out.push({ x, z, s: 0.75 + rng() * 0.8, r: rng() * Math.PI * 2, c: rng() });
    }
    return out;
  }, [dense]);

  const bushes = useMemo(() => {
    const rng = mulberry32(9090);
    const out: { x: number; y: number; z: number; s: number; c: number }[] = [];
    let guard = 0;
    while (out.length < 120 && guard++ < 3000) {
      const a = rng() * Math.PI * 2;
      const r = 21.5 + rng() * 8.5;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (z > 17 && Math.abs(x) < 6.5) continue; // keep the gate road open
      if (blocked(x, z, 4.4, 1.6)) continue;
      const s = 0.65 + rng() * 0.75;
      out.push({ x, y: s * 0.38, z, s, c: rng() });
      // a smaller buddy blob makes each bush lumpy and soft
      const b = 0.55 + rng() * 0.35;
      out.push({ x: x + (rng() - 0.5) * 0.9, y: s * b * 0.36, z: z + (rng() - 0.5) * 0.9, s: s * b, c: rng() });
    }
    return out;
  }, []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const col = new THREE.Color();
    const grassA = new THREE.Color('#5f9a45');
    const grassB = new THREE.Color('#8fbf5a');
    const g = grassRef.current;
    if (g) {
      grass.forEach((t, i) => {
        e.set((t.c - 0.5) * 0.2, t.r, 0);
        q.setFromEuler(e);
        m.compose(new THREE.Vector3(t.x, 0, t.z), q, new THREE.Vector3(t.s, t.s, t.s));
        g.setMatrixAt(i, m);
        g.setColorAt(i, col.copy(grassA).lerp(grassB, t.c));
      });
      g.instanceMatrix.needsUpdate = true;
      if (g.instanceColor) g.instanceColor.needsUpdate = true;
    }
    const b = bushRef.current;
    const bushA = new THREE.Color('#3f6f35');
    const bushB = new THREE.Color('#6c9e48');
    if (b) {
      bushes.forEach((t, i) => {
        q.setFromEuler(e.set(0, t.c * 6.28, 0));
        m.compose(new THREE.Vector3(t.x, t.y, t.z), q, new THREE.Vector3(t.s, t.s * 0.82, t.s));
        b.setMatrixAt(i, m);
        b.setColorAt(i, col.copy(bushA).lerp(bushB, t.c));
      });
      b.instanceMatrix.needsUpdate = true;
      if (b.instanceColor) b.instanceColor.needsUpdate = true;
    }
  }, [grass, bushes]);

  return (
    <group>
      <instancedMesh
        key={`grass-${grass.length}`}
        ref={grassRef}
        args={[tuft, undefined, grass.length]}
        frustumCulled={false}
        userData={{ noShadow: true }}
      >
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={bushRef} args={[bushGeo, undefined, bushes.length]} frustumCulled={false}>
        <meshStandardMaterial color="#ffffff" roughness={0.95} flatShading />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------ butterflies ------------------------------ */

const BUTTERFLY_TINTS = ['#ffd166', '#f7a9d6', '#9fdcff', '#ffffff', '#c6f29a', '#ffb38a'];
const BUTTERFLY_HOMES: [number, number][] = [[-5, 10], [6, 7], [-10, -9], [11, -4], [-3, -11], [4, 12]];

function Butterfly({ home, tint, seed }: { home: [number, number]; tint: string; seed: number }): React.JSX.Element {
  const body = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = body.current;
    if (!g) return;
    const reduced = useGame.getState().reducedMotion;
    const t = clock.elapsedTime * (reduced ? 0.25 : 1) + seed * 10;
    const r = 1.6 + Math.sin(t * 0.37) * 0.9;
    const x = home[0] + Math.cos(t * 0.45) * r;
    const z = home[1] + Math.sin(t * 0.6) * r;
    const y = 0.75 + Math.sin(t * 1.7) * 0.25 + Math.sin(t * 0.3) * 0.3;
    const dx = x - g.position.x;
    const dz = z - g.position.z;
    if (Math.abs(dx) + Math.abs(dz) > 1e-4) g.rotation.y = Math.atan2(dx, dz);
    g.position.set(x, y, z);
    const flap = reduced ? 0.4 : Math.sin(clock.elapsedTime * 16 + seed * 3) * 0.9;
    if (left.current) left.current.rotation.z = 0.25 + flap;
    if (right.current) right.current.rotation.z = -0.25 - flap;
  });

  return (
    <group ref={body}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.014, 0.09, 3, 6]} />
        <meshBasicMaterial color="#4a3b2c" />
      </mesh>
      <group ref={left}>
        <mesh position={[-0.075, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 0.13]} />
          <meshBasicMaterial color={tint} side={THREE.DoubleSide} transparent opacity={0.92} />
        </mesh>
      </group>
      <group ref={right}>
        <mesh position={[0.075, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 0.13]} />
          <meshBasicMaterial color={tint} side={THREE.DoubleSide} transparent opacity={0.92} />
        </mesh>
      </group>
    </group>
  );
}

export function FestivalDecor(): React.JSX.Element {
  const cozy = useGame((s) => s.gfx === 'cozy');
  return (
    <group>
      <Lanterns />
      <Greenery dense={cozy} />
      {BUTTERFLY_HOMES.map((h, i) => (
        <Butterfly key={i} home={h} tint={BUTTERFLY_TINTS[i % BUTTERFLY_TINTS.length]} seed={i * 1.37} />
      ))}
    </group>
  );
}
