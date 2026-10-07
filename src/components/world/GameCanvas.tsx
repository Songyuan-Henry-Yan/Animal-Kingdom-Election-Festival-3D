import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ForestPlaza } from './ForestPlaza';
import { PlayerController } from './PlayerController';
import { CountShow } from './CountShow';
import { useGame } from '../../state/store';

/** Golden-hour palette — the fog matches the horizon so the forest melts into the sky. */
const SKY_TOP = '#8fb9e2';
const SKY_HORIZON = '#fcd7a7';
const SKY_BELOW = '#f2c290';

/** A big gradient sky bowl that follows the camera (no images needed). */
function SkyDome(): React.JSX.Element {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    uniforms: {
      top: { value: new THREE.Color(SKY_TOP) },
      horizon: { value: new THREE.Color(SKY_HORIZON) },
      below: { value: new THREE.Color(SKY_BELOW) },
    },
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 top;
      uniform vec3 horizon;
      uniform vec3 below;
      varying vec3 vDir;
      void main() {
        float h = vDir.y;
        vec3 c = h > 0.0
          ? mix(horizon, top, smoothstep(0.02, 0.6, h))
          : mix(horizon, below, smoothstep(0.0, -0.25, h));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  }), []);

  useFrame(({ camera }) => {
    mesh.current?.position.copy(camera.position);
  });

  return (
    <mesh ref={mesh} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[100, 32, 16]} />
    </mesh>
  );
}

function isLitMaterial(m: THREE.Material): boolean {
  return (m as THREE.MeshStandardMaterial).isMeshStandardMaterial === true;
}

/**
 * Turns on shadows for every solid prop in one place, so no station has to
 * remember to. Flat decals and tiny details (eyes, flower heads) are skipped —
 * they would cost time without adding anything you could see.
 */
function ShadowSetup(): null {
  const scene = useThree((s) => s.scene);
  const showId = useGame((s) => s.countShow?.id ?? 0);
  const applyRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    const scale = new THREE.Vector3();
    const apply = () => {
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh || mesh.userData.shadowSet) return;
        mesh.userData.shadowSet = true;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        if (!mats.some(isLitMaterial)) return;
        mesh.receiveShadow = true;
        if (mesh.userData.noShadow) return;
        const type = mesh.geometry?.type ?? '';
        if (type === 'PlaneGeometry' || type === 'CircleGeometry' || type === 'RingGeometry') return;
        if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
        mesh.getWorldScale(scale);
        const radius = (mesh.geometry.boundingSphere?.radius ?? 1) * Math.max(scale.x, scale.y, scale.z);
        mesh.castShadow = radius > 0.09;
      });
    };
    applyRef.current = apply;
    apply();
    const id = window.setInterval(apply, 1200);
    return () => window.clearInterval(id);
  }, [scene]);
  // New actors walk on stage for the Count Show — give them shadows right away.
  useEffect(() => {
    const id = window.setTimeout(() => applyRef.current(), 30);
    return () => window.clearTimeout(id);
  }, [showId]);
  return null;
}

/** The full 3D scene: a golden-hour forest plaza with soft sun shadows. */
export function GameCanvas(): React.JSX.Element {
  const gfx = useGame((s) => s.gfx);
  const cozy = gfx === 'cozy';

  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas
        key={gfx}
        dpr={cozy ? [1, 1.75] : [1, 1]}
        shadows={cozy ? 'soft' : false}
        camera={{ fov: 42, position: [0, 10, 40], near: 0.4, far: 140 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[SKY_HORIZON]} />
        <fog attach="fog" args={[SKY_HORIZON, 30, 92]} />
        <SkyDome />
        <hemisphereLight args={['#ffeccc', '#5f8a4c', 0.95]} />
        <ambientLight intensity={0.12} />
        {/* The low festival sun sits behind you (south-west), so shadows stretch out ahead. */}
        <directionalLight
          position={[-16, 20, 20]}
          intensity={cozy ? 1.65 : 1.25}
          color="#ffd7a1"
          castShadow={cozy}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-36}
          shadow-camera-right={36}
          shadow-camera-top={36}
          shadow-camera-bottom={-36}
          shadow-camera-near={0.5}
          shadow-camera-far={90}
          shadow-bias={-0.0004}
          shadow-normalBias={0.03}
        />
        {cozy && <ShadowSetup />}
        <ForestPlaza />
        <CountShow />
        <PlayerController />
      </Canvas>
    </div>
  );
}
