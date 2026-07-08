# Animal Kingdom Election Festival 3D 🎪🦊🐼🦉

A cozy, child-friendly, **nonpartisan civics education game** set in a storybook forest village.
Ten friendly animal candidates, one hundred simulated voters, nine counting machines — and one big question.

## Educational goal

Children learn that **the counting rule is part of the election**. The game never says one rule
is best; it shows how each rule rewards a different democratic value (simplicity, majority
support, broad acceptability, strong feelings, compromise, representation) and lets players see
the differences for themselves.

## Core learning message

> **Same voters. Same ballots. Different voting rules. Will the same animal win?**

On the built-in Teaching Example (100 fixed voters), the answer is a resounding *no*:

| Counting rule | Machine | Winner |
| --- | --- | --- |
| Choose-One (Plurality) | Acorn Basket Machine | 🦊 Flynn Fox |
| Two-Round Runoff | Two Bridge Machine | 🐼 Penny Panda |
| Ranked Choice (IRV) | Leaf Transfer Machine | 🦉 Olive Owl |
| Borda Count | Ranking Ladder Machine | 🐬 Dolly Dolphin |
| Condorcet Matchups | Friendly Matchup Arena | 🐬 Dolly Dolphin |
| Approval Voting | Smile Sticker Machine | 🐬 Dolly Dolphin |
| Score Voting | Star Jar Machine | 🐬 Dolly Dolphin |
| STAR Voting | Star + Bridge Machine | 🐬 Dolly Dolphin |
| Proportional Forest Council | Council Tree Machine | Shared 7-seat council via D'Hondt (F2 P2 O1 L1 D1 — largest voice by tie-break) |

Every machine reads the **exact same 100 ballots** — they are generated once and reused,
never regenerated when you switch rules. `scripts/verifyVoting.ts` proves all of the outcomes
above (43 automated checks).

## Design (ported from Forest-Election-Festival)

This 3D version now follows the same ideas and flow as the author's 2D
[Forest-Election-Festival](https://github.com/Songyuan-Henry-Yan/Forest-Election-Festival) design:

- **Age modes** — 🐣 Story Mode (6–8: 3 candidates, 4 issues, 40 voters, 3 simple rules,
  simplified results), 🏫 Classroom Election (9–11: 5 candidates, 6 issues, 100 voters,
  5 rules), 🧪 Voting Systems Lab (12–14: 7 candidates, 9 issues, 150 voters, all 9 rules,
  pairwise matrix + council seats). Picked at the Festival Gate; asleep machines show a 🔒.
- **Magic Election Seed** — the same seed always grows the same election (roster, families,
  ballots), so a whole classroom can compare identical elections. Change it in the Workshop.
- **Forest Neighborhood mixer** — 🎲 Surprise mix or 🎨 Design the neighborhood: ages,
  pantry (wealth), forest roots, and job-family dials reshape ten animal households with a
  live preview and a "Meet the neighbors" panel. Different families need different things,
  so changing the neighborhood changes the election.
- **Value-axis voters** — candidates and households sit on eight value axes
  (rules↔freedom, effort↔sharing, tradition↔change, local↔together, build↔nature,
  choice↔services, feelings↔facts, leader↔compromise); compromise candidates earn
  broad-but-shallow support. **Polarization** (gentle breeze / windy / swirling leaves)
  widens or narrows how generous voters are.
- **Classroom Vote** — students take turns sealing real private ballots at one screen
  (with quick-fill from ranking), optionally add bot voters (up to 500 total), then flip
  the Counting Theater to count the classroom ballot box with every rule.
- **Prediction panel** — guess each machine's winner before running the count.
- **Tie-break transparency** — whenever the deterministic tie-break chain decides anything,
  the result card says so (⚖️).
- **Teaching Example button** — one press loads the fixed 100-voter election and wakes all
  nine machines, in any age mode.
- Ten campfire reflection cards plus a teacher-mode 🌰 **Pass the Acorn** random question
  picker; per-issue real-world connection notes; preferences (mode, seed, polarization,
  neighborhood, stickers) persist in `localStorage`.

## How to run

Requires Node.js 18+.

```bash
npm install
npm run dev            # local dev server (Vite) — open the printed URL
npm run build          # typecheck + production build to dist/
npm run preview        # serve the production build
npx tsx scripts/verifyVoting.ts   # prove the Teaching Example winners
```

## Play Together — online classroom rooms 🌐

The whole class can explore the **same living forest at the same time**: everyone sees each
other walk, hop, and wave; the teacher steers one shared election; and every student seals a
secret ballot **from their own seat** into one shared ballot box.

### How it works

Rooms are powered by a tiny WebSocket server (`server/festival-server.mjs`). Because every
election grows deterministically from the Magic Election Seed, the server never ships the
world — it only relays four small things: player positions, the teacher's setup (as a share
code), news draws, and "run the count" commands. Every computer regrows the identical
election locally, so 30 students stay in sync on a school network with almost no bandwidth.

### Classroom setup (LAN — no internet needed)

1. **Teacher, once:** `npm install`, then `npm run build`, then `npm run server`
2. The server prints a link like `http://192.168.1.20:8787` — write it on the board.
3. **Students:** open that link, press **🌐 Play Together**, type a first name, pick an animal.
4. **Teacher:** press **🌐 Play Together → 👑 Host a room**, and write the 4-letter room code
   on the board. Students join with it.

