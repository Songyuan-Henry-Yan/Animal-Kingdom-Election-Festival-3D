import React, { useState } from 'react';
import { PaperPanel, Btn } from './common';
import { useGame } from '../../state/store';
import { NET_SPECIES, SPECIES_EMOJI, defaultServerUrl, net } from '../../lib/net';
import type { NetSpecies } from '../../lib/net';
import { loadJSON, saveJSON } from '../../lib/storage';

const NET_PREFS_KEY = 'akef3d-net-v1';

interface NetPrefs {
  name: string;
  species: NetSpecies;
  url: string;
}

/** 🌐 Host or join a Festival Room so a whole class explores the SAME world. */
export function OnlinePanel(): React.JSX.Element {
  const s = useGame();
  const saved = loadJSON<NetPrefs>(NET_PREFS_KEY, { name: '', species: 'rabbit', url: '' });
  const [name, setName] = useState(saved.name);
  const [species, setSpecies] = useState<NetSpecies>(saved.species);
  const [url, setUrl] = useState(saved.url || defaultServerUrl());
  const [code, setCode] = useState('');
  const [tab, setTab] = useState<'join' | 'host'>('join');

  const remember = () => saveJSON(NET_PREFS_KEY, { name, species, url });
  const ready = name.trim().length > 0;

  if (s.netStatus === 'online') {
    const isHost = s.netRole === 'host';
    return (
      <PaperPanel title="🌐 Festival Room" wide>
        <p className="online-note">
          Everyone in this room walks the <strong>same plaza</strong>, follows the{' '}
          <strong>same election</strong>, and votes from their <strong>own seat</strong>.
        </p>
        <div className="room-code" aria-label={`Room code ${s.netCode}`}>
          {s.netCode}
        </div>
        <p className="muted center-note">
          Classmates: open this game, press <strong>🌐 Play Together</strong>, and type the code above.
        </p>

        <h4>🐾 Explorers here ({s.netPeers.length})</h4>
        <ul className="note-list peer-list">
          {s.netPeers.map((p) => (
            <li key={p.id}>
              {SPECIES_EMOJI[p.species] ?? '🐾'} <strong>{p.name}</strong>
              {p.host ? ' 👑 host' : ''}
              {p.id === net.myId ? ' ⭐ (you)' : ''}
            </li>
          ))}
        </ul>

        <p>🗳️ Room ballot box: <strong>{s.netBallotCount}</strong> sealed ballot{s.netBallotCount === 1 ? '' : 's'}.</p>

        {isHost ? (
          <div className="side-card">
            <h4>👑 You are the host</h4>
            <p>
              You steer the shared festival: your 🎨 setup and 🌱 seed reach everyone automatically,
              you draw the 📰 news, and you press ▶ in the 🎭 Counting Theater. Everyone can seal a
              secret ballot in the 🗳️ Booth — then count them with source “Classroom Ballots”.
            </p>
          </div>
        ) : (
          <div className="side-card">
            <h4>🎒 You are an explorer</h4>
            <p>
              Your teacher steers the setup, news, and counting — you explore, chat with voters,
              and seal your own secret ballot in the 🗳️ Booth. Wave hello with <kbd>F</kbd>!
            </p>
          </div>
        )}

        <p className="muted">
          🍃 Privacy: first names only, no accounts, nothing saved — the room evaporates when
          everyone leaves.
        </p>

        <div className="btn-row">
          <Btn kind="danger" onClick={s.leaveRoom}>🚪 Leave the room</Btn>
        </div>
      </PaperPanel>
    );
  }

  if (s.netStatus === 'connecting') {
    return (
      <PaperPanel title="🌐 Festival Room">
        <p>🕊️ A messenger dove is flying to the room server…</p>
        {s.netError && <p className="online-error">⚠️ {s.netError}</p>}
        <div className="btn-row">
          <Btn onClick={s.leaveRoom}>Cancel</Btn>
        </div>
      </PaperPanel>
    );
  }

  return (
    <PaperPanel title="🌐 Play Together — Festival Rooms" wide>
      <p>
        Join classmates in the <strong>same living forest</strong>: see each other walk and wave,
        follow the teacher's election, and seal your own secret ballot from your own seat.
      </p>

      <h4>1️⃣ Pick your festival name</h4>
      <input
        className="seed-input"
        value={name}
        maxLength={16}
        placeholder="Your first name"
        aria-label="Your festival name"
        onChange={(e) => setName(e.target.value)}
      />

      <h4>2️⃣ Pick your animal</h4>
      <div className="chip-row" role="radiogroup" aria-label="Pick your animal">
        {NET_SPECIES.map((sp) => (
          <button
            key={sp.id}
            type="button"
            role="radio"
            aria-checked={species === sp.id}
            className={`chip-toggle${species === sp.id ? ' on' : ''}`}
            onClick={() => setSpecies(sp.id)}
          >
            {sp.emoji} {sp.label}
          </button>
        ))}
      </div>

      <h4>3️⃣ Join your class — or open a new room</h4>
      <div className="btn-row tabs" role="tablist" aria-label="Join or host">
        <Btn kind="plain" pressed={tab === 'join'} onClick={() => setTab('join')}>🎒 Join a room</Btn>
        <Btn kind="plain" pressed={tab === 'host'} onClick={() => setTab('host')}>👑 Host a room</Btn>
      </div>

      {tab === 'join' ? (
        <div>
          <p className="muted">Type the 4-letter code from the board:</p>
          <input
            className="seed-input room-code-input"
            value={code}
            maxLength={4}
            placeholder="ABCD"
            aria-label="Room code"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <div className="btn-row">
            <Btn
              kind="leaf"
              disabled={!ready || code.trim().length !== 4}
              onClick={() => { remember(); s.joinRoom(url, code, name.trim(), species); }}
            >
              🚪 Hop into room {code || '…'}
            </Btn>
          </div>
        </div>
      ) : (
        <div>
          <p className="muted">
            Hosting is for the teacher (or the first player). You get a 4-letter code to write on
            the board, and you steer the shared election.
          </p>
          <div className="btn-row">
            <Btn kind="leaf" disabled={!ready} onClick={() => { remember(); s.hostRoom(url, name.trim(), species); }}>
              🌳 Grow a new room
            </Btn>
          </div>
        </div>
      )}

      {s.netError && <p className="online-error">⚠️ {s.netError}</p>}

      <details className="advanced-net">
        <summary>⚙️ Server address (advanced)</summary>
        <p className="muted">
          The room server usually runs on the teacher's computer: <code>npm run server</code>.
          On one machine or a school network this default just works:
        </p>
        <input
          className="seed-input wide-input"
          value={url}
          aria-label="Room server address"
          onChange={(e) => setUrl(e.target.value)}
        />
        <p className="muted">
          Playing from home? Host the server online (any Node host) and enter its address here,
          like <code>wss://your-forest.example.com</code>.
        </p>
      </details>
    </PaperPanel>
  );
}
