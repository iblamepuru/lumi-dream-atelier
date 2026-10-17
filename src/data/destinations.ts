import type { DestinationId } from '../types/atelier';

export interface Destination {
  id: DestinationId;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  pathD: string; // SVG bezier curve from observatory (100, 340)
  description: string;
  dreamer: string;
  vignette: string;
  icon: string;
}

export const MAP_HOME = {
  id: 'observatory',
  name: 'Observatory Workshop No. 07',
  x: 100,
  y: 340,
  description: 'Lumi’s cozy atelier nestled inside the vintage brass telescope dome.',
};

export const DESTINATIONS: Destination[] = [
  {
    id: 'cloud-garden',
    name: 'The Cloud Garden',
    subtitle: 'Floating Botanist Spire',
    x: 220,
    y: 160,
    pathD: 'M 100 340 C 120 230, 160 180, 220 160',
    description: 'A floating conservatory where slumbering sky-botanists dream of luminous, singing petals.',
    dreamer: 'Lyra the Cloud Gardener',
    vignette: 'The restored dream lantern glides past frosted glass arches. Phosphorescent orchids unfold in the moonlight, humming a lullaby as Lyra smiles in deep slumber.',
    icon: 'Flower2',
  },
  {
    id: 'sleeping-lighthouse',
    name: 'The Sleeping Lighthouse',
    subtitle: 'Quiet Spire Above Mist',
    x: 480,
    y: 120,
    pathD: 'M 100 340 C 220 280, 360 140, 480 120',
    description: 'A quiet coastal spire standing above a sea of mist, waiting for a guiding spark.',
    dreamer: 'Barnaby the Mist Watcher',
    vignette: 'Lumi gently hangs the glowing lantern upon the lighthouse crown. A warm beacon of starlight cuts through the coastal fog, soothing Barnaby’s stormy thoughts.',
    icon: 'Radio',
  },
  {
    id: 'moonflower-valley',
    name: 'The Moonflower Valley',
    subtitle: 'Terraced Silver Meadow',
    x: 640,
    y: 310,
    pathD: 'M 100 340 C 260 410, 480 380, 640 310',
    description: 'A terraced valley where silver blossoms open only when touched by a mended dream.',
    dreamer: 'Pip the Little Dreamer',
    vignette: 'As the lantern touches the silver grass, hundreds of night lilies burst into luminescent bloom. Pip hugs a plush pillow tighter, safely cradled in sweet dreams.',
    icon: 'Sparkles',
  },
];
