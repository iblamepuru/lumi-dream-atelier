import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react';
import {
  ALL_DESTINATION_IDS,
  ALL_STAR_IDS,
  type AtelierState,
  type AtelierContextType,
  type ThemeMode,
  type LanternConfig,
  type DestinationId,
  type StoryProgress,
  type Preferences,
  type VisitorMemory,
  type LumiMessage,
  type LumiMood,
} from '../types/atelier';

const STORAGE_KEY = 'lumi_atelier_state_v1';
const PREFS_KEY = 'lumi_prefs_v1';
const VISITOR_KEY = 'lumi_visitor_memory_v1';
const SESSION_FLAG = 'lumi_session_counted';

const DEFAULT_LANTERN: LanternConfig = {
  shape: 'round',
  color: 'gold',
  symbol: 'star',
  glowIntensity: 85,
  environment: 'midnight',
  dreamName: 'The Starlight Voyager',
  cardCreated: false,
};

const DEFAULT_STATE: AtelierState = {
  theme: 'midnight',
  isMuted: true, // Audio always starts muted
  crystalRepaired: false,
  lanternConfig: DEFAULT_LANTERN,
  deliveriesCompleted: [],
  discoveredStars: [],
  storyProgress: { starAwakened: false, fragmentsCollected: [], inventionsInspected: [] },
};

const DEFAULT_PREFS: Preferences = { sparkleTrail: true, chaosMode: false, forceReducedMotion: false };

const canUseStorage = () => {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
};

const unique = <T,>(arr: T[]) => Array.from(new Set(arr));
const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

/** Validate anything read from storage; malformed or outdated fields fall back to defaults. */
function sanitizeState(parsed: unknown): AtelierState {
  if (!parsed || typeof parsed !== 'object') return DEFAULT_STATE;
  const p = parsed as Record<string, any>;
  const lc = (p.lanternConfig && typeof p.lanternConfig === 'object' ? p.lanternConfig : {}) as Record<string, any>;
  const sp = (p.storyProgress && typeof p.storyProgress === 'object' ? p.storyProgress : {}) as Record<string, any>;
  return {
    theme: oneOf(p.theme, ['twilight', 'midnight'] as const, 'midnight'),
    isMuted: typeof p.isMuted === 'boolean' ? p.isMuted : true,
    crystalRepaired: p.crystalRepaired === true,
    lanternConfig: {
      shape: oneOf(lc.shape, ['round', 'star', 'crescent'] as const, 'round'),
      color: oneOf(lc.color, ['gold', 'lavender', 'rose', 'ice'] as const, 'gold'),
      symbol: oneOf(lc.symbol, ['star', 'moon', 'flower', 'comet'] as const, 'star'),
      glowIntensity: typeof lc.glowIntensity === 'number' && Number.isFinite(lc.glowIntensity)
        ? Math.round(Math.max(20, Math.min(100, lc.glowIntensity)))
        : 85,
      environment: oneOf(lc.environment, ['twilight', 'midnight'] as const, 'midnight'),
      dreamName: typeof lc.dreamName === 'string' ? lc.dreamName.slice(0, 40) : DEFAULT_LANTERN.dreamName,
      cardCreated: lc.cardCreated === true,
    },
    deliveriesCompleted: Array.isArray(p.deliveriesCompleted)
      ? unique(p.deliveriesCompleted.filter((d: unknown) => ALL_DESTINATION_IDS.includes(d as DestinationId)))
      : [],
    discoveredStars: Array.isArray(p.discoveredStars)
      ? unique(p.discoveredStars.filter((s: unknown) => ALL_STAR_IDS.includes(s as never)))
      : [],
    storyProgress: {
      starAwakened: sp.starAwakened === true,
      fragmentsCollected: Array.isArray(sp.fragmentsCollected)
        ? unique(sp.fragmentsCollected.filter((n: unknown) => n === 1 || n === 2 || n === 3))
        : [],
      inventionsInspected: Array.isArray(sp.inventionsInspected)
        ? unique(sp.inventionsInspected.filter((s: unknown) => s === 'loom' || s === 'press' || s === 'compass'))
        : [],
    },
  };
}

function readJSON(key: string): unknown {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode) — the experience keeps working in memory.
  }
}

function loadPrefs(): Preferences {
  const p = readJSON(PREFS_KEY) as Partial<Preferences> | null;
  return {
    sparkleTrail: typeof p?.sparkleTrail === 'boolean' ? p.sparkleTrail : DEFAULT_PREFS.sparkleTrail,
    chaosMode: p?.chaosMode === true,
    forceReducedMotion: p?.forceReducedMotion === true,
  };
}

/** Loads visitor memory and counts this browser session once (sessionStorage guard). */
function loadVisitor(): VisitorMemory {
  const now = new Date().toISOString();
  const stored = readJSON(VISITOR_KEY) as Partial<VisitorMemory> | null;
  const base: VisitorMemory = {
    visitCount: typeof stored?.visitCount === 'number' && stored.visitCount > 0 ? Math.floor(stored.visitCount) : 0,
    firstVisit: typeof stored?.firstVisit === 'string' ? stored.firstVisit : now,
    lastVisit: typeof stored?.lastVisit === 'string' ? stored.lastVisit : now,
    previousVisit: typeof stored?.previousVisit === 'string' ? stored.previousVisit : null,
    visitorName: typeof stored?.visitorName === 'string' ? stored.visitorName.slice(0, 24) : '',
  };

  let alreadyCounted = false;
  try {
    alreadyCounted = sessionStorage.getItem(SESSION_FLAG) === '1';
  } catch {
    alreadyCounted = false;
  }
  if (alreadyCounted && base.visitCount > 0) return base;

  const next: VisitorMemory = {
    ...base,
    visitCount: base.visitCount + 1,
    previousVisit: base.visitCount > 0 ? base.lastVisit : null,
    lastVisit: now,
  };
  writeJSON(VISITOR_KEY, next);
  try {
    sessionStorage.setItem(SESSION_FLAG, '1');
  } catch {
    // ignore
  }
  return next;
}

