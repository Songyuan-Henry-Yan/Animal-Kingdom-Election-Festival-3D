import React, { useEffect, useState } from 'react';
import type { CandidateId } from '../../types/game';
import { VOTER_CHARACTERS } from '../../data/voters';
import { HOUSEHOLDS } from '../../data/neighborhood';
import { ISSUES } from '../../data/issues';
import { CANDIDATES } from '../../data/candidates';
import { PaperPanel, Btn } from './common';
import { useGame } from '../../state/store';
import { audio } from '../../lib/audio';

type Topic = 'hello' | 'needs' | 'worry' | 'leaning';

/** Chat with a voter family on the Neighborhood Green. */
export function VoterPanel({ householdId }: { householdId: string }): React.JSX.Element {
  const v = VOTER_CHARACTERS[householdId] ?? VOTER_CHARACTERS.meadowMice;
  const fam = HOUSEHOLDS.find((h) => h.id === v.householdId) ?? HOUSEHOLDS[0];
  const game = useGame((s) => s.game);
  const teacherMode = useGame((s) => s.teacherMode);
  const hideLeanings = useGame((s) => s.hideLeanings);
  const [topic, setTopic] = useState<Topic>('hello');

  useEffect(() => {
    setTopic('hello');
    audio.speak(v.voice, v.hello, v.name);
  }, [v]);

  const count = game.groups.find((g) => g.id === v.householdId)?.count ?? 0;
  const ours = game.ballots.filter((b) => b.voterGroupId === v.householdId);
  const firsts: Record<string, number> = {};
  const okays: Record<string, number> = {};
  for (const b of ours) {
    firsts[b.ranking[0]] = (firsts[b.ranking[0]] ?? 0) + 1;
    for (const c of b.approvals) okays[c] = (okays[c] ?? 0) + 1;
  }
  const top = (rec: Record<string, number>): CandidateId | null => {
    const e = Object.entries(rec).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
    return e.length ? (e[0][0] as CandidateId) : null;
  };
  const fav = top(firsts);
  const okay = top(okays);

  const leaningLine = ours.length === 0
    ? 'Our family is so small this election that the pollsters skipped us entirely! Remix the neighborhood in the Workshop and we might grow.'
    : `Well... between us? Of our ${count} voters, the most first-choice hearts point to ${fav ? `${CANDIDATES[fav].emoji} ${CANDIDATES[fav].name}` : 'nobody yet'}${okay && okay !== fav ? `, and most of us agree ${CANDIDATES[okay].emoji} ${CANDIDATES[okay].name} would be okay too` : ''}. But the ballot booth is private — shh!`;

  const line =
    topic === 'hello' ? v.hello
      : topic === 'needs' ? `${fam.blurb} What we really need: ${fam.needs}`
        : topic === 'worry' ? v.worry
          : leaningLine;

  const say = (t: Topic) => {
    setTopic(t);
    const text = t === 'hello' ? v.hello : t === 'needs' ? fam.needs : t === 'worry' ? v.worry : leaningLine;
    audio.speak(v.voice, text, v.name);
  };

  return (
    <PaperPanel title={`${fam.emoji} ${v.name} — ${fam.name}`}>
      <p className="muted">A family of <strong>{count}</strong> voters in today's election.</p>
      <p className="dialogue-line">“{line}”</p>
      <div className="btn-row" role="group" aria-label="Ask the voter">
        <Btn onClick={() => say('hello')}>👋 Say hello</Btn>
        <Btn onClick={() => say('needs')}>🧺 What do you need?</Btn>
        <Btn onClick={() => say('worry')}>😟 What worries you?</Btn>
        {!hideLeanings && <Btn onClick={() => say('leaning')}>🗳️ Who are you leaning toward?</Btn>}
      </div>
      <h3>Issues our family watches</h3>
      <div className="chip-row">
        {Object.keys(fam.issueBoost).map((iid) => {
          const issue = ISSUES[iid as keyof typeof ISSUES];
          return issue ? <span key={iid} className="chip">{issue.emoji} {issue.title}</span> : null;
        })}
      </div>
      <p className="muted small">
        The leanings you just heard are peeked from today's REAL simulated ballots — the very
        stack the counting machines will read. Interview more families, then try the 🔭
        prediction panel in the Counting Theater!
      </p>
      {teacherMode && (
        <div className="teacher-box">
          <strong>🎓 Teacher note:</strong> Talking to voters is what pollsters and journalists
          do before an election. Polls <em>describe</em> how groups feel — they never decide the
          result, and small families can surprise everyone.
        </div>
      )}
    </PaperPanel>
  );
}
