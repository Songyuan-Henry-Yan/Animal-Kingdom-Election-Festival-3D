import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ForestPlaza } from './ForestPlaza';
import { PlayerController } from './PlayerController';

/** The full 3D scene: golden-hour forest plaza with fireflies. */
export function GameCanvas(): React.JSX.Element {
  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 42, position: [0, 10, 40], near: 0.4, far: 140 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#ffd9a3']} />
        <fog attach="fog" args={['#f4c896', 36, 100]} />
        <hemisphereLight args={['#fff2d2', '#6f9b57', 0.8]} />
        <directionalLight position={[14, 24, 10]} intensity={1.05} color="#ffe7ba" />
        <ambientLight intensity={0.22} />
        <ForestPlaza />
        <PlayerController />
      </Canvas>
    </div>
  );
}
