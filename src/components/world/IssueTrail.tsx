import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { IssueId } from '../../types/game';
import { ISSUES, ISSUE_ORDER } from '../../data/issues';
import { registerInteractable } from '../../state/registry';
import { useGame, issuesInPlay } from '../../state/store';
import { NameLabel, GlowRing } from '../characters/CandidateNPC';
import { LocationSign } from './LocationSign';

/** Nine leaf posts along the western trail; age mode decides how many are grown. */
const LEAF_SPOTS: [number, number][] = [
  [-21.5, 6.5], [-21, 2.5], [-20, -1.5], [-19, -5.5], [-17.5, -9],
  [-15.5, -12], [-13, -14.5], [-10.5, -16.5], [-8, -18],
];

function IssueLeaf({ issueId, x, z }: { issueId: IssueId; x: number; z: number }): React.JSX.Element {
  const leaf = useRef<THREE.Group>(null);
  const read = useGame((s) => s.issuesRead.includes(issueId));
  const nearby = useGame((s) => s.nearby);
  const issue = ISSUES[issueId];
  const id = `issue-${issueId}`;

  useEffect(() => registerInteractable({
    id, kind: 'issue', targetId: issueId, label: `Read issue: ${issue.title}`, x, z, radius: 2.5,
  }), [id, issueId, issue.title, x, z]);

  useFrame(({ clock }, dt) => {
    if (!leaf.current) return;
    const reduced = useGame.getState().reducedMotion;
    const target = read ? Math.PI : 0; // flips over when read
    leaf.current.rotation.z += (target - leaf.current.rotation.z) * Math.min(1, dt * (reduced ? 30 : 5));
    if (!reduced && !read) {
      leaf.current.position.y = 1.15 + Math.sin(clock.elapsedTime * 1.6 + x) * 0.05;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 1.1, 8]} />
        <meshStandardMaterial color="#7a5230" roughness={0.9} />
      </mesh>
      <group ref={leaf} position={[0, 1.15, 0]}>
        <mesh rotation={[-0.35, 0, 0]} scale={[1, 0.1, 1.45]}>
          <sphereGeometry args={[0.5, 14, 14]} />
          <meshStandardMaterial
            color={read ? '#b9c98a' : '#69a84f'}
            emissive={read ? '#000000' : '#2f5c22'}
            emissiveIntensity={read ? 0 : 0.5}
            roughness={0.7}
          />
        </mesh>
        <mesh rotation={[-0.35, 0, 0]} position={[0, 0.06, 0]} scale={[0.08, 0.06, 1.3]}>
          <sphereGeometry args={[0.5, 6, 6]} />
          <meshStandardMaterial color="#4a7a36" roughness={0.8} />
        </mesh>
      </group>
      <NameLabel text={`${issue.emoji} ${issue.title}${read ? ' ✓' : ''}`} y={2.05} scale={0.85} />
      <GlowRing active={nearby?.id === id} radius={1.2} />
    </group>
  );
}

export function IssueTrail(): React.JSX.Element {
  const shown = useGame((s) => issuesInPlay(s)).slice(0, 9);
  return (
    <group>
      <LocationSign
        id="issue-trailhead"
        kind="intro"
        targetId="trail"
        signText={'Issue Trail'}
        promptLabel="What is the Issue Trail?"
        position={[-19.5, 0, 9.5]}
        radius={2.6}
        rotationY={0.9}
      />
      {shown.map((issueId, i) => (
        <IssueLeaf key={issueId} issueId={issueId} x={LEAF_SPOTS[i][0]} z={LEAF_SPOTS[i][1]} />
      ))}
    </group>
  );
}
