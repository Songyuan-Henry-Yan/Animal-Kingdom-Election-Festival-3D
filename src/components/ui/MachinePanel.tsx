import React from 'react';
import type { SystemId } from '../../types/game';
import { SYSTEM_INFO } from '../../lib/voting';
import { MODES } from '../../data/modes';
import { PaperPanel, Btn } from './common';
import { useGame } from '../../state/store';

export function MachinePanel({ systemId }: { systemId: SystemId }): React.JSX.Element {
  const info = SYSTEM_INFO[systemId];
  const selected = useGame((s) => s.selectedSystems.includes(systemId));
  const toggleSystem = useGame((s) => s.toggleSystem);
  const teacherMode = useGame((s) => s.teacherMode);
  const mode = useGame((s) => s.mode);
  const awake = MODES[mode].systems.includes(systemId);

  return (
    <PaperPanel title={`${info.emoji} ${info.machineName}`}>
      <p className="muted">
        Counting rule: <strong>{info.name}</strong> · Difficulty:{' '}
        <span aria-label={`difficulty ${info.difficulty} of 3`}>
          {'⭐'.repeat(info.difficulty)}{'☆'.repeat(3 - info.difficulty)}
        </span>
      </p>
      {!awake && !selected && (
        <p className="notice">
          🔒 This machine is asleep in {MODES[mode].emoji} {MODES[mode].name}. Switch to a bigger
          age mode at the Festival Gate — or press "Load the Teaching Example" there to wake
          every machine at once!
        </p>
      )}
      <div className="quote-box">{info.rule}</div>
      <div className="two-sides">
        <div className="side-card">
          <h4>💪 Strength</h4>
          <p>{info.strength}</p>
        </div>
        <div className="side-card">
          <h4>⚖️ Weakness</h4>
          <p>{info.weakness}</p>
        </div>
      </div>
      <div className="btn-row">
        <Btn
          kind={selected ? 'leaf' : 'wood'}
          pressed={selected}
          disabled={!awake && !selected}
          onClick={() => toggleSystem(systemId)}
        >
          {selected ? '✅ Using this rule — press to switch off' : awake ? '⬜ Use this rule' : '🔒 Asleep in this mode'}
        </Btn>
      </div>
      <p className="muted">
        Machines you switch on will all count the <strong>same ballots</strong> in the Counting
        Theater.
      </p>
      {teacherMode && (
        <div className="teacher-box">
          <strong>🎓 {info.teacher.formalName}.</strong> {info.teacher.realWorld}
          <p><strong>Pros:</strong> {info.teacher.pros}</p>
          <p><strong>Cons:</strong> {info.teacher.cons}</p>
          <p><strong>Classroom prompt:</strong> {info.teacher.prompt}</p>
        </div>
      )}
    </PaperPanel>
  );
}
