import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAtelier } from '../context/AtelierContext';
import { playMusicBoxNote } from '../utils/soundEngine';
import { LumiCharacter } from '../components/LumiCharacter';
import { SoundToggle } from '../components/SoundToggle';
import { Music, Play, Square, Circle, Repeat, Trash2 } from 'lucide-react';

// C-major pentatonic across two octaves: every combination sounds gentle.
const KEYS = [
  { note: 'C', freq: 523.25, key: '1', color: '#F4C96B' },
  { note: 'D', freq: 587.33, key: '2', color: '#F2B8A0' },
  { note: 'E', freq: 659.25, key: '3', color: '#D995B7' },
  { note: 'G', freq: 783.99, key: '4', color: '#C9A3D9' },
  { note: 'A', freq: 880.0, key: '5', color: '#B9A5E8' },
  { note: 'C', freq: 1046.5, key: '6', color: '#A5B8EE' },
  { note: 'D', freq: 1174.66, key: '7', color: '#93C5FD' },
  { note: 'E', freq: 1318.51, key: '8', color: '#A7E3E0' },
];

// "Lumi's Lullaby" — an original melody as [key index, beats].
const LUMIS_LULLABY: [number, number][] = [
  [2, 1], [3, 1], [4, 2], [3, 1], [2, 1], [1, 1], [0, 3],
  [1, 1], [2, 1], [3, 2], [2, 1], [1, 1], [0, 1], [1, 3],
  [2, 1], [3, 1], [4, 1], [5, 2], [4, 1], [3, 1], [2, 3],
  [1, 1], [2, 1], [3, 2], [2, 1], [1, 1], [0, 4],
];
const BEAT_MS = 420;
const MAX_RECORDED = 64;

interface RecordedNote {
  index: number;
  at: number; // ms from the first note
}

type Mode = 'idle' | 'lullaby' | 'recording' | 'replay';

