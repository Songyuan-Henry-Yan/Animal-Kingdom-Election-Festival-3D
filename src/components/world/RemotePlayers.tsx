import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../../state/store';
import { net, SPECIES_EMOJI } from '../../lib/net';
import type { NetPeer } from '../../lib/net';
import { AnimalModel } from '../characters/AnimalModel';
import { NameLabel } from '../characters/CandidateNPC';

const EMOTE_MS = 1400;

/**
 * One classmate, smoothly eased toward their 10x/second network position.
 * Waves spin them around (just like the local F-key wave), hops arrive
 * through the y coordinate, and splashes ripple Dolly's pool for everyone.
 */
function RemoteExplorer({ peer }: { peer: NetPeer }): React.JSX.Element | null {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const walkT = useRef(Math.random() * 10);

  const a0 = net.remote.get(peer.id);
  const color = a0?.color ?? '#c9a06b';
  const accent = a0?.accent ?? '#5aa04f';

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const a = net.remote.get(peer.id);
    const g = group.current;
    if (!g) return;
    if (!a || !a.hasPos) {
      g.visible = false;
      return;
    }
    g.visible = true;

    // Ease toward the latest network target.
    const k = Math.min(1, dt * 9);
    a.x += (a.tx - a.x) * k;
    a.y += (a.ty - a.y) * k;
    a.z += (a.tz - a.z) * k;
    g.position.set(a.x, a.y, a.z);

    const waving = a.emote?.kind === 'wave' && performance.now() - a.emote.at < EMOTE_MS;
    if (waving) {
      g.rotation.y += dt * 11; // happy hello spin!
    } else {
      let diff = a.try - g.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      g.rotation.y += diff * Math.min(1, dt * 8);
    }

    if (body.current) {
      walkT.current += dt * 9;
      body.current.position.y = a.moving ? Math.abs(Math.sin(walkT.current)) * 0.09 : 0;
    }
  });

  return (
    <group ref={group} visible={false}>
      <group ref={body}>
        <AnimalModel species={peer.species} color={color} accent={accent} />
      </group>
      <NameLabel
        text={`${peer.host ? '👑 ' : ''}${SPECIES_EMOJI[peer.species] ?? '🐾'} ${peer.name}`}
        y={1.95}
        scale={0.85}
      />
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 20]} />
        <meshBasicMaterial color="#20301c" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Everyone else in the Festival Room, walking the same plaza as you. */
export function RemotePlayers(): React.JSX.Element | null {
  const online = useGame((s) => s.netStatus === 'online');
  const peers = useGame((s) => s.netPeers);
  if (!online) return null;
  return (
    <group>
      {peers.filter((p) => p.id !== net.myId).map((p) => (
        <RemoteExplorer key={p.id} peer={p} />
      ))}
    </group>
  );
}
