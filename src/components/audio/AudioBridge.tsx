import { useEffect } from 'react';
import { audio } from '../../lib/audio';
import { useGame } from '../../state/store';

/**
 * Wires the AudioManager to the game:
 * - unlocks audio on the FIRST user gesture (browsers block autoplay),
 * - routes sound captions into the HUD caption line,
 * - watches the OS "prefers-reduced-motion" setting.
 */
export function AudioBridge(): null {
  const setCaption = useGame((s) => s.setCaption);
  const setReducedMotion = useGame((s) => s.setReducedMotion);

  useEffect(() => {
    audio.onCaption(setCaption);
    const unlock = () => {
      audio.unlock();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [setCaption]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [setReducedMotion]);

  return null;
}
