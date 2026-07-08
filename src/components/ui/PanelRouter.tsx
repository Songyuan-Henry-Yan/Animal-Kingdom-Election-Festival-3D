import React from 'react';
import { useGame } from '../../state/store';
import type { CandidateId, IssueId, SystemId } from '../../types/game';
import { GatePanel, CharterPanel, VillagerPanel } from './StoryPanels';
import { WorkshopPanel } from './WorkshopPanel';
import { SetupPanel } from './SetupPanel';
import { MapPanel } from './MapPanel';
import { ReportPanel } from './ReportPanel';
import { IntroPanel } from './IntroPanel';
import { VoterPanel } from './VoterPanel';
import { IssuePanel } from './IssuePanel';
import { DialoguePanel } from './DialoguePanel';
import { NewsPanel } from './NewsPanel';
import { BoothPanel } from './BoothPanel';
import { MachinePanel } from './MachinePanel';
import { TheaterPanel } from './TheaterPanel';
import { CampfirePanel } from './CampfirePanel';
import { CivicNotebook } from './CivicNotebook';
import { SettingsPanel } from './SettingsPanel';
import { OnlinePanel } from './OnlinePanel';

export function PanelRouter(): React.JSX.Element | null {
  const panel = useGame((s) => s.panel);
  const teacherMode = useGame((s) => s.teacherMode);
  if (!panel) return null;

  switch (panel.kind) {
    case 'gate': return <GatePanel />;
    case 'setup': return <SetupPanel />;
    case 'map': return <MapPanel />;
    case 'report': return <ReportPanel />;
    case 'intro': return <IntroPanel introId={panel.id ?? 'trail'} />;
    case 'voter': return <VoterPanel householdId={panel.id ?? 'meadowMice'} />;
    case 'workshop': return <WorkshopPanel />;
    case 'issue': return <IssuePanel issueId={panel.id as IssueId} />;
    case 'candidate': return <DialoguePanel candidateId={panel.id as CandidateId} />;
    case 'news': return <NewsPanel />;
    case 'booth': return <BoothPanel />;
    case 'machine': return <MachinePanel systemId={panel.id as SystemId} />;
    case 'theater': return <TheaterPanel />;
    case 'charter': return <CharterPanel teacherMode={teacherMode} />;
    case 'campfire': return <CampfirePanel />;
    case 'notebook': return <CivicNotebook />;
    case 'settings': return <SettingsPanel />;
    case 'villager': return <VillagerPanel villagerId={panel.id ?? 'willow'} />;
    case 'online': return <OnlinePanel />;
    default: return null;
  }
}
