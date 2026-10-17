import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useAtelier } from '../context/AtelierContext';
import { playGentleNudge, playMusicBoxNote, playSparkle } from '../utils/soundEngine';
import { LumiCharacter } from '../components/LumiCharacter';
import type { LumiMood } from '../types/atelier';
import { Gamepad2, Play, RotateCcw, Trophy, Timer } from 'lucide-react';

const GAME_SECONDS = 40;
const BEST_KEY = 'lumi_catch_best_v1';
const LUMI_SIZE = 64;
const CATCH_HALF_WIDTH = 34;
// Each catch plays the next note of Lumi's lullaby (C-major pentatonic).
const CATCH_MELODY = [659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 783.99, 659.25, 587.33];
const CRYSTAL_COLORS = ['#B9A5E8', '#D995B7', '#93C5FD', '#A7E3E0'];

type Kind = 'crystal' | 'star' | 'cloud';

interface Faller {
  x: number;
  y: number;
  vy: number;
  kind: Kind;
  color: string;
  rot: number;
  vr: number;
  size: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

type Status = 'ready' | 'playing' | 'over';

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

export const CatchTheDreams: React.FC = () => {
  const { state, lumiSay } = useAtelier();
  const [status, setStatus] = useState<Status>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [best, setBest] = useState(readBest);
  const [isNewBest, setIsNewBest] = useState(false);
  const [mood, setMood] = useState<LumiMood>('curious');

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lumiRef = useRef<HTMLDivElement>(null);
  const mutedRef = useRef(state.isMuted);
  const moodTimer = useRef<number | null>(null);

  // Mutable game world lives in a ref so the animation loop never waits on React renders.
  const world = useRef({
    width: 320,
    height: 320,
    lumiX: 160,
    targetX: 160,
    keyDir: 0,
    fallers: [] as Faller[],
    sparks: [] as Spark[],
    score: 0,
    spawnIn: 0,
    elapsed: 0,
    noteIndex: 0,
  });

  useEffect(() => {
    mutedRef.current = state.isMuted;
  }, [state.isMuted]);

  const flashMood = useCallback((next: LumiMood, ms = 450) => {
    setMood(next);
    if (moodTimer.current) window.clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => setMood('focused'), ms);
  }, []);

  useEffect(
    () => () => {
      if (moodTimer.current) window.clearTimeout(moodTimer.current);
    },
    []
  );

  // Keep the canvas sharp and sized to its container.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      const wd = world.current;
      wd.lumiX = Math.min(Math.max(wd.lumiX * (w / (wd.width || w)), CATCH_HALF_WIDTH), w - CATCH_HALF_WIDTH);
      wd.targetX = wd.lumiX;
      wd.width = w;
      wd.height = h;
      if (lumiRef.current) lumiRef.current.style.transform = `translateX(${wd.lumiX - LUMI_SIZE / 2}px)`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const finish = useCallback(() => {
    const final = world.current.score;
    setStatus('over');
    setTimeLeft(0);
    const prevBest = readBest();
    const newBest = final > prevBest;
    setIsNewBest(newBest);
    if (newBest) {
      setBest(final);
      try {
        localStorage.setItem(BEST_KEY, String(final));
      } catch {
        // storage unavailable
      }
      setMood('celebrating');
      playSparkle(mutedRef.current);
      try {
        confetti({ particleCount: 60, spread: 70, colors: ['#F4C96B', '#D995B7', '#B9A5E8', '#FFF8F1'] });
      } catch {
        // confetti unavailable
      }
      lumiSay?.(`${final} dreams caught! That's a new record for Workshop No. 07!`, 'celebrating');
    } else {
      setMood('happy');
      lumiSay?.(`${final} dreams safely caught. Every single one will reach a sleeper tonight.`, 'happy');
    }
  }, [lumiSay]);

