import type { VoiceId } from '../types/game';
import type { Species } from '../components/characters/AnimalModel';

/**
 * One friendly spokes-voter for each household family. Talk to them on the
 * Neighborhood Green to learn what their family needs, worries about, and
 * who they are leaning toward (computed live from today's actual ballots!).
 */
export interface VoterCharacter {
  householdId: string;
  name: string;
  species: Species;
  color: string;
  accent: string;
  voice: VoiceId;
  hello: string;
  worry: string;
}

export const VOTER_CHARACTERS: Record<string, VoterCharacter> = {
  meadowMice: {
    householdId: 'meadowMice',
    name: 'Pip Whiskerfield',
    species: 'helper',
    color: '#b9b2a6',
    accent: '#d9534f',
    voice: 'villager',
    hello: 'Squeak! We are the Meadow Mice — lots of little ones, one small pantry. Every seed counts at our house!',
    worry: 'We worry about empty snack shelves and busy paths on the way to school. Big promises are nice, but will there be seeds in winter?',
  },
  bambooGrove: {
    householdId: 'bambooGrove',
    name: 'Mei Bamboo',
    species: 'panda',
    color: '#efe9df',
    accent: '#3a3a36',
    voice: 'penny',
    hello: 'Welcome, dear. Our grove cooks a big pot every evening — anyone who knocks gets a bowl.',
    worry: 'We worry about neighbors who are too shy to ask for help. A forest is only as warm as its coldest den.',
  },
  libraryOwls: {
    householdId: 'libraryOwls',
    name: 'Professor Hoots',
    species: 'owl',
    color: '#7a6248',
    accent: '#ddd2ba',
    voice: 'olive',
    hello: 'Hoo! Before you ask who we vote for — ask how we check what candidates SAY. We read everything twice.',
    worry: 'We worry about loud megaphones and Robot Parrots spreading mixed-up facts faster than we can check them.',
  },
  ridgeLions: {
    householdId: 'ridgeLions',
    name: 'Granny Goldmane',
    species: 'lion',
    color: '#c99a44',
    accent: '#8f9fb8',
    voice: 'leo',
    hello: 'Good evening, cub. Our ridge families have walked these trails for generations — steady paws, steady rules.',
    worry: 'We worry about unsafe toys at the playground and nobody practicing the storm drill. Excitement fades; safety keeps.',
  },
  pondDolphins: {
    householdId: 'pondDolphins',
    name: 'Splash Finley',
    species: 'dolphin',
    color: '#63a8b8',
    accent: '#cfeaee',
    voice: 'dolly',
    hello: 'Splash! Our pond circle loves when meadow friends visit. Come for the picnic, stay for the compromise!',
    worry: 'We worry about murky water and neighbors who stop talking to each other. Most fights shrink at a round table.',
  },
  damBeavers: {
    householdId: 'damBeavers',
    name: 'Chip Woodson',
    species: 'beaver',
    color: '#96653c',
    accent: '#e8b53a',
    voice: 'bella',
    hello: 'Tap tap! Excuse the sawdust. Our crews cross the wobbly bridges every single morning — we notice every loose plank.',
    worry: 'We worry that repairs keep getting skipped for shinier projects. A bridge nobody fixes becomes a river nobody crosses.',
  },
  burrowRabbits: {
    householdId: 'burrowRabbits',
    name: 'Clover Hopwell',
    species: 'rabbit',
    color: '#e8dcc8',
    accent: '#e0788a',
    voice: 'ruby',
    hello: 'Boing! Morning! Our burrow has seven little hoppers and never enough carrots. We LOVE the veggie garden idea.',
    worry: 'We worry about tired little ones with rumbly tummies at school. Healthy snacks should not depend on a lucky pantry.',
  },
  elderTurtles: {
    householdId: 'elderTurtles',
    name: 'Grandpa Shellby',
    species: 'turtle',
    color: '#7d9b6a',
    accent: '#d9b86a',
    voice: 'tata',
    hello: 'Mm, hello, young helper. Sit a moment. I have voted in forty festivals — the stories I could tell you...',
    worry: 'We worry the forest forgets its old stories and spends every acorn the day it is picked. Save some, little one.',
  },
  marketRaccoons: {
    householdId: 'marketRaccoons',
    name: 'Nickel Ringtail',
    species: 'raccoon',
    color: '#8b8d93',
    accent: '#43434a',
    voice: 'rocky',
    hello: 'Psst — welcome to the family stall! Fair trades, tidy books, and no acorn wasted. What are you shopping for? Ideas?',
    worry: 'We worry about heavy rules squeezing small stalls, and about budgets that promise ten acorns from a five-acorn jar.',
  },
  grandElephants: {
    householdId: 'grandElephants',
    name: 'Auntie Trunkle',
    species: 'elephant',
    color: '#a7aeba',
    accent: '#e58bb0',
    voice: 'ella',
    hello: 'Hello, dear one. Our families are new to this forest, and my, what a welcome the picnics have been!',
    worry: 'We worry new families will not be heard yet — and we never, ever forget which promises were kept.',
  },
};
