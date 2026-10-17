import type { LanternColor, LanternShape, LanternSymbol } from '../types/atelier';

export interface LanternPalette {
  hex: string; // main glass / glow colour
  core: string; // hottest inner light
  deep: string; // darker rim for contrast
  name: string;
}

export const LANTERN_PALETTE: Record<LanternColor, LanternPalette> = {
  gold: { hex: '#F4C96B', core: '#FFF4CC', deep: '#C98F1E', name: 'Lantern Gold' },
  lavender: { hex: '#B9A5E8', core: '#F1EBFF', deep: '#7C62C4', name: 'Moth Lavender' },
  rose: { hex: '#D995B7', core: '#FFE6F1', deep: '#AE5A86', name: 'Dream Rose' },
  ice: { hex: '#93C5FD', core: '#E6F3FF', deep: '#4B8FD9', name: 'Ice Blue' },
};

export const SHAPE_NAMES: Record<LanternShape, string> = {
  round: 'Classic Globe',
  star: 'Astral Star',
  crescent: 'Moon Cradle',
};

export const SYMBOL_NAMES: Record<LanternSymbol, string> = {
  star: 'Star',
  moon: 'Moon',
  flower: 'Moonpetal',
  comet: 'Comet',
};

/** Lumi's original blessings — one for every colour × symbol pairing. */
export const BLESSINGS: Record<LanternColor, Record<LanternSymbol, string>> = {
  gold: {
    star: 'May your brightest hope find its way across even the darkest sky.',
    moon: 'May gentle silver light cradle your thoughts until morning wakes.',
    flower: 'May quiet joy bloom in your heart whenever midnight turns cold.',
    comet: 'May your boldest wish carry you all the way past the horizon.',
  },
  lavender: {
    star: 'May peaceful sleep stitch every scattered thought back together.',
    moon: 'May the hush of the stars keep watch over you till dawn.',
    flower: 'May soft lavender petals settle every worry before sunrise.',
    comet: 'May your dreams drift home on wings as soft as mine.',
  },
  rose: {
    star: 'May warm courage glow in every sleepy breath you take.',
    moon: 'May a blanket of rose-spun moonlight keep you warm tonight.',
    flower: 'May kindness blossom wherever this mended dream wanders.',
    comet: 'May your fondest memories shine like rose-gold constellations.',
  },
  ice: {
    star: 'May clear starlight guide your sleep through the misty clouds.',
    moon: 'May cool, calm stillness quiet even the stormiest night.',
    flower: 'May crystal wonder keep your imagination fresh and deep.',
    comet: 'May a spark of brilliant inspiration greet you when you wake.',
  },
};

/** Deterministic workshop serial, e.g. "WS07-4F2A", derived from the lantern choices. */
export function workshopSerial(parts: string[]): string {
  let h = 2166136261;
  for (const ch of parts.join('|')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return `WS07-${(h >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 4)}`;
}
