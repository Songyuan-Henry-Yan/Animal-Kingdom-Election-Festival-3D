import type { EventId, NewsEvent } from '../types/game';

export const EVENT_ORDER: EventId[] = ['heatwave', 'snackprices', 'robotwrong', 'megaphone'];

export const EVENTS: Record<EventId, NewsEvent> = {
  heatwave: {
    id: 'heatwave',
    title: 'Forest Heat Wave',
    emoji: '☀️',
    text: 'Squawk! The sun is extra toasty this week. Ponds are shrinking and everyone wants shade and clean water.',
    effectLine: 'Environment matters more to voters today.',
  },
  snackprices: {
    id: 'snackprices',
    title: 'Snack Prices Jump',
    emoji: '🥜',
    text: 'Squawk! Berry and nut prices doubled overnight. Families are counting their acorns very carefully.',
    effectLine: 'Budget and snack issues matter more to voters today.',
  },
  robotwrong: {
    id: 'robotwrong',
    title: 'Robot Parrot Gets It Wrong',
    emoji: '🤖',
    text: 'Squawk! The Robot Parrot told a classroom that fish can fly. The homework was VERY silly.',
    effectLine: 'Fact-checking matters more to voters today.',
  },
  megaphone: {
    id: 'megaphone',
    title: 'Big Bear Buys Megaphone Ads',
    emoji: '📣',
    text: 'Squawk! A big bear bought every megaphone in the forest to shout catchy slogans all day long.',
    effectLine: 'Campaign influence matters more — loud slogans sway some voters today.',
  },
};
