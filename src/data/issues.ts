import type { Issue, IssueId } from '../types/game';

/**
 * Nine child-friendly issue cards. Age modes show the first N:
 * Story Mode 4 · Classroom Election 6 · Voting Systems Lab 9.
 */
export const ISSUE_ORDER: IssueId[] = [
  'snacks', 'nature', 'robot', 'safety', 'budget', 'ads', 'health', 'traditions', 'bridges',
];

export const ISSUES: Record<IssueId, Issue> = {
  snacks: {
    id: 'snacks',
    title: 'Snack Sharing',
    emoji: '🍎',
    question: 'If some animals have many snacks and others have none, should the forest share?',
    sideA: 'Some animals say: "Nobody should be hungry. Sharing shelves make the forest kinder."',
    sideB: 'Other animals say: "I gathered my snacks myself. Sharing should be my choice, not a rule."',
    think: 'Is there a plan that keeps everyone fed AND feels fair to the gatherers?',
    realWorld: 'Real communities debate food banks, school lunches, and how taxes share resources — kindness and fairness-to-effort both matter to voters.',
  },
  nature: {
    id: 'nature',
    title: 'The River and the Old Trees',
    emoji: '🌳',
    question: 'Should the forest build more playgrounds, or protect more trees and clean water?',
    sideA: 'Some animals say: "Playgrounds bring friends together. Kids need places to play!"',
    sideB: 'Other animals say: "Old trees and clean water take care of us. Once they are gone, they are gone."',
    think: 'Could a smaller playground and protected trees both fit? What would you give up?',
    realWorld: 'Cities weigh development against parks, forests, and water protection — zoning boards and environmental reviews exist for exactly this debate.',
  },
  robot: {
    id: 'robot',
    title: 'The Robot Parrot',
    emoji: '🤖',
    question: 'The Robot Parrot can help with homework, but sometimes it makes things up. Who should check it?',
    sideA: 'Some animals say: "It is so helpful! Let everyone use it and learn to double-check."',
    sideB: 'Other animals say: "Teachers and librarians should test it first, so it does not teach mistakes."',
    think: 'How would YOU check whether the Robot Parrot is telling the truth?',
    realWorld: 'Societies are deciding how to verify AI tools and online information — media literacy and fact-checking are modern civic skills.',
  },
  safety: {
    id: 'safety',
    title: 'Playground Safety',
    emoji: '🛝',
    question: 'What should the forest do when animals argue or bring unsafe toys to the playground?',
    sideA: 'Some animals say: "Clear rules and kind helpers keep playtime safe for everyone."',
    sideB: 'Other animals say: "Too many rules spoil the fun. Let animals work it out themselves."',
    think: 'Who should decide the playground rules — and who should help when there is an argument?',
    realWorld: 'Every community balances safety rules against personal freedom — from bike helmets to referees to neighborhood watch programs.',
  },
  budget: {
    id: 'budget',
    title: 'The Forest Budget',
    emoji: '🌰',
    question: 'The forest has only so many acorns to spend. What should matter most?',
    sideA: 'Some animals say: "Spend on what helps the most animals first — food, water, safety."',
    sideB: 'Other animals say: "Save some acorns for emergencies, even if it means fewer fun projects now."',
    think: 'The candidates all promise things. Do all their promises fit inside 12 acorns?',
    realWorld: 'Public budgets force choices — voters can compare campaign promises with what a budget can actually pay for.',
  },
  ads: {
    id: 'ads',
    title: 'The Big Megaphone Ads',
    emoji: '📣',
    question: 'If one animal can buy every megaphone in the forest, is the election still fair?',
    sideA: 'Some animals say: "Anyone should be free to cheer for their favorite as loudly as they like."',
    sideB: 'Other animals say: "If only rich animals get megaphones, quiet voices disappear. Share the megaphones!"',
    think: 'Does the loudest slogan mean the best plan? How could voters look past the noise?',
    realWorld: 'Democracies debate campaign advertising and spending rules — how to keep speech free while keeping elections fair.',
  },
  health: {
    id: 'health',
    title: 'Morning Hops and Crunchy Snacks',
    emoji: '🥕',
    question: 'Should the forest school add morning exercise and veggie gardens, even if not everyone loves them?',
    sideA: 'Some animals say: "Healthy hops and fresh snacks help every animal learn and grow."',
    sideB: 'Other animals say: "Animals should choose for themselves. Not every bunny likes early stretching!"',
    think: 'When should the group encourage healthy habits, and when is it each animal\'s own choice?',
    realWorld: 'Public health programs — school lunches, exercise time, wellness campaigns — always balance encouragement with personal choice.',
  },
  traditions: {
    id: 'traditions',
    title: 'Story Circle and New Games',
    emoji: '📖',
    question: 'Should festival time keep the old Story Circle traditions, or make room for brand-new games?',
    sideA: 'Some animals say: "Traditions carry the forest\'s memory. Elders\' stories teach what worked before."',
    sideB: 'Other animals say: "New games welcome new families. A forest that never changes gets stuck."',
    think: 'Can a forest honor its old stories AND try new ways? What would that look like?',
    realWorld: 'Communities constantly balance heritage and change — preserving traditions while welcoming newcomers and new ideas.',
  },
  bridges: {
    id: 'bridges',
    title: 'The Wobbly Bridges',
    emoji: '🌉',
    question: 'Should acorns fix the old wobbly bridges first, or build exciting new places instead?',
    sideA: 'Some animals say: "Fix what we have! Wobbly bridges are how animals get to school and work."',
    sideB: 'Other animals say: "New dens and markets help the forest grow. Repairs can wait one more season."',
    think: 'Repairs are not exciting, but everyone uses the bridges. How should a budget choose?',
    realWorld: 'Infrastructure — roads, bridges, pipes — is a classic budget debate: maintenance is invisible until it is urgent.',
  },
};
