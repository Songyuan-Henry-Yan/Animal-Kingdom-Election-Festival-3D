import * as THREE from 'three';

/**
 * Renders text onto a canvas and returns a THREE.CanvasTexture.
 * Keeps every 3D sign self-contained — no external fonts or images.
 */
export interface LabelOpts {
  fontPx?: number;
  pad?: number;
  bg?: string;
  fg?: string;
  border?: string;
  radius?: number;
}

const cache = new Map<string, { tex: THREE.CanvasTexture; aspect: number }>();

export function makeLabelTexture(text: string, opts: LabelOpts = {}): { tex: THREE.CanvasTexture; aspect: number } {
  const key = JSON.stringify([text, opts]);
  const hit = cache.get(key);
  if (hit) return hit;

  const fontPx = opts.fontPx ?? 46;
  const pad = opts.pad ?? 26;
  const font = `600 ${fontPx}px 'Trebuchet MS', 'Segoe UI', Verdana, sans-serif`;

  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = font;
  const lines = text.split('\n');
  const textW = Math.max(...lines.map((l) => measure.measureText(l).width));
  const lineH = fontPx * 1.25;

  const w = Math.ceil(textW + pad * 2);
  const h = Math.ceil(lineH * lines.length + pad * 2);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const r = opts.radius ?? 26;
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, h - 4, r);
  ctx.fillStyle = opts.bg ?? 'rgba(253, 246, 227, 0.96)';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = opts.border ?? '#8a5a2b';
  ctx.stroke();

  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = opts.fg ?? '#4a3218';
  lines.forEach((l, i) => {
    ctx.fillText(l, w / 2, pad + lineH * (i + 0.5));
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  const out = { tex, aspect: w / h };
  cache.set(key, out);
  return out;
}
