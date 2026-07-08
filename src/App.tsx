import React, { useEffect } from 'react';
import { GameCanvas } from './components/world/GameCanvas';
import { HUD } from './components/ui/HUD';
import { PanelRouter } from './components/ui/PanelRouter';
import { AudioBridge } from './components/audio/AudioBridge';
import { useGame } from './state/store';
import { nearestInteractable, playerPos, playerFx } from './state/registry';
import { audio } from './lib/audio';
import { net } from './lib/net';

export default function App(): React.JSX.Element {
  const openPanelFor = useGame((s) => s.openPanelFor);
  const closePanel = useGame((s) => s.closePanel);
  const toggleNotebook = useGame((s) => s.toggleNotebook);

  // Welcome the player at the gate on first load.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!useGame.getState().visited.gate) openPanelFor('gate');
    }, 600);
    return () => window.clearTimeout(t);
  }, [openPanelFor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useGame.getState();
      if (e.key === 'Tab') {
        e.preventDefault();
        toggleNotebook();
        return;
      }
      if (e.key === 'Escape') {
        closePanel();
        return;
      }
      // Interact: E / Space / Enter — but never steal keys from buttons or inputs.
      const target = e.target as HTMLElement | null;
      const onControl = !!target && (
        target.tagName === 'BUTTON' || target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' || target.tagName === 'TEXTAREA'
      );
      if (s.panel || onControl) return;
      if (e.code === 'KeyM') {
        openPanelFor('map');
        return;
      }
      if (e.code === 'KeyF') {
        playerFx.spinUntil = performance.now() + 650;
        audio.starSparkle();
        net.sendFx('wave');
        s.setCaption('You wave hello! 👋');
        return;
      }
      if (e.code === 'KeyE' || e.code === 'Enter') {
        e.preventDefault();
        const near = nearestInteractable(playerPos.x, playerPos.z);
        if (near) {
          openPanelFor(near.kind, near.targetId, [near.x, 1.2, near.z]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPanelFor, closePanel, toggleNotebook]);

  return (
    <div className="app-root">
      <GameCanvas />
      <HUD />
      <PanelRouter />
      <AudioBridge />
    </div>
  );
}
