import type { AgeMode, CustomSetup, NeighborhoodSettings, Polarization } from '../types/game';

/**
 * Share codes: pack a whole election setup into a short text code so a friend
 * (or a whole classroom) can regrow the IDENTICAL election on their machine.
 * No servers — just base64 text kids can paste in chat or write on the board.
 */
export interface SharedSetup {
  v: 1;
  seed: string;
  mode: AgeMode;
  polarization: Polarization;
  hood: NeighborhoodSettings;
  custom: CustomSetup;
}

export function encodeShareCode(s: Omit<SharedSetup, 'v'>): string {
  const payload: SharedSetup = { v: 1, ...s };
  const json = JSON.stringify(payload);
  const b64 = window.btoa(unescape(encodeURIComponent(json)));
  return `FOREST-${b64.replace(/=+$/, '')}`;
}

export function decodeShareCode(code: string): Omit<SharedSetup, 'v'> | null {
  try {
    const raw = code.trim().replace(/^FOREST-/i, '');
    const pad = raw + '='.repeat((4 - (raw.length % 4)) % 4);
    const json = decodeURIComponent(escape(window.atob(pad)));
    const data = JSON.parse(json) as SharedSetup;
    if (data.v !== 1 || !data.seed || !data.mode || !data.hood || !data.custom) return null;
    return { seed: data.seed, mode: data.mode, polarization: data.polarization, hood: data.hood, custom: data.custom };
  } catch {
    return null;
  }
}
