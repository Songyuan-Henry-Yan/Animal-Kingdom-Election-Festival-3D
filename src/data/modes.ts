import type { AgeMode, SystemId } from '../types/game';

export interface ModeConfig {
  id: AgeMode;
  name: string;
  ages: string;
  emoji: string;
  blurb: string;
  candidates: number;
  issues: number;
  voters: number;
  /** Which counting machines are awake in this mode. */
  systems: SystemId[];
  /** Machines switched on by default when the mode starts. */
  defaultSelected: SystemId[];
  /** Story Mode hides the trickiest tables for the youngest players. */
  simplifiedResults: boolean;
}

export const MODE_ORDER: AgeMode[] = ['story', 'classroom', 'lab'];

export const MODES: Record<AgeMode, ModeConfig> = {
  story: {
    id: 'story',
    name: 'Story Mode',
    ages: 'ages 6–8',
    emoji: '🐣',
    blurb: '3 candidates, 4 issues, 40 voters, 3 simple rules, extra-simple results.',
    candidates: 3,
    issues: 4,
    voters: 40,
    systems: ['plurality', 'runoff', 'approval'],
    defaultSelected: ['plurality', 'runoff', 'approval'],
    simplifiedResults: true,
  },
  classroom: {
    id: 'classroom',
    name: 'Classroom Election',
    ages: 'ages 9–11',
    emoji: '🏫',
    blurb: '5 candidates, 6 issues, 100 voters, 5 rules — the main experience.',
    candidates: 5,
    issues: 6,
    voters: 100,
    systems: ['plurality', 'runoff', 'irv', 'borda', 'condorcet'],
    defaultSelected: ['plurality', 'runoff', 'irv', 'borda', 'condorcet'],
    simplifiedResults: false,
  },
  lab: {
    id: 'lab',
    name: 'Voting Systems Lab',
    ages: 'ages 12–14',
    emoji: '🧪',
    blurb: '7 candidates, 9 issues, 150 voters, all 9 rules, matchup matrix + council seats.',
    candidates: 7,
    issues: 9,
    voters: 150,
    systems: ['plurality', 'runoff', 'irv', 'borda', 'condorcet', 'approval', 'score', 'star', 'council'],
    defaultSelected: ['plurality', 'runoff', 'irv', 'borda', 'condorcet'],
    simplifiedResults: false,
  },
};

export const POLARIZATION_INFO: Record<'breeze' | 'windy' | 'swirl', { name: string; emoji: string; blurb: string }> = {
  breeze: { name: 'Gentle breeze', emoji: '🍃', blurb: 'Voters are generous — even distant candidates get some stars and stickers.' },
  windy: { name: 'Windy', emoji: '🌬️', blurb: 'A normal election day — clear favorites, fair middles.' },
  swirl: { name: 'Swirling leaves', emoji: '🍂', blurb: 'Strong feelings! Favorites get everything, distant candidates get almost nothing.' },
};
