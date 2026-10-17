export interface SignatureObject {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  iconName: string;
}

export const LUMI_CHARACTER = {
  name: 'Lumi',
  species: 'Moon Moth',
  whatTheyAre: 'A tiny moon moth with lavender wings, amber eyes and a knitted rose scarf. Quietly brave, curious, and a little forgetful.',
  whatTheyDo: 'Junior Dream Repairer of Workshop No. 07: mends broken dream crystals with moonlight thread and flies them home before sunrise.',
  theirStory: 'Lumi discovered a fallen star that had forgotten how to shine, inspiring a lifelong mission to rescue broken dreams before sunrise.',
  tagline: 'Even the smallest light can rescue a dream.',
  role: 'Junior Dream Repairer',
  workshop: 'Moonlit Atelier, Workshop No. 07',
  home: 'A miniature workshop inside an abandoned observatory above the clouds.',
  biography: 'High above the sleeping world, Lumi works through the quietest hours of the night. Guided by the faint chime of cracked dream crystals, this tiny artisan mends fragile hopes with threads of spun moonlight, tucks them into protective lanterns, and ensures no dreamer wakes up in the dark.',
  personality: [
    'Quietly brave',
    'Curious & observant',
    'Gentle & compassionate',
    'Patient artisan',
    'Slightly forgetful',
    'Determined helper',
  ],
  specialAbility: {
    title: 'Moonlight Weaving & Emotional Sight',
    description: 'Lumi perceives the hidden emotional hues inside dreams and seamlessly reknits shattered facets using threads of silver starlight.',
  },
  weakness: {
    title: 'Hope-Bound Lantern',
    description: "Lumi's brass lantern flickers and dims whenever a dreamer begins to lose faith or surrender to despair.",
  },
  signatureObjects: [
    {
      id: 'lantern',
      name: 'Brass Star Lantern',
      shortLabel: 'Star Lantern',
      description: 'Houses a living, pulsing fragment of the very first fallen star Lumi ever rescued. It never burns out unless hope fades.',
      iconName: 'Flame',
    },
    {
      id: 'satchel',
      name: 'Dream Fragment Satchel',
      shortLabel: 'Fragment Satchel',
      description: 'A velvet cross-body pouch padded with dandelion down to safely carry wandering, fractured crystal shards.',
      iconName: 'Package',
    },
    {
      id: 'scarf',
      name: 'Knitted Rose Scarf',
      shortLabel: 'Rose Scarf',
      description: 'Hand-spun from cloud-thistle silk by an elder moon moth. Keeps Lumi warm against chilling stratosphere currents.',
      iconName: 'Sparkles',
    },
    {
      id: 'needles',
      name: 'Moon-Thread Needles',
      shortLabel: 'Silver Needles',
      description: 'Microscopic silver tools capable of capturing raw beams of moonlight and weaving them into unbreakable crystalline seams.',
      iconName: 'Compass',
    },
  ] as SignatureObject[],
};