  // Main game loop
  useEffect(() => {
    if (status !== 'playing') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let raf = 0;
    let last = performance.now();
    let lastSecond = GAME_SECONDS;

    const spawn = () => {
      const wd = world.current;
      const t = wd.elapsed / GAME_SECONDS;
      const roll = Math.random();
      const kind: Kind = roll < 0.07 ? 'star' : roll < 0.07 + 0.16 + t * 0.12 ? 'cloud' : 'crystal';
      wd.fallers.push({
        x: 20 + Math.random() * (wd.width - 40),
        y: -24,
        vy: (110 + Math.random() * 60) * (1 + t * 0.9) * (kind === 'star' ? 1.25 : 1),
        kind,
        color: kind === 'star' ? '#F4C96B' : kind === 'cloud' ? '#6B6385' : CRYSTAL_COLORS[Math.floor(Math.random() * CRYSTAL_COLORS.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 2.5,
        size: kind === 'cloud' ? 20 : kind === 'star' ? 14 : 11,
      });
      wd.spawnIn = Math.max(0.3, 0.72 - t * 0.42) * (0.7 + Math.random() * 0.6);
    };

    const burst = (x: number, y: number, color: string, count: number) => {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 40 + Math.random() * 110;
        world.current.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.6, color });
      }
    };

    const drawFaller = (f: Faller) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      if (f.kind === 'cloud') {
        // A sleepy grumpy rain cloud
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(-10, 2, 10, 0, Math.PI * 2);
        ctx.arc(0, -4, 13, 0, Math.PI * 2);
        ctx.arc(11, 2, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2A2340';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-6, -2);
        ctx.lineTo(-2, -1);
        ctx.moveTo(6, -2);
        ctx.lineTo(2, -1);
        ctx.moveTo(-3, 5);
        ctx.quadraticCurveTo(0, 3, 3, 5);
        ctx.stroke();
        ctx.strokeStyle = '#93C5FD';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (const dx of [-8, 0, 8]) {
          ctx.moveTo(dx, 12);
          ctx.lineTo(dx - 2, 18);
        }
        ctx.stroke();
      } else {
        ctx.rotate(f.rot);
        ctx.shadowColor = f.color;
        ctx.shadowBlur = f.kind === 'star' ? 18 : 10;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        if (f.kind === 'star') {
          const r = f.size;
          for (let i = 0; i < 8; i++) {
            const rr = i % 2 === 0 ? r : r * 0.38;
            const a = (i * Math.PI) / 4;
            ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
        } else {
          const r = f.size;
          ctx.moveTo(0, -r * 1.3);
          ctx.lineTo(r, 0);
          ctx.lineTo(0, r * 1.3);
          ctx.lineTo(-r, 0);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,248,241,0.6)';
        ctx.beginPath();
        ctx.arc(-f.size * 0.25, -f.size * 0.35, f.size * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      const wd = world.current;
      // Clamp the step so a hidden tab or slow frame never teleports everything.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      wd.elapsed += dt;

      const remaining = Math.max(0, GAME_SECONDS - wd.elapsed);
      const sec = Math.ceil(remaining);
      if (sec !== lastSecond) {
        lastSecond = sec;
        setTimeLeft(sec);
      }
      if (remaining <= 0) {
        finish();
        return;
      }

      // Move Lumi: keyboard steers the target, pointer sets it directly; motion is eased.
      if (wd.keyDir !== 0) wd.targetX += wd.keyDir * 420 * dt;
      wd.targetX = Math.min(Math.max(wd.targetX, CATCH_HALF_WIDTH), wd.width - CATCH_HALF_WIDTH);
      wd.lumiX += (wd.targetX - wd.lumiX) * Math.min(1, dt * 14);
      if (lumiRef.current) lumiRef.current.style.transform = `translateX(${wd.lumiX - LUMI_SIZE / 2}px)`;

      wd.spawnIn -= dt;
      if (wd.spawnIn <= 0) spawn();

      const catchY = wd.height - LUMI_SIZE * 0.75;
      let scoreChanged = false;
      wd.fallers = wd.fallers.filter((f) => {
        f.y += f.vy * dt;
        f.rot += f.vr * dt;
        const inReach = Math.abs(f.x - wd.lumiX) < CATCH_HALF_WIDTH + f.size * 0.5 && f.y > catchY - 14 && f.y < catchY + 22;
        if (inReach) {
          scoreChanged = true;
          if (f.kind === 'cloud') {
            wd.score = Math.max(0, wd.score - 3);
            playGentleNudge(mutedRef.current);
            burst(f.x, f.y, '#6B6385', 8);
            flashMood('sleepy', 600);
          } else {
            wd.score += f.kind === 'star' ? 5 : 1;
            playMusicBoxNote(mutedRef.current, CATCH_MELODY[wd.noteIndex++ % CATCH_MELODY.length] * (f.kind === 'star' ? 2 : 1), 0.12);
            burst(f.x, f.y, f.color, f.kind === 'star' ? 18 : 8);
            if (f.kind === 'star') flashMood('celebrating');
          }
          return false;
        }
        return f.y < wd.height + 30;
      });
      if (scoreChanged) setScore(wd.score);

      wd.sparks = wd.sparks.filter((s) => {
        s.life -= dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 220 * dt;
        return s.life > 0;
      });

      ctx.clearRect(0, 0, wd.width, wd.height);
      wd.fallers.forEach(drawFaller);
      wd.sparks.forEach((s) => {
        ctx.globalAlpha = Math.max(0, s.life / 0.6);
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
      });
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [status, finish, flashMood]);

  // Keyboard steering while a round is running
  useEffect(() => {
    if (status !== 'playing') return;
    const wd = world.current;
    const dirFor = (key: string) =>
      key === 'ArrowLeft' || key === 'a' || key === 'A' ? -1 : key === 'ArrowRight' || key === 'd' || key === 'D' ? 1 : 0;
    const down = (e: KeyboardEvent) => {
      const dir = dirFor(e.key);
      if (!dir) return;
      e.preventDefault();
      wd.keyDir = dir;
    };
    const up = (e: KeyboardEvent) => {
      if (dirFor(e.key) === wd.keyDir) wd.keyDir = 0;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      wd.keyDir = 0;
    };
  }, [status]);

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (status !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    world.current.targetX = e.clientX - rect.left;
  };

  const start = () => {
    const wd = world.current;
    wd.fallers = [];
    wd.sparks = [];
    wd.score = 0;
    wd.elapsed = 0;
    wd.spawnIn = 0.4;
    wd.noteIndex = 0;
    wd.lumiX = wd.width / 2;
    wd.targetX = wd.width / 2;
    canvasRef.current?.getContext('2d')?.clearRect(0, 0, wd.width, wd.height);
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setIsNewBest(false);
    setMood('focused');
    setStatus('playing');
    wrapRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-glow)] shadow-xl flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
            <Gamepad2 className="w-4 h-4" />
            <span>Mini-Game</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-[var(--text-primary)] mt-1">Catch the Falling Dreams</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
            Glide Lumi with your mouse, finger or <kbd className="font-mono">←</kbd> <kbd className="font-mono">→</kbd>. Crystals +1, golden
            stars +5, and dodge the grumpy rain clouds (−3).
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-bold" aria-live="polite">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--text-primary)]">
          ✦ <span>{score} caught</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--text-primary)]">
          <Timer className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
          <span>{timeLeft}s</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
          <Trophy className="w-3.5 h-3.5" />
          <span>Best {best}</span>
        </span>
      </div>

      <div
        ref={wrapRef}
        tabIndex={status === 'playing' ? 0 : -1}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        aria-label="Catch the Falling Dreams play area"
        role="application"
        className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-b from-[#120e20] via-[#221a3a] to-[#3a2c55] border border-[#F4C96B]/30 select-none touch-none focus-visible:outline-2 focus-visible:outline-[var(--accent-gold)]"
      >
        {/* Twinkling backdrop */}
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(1px 1px at 12% 20%, #fff8f1 50%, transparent), radial-gradient(1px 1px at 38% 62%, #fff8f1 50%, transparent), radial-gradient(1.5px 1.5px at 72% 28%, #f4c96b 50%, transparent), radial-gradient(1px 1px at 86% 70%, #fff8f1 50%, transparent), radial-gradient(1px 1px at 55% 12%, #b9a5e8 50%, transparent)',
          }}
        />
        <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

        {/* Lumi rides along the bottom */}
        <div
          ref={lumiRef}
          className="absolute bottom-1 left-0 pointer-events-none will-change-transform"
          style={{ width: LUMI_SIZE, height: LUMI_SIZE }}
          aria-hidden="true"
        >
          <LumiCharacter mood={mood} size={LUMI_SIZE} lanternColor={state.lanternConfig.color} enableEyeTracking={false} />
        </div>

        {status !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#120e20]/70 backdrop-blur-[2px] text-center px-6">
            {status === 'over' ? (
              <>
                <p className="text-[#F4C96B] text-xs font-bold uppercase tracking-widest">
                  {isNewBest ? '★ New record! ★' : 'Sunrise! Round over'}
                </p>
                <p className="text-[#FFF8F1] text-4xl font-serif font-bold">{score}</p>
                <p className="text-[#FFF8F1]/70 text-xs">dreams caught before dawn</p>
              </>
            ) : (
              <p className="text-[#FFF8F1] text-sm font-serif max-w-xs">
                Dreams are tumbling out of the sky! Help Lumi catch as many as you can in {GAME_SECONDS} seconds.
              </p>
            )}
            <button
              type="button"
              onClick={start}
              className="mt-1 px-6 py-2.5 rounded-full font-bold text-xs bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow-md hover:shadow-lg active:scale-95 transition-all inline-flex items-center gap-2"
            >
              {status === 'over' ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{status === 'over' ? 'Play again' : 'Start catching'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
