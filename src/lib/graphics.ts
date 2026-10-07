import { loadJSON, saveJSON } from './storage';

/**
 * Graphics quality.
 *  - cozy:   soft sun shadows, sharper rendering, swaying grass and lanterns.
 *  - speedy: no shadows and fewer extras — keeps school Chromebooks smooth.
 */
export type GfxQuality = 'cozy' | 'speedy';

const KEY = 'akef3d-gfx-v1';

/** A gentle guess: small or touch-first devices start in Speedy mode. */
export function detectDefaultQuality(): GfxQuality {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 8;
    const memory = nav.deviceMemory ?? 8;
    const touchFirst = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    return cores <= 4 || memory <= 4 || touchFirst ? 'speedy' : 'cozy';
  } catch {
    return 'cozy';
  }
}

export function loadQuality(): GfxQuality {
  const saved = loadJSON<{ q: GfxQuality | null }>(KEY, { q: null }).q;
  return saved === 'cozy' || saved === 'speedy' ? saved : detectDefaultQuality();
}

export function saveQuality(q: GfxQuality): void {
  saveJSON(KEY, { q });
}
