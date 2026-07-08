/** Friendly introductions each station's sign board shows (what this place IS and what to do). */
export interface StationIntro {
  id: string;
  title: string;
  emoji: string;
  what: string;
  todo: string;
  funFact: string;
}

export const INTROS: Record<string, StationIntro> = {
  trail: {
    id: 'trail',
    title: 'The Issue Trail',
    emoji: '🍃',
    what: 'A winding path of glowing issue leaves. Each leaf holds one big question the forest is wrestling with — snacks, safety, trees, budgets, and more.',
    todo: 'Walk from leaf to leaf and press E to read each one. Every leaf shows two friendly sides — because real issues have more than one! Read leaves to fill your Civic Notebook.',
    funFact: 'Candidates promise things ABOUT these issues. Reading the leaves first makes you a much sharper listener at the Rally Stage.',
  },
  rally: {
    id: 'rally',
    title: 'The Candidate Rally Stage',
    emoji: '🎤',
    what: 'The wooden stage where today\'s candidates make their case. Each animal has a slogan, three promise cards, a strength — and a tradeoff.',
    todo: 'Walk up to each candidate and press E. Ask all four questions: hear a promise, ask what it costs, who it helps, and who might worry. Check their plans against the 12-acorn budget tray!',
    funFact: 'No candidate here is "the right answer." Each one stands for a different value the forest cares about.',
  },
  arcade: {
    id: 'arcade',
    title: 'The Counting Machine Arcade',
    emoji: '🕹️',
    what: 'Nine wonderful machines, each counting the SAME ballots by a different rule — baskets, bridges, ladders, star jars, even a council tree.',
    todo: 'Inspect machines with E and flip the "Use this rule" switch on the ones you want. Machines with a 🔒 lamp are asleep in your age mode. Your switched-on machines all run in the Counting Theater.',
    funFact: 'Every machine is fair in its own way — and they do not always agree on the winner. That is the whole mystery of this festival!',
  },
  meadow: {
    id: 'meadow',
    title: 'The Neighborhood Green',
    emoji: '🏘️',
    what: 'The cozy picnic meadow where voter families gather. These are the animals whose ballots the machines will count!',
    todo: 'Talk to the family folks here (press E). Ask what they need, what worries them, and who they are leaning toward. Great detectives interview voters BEFORE predicting winners.',
    funFact: 'The families you meet match today\'s neighborhood mix — remix it in the Election Workshop and different families grow or shrink.',
  },
};
