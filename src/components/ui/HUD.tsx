import React from 'react';
import { useGame, currentQuest } from '../../state/store';
import { STICKERS } from '../../data/stickers';
import { audio } from '../../lib/audio';

export function HUD(): React.JSX.Element {
  const nearby = useGame((s) => s.nearby);
  const panel = useGame((s) => s.panel);
  const caption = useGame((s) => s.caption);
  const stickers = useGame((s) => s.stickers);
  const stickerToast = useGame((s) => s.stickerToast);
  const toggleNotebook = useGame((s) => s.toggleNotebook);
  const openSettings = useGame((s) => s.openSettings);
  const openPanelFor = useGame((s) => s.openPanelFor);
  const quest = useGame((s) => currentQuest(s));
  const netStatus = useGame((s) => s.netStatus);
  const netCode = useGame((s) => s.netCode);
  const netPeers = useGame((s) => s.netPeers);

  return (
    <>
      <div className="hud-top-left">
        <div className="quest-chip" role="status">
          {quest ? <>🧭 Next: {quest.label}</> : <>🎉 Festival complete — explore freely!</>}
        </div>
      </div>

      <div className="hud-top-right">
        <button
          type="button"
          className="hud-btn"
          onClick={() => openPanelFor('map')}
          onMouseEnter={() => audio.hoverTick()}
          aria-label="Open the Festival Map (M key)"
        >
          🗺️ Map <kbd>M</kbd>
        </button>
        <button
          type="button"
          className={`hud-btn${netStatus === 'online' ? ' hud-online' : ''}`}
          onClick={() => openPanelFor('online')}
          onMouseEnter={() => audio.hoverTick()}
          aria-label="Open the online Festival Room panel"
        >
          {netStatus === 'online' ? <>🌐 {netCode} · {netPeers.length} 🐾</> : <>🌐 Play Together</>}
        </button>
        <button
          type="button"
          className="hud-btn"
          onClick={toggleNotebook}
          onMouseEnter={() => audio.hoverTick()}
          aria-label="Open Civic Notebook (Tab key)"
        >
          📓 Notebook <kbd>Tab</kbd>
        </button>
        <button
          type="button"
          className="hud-btn"
          onClick={openSettings}
          onMouseEnter={() => audio.hoverTick()}
          aria-label="Open audio and accessibility settings"
        >
          ⚙️ Settings
        </button>
        <div className="hud-stickers" aria-label={`${stickers.length} of 8 passport stickers earned`}>
          🛂 {stickers.length}/8
        </div>
      </div>

      {!panel && nearby && (
        <div className="interact-prompt" role="status">
          <kbd>E</kbd> {nearby.label}
        </div>
      )}

      {!panel && (
        <div className="controls-hint" aria-hidden="true">
          WASD — walk · Space — hop · Drag — look · E — interact · M — map · F — wave · Tab — notebook · Esc — close
        </div>
      )}

      <div className="caption-line" aria-live="polite">
        {caption}
      </div>

      {stickerToast && Date.now() - stickerToast.at < 4000 && (
        <div className="sticker-toast" key={stickerToast.at}>
          <span className="sticker-emoji">{STICKERS[stickerToast.id].emoji}</span>
          <div>
            <strong>Passport sticker earned!</strong>
            <div>{STICKERS[stickerToast.id].name}</div>
          </div>
        </div>
      )}
    </>
  );
}
