import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Flashlight, RotateCcw } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { playChime, playSparkle } from '../utils/soundEngine';
import { LANTERN_PALETTE } from '../data/lantern';

// Lantern Hide-and-Seek: a nightlight cursor. A dark layer covers a hidden dream mural; a CSS
// radial mask follows your pointer, finger or the arrow keys like Lumi's lantern. Hold the light
// on each sleepy dream creature to find it.

const VB_W = 800;
const VB_H = 400;

interface Creature {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

const CREATURES: Creature[] = [
  { id: 'bunny', name: 'a cloud bunny', x: 130, y: 280, color: '#e3eeff' },
  { id: 'owl', name: 'a dozing owl', x: 330, y: 110, color: '#c9a3d9' },
  { id: 'fox', name: 'a star fox', x: 560, y: 290, color: '#f4c96b' },
  { id: 'whale', name: 'a sky whale', x: 700, y: 120, color: '#a8d8f0' },
];

const CreatureArt: React.FC<{ c: Creature; found: boolean }> = ({ c, found }) => (
  <g transform={`translate(${c.x} ${c.y})`} style={{ transition: 'filter 0.4s' }} filter={found ? 'url(#foundGlow)' : undefined}>
    {c.id === 'bunny' && (
      <>
        <ellipse cx="-8" cy="-26" rx="7" ry="18" fill={c.color} />
        <ellipse cx="8" cy="-26" rx="7" ry="18" fill={c.color} />
        <circle r="24" fill={c.color} />
      </>
    )}
    {c.id === 'owl' && (
      <>
        <path d="M-22 -14 L-14 -30 L-6 -18 Z M22 -14 L14 -30 L6 -18 Z" fill={c.color} />
        <ellipse rx="24" ry="28" fill={c.color} />
        <ellipse cy="10" rx="14" ry="12" fill="#e9d6f0" />
      </>
    )}
    {c.id === 'fox' && (
      <>
        <path d="M-20 -10 L-14 -34 L-2 -16 Z M20 -10 L14 -34 L2 -16 Z" fill={c.color} />
        <circle r="24" fill={c.color} />
        <path d="M24 10 C 50 0, 54 28, 30 26" fill={c.color} />
      </>
    )}
    {c.id === 'whale' && (
      <>
        <ellipse rx="40" ry="22" fill={c.color} />
        <path d="M36 -4 L58 -18 L54 6 Z" fill={c.color} />
        <path d="M-10 -22 C -8 -36, 4 -36, 2 -24" stroke="#e3f4ff" strokeWidth="3" fill="none" />
      </>
    )}
    {/* sleepy face */}
    <path d="M-10 -2 q4 4 8 0 M2 -2 q4 4 8 0" stroke="#3b2a3f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <ellipse cx="-13" cy="6" rx="4" ry="2.5" fill="#f2a2bc" opacity="0.7" />
    <ellipse cx="13" cy="6" rx="4" ry="2.5" fill="#f2a2bc" opacity="0.7" />
    <text x="20" y="-28" fontSize="14" fontFamily="Fredoka, sans-serif" fill="#fff8f1" opacity="0.85">z</text>
    {found && (
      <text y="48" textAnchor="middle" fontSize="13" fontFamily="Georgia, serif" fill="#fff1c2">
        ✦ found!
      </text>
    )}
  </g>
);

export const NightlightSeek: React.FC = () => {
  const { state, lumiSay } = useAtelier();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0.5, y: 0.5 }); // 0..1 within the panel
  const dwell = useRef<{ id: string; since: number } | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [lit, setLit] = useState(false);
  const glow = LANTERN_PALETTE[state.lanternConfig.color]?.hex ?? '#f4c96b';

  const paint = useCallback(() => {
    // Set on the wrapper so the darkness mask and the warm tint both follow the lantern.
    const el = wrapRef.current;
    if (!el) return;
    el.style.setProperty('--lx', `${(pos.current.x * 100).toFixed(2)}%`);
    el.style.setProperty('--ly', `${(pos.current.y * 100).toFixed(2)}%`);
  }, []);

  const check = useCallback(() => {
    const now = performance.now();
    const hit = CREATURES.find((c) => Math.hypot(c.x / VB_W - pos.current.x, (c.y / VB_H - pos.current.y) * 0.5) < 0.06);
    if (!hit || found.includes(hit.id)) {
      dwell.current = null;
      return;
    }
    if (!dwell.current || dwell.current.id !== hit.id) {
      dwell.current = { id: hit.id, since: now };
      return;
    }
    if (now - dwell.current.since > 350) {
      dwell.current = null;
      const next = [...found, hit.id];
      setFound(next);
      playChime(state.isMuted, 660 + next.length * 110);
      if (next.length === CREATURES.length) {
        playSparkle(state.isMuted);
        lumiSay?.('You found every sleepy dream friend! The nightlight never fails.', 'celebrating');
        try {
          confetti({ particleCount: 60, spread: 70, colors: ['#F4C96B', '#D995B7', '#B9A5E8', '#FFF8F1'] });
        } catch {
          // confetti unavailable
        }
      } else {
        lumiSay?.(`Shh, you found ${hit.name}! ${CREATURES.length - next.length} more asleep in the dark.`, 'happy');
      }
    }
  }, [found, lumiSay, state.isMuted]);

  useEffect(() => {
    paint();
  }, [paint]);

  // Keep checking while the light rests on a creature (dwell to find).
  useEffect(() => {
    if (!lit) return;
    const t = window.setInterval(check, 120);
    return () => window.clearInterval(t);
  }, [lit, check]);

  const moveTo = (clientX: number, clientY: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    pos.current = {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    };
    paint();
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = 0.04;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step * 2], ArrowDown: [0, step * 2] };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setLit(true);
    pos.current = { x: Math.min(1, Math.max(0, pos.current.x + m[0])), y: Math.min(1, Math.max(0, pos.current.y + m[1])) };
    paint();
  };

  const reset = () => {
    setFound([]);
    playChime(state.isMuted, 440);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-glow)] shadow-xl flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
            <Flashlight className="w-4 h-4" />
            <span>Nightlight</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-[var(--text-primary)] mt-1">Lantern Hide-and-Seek</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">
            Four dream friends fell asleep in the dark. Your cursor (or finger, or arrow keys) is Lumi's lantern: hold the light on each one to find
            them.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1 rounded-full bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--text-primary)]" aria-live="polite">
            ✦ {found.length}/{CREATURES.length} found
          </span>
          {found.length > 0 && (
            <button type="button" onClick={reset} className="px-3 py-1 rounded-full border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Hide again
            </button>
          )}
        </div>
      </div>

      <div
        ref={wrapRef}
        tabIndex={0}
        role="application"
        aria-label={`Dark dream layer. Move the lantern with the pointer, a finger or the arrow keys. ${found.length} of ${CREATURES.length} dream friends found.`}
        onPointerEnter={() => setLit(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setLit(false)}
        onPointerMove={(e) => moveTo(e.clientX, e.clientY)}
        onPointerDown={(e) => {
          setLit(true);
          moveTo(e.clientX, e.clientY);
        }}
        onKeyDown={onKey}
        onFocus={() => setLit(true)}
        className="relative w-full rounded-2xl overflow-hidden select-none touch-none cursor-none focus-visible:outline-2 focus-visible:outline-[var(--accent-gold)]"
        style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
      >
        {/* The hidden dream mural, revealed by the lantern */}
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id="muralSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a2c6e" />
              <stop offset="1" stopColor="#6a4f9e" />
            </linearGradient>
            <filter id="foundGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width={VB_W} height={VB_H} fill="url(#muralSky)" />
          <circle cx="470" cy="70" r="34" fill="#f4c96b" opacity="0.9" />
          <circle cx="484" cy="62" r="30" fill="#3a2c6e" />
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={(i * 131) % VB_W} cy={(i * 59) % 230} r={i % 4 === 0 ? 2 : 1.2} fill="#fff1c2" opacity="0.8" />
          ))}
          <path d={`M0 ${VB_H} L0 330 C 140 300, 260 350, 400 320 C 540 292, 660 345, ${VB_W} 315 L${VB_W} ${VB_H} Z`} fill="#8f78c8" />
          {[90, 250, 430, 610, 760].map((x, i) => (
            <g key={x} transform={`translate(${x} ${350 + (i % 2) * 14})`}>
              <path d="M0 0 L0 -26" stroke="#bfe3d0" strokeWidth="2.5" />
              <circle cy="-30" r="8" fill={['#f6c1d4', '#f4d58d', '#a8d8f0', '#f6c1d4', '#c9a3d9'][i]} />
            </g>
          ))}
          <text x="400" y="392" textAnchor="middle" fontSize="14" fontFamily="Georgia, serif" fill="#fff1c2" opacity="0.8">
            sweet dreams, little ones
          </text>
          {CREATURES.map((c) => (
            <CreatureArt key={c.id} c={c} found={found.includes(c.id)} />
          ))}
        </svg>

        {/* The darkness, with a lantern-shaped hole cut by a CSS mask */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={
            {
              background: 'radial-gradient(circle at 20% 30%, rgba(255,248,241,0.5) 0 1px, transparent 2px) 0 0 / 90px 70px, #0b0716',
              WebkitMaskImage: `radial-gradient(circle var(--lr, 120px) at var(--lx) var(--ly), transparent 0%, transparent 45%, rgba(0,0,0,0.6) 70%, black 100%)`,
              maskImage: `radial-gradient(circle var(--lr, 120px) at var(--lx) var(--ly), transparent 0%, transparent 45%, rgba(0,0,0,0.6) 70%, black 100%)`,
              opacity: found.length === CREATURES.length ? 0.35 : 1,
              transition: 'opacity 1s',
              ['--lr' as string]: lit ? 'clamp(70px, 14vw, 130px)' : '0px',
            } as React.CSSProperties
          }
        />
        {/* Creatures already found stay glowing above the darkness */}
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          {CREATURES.filter((c) => found.includes(c.id)).map((c) => (
            <CreatureArt key={c.id} c={c} found />
          ))}
        </svg>
        {/* Warm lantern tint at the light's centre */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            background: `radial-gradient(circle clamp(60px, 11vw, 110px) at var(--lx) var(--ly), ${glow}33 0%, transparent 70%)`,
            opacity: lit ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
        {!lit && (
          <div className="absolute inset-0 flex items-center justify-center text-center px-6 pointer-events-none">
            <p className="text-sm font-serif text-[#FFF8F1]/80">Move over the darkness to light Lumi's lantern ✦</p>
          </div>
        )}
      </div>
    </div>
  );
};
