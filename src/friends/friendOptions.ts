// Options for the Dream Friend Maker: visitors design their own original baby character.

export type FriendKind = 'ghost' | 'cloud' | 'robot' | 'alien' | 'monster' | 'you';
export type FriendMood = 'happy' | 'sleepy' | 'surprised' | 'wink';
export type FriendAccessory = 'none' | 'nightcap' | 'flowers' | 'crown' | 'scarf' | 'bow';

export interface FriendConfig {
  kind: FriendKind;
  color: string;
  skin: string;
  mood: FriendMood;
  accessory: FriendAccessory;
  name: string;
}

export const KINDS: { id: FriendKind; label: string; icon: string; blurb: string }[] = [
  { id: 'ghost', label: 'Friendly Ghost', icon: '👻', blurb: 'Floats through walls to tuck in shy sleepers.' },
  { id: 'cloud', label: 'Sleepy Cloud', icon: '☁️', blurb: 'Rains only lullabies, never puddles.' },
  { id: 'robot', label: 'Baby Robot', icon: '🤖', blurb: 'Beeps a goodnight in binary and blinks its antenna.' },
  { id: 'alien', label: 'Little Alien', icon: '🛸', blurb: 'Collects earth bedtime stories for its home planet.' },
  { id: 'monster', label: 'Fuzzy Monster', icon: '🧸', blurb: 'Lives under the bed to scare away bad dreams.' },
  { id: 'you', label: 'Fantastical You', icon: '✨', blurb: 'You, as the hero of your own dream.' },
];

export const COLORS = ['#F3EEFF', '#E3EEFF', '#BFE3D0', '#A8D8F0', '#C9A3D9', '#F6C1D4', '#F4D58D', '#B9C4D6'];
export const SKIN_TONES = ['#FBE3D3', '#F1C7A5', '#D9A37E', '#A86F4C', '#6E4630'];

export const MOODS: { id: FriendMood; label: string }[] = [
  { id: 'happy', label: 'Happy' },
  { id: 'sleepy', label: 'Sleepy' },
  { id: 'surprised', label: 'Wow!' },
  { id: 'wink', label: 'Wink' },
];

export const ACCESSORIES: { id: FriendAccessory; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'nightcap', label: 'Moon Nightcap' },
  { id: 'flowers', label: 'Flower Crown' },
  { id: 'crown', label: 'Star Crown' },
  { id: 'scarf', label: 'Cozy Scarf' },
  { id: 'bow', label: 'Ribbon Bow' },
];

export const DEFAULT_KIND_COLOR: Record<FriendKind, string> = {
  ghost: '#F3EEFF',
  cloud: '#E3EEFF',
  robot: '#B9C4D6',
  alien: '#BFE3D0',
  monster: '#C9A3D9',
  you: '#5C4033',
};

export const DEFAULT_FRIEND: FriendConfig = {
  kind: 'ghost',
  color: DEFAULT_KIND_COLOR.ghost,
  skin: SKIN_TONES[1],
  mood: 'happy',
  accessory: 'nightcap',
  name: 'Boo-Bean',
};

const NAME_START = ['Pudding', 'Mochi', 'Nimbus', 'Bloop', 'Twinkle', 'Puff', 'Zuzu', 'Biscuit', 'Comet', 'Wisp', 'Pebble', 'Noodle'];
const NAME_END = ['kin', 'bean', 'let', 'by', 'loo', 'puff', 'drop', 'bit'];

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

export const randomFriend = (): FriendConfig => {
  const kind = pick(KINDS).id;
  return {
    kind,
    color: kind === 'you' ? pick(['#5C4033', '#2A2340', '#C77D4A', '#E8C07A', '#B9A5E8']) : pick(COLORS),
    skin: pick(SKIN_TONES),
    mood: pick(MOODS).id,
    accessory: pick(ACCESSORIES).id,
    name: `${pick(NAME_START)}${Math.random() < 0.5 ? '' : pick(NAME_END)}`,
  };
};
