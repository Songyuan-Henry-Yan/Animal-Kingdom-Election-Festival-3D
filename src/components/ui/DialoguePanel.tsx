import React, { useEffect, useState } from 'react';
import type { CandidateId } from '../../types/game';
import { ACORN_BUDGET, CANDIDATES } from '../../data/candidates';
import { audio } from '../../lib/audio';
import { PaperPanel, Btn, AcornTray } from './common';
import { useGame } from '../../state/store';

type Topic = 'greeting' | 'promise' | 'costs' | 'helps' | 'worries';

export function DialoguePanel({ candidateId }: { candidateId: CandidateId }): React.JSX.Element {
  const c = CANDIDATES[candidateId];
  const teacherMode = useGame((s) => s.teacherMode);
  const [topic, setTopic] = useState<Topic>('greeting');
  const [promiseIdx, setPromiseIdx] = useState(0);

  useEffect(() => {
    setTopic('greeting');
    setPromiseIdx(0);
    audio.speak(c.id, c.greeting, c.name);
  }, [c]);

  const totalCost = c.promises.reduce((s, p) => s + p.cost, 0);
  const overBudget = totalCost > ACORN_BUDGET;

  const say = (t: Topic) => {
    setTopic(t);
    if (t === 'promise') {
      const next = topic === 'promise' ? (promiseIdx + 1) % c.promises.length : promiseIdx;
      setPromiseIdx(next);
      audio.speak(c.id, c.promises[next].text, c.name);
      audio.acornDrop();
    } else if (t !== 'greeting') {
      audio.speak(c.id, c.answers[t === 'costs' ? 'costs' : t === 'helps' ? 'helps' : 'worries'], c.name);
    }
  };

  const line =
    topic === 'greeting' ? c.greeting
      : topic === 'promise' ? c.promises[promiseIdx].text
        : topic === 'costs' ? c.answers.costs
          : topic === 'helps' ? c.answers.helps
            : c.answers.worries;

  return (
    <PaperPanel title={`${c.emoji} ${c.name}`} wide>
      <p className="slogan">“{c.slogan}”</p>
      <p className="muted">{c.personality} · {c.colorNote}</p>
      <p className="dialogue-line">“{line}”</p>

      <div className="btn-row" role="group" aria-label="Ask the candidate">
        <Btn onClick={() => say('promise')}>🍃 Hear a Promise</Btn>
        <Btn onClick={() => say('costs')}>🌰 Ask What It Costs</Btn>
        <Btn onClick={() => say('helps')}>🤗 Ask Who It Helps</Btn>
        <Btn onClick={() => say('worries')}>😟 Ask Who Might Worry</Btn>
      </div>

      <h3>Promise cards</h3>
      <div className="promise-grid">
        {c.promises.map((p, i) => (
          <div key={p.title} className={`promise-card${topic === 'promise' && i === promiseIdx ? ' active' : ''}`}>
            <h4>{p.title}</h4>
            <p>{p.text}</p>
            <p><strong>Helps:</strong> {p.helps}</p>
            <p><strong>Cost:</strong> {'🌰'.repeat(p.cost)} ({p.cost} acorns)</p>
            <p><strong>Tradeoff:</strong> {p.tradeoff}</p>
          </div>
        ))}
      </div>

      <h3>The acorn budget</h3>
      <AcornTray used={totalCost} budget={ACORN_BUDGET} />
      {overBudget && (
        <p className="notice">
          This plan sounds exciting, but the acorn budget may not be enough.
        </p>
      )}

      <div className="two-sides">
        <div className="side-card">
          <h4>💪 Strength</h4>
          <p>{c.strength}</p>
        </div>
        <div className="side-card">
          <h4>⚖️ Tradeoff</h4>
          <p>{c.tradeoff}</p>
        </div>
      </div>

      {teacherMode && (
        <div className="teacher-box">
          <strong>🎓 Teacher note:</strong> Every candidate here is a bundle of values —
          freedom, fairness, facts, safety, compromise, building, patience, health, listening,
          or thrift. None is "the correct one." Ask students which promises they would fund
          within the 12-acorn budget, and what they would give up.
        </div>
      )}
    </PaperPanel>
  );
}