export const LullabyLab: React.FC = () => {
  const { state, lumiSay } = useAtelier();
  const [mode, setMode] = useState<Mode>('idle');
  const [litKey, setLitKey] = useState<number | null>(null);
  const [recording, setRecording] = useState<RecordedNote[]>([]);
  const [notesPlayed, setNotesPlayed] = useState(0);

  const mutedRef = useRef(state.isMuted);
  const timersRef = useRef<number[]>([]);
  const recordStartRef = useRef<number | null>(null);
  const modeRef = useRef<Mode>('idle');

  useEffect(() => {
    mutedRef.current = state.isMuted;
  }, [state.isMuted]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const sound = useCallback((index: number) => {
    playMusicBoxNote(mutedRef.current, KEYS[index].freq);
    setLitKey(index);
    const t = window.setTimeout(() => setLitKey((k) => (k === index ? null : k)), 260);
    timersRef.current.push(t);
  }, []);

  const pressKey = useCallback(
    (index: number) => {
      if (modeRef.current === 'lullaby' || modeRef.current === 'replay') return;
      sound(index);
      setNotesPlayed((n) => n + 1);
      if (modeRef.current === 'recording') {
        const now = performance.now();
        if (recordStartRef.current === null) recordStartRef.current = now;
        const at = now - recordStartRef.current;
        setRecording((prev) => (prev.length >= MAX_RECORDED ? prev : [...prev, { index, at }]));
      }
    },
    [sound]
  );

  // Number keys 1–8 play the comb whenever focus isn't in a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const index = KEYS.findIndex((k) => k.key === e.key);
      if (index === -1) return;
      const lab = document.getElementById('lullaby-lab');
      if (!lab) return;
      const rect = lab.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return; // only while the lab is on screen
      pressKey(index);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pressKey]);

  const playSequence = (notes: RecordedNote[], nextMode: Mode, onDone: () => void) => {
    clearTimers();
    setMode(nextMode);
    notes.forEach(({ index, at }) => {
      timersRef.current.push(window.setTimeout(() => sound(index), at));
    });
    const end = (notes[notes.length - 1]?.at ?? 0) + 900;
    timersRef.current.push(
      window.setTimeout(() => {
        setMode('idle');
        onDone();
      }, end)
    );
  };

  const handleLullaby = () => {
    if (mode === 'lullaby') {
      clearTimers();
      setMode('idle');
      return;
    }
    let t = 0;
    const notes = LUMIS_LULLABY.map(([index, beats]) => {
      const n = { index, at: t };
      t += beats * BEAT_MS;
      return n;
    });
    if (state.isMuted) lumiSay?.('The music box is spinning, but sound is muted. Tap the sound switch to hear my lullaby!', 'curious');
    playSequence(notes, 'lullaby', () =>
      lumiSay?.('That is the song I hum while mending dreams. Now you try a melody of your own!', 'sleepy')
    );
  };

  const handleRecord = () => {
    if (mode === 'recording') {
      setMode('idle');
      recordStartRef.current = null;
      if (recording.length > 0) lumiSay?.(`A ${recording.length}-note lullaby! I'll keep it in my music box.`, 'happy');
      return;
    }
    clearTimers();
    setRecording([]);
    recordStartRef.current = null;
    setMode('recording');
  };

  const handleReplay = () => {
    if (mode === 'replay') {
      clearTimers();
      setMode('idle');
      return;
    }
    if (recording.length === 0) return;
    playSequence(recording, 'replay', () => undefined);
  };

  const lumiMood = mode === 'lullaby' ? 'sleepy' : litKey !== null ? 'celebrating' : mode === 'recording' ? 'focused' : 'happy';

  return (
    <div
      id="lullaby-lab"
      className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-glow)] shadow-xl flex flex-col gap-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
            <Music className="w-4 h-4" />
            <span>Lullaby Lab</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-[var(--text-primary)] mt-1">The Star-Comb Music Box</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
            Pluck the eight star tines (or press keys <kbd className="font-mono">1</kbd>–<kbd className="font-mono">8</kbd>). Every note
            fits, so nothing sounds wrong.
          </p>
        </div>
        <div className="shrink-0 hidden sm:block" aria-hidden="true">
          <LumiCharacter mood={lumiMood} size={84} lanternColor={state.lanternConfig.color} enableEyeTracking={false} />
        </div>
      </div>

      {state.isMuted && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--surface-badge)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
          <span>Sound is muted. The stars still glow, but turn sound on to hear the music box.</span>
          <SoundToggle />
        </div>
      )}

      {/* The comb: eight star tines of rising height */}
      <div
        role="group"
        aria-label="Music box star keys"
        className="relative flex items-end justify-between gap-1.5 sm:gap-2 h-44 px-2 pt-3 pb-2 rounded-2xl bg-gradient-to-b from-[#1d1730] to-[#2b2244] border border-[#F4C96B]/30 overflow-hidden"
      >
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-[#B88A3E] via-[#F4C96B] to-[#B88A3E]" aria-hidden="true" />
        {KEYS.map((k, i) => {
          const lit = litKey === i;
          return (
            <button
              key={i}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                pressKey(i);
              }}
              onClick={(e) => {
                // detail === 0: activated by keyboard or assistive tech rather than a pointer press
                if (e.detail === 0) pressKey(i);
              }}
              aria-label={`Star tine ${i + 1}, note ${k.note}`}
              className="group relative flex-1 flex flex-col items-center justify-end h-full focus-visible:outline-2 focus-visible:outline-[var(--accent-gold)] rounded-lg touch-manipulation"
            >
              <span
                className="block mb-1 transition-transform duration-150"
                style={{ transform: lit ? 'translateY(-8px) scale(1.35)' : 'none', color: k.color }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path
                    d="M12 2 L14.6 9.4 L22 12 L14.6 14.6 L12 22 L9.4 14.6 L2 12 L9.4 9.4 Z"
                    fill="currentColor"
                    style={{ filter: lit ? `drop-shadow(0 0 10px ${k.color})` : 'none' }}
                  />
                </svg>
              </span>
              <span
                className="block w-3 sm:w-4 rounded-t-full transition-all duration-150 group-hover:brightness-125"
                style={{
                  height: `${40 + (KEYS.length - i) * 9}%`,
                  background: `linear-gradient(to top, #B88A3E, ${k.color})`,
                  boxShadow: lit ? `0 0 18px ${k.color}` : 'none',
                }}
                aria-hidden="true"
              />
              <span className="mt-1 text-[10px] font-mono text-[#FFF8F1]/60" aria-hidden="true">
                {k.key}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={handleLullaby}
          aria-pressed={mode === 'lullaby'}
          disabled={mode === 'recording' || mode === 'replay'}
          className="py-2.5 rounded-full bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {mode === 'lullaby' ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{mode === 'lullaby' ? 'Stop' : "Lumi's Song"}</span>
        </button>
        <button
          type="button"
          onClick={handleRecord}
          aria-pressed={mode === 'recording'}
          disabled={mode === 'lullaby' || mode === 'replay'}
          className={`py-2.5 rounded-full border transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 ${
            mode === 'recording'
              ? 'border-[#D995B7] bg-[#D995B7]/25 text-[var(--text-primary)] animate-pulse'
              : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--border-glow)]'
          }`}
        >
          <Circle className={`w-3.5 h-3.5 ${mode === 'recording' ? 'fill-[#D995B7] text-[#D995B7]' : 'text-[#D995B7]'}`} />
          <span>{mode === 'recording' ? `Done (${recording.length})` : 'Record'}</span>
        </button>
        <button
          type="button"
          onClick={handleReplay}
          aria-pressed={mode === 'replay'}
          disabled={recording.length === 0 || mode === 'recording' || mode === 'lullaby'}
          className="py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--border-glow)] transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          {mode === 'replay' ? <Square className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
          <span>{mode === 'replay' ? 'Stop' : 'My Tune'}</span>
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]" aria-live="polite">
        <span>
          {mode === 'lullaby'
            ? 'Lumi is humming along…'
            : mode === 'recording'
              ? 'Recording: play your melody, then press Done.'
              : mode === 'replay'
                ? 'Playing your tune back…'
                : `${notesPlayed} notes plucked tonight`}
        </span>
        {recording.length > 0 && mode === 'idle' && (
          <button
            type="button"
            onClick={() => setRecording([])}
            className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear tune</span>
          </button>
        )}
      </div>
    </div>
  );
};
