/**
 * SELF-CHECK ONLY — minimal ambient stubs for third-party libraries.
 *
 * These stubs exist so the whole project can be typechecked in environments
 * with no npm access (tsc -p tsconfig.selfcheck.json). They are NOT used by
 * the real build: `npm run build` uses the genuine @types packages installed
 * by `npm install`, which typecheck much more strictly.
 */

declare module 'react' {
  namespace React {
    type ReactNode = any;
    type Key = string | number;
    const StrictMode: any;

    function useState<T>(init: T | (() => T)): [T, (v: T | ((prev: T) => T)) => void];
    function useEffect(fn: () => void | (() => void), deps?: readonly unknown[]): void;
    function useMemo<T>(fn: () => T, deps: readonly unknown[]): T;
    function useRef<T>(init: T): { current: T };
    function useRef<T>(init: T | null): { current: T | null };
    function useReducer<S>(reducer: (s: S, a?: unknown) => S, init: S): [S, (a?: unknown) => void];

    namespace JSX {
      type Element = any;
      interface IntrinsicAttributes { key?: string | number }
      interface IntrinsicElements { [name: string]: any }
      interface ElementChildrenAttribute { children: unknown }
    }
  }
  export = React;
}

/** Node global used only by scripts/verifyVoting.ts (real builds get this from @types/node). */
declare const process: { exit(code?: number): never };

declare module 'react/jsx-runtime' {
  export namespace JSX {
    type Element = any;
    interface IntrinsicAttributes { key?: string | number }
    interface IntrinsicElements { [name: string]: any }
  }
  export function jsx(...args: unknown[]): any;
  export function jsxs(...args: unknown[]): any;
  export const Fragment: unique symbol;
}

declare module 'react-dom/client' {
  export function createRoot(el: Element | DocumentFragment): { render(node: unknown): void };
}

declare module 'three' {
  export class Vector3 {
    x: number; y: number; z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    setScalar(v: number): this;
    copy(v: Vector3): this;
    lerp(v: Vector3, alpha: number): this;
  }
  export class Euler { x: number; y: number; z: number; }
  export class Object3D {
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
    visible: boolean;
    children: Object3D[];
    lookAt(x: number | Vector3, y?: number, z?: number): void;
    getWorldPosition(target: Vector3): Vector3;
  }
  export class Group extends Object3D {}
  export class Material { opacity: number; transparent: boolean; }
  export class MeshBasicMaterial extends Material { color: unknown; }
  export class Mesh extends Object3D { material: Material | Material[]; }
  export class Texture { anisotropy: number; colorSpace: string; }
  export class CanvasTexture extends Texture { constructor(canvas: HTMLCanvasElement); }
  export const SRGBColorSpace: string;
  export const MathUtils: {
    clamp(value: number, min: number, max: number): number;
  };
}

declare module '@react-three/fiber' {
  import * as THREE from 'three';
  export interface RootState {
    clock: { elapsedTime: number };
    camera: THREE.Object3D;
    gl: { domElement: HTMLCanvasElement };
  }
  export function useFrame(cb: (state: RootState, delta: number) => void): void;
  export function useThree(): RootState;
  export function Canvas(props: Record<string, unknown>): any;
}

declare module '@react-three/drei' {
  export function Billboard(props: Record<string, unknown>): any;
  export function RoundedBox(props: Record<string, unknown>): any;
  export function Sparkles(props: Record<string, unknown>): any;
}

declare module 'zustand' {
  export type Setter<T> = (partial: Partial<T> | ((s: T) => Partial<T>)) => void;
  export interface UseBoundStore<T> {
    (): T;
    <U>(selector: (s: T) => U): U;
    getState(): T;
    setState(partial: Partial<T>): void;
  }
  export function create<T>(init: (set: Setter<T>, get: () => T) => T): UseBoundStore<T>;
}
