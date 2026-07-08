import React from 'react';
import type { IssueId } from '../../types/game';
import { ISSUES } from '../../data/issues';
import { PaperPanel } from './common';
import { useGame, issuesInPlay } from '../../state/store';

export function IssuePanel({ issueId }: { issueId: IssueId }): React.JSX.Element {
  const issue = ISSUES[issueId];
  const read = useGame((s) => s.issuesRead.length);
  const teacherMode = useGame((s) => s.teacherMode);
  const total = useGame((s) => issuesInPlay(s).length);
  return (
    <PaperPanel title={`${issue.emoji} Issue Leaf: ${issue.title}`}>
      <div className="quote-box">{issue.question}</div>
      <div className="two-sides">
        <div className="side-card">
          <h4>🌼 One side</h4>
          <p>{issue.sideA}</p>
        </div>
        <div className="side-card">
          <h4>🍂 Another side</h4>
          <p>{issue.sideB}</p>
        </div>
      </div>
      <p><strong>🤔 Think about it:</strong> {issue.think}</p>
      {teacherMode && (
        <div className="teacher-box">
          <strong>🎓 Real-world connection:</strong> {issue.realWorld}
        </div>
      )}
      <p className="muted">
        Added to your Civic Notebook. Issue leaves read: {read} of {total} in this mode.
        Neither side is "the bad side" — good citizens listen to both before deciding.
      </p>
    </PaperPanel>
  );
}