const AtelierContext = createContext<AtelierContextType | undefined>(undefined);

export const AtelierProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AtelierState>(() => sanitizeState(readJSON(STORAGE_KEY)));
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs);
  const [visitor, setVisitor] = useState<VisitorMemory>(loadVisitor);
  const [lumiMessage, setLumiMessage] = useState<LumiMessage | null>(null);
  const messageId = useRef(0);

  // Theme attribute on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', state.theme);
    root.classList.toggle('theme-midnight', state.theme === 'midnight');
    root.classList.toggle('theme-twilight', state.theme === 'twilight');
  }, [state.theme]);

  // Preference classes on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('force-reduced-motion', prefs.forceReducedMotion);
    root.classList.toggle('chaos-mode', prefs.chaosMode);
  }, [prefs.forceReducedMotion, prefs.chaosMode]);

  useEffect(() => writeJSON(STORAGE_KEY, state), [state]);
  useEffect(() => writeJSON(PREFS_KEY, prefs), [prefs]);
  useEffect(() => writeJSON(VISITOR_KEY, visitor), [visitor]);

  const setTheme = useCallback((theme: ThemeMode) => setState((prev) => ({ ...prev, theme })), []);
  const toggleTheme = useCallback(
    () => setState((prev) => ({ ...prev, theme: prev.theme === 'midnight' ? 'twilight' : 'midnight' })),
    []
  );
  const setIsMuted = useCallback((isMuted: boolean) => setState((prev) => ({ ...prev, isMuted })), []);
  const toggleMute = useCallback(() => setState((prev) => ({ ...prev, isMuted: !prev.isMuted })), []);
  const setCrystalRepaired = useCallback(
    (crystalRepaired: boolean) => setState((prev) => (prev.crystalRepaired === crystalRepaired ? prev : { ...prev, crystalRepaired })),
    []
  );
  const updateLanternConfig = useCallback(
    (config: Partial<LanternConfig>) =>
      setState((prev) => ({ ...prev, lanternConfig: { ...prev.lanternConfig, ...config } })),
    []
  );
  const markDeliveryCompleted = useCallback(
    (destination: DestinationId) =>
      setState((prev) =>
        prev.deliveriesCompleted.includes(destination)
          ? prev
          : { ...prev, deliveriesCompleted: [...prev.deliveriesCompleted, destination] }
      ),
    []
  );
  const discoverStar = useCallback(
    (starId: string) =>
      setState((prev) =>
        prev.discoveredStars.includes(starId) || !ALL_STAR_IDS.includes(starId as never)
          ? prev
          : { ...prev, discoveredStars: [...prev.discoveredStars, starId] }
      ),
    []
  );
  const updateStoryProgress = useCallback(
    (progress: Partial<StoryProgress>) =>
      setState((prev) => ({ ...prev, storyProgress: { ...prev.storyProgress, ...progress } })),
    []
  );
  const setPref = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);
  const setVisitorName = useCallback((name: string) => {
    setVisitor((prev) => ({ ...prev, visitorName: name.trim().slice(0, 24) }));
  }, []);
  const lumiSay = useCallback((text: string, mood: LumiMood = 'happy') => {
    messageId.current += 1;
    setLumiMessage({ id: messageId.current, text, mood });
  }, []);

  /** Replays the origin story chapters only — projects, lantern, deliveries, and stars are kept. */
  const replayStory = useCallback(
    () => setState((prev) => ({ ...prev, storyProgress: { ...DEFAULT_STATE.storyProgress } })),
    []
  );
  /** Resets journey progress but keeps comfort settings (theme, sound) and visitor memory. */
  const resetAllProgress = useCallback(
    () => setState((prev) => ({ ...DEFAULT_STATE, theme: prev.theme, isMuted: prev.isMuted })),
    []
  );
  const resetStars = useCallback(() => setState((prev) => ({ ...prev, discoveredStars: [] })), []);
  const resetDeliveries = useCallback(() => setState((prev) => ({ ...prev, deliveriesCompleted: [] })), []);
  const resetPuzzle = useCallback(() => setState((prev) => ({ ...prev, crystalRepaired: false })), []);

  const value = useMemo<AtelierContextType>(
    () => ({
      state,
      prefs,
      visitor,
      lumiMessage,
      setTheme,
      toggleTheme,
      setIsMuted,
      toggleMute,
      setCrystalRepaired,
      updateLanternConfig,
      markDeliveryCompleted,
      discoverStar,
      updateStoryProgress,
      setPref,
      setVisitorName,
      lumiSay,
      replayStory,
      resetAllProgress,
      resetStars,
      resetDeliveries,
      resetPuzzle,
    }),
    [state, prefs, visitor, lumiMessage, setTheme, toggleTheme, setIsMuted, toggleMute, setCrystalRepaired,
      updateLanternConfig, markDeliveryCompleted, discoverStar, updateStoryProgress, setPref, setVisitorName,
      lumiSay, replayStory, resetAllProgress, resetStars, resetDeliveries, resetPuzzle]
  );

  return <AtelierContext.Provider value={value}>{children}</AtelierContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAtelier = (): AtelierContextType => {
  const context = useContext(AtelierContext);
  if (!context) throw new Error('useAtelier must be used within an AtelierProvider');
  return context;
};
