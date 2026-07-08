import type { Species } from '../components/characters/AnimalModel';

/**
 * Ambient festival-goers who stroll the plaza on their own little routes.
 * Walk up and press E to say hello — each one has a few things to share.
 * Purely for charm: they make the island feel busy and alive on voting day.
 */
export interface WandererDef {
  id: string;
  name: string;
  species: Species;
  color: string;
  accent: string;
  /** A handful of lines; one is picked at random each time you chat. */
  lines: string[];
}

export const WANDERERS: WandererDef[] = [
  {
    id: 'rusty',
    name: 'Rusty',
    species: 'fox',
    color: '#d98b4a',
    accent: '#f2c035',
    lines: [
      'Big day, huh? I already visited every station twice. My favourite is the rally stage — you can hop right up on it!',
      'A wise old owl told me: read the promise cards before you cheer. So now I read them TWICE.',
      'Whatever wins today, we all live in the same forest tomorrow. Best be kind about it!',
    ],
  },
  {
    id: 'pip',
    name: 'Pip',
    species: 'raccoon',
    color: '#8a8f99',
    accent: '#4b4f57',
    lines: [
      'Psst — did you know every counting machine reads the SAME ballots? They just count them different ways. Sneaky, right?',
      "I'm still deciding who to vote for. That's allowed! Nobody has to make up their mind early.",
      'I collect shiny acorns AND good ideas. Found any good ideas at the workshop yet?',
    ],
  },
  {
    id: 'bramble',
    name: 'Bramble',
    species: 'beaver',
    color: '#9c6f43',
    accent: '#c9b88a',
    lines: [
      'A fair vote is like a good dam — every log matters, even the little ones.',
      'I fixed the bridge to the meadow this morning. Go say hi to the voter families over there!',
      "Don't forget to seal your ballot at the booth. Behind the curtain — it's a secret for a reason!",
    ],
  },
  {
    id: 'hazel',
    name: 'Hazel',
    species: 'owl',
    color: '#8d6f52',
    accent: '#c7a978',
    lines: [
      'Hoo! So many ways to count votes — plurality, runoff, ranked… each tells a slightly different story.',
      'Take your time exploring. The Festival waits for no one, but it welcomes everyone.',
      'The wisest voters ask questions. You are asking questions. Very promising!',
    ],
  },
  {
    id: 'tuff',
    name: 'Tuff',
    species: 'elephant',
    color: '#9aa4ad',
    accent: '#f7cede',
    lines: [
      'I never forget a promise a candidate made — that helps a LOT when it is time to vote.',
      'Big ears are handy at a rally. I hear ALL the speeches, even the quiet ones.',
      'Feeling unsure? That is normal. Chat with a few neighbours and see what they think!',
    ],
  },
  {
    id: 'juniper',
    name: 'Juniper',
    species: 'panda',
    color: '#efe9df',
    accent: '#2b2b2b',
    lines: [
      'I brought snacks to share at the campfire. Voting is hungry work!',
      'Everyone gets exactly one vote here — the tiniest mouse and the tallest elephant. I like that.',
      'When the counting theater lights up, come watch with me. It is the best part!',
    ],
  },
];