(Developing? `npm run server` also works alongside `npm run dev` — the game finds the room
server on port 8787 automatically.)

### Who can do what

- **Host (teacher):** festival setup, seed, neighborhood mixer, news draws, and the Counting
  Theater's ▶ button. Every change is quietly re-broadcast to the room.
- **Everyone:** explore, meet candidates and voter families, practice ballots, wave (`F`),
  hop (`Space`), splash in Dolly's pool — and seal one real secret ballot in the Booth
  (sealing again replaces it). Then the teacher counts the **Classroom Ballots** with any of
  the nine rules.
- If the host leaves, the crown passes to the next player automatically.

### Privacy by design 🍃

First names only, no accounts, no chat, nothing saved to disk — rooms live in the server's
memory and evaporate when the last player leaves. Hosting for remote students works on any
Node host (set `PORT`; use `wss://` behind TLS) — enter the address under
**⚙️ Server address (advanced)**.

## Controls

| Input | Action |
| --- | --- |
| `WASD` / arrow keys | Walk |
| Mouse drag | Orbit the camera |
| `E` | Interact with the glowing station near you |
| `Space` | Hop! (you can jump up onto the Rally Stage) |
| `Tab` | Open / close the Civic Notebook |
| `Esc` | Close any panel |

No combat, no timers — hopping is just for fun. A quest chip in the top-left always shows the recommended
next step; free roaming is always allowed.

## The festival

Forest Festival Gate → Election Workshop → Issue Trail (5 issue leaves) → Candidate Rally
Stage (10 candidates with slogans, promise cards, acorn budgets) → Parrot News Stand (draw 2
news events that reshape the *festival* ballots) → Secret Ballot Booth (practice ranking,
approval, and score ballots) → Counting Machine Arcade (switch any of 9 machines on) →
**Counting Theater** (run the same ballots through every selected machine, with winner
ribbons, round-by-round replays, a Condorcet pairwise matrix, STAR's score-then-runoff, and
council seats) → Campfire Reflection Circle. The Forest Charter Tree stands in the center.

Extras: three ballot stacks in the Theater (Teaching / Festival / Classroom), a Forest Passport with 8 motivational stickers (they never affect results),
**Teacher Mode** (formal system names, real-world connections, longer pros/cons, classroom
prompts), and a **Print Summary** button (results or reflection panel) that prints the seed,
settings, candidates, issues, rules, winners, and reflection questions via `window.print()`.

## Audio

Everything you hear is synthesized live with the **Web Audio API** — no audio files:

- An original, gentle marimba-and-bells forest loop (starts after your first click or key
  press, because browsers block autoplay, and fades in softly; it ducks during the results).
- Area-based ambience: leaf rustle near the tree line, water burbles near Dolly's pool, crowd
  murmur at the rally stage, machine hum in the arcade, campfire crackle by the fire.
- Unique procedural "voice barks" for all 10 candidates, the parrot reporter, and villagers.
- Interaction sounds: clicks, hovers, panel swishes, leaf flips, acorn knocks, sticker pops,
  star sparkles, machine start/finish, curtain swish, fact-check stamp, news jingle, ribbon
  fanfare.
- Settings panel with music / effects / voice sliders, mute-all, and captions — all saved to
  `localStorage`.

**Audio is never required**: every sound has a text equivalent, and captions are on by default.

## Accessibility

Keyboard-only play is fully supported (including all three practice ballots), focus states are
always visible, no meaning is carried by color alone, text is large for projectors, captions
describe sounds and voices, and the OS **reduced-motion** preference calms idle bobbing,
spinning machines, ribbon animations, and pulses automatically.

## Nonpartisan note

All candidates, groups, events, and the Forest Charter are **fictional animals in a fictional
forest**. The game references no real politicians, parties, elections, or countries, and it
never tells players which values should win. Candidates are never called liars — budgets are
simply checked against the 12-acorn tray.

## No external assets

No backend, no database, no login, no external APIs, no downloaded images, models, fonts, or
audio. Characters are built from spheres, capsules, cylinders, cones, and boxes; signs are
drawn onto canvases at runtime; every sound is synthesized. The game runs entirely offline
after `npm install`.

## Classroom ideas

- **Predict first**: after the Rally Stage, have students vote on who *should* win, then run
  the Teaching Example and compare rules.
- **Rule debate**: assign each group a counting machine; groups argue why their rule is fair
  and where it struggles (Teacher Mode has prompts and real-world connections).
- **News day**: draw different news pairs, re-run today's festival ballots, and discuss how
  events (and megaphone ads!) sway outcomes.
- **Charter talk**: which charter rule protects voters? candidates? small groups?
- **Print Summary** makes a handout of the whole session for discussion or homework.

## Project structure

```
src/
  App.tsx  main.tsx  styles/global.css
  components/  ui/  world/  characters/  audio/
  data/        candidates, issues, events, teachingExample, stickers, reflection
  lib/         voting (9 systems), metrics, audio, festivalBallots, print, random, storage, textTexture
  state/       store (zustand), registry
  types/       game.ts
scripts/verifyVoting.ts   — proves the Teaching Example outcomes
selfcheck/                — offline typecheck stubs (not used by the real build)
```

## Copyright

© 2026 Songyuan Yan. All rights reserved.

Animal Kingdom Election Festival — including its code, artwork, characters,
and text — was created as a nonpartisan educational project. If you would
like to use it in your classroom or build on it, please reach out to the
author.
