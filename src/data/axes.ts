import type { AxisId, CandidateId } from '../types/game';

/** The eight value axes, with kid-friendly end labels (-1 side ↔ +1 side). */
export const AXES: Record<AxisId, { name: string; low: string; high: string }> = {
  freedom: { name: 'Rules & Freedom', low: 'clear rules', high: 'free choice' },
  sharing: { name: 'Effort & Sharing', low: 'reward effort', high: 'shared support' },
  change: { name: 'Tradition & Change', low: 'keep traditions', high: 'try new ways' },
  cooperation: { name: 'Local & Together', low: 'our meadow first', high: 'work together' },
  nature: { name: 'Building & Nature', low: 'build more', high: 'protect nature' },
  services: { name: 'Choice & Services', low: 'individual choice', high: 'public services' },
  facts: { name: 'Feelings & Facts', low: 'follow feelings', high: 'check the facts' },
  compromise: { name: 'Leader & Compromise', low: 'strong leader', high: 'find compromise' },
};

export const AXIS_ORDER: AxisId[] = [
  'freedom', 'sharing', 'change', 'cooperation', 'nature', 'services', 'facts', 'compromise',
];

/** Where each candidate stands on every axis (-1..+1). Drives simulated voters. */
export const CANDIDATE_AXES: Record<CandidateId, Record<AxisId, number>> = {
  flynn: { freedom: 0.9, sharing: -0.4, change: 0.6, cooperation: -0.2, nature: -0.3, services: -0.7, facts: -0.2, compromise: -0.3 },
  penny: { freedom: -0.1, sharing: 0.9, change: 0.1, cooperation: 0.4, nature: 0.2, services: 0.8, facts: 0.0, compromise: 0.3 },
  olive: { freedom: 0.0, sharing: 0.2, change: 0.2, cooperation: 0.3, nature: 0.4, services: 0.3, facts: 0.95, compromise: 0.1 },
  leo:   { freedom: -0.85, sharing: -0.1, change: -0.4, cooperation: -0.1, nature: 0.0, services: 0.2, facts: 0.3, compromise: -0.5 },
  dolly: { freedom: 0.0, sharing: 0.3, change: 0.1, cooperation: 0.8, nature: 0.4, services: 0.2, facts: 0.2, compromise: 0.95 },
  bella: { freedom: 0.0, sharing: 0.1, change: 0.3, cooperation: 0.2, nature: -0.6, services: 0.4, facts: 0.1, compromise: 0.0 },
  tata:  { freedom: -0.2, sharing: 0.2, change: -0.9, cooperation: 0.0, nature: 0.3, services: 0.1, facts: 0.2, compromise: 0.2 },
  ruby:  { freedom: 0.3, sharing: 0.3, change: 0.4, cooperation: 0.2, nature: 0.1, services: 0.5, facts: -0.3, compromise: 0.0 },
  ella:  { freedom: -0.1, sharing: 0.5, change: 0.0, cooperation: 0.5, nature: 0.2, services: 0.4, facts: 0.1, compromise: 0.6 },
  rocky: { freedom: 0.4, sharing: 0.2, change: 0.3, cooperation: 0.1, nature: 0.6, services: -0.2, facts: 0.0, compromise: 0.1 },
};

/** How flashy each campaign's slogans are (used only by the megaphone-ads event). */
export const CANDIDATE_FLASH: Record<CandidateId, number> = {
  flynn: 0.9, ruby: 0.8, rocky: 0.65, dolly: 0.6, bella: 0.55,
  penny: 0.5, ella: 0.45, leo: 0.4, tata: 0.25, olive: 0.2,
};
