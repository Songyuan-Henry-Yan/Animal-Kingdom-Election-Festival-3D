export interface ReflectionQ {
  q: string;
  a: string;
  teacher?: string;
}

/** Ten campfire discussion cards. */
export const REFLECTION_QUESTIONS: ReflectionQ[] = [
  {
    q: 'Which voting rule was easiest to understand?',
    a: 'Most animals say the Acorn Basket (choose-one): one favorite each, biggest pile wins. Easy — but it ignores the rest of your ballot.',
    teacher: 'Discuss the tradeoff between simplicity and information: easy rules are transparent, but they read less of the ballot.',
  },
  {
    q: 'Which rule let voters express the most information?',
    a: 'Star ballots (score) say how strongly you feel about everyone, and rankings give your whole order. The Ranking Ladder and Star Jar both read much more of the ballot than the Acorn Basket does.',
    teacher: 'Compare expressiveness vs. strategy: richer ballots can invite exaggeration.',
  },
  {
    q: 'Which rule picked the candidate with the most first-choice fans?',
    a: 'The Acorn Basket. In the Teaching Example that was Flynn Fox with 28 fans — even though 72 of 100 voters ranked Flynn last!',
    teacher: 'Introduce the idea of a plurality winner without majority support, and vote-splitting.',
  },
  {
    q: 'Which rule picked a candidate many animals could accept?',
    a: 'The Smile Sticker Machine and the Friendly Matchup Arena. In the Teaching Example, Dolly Dolphin was okay with ALL 100 voters and beat everyone head-to-head.',
    teacher: 'This is the Condorcet winner / broad-acceptability idea — compare with the IRV and plurality outcomes.',
  },
  {
    q: 'Can the majority decide everything?',
    a: 'No. The Forest Charter protects things no vote can take away — like school for every kind of animal, private ballots, and safety for smaller groups.',
    teacher: 'Connect to constitutional limits, rights, and judicial review in real democracies.',
  },
  {
    q: 'Why does the Forest Charter matter?',
    a: 'Because elections choose leaders, but the Charter protects the players. It keeps the game fair for whoever loses, so everyone can safely try again next time.',
    teacher: 'Peaceful transfer of power and loser\'s consent are norms that keep elections meaningful.',
  },
  {
    q: 'Why should voters check campaign promises against the budget?',
    a: 'The forest has only 12 acorns. Promises that cost more than the budget cannot all come true — so wise voters count acorns, not just applause.',
    teacher: 'A gentle introduction to fiscal constraints and evaluating platforms critically without calling anyone a liar.',
  },
  {
    q: 'If one animal buys every megaphone, is the election still fair?',
    a: 'Being loud is not the same as being right. Fair elections give quiet voices a turn too — that is why voters compare plans, not just slogans.',
    teacher: 'Media literacy and campaign-influence discussions: how do voters see past advertising volume?',
  },
  {
    q: 'Why do we keep ballots secret?',
    a: 'So nobody can pressure, bribe, or tease a voter about their choice. The Forest Charter says ballots should be private — that keeps every vote honest and free.',
    teacher: 'The secret ballot (historically, the "Australian ballot") protects voters from coercion and retaliation.',
  },
  {
    q: 'The forest tried nine counting machines. Why might a real forest pick just one?',
    a: 'The Charter says the voting rule must be explained BEFORE the election. A forest picks one rule everyone understands and trusts — and different forests choose different values.',
    teacher: 'Electoral system choice is itself a democratic decision — compare how countries debated and reformed their own rules.',
  },
];
