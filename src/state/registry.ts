import * as THREE from 'three';
import type { PanelKind } from '../types/game';

/**
 * Lightweight world registry kept OUTSIDE React state so the player controller
 * can query it every frame without re-rendering the UI.
 */

export interface Interactable {
  id: string;
  kind: PanelKind;
  targetId?: string;
  label: string;
  x: number;
  z: number;
  radius: number;
}

const interactables = new Map<string, Interactable>();

export function registerInteractable(item: Interactable): () => void {
  interactables.set(item.id, item);
  return () => {
    interactables.delete(item.id);
  };
}

export function nearestInteractable(x: number, z: number): Interactable | null {
  let bestItem: Interactable | null = null;
  let bestDist = Infinity;
  for (const item of interactables.values()) {
    const dx = item.x - x;
    const dz = item.z - z;
    const d = Math.hypot(dx, dz);
    if (d <= item.radius && d < bestDist) {
      bestDist = d;
      bestItem = item;
    }
  }
  return bestItem;
}

/** Shared mutable player position (world units). */
export const playerPos = new THREE.Vector3(0, 0, 27);

/** Fun effects on the player (e.g., the F-key wave spin). */
export const playerFx = { spinUntil: 0 };

/** Set to performance.now() when the player splashes into the pool. */
export const poolFx = { splashAt: 0 };

/** Optional camera focus point while a character talks. */
export const cameraFocus = {
  active: false,
  point: new THREE.Vector3(),
};

/** Simple circle colliders so the player cannot walk through big props. */
export interface CircleCollider { x: number; z: number; r: number; top?: number }

export const COLLIDERS: CircleCollider[] = [
  { x: 0, z: 0, r: 2.6 },       // charter tree trunk
  { x: 0, z: -19.5, r: 4.6, top: 0.5 },   // rally stage — jump onto it with Space!
  { x: 6.8, z: -13.8, r: 2.0, top: 0.3 }, // dolly's pool — hop in for a splash!
  { x: 13, z: -13, r: 1.7 },    // news stand
  { x: 19, z: -4, r: 1.5 },     // ballot booth
  { x: -17, z: 13, r: 2.3 },    // workshop hut
  { x: 9.5, z: 16.5, r: 1.3 },  // theater pedestal
  { x: -8, z: 17, r: 1.4 },     // campfire
  { x: -3.2, z: 23, r: 0.7 },   // gate posts
  { x: 3.2, z: 23, r: 0.7 },
];

export const PLAZA_RADIUS = 29;
