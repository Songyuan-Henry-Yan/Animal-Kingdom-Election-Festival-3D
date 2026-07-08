import React, { useEffect, useRef, useState } from 'react';
import { audio } from '../../lib/audio';
import { useGame } from '../../state/store';
import { canSpeak, speakText, stopSpeech } from '../../lib/speech';

/** Wooden button with built-in click/hover sounds. */
export function Btn({
  children, onClick, kind = 'wood', pressed, disabled, ariaLabel, title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: 'wood' | 'leaf' | 'plain' | 'danger';
  pressed?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      className={`btn btn-${kind}${pressed ? ' pressed' : ''}`}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onMouseEnter={() => audio.hoverTick()}
      onFocus={() => audio.hoverTick()}
      onClick={() => {
        audio.click();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

/** 0-5 star display (with text alternative for screen readers). */
export function Stars({ n, outOf = 5 }: { n: number; outOf?: number }): React.JSX.Element {
  return (
    <span className="stars" role="img" aria-label={`${n} out of ${outOf} stars`}>
      {'★'.repeat(Math.round(n))}{'☆'.repeat(Math.max(0, outOf - Math.round(n)))}
    </span>
  );
}

/** A row of acorns showing cost against the 12-acorn budget. */
export function AcornTray({ used, budget }: { used: number; budget: number }): React.JSX.Element {
  const over = used > budget;
  return (
    <div className="acorn-tray" aria-label={`${used} of ${budget} acorns used${over ? ' — over budget' : ''}`}>
      <span className="acorn-icons" aria-hidden="true">
        {Array.from({ length: budget }, (_, i) => (
          <span key={i} className={i < used ? 'acorn used' : 'acorn'}>🌰</span>
        ))}
        {over && <span className="acorn over">+{used - budget}</span>}
      </span>
      <span className="acorn-text">{used} / {budget} acorns {over ? '— too many!' : ''}</span>
    </div>
  );
}

/** Paper card modal panel. Esc is handled globally; the ✕ button also closes. */
export function PaperPanel({
  title, children, wide = false, labelledBy,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
  labelledBy?: string;
}): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [reading, setReading] = useState(false);
  const closePanel = useGame((s) => s.closePanel);

  useEffect(() => {
    ref.current?.focus();
    return () => stopSpeech(); // closing the panel stops the reading voice
  }, []);

  const toggleRead = () => {
    if (reading) {
      stopSpeech();
      setReading(false);
    } else {
      const text = `${title}. ${bodyRef.current?.textContent ?? ''}`;
      speakText(text, () => setReading(false));
      setReading(true);
    }
  };

  return (
    <div className="panel-backdrop" onClick={closePanel}>
      <div
        ref={ref}
        className={`paper-panel${wide ? ' wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : title}
        tabIndex={-1}
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
      >
        <div className="panel-head">
          <h2 id={labelledBy}>{title}</h2>
          <span className="head-btns">
            {canSpeak() && (
              <button
                type="button"
                className="read-btn"
                aria-label={reading ? 'Stop reading aloud' : 'Read this panel to me'}
                aria-pressed={reading}
                onClick={toggleRead}
                onMouseEnter={() => audio.hoverTick()}
              >
                {reading ? '⏹ Stop' : '🔊 Read'}
              </button>
            )}
            <button
              type="button"
              className="close-x"
              aria-label="Close panel (Esc)"
              onClick={closePanel}
              onMouseEnter={() => audio.hoverTick()}
            >
              ✕
            </button>
          </span>
        </div>
        <div className="panel-body" ref={bodyRef}>{children}</div>
      </div>
    </div>
  );
}
