export interface StoryScene {
  id: number;
  title: string;
  subtitle: string;
  text: string;
  instruction: string;
}

export const STORY_SCENES: StoryScene[] = [
  {
    id: 1,
    title: 'The Star That Fell Asleep',
    subtitle: 'Where every gentle journey starts',
    text: 'A tiny star tumbled into the cloud-top moss, cold, gray, and silent, having forgotten how to shine. Lumi knelt beside it, lifting a miniature brass lantern until its gentle warmth stirred the sleeping embers awake.',
    instruction: 'Tap the fallen star to infuse it with golden warmth and awaken its starlight.',
  },
  {
    id: 2,
    title: 'The First Broken Dream',
    subtitle: 'Fragile hopes adrift in the wind',
    text: 'High above the telescope dome, Lumi learned that wishes travel through the night sky as crystalline spheres. When sharp gale winds shattered a young dreamer’s wish into three drifting shards, Lumi vowed to let no dream slip into the shadows.',
    instruction: 'Collect the 3 wandering shards scattered in the wind to tuck them safely into Lumi’s satchel.',
  },
  {
    id: 3,
    title: 'The Moonlit Atelier',
    subtitle: 'Workshop No. 07 above the clouds',
    text: 'Inside an abandoned brass observatory dome, Lumi built Workshop No. 07. With miniature gears, spun silver beams, and amber glass, Lumi crafted three wondrous inventions to shelter fragile dreams before the break of dawn.',
    instruction: 'Inspect the 3 artisanal inventions Lumi crafted for midnight rescues.',
  },
  {
    id: 4,
    title: 'Your Dream, Too',
    subtitle: 'An apprentice’s warm welcome',
    text: 'Lumi turns toward you with a soft flutter of lavender wings. Just moments ago, a fractured dream arrived at the repair mat. With your hands and Lumi’s moonlight thread, tonight we will make it whole once more.',
    instruction: 'Step up to the workbench and begin restoring the dream crystal.',
  },
];

export const INVENTIONS = [
  {
    id: 'loom',
    name: 'The Moon-Thread Spool',
    tag: 'Tool 01',
    description: 'Spins ethereal silver moonlight into supple, unbreakable thread that knits fractured crystal facets seamlessly.',
    icon: 'Feather',
  },
  {
    id: 'press',
    name: 'The Starlight Lantern Press',
    tag: 'Tool 02',
    description: 'Forges protective brass and stained-glass chambers, shielding sensitive dreams from morning turbulence.',
    icon: 'Hammer',
  },
  {
    id: 'compass',
    name: 'The Cloud-Current Compass',
    tag: 'Tool 03',
    description: 'A magnetic astrolabe that points straight toward whichever sleeping dreamer is tossing and turning most.',
    icon: 'Compass',
  },
];
