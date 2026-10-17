export type ThemeMode = 'twilight' | 'midnight';

export type LanternShape = 'round' | 'star' | 'crescent';
export type LanternColor = 'gold' | 'lavender' | 'rose' | 'ice';
export type LanternSymbol = 'star' | 'moon' | 'flower' | 'comet';

export type DestinationId = 'cloud-garden' | 'sleeping-lighthouse' | 'moonflower-valley';

export type HiddenStarId = 'star-hero' | 'star-profile' | 'star-story' | 'star-lab' | 'star-map';

export type LumiMood = 'happy' | 'curious' | 'focused' | 'sleepy' | 'celebrating';

export const ALL_STAR_IDS: HiddenStarId[] = ['star-hero', 'star-profile', 'star-story', 'star-lab', 'star-map'];
export const ALL_DESTINATION_IDS: DestinationId[] = ['cloud-garden', 'sleeping-lighthouse', 'moonflower-valley'];

export interface LanternConfig {
  shape: LanternShape;
  color: LanternColor;
  symbol: LanternSymbol;
  glowIntensity: number; // 20 to 100
  environment: ThemeMode;
  dreamName: string;
  cardCreated: boolean;
}

export interface StoryProgress {
  starAwakened: boolean;
  fragmentsCollected: number[]; // subset of [1, 2, 3]
  inventionsInspected: string[]; // subset of ['loom', 'press', 'compass']
}

/** Persisted under `lumi_atelier_state_v1` — schema unchanged for backward compatibility. */
export interface AtelierState {
  theme: ThemeMode;
  isMuted: boolean;
  crystalRepaired: boolean;
  lanternConfig: LanternConfig;
  deliveriesCompleted: DestinationId[];
  discoveredStars: string[]; // unique star IDs
  storyProgress: StoryProgress;
}

/** Persisted separately under `lumi_prefs_v1`. */
export interface Preferences {
  sparkleTrail: boolean;
  chaosMode: boolean;
  forceReducedMotion: boolean;
}

/** Persisted separately under `lumi_visitor_memory_v1`. Never leaves the device. */
export interface VisitorMemory {
  visitCount: number;
  firstVisit: string; // ISO date
  lastVisit: string; // ISO date of the current session
  previousVisit: string | null; // ISO date of the session before this one
  visitorName: string;
}

/** A transient line of dialogue Lumi says in reaction to something (not persisted). */
export interface LumiMessage {
  id: number;
  text: string;
  mood: LumiMood;
}

export interface AtelierContextType {
  state: AtelierState;
  prefs: Preferences;
  visitor: VisitorMemory;
  lumiMessage: LumiMessage | null;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setCrystalRepaired: (repaired: boolean) => void;
  updateLanternConfig: (config: Partial<LanternConfig>) => void;
  markDeliveryCompleted: (destination: DestinationId) => void;
  discoverStar: (starId: string) => void;
  updateStoryProgress: (progress: Partial<StoryProgress>) => void;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  setVisitorName: (name: string) => void;
  lumiSay: (text: string, mood?: LumiMood) => void;
  replayStory: () => void;
  resetAllProgress: () => void;
  resetStars: () => void;
  resetDeliveries: () => void;
  resetPuzzle: () => void;
}
