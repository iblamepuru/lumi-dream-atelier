import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

// A living sky behind the whole page: twinkling stars with a gentle scroll parallax, drifting
// fireflies, and the odd shooting star at night. In Twilight it becomes pastel sparkles and
// rising dream bubbles. One canvas, capped at 30 fps, started only after the page has loaded,
// paused while the tab is hidden, and drawn once (still) when reduced motion is on.

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  hue: number;
}
interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
}
interface Shooter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const NIGHT = { stars: ['#fff8f1', '#fff8f1', '#f4c96b', '#c9b8f5'], mote: [255, 214, 120] as const };
const DAWN = { stars: ['#e0a94a', '#d995b7', '#b9a5e8'], mote: [217, 149, 183] as const };

const makeGlow = (rgb: readonly [number, number, number]) => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${rgb.join(',')},0.95)`);
  grad.addColorStop(0.25, `rgba(${rgb.join(',')},0.45)`);
  grad.addColorStop(1, `rgba(${rgb.join(',')},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
};

export const LiveSky: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let motes: Mote[] = [];
    let shooter: Shooter | null = null;
    let nextShooter = 4;
    let raf = 0;
    let started = false;
    let last = 0;
    const glows = { night: makeGlow(NIGHT.mote), dawn: makeGlow(DAWN.mote) };

    const isDawn = () => document.documentElement.getAttribute('data-theme') === 'twilight';

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = width < 640;
      stars = Array.from({ length: small ? 70 : 140 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 1.6,
        r: 0.4 + Math.random() * 1.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.8,
        hue: Math.floor(Math.random() * 4),
      }));
      motes = Array.from({ length: small ? 9 : 16 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 8,
        r: 8 + Math.random() * 10,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number, dt: number) => {
      const dawn = isDawn();
      const palette = dawn ? DAWN : NIGHT;
      ctx.clearRect(0, 0, width, height);

      // Stars, with a gentle parallax so they drift as the page scrolls
      const parallax = window.scrollY * 0.06;
      for (const s of stars) {
        const y = (((s.y - parallax) % (height * 1.6)) + height * 1.6) % (height * 1.6);
        if (y > height) continue;
        const twinkle = reducedMotion ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.globalAlpha = (dawn ? 0.5 : 0.9) * twinkle;
        ctx.fillStyle = palette.stars[s.hue % palette.stars.length];
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fireflies by night, dream bubbles rising at dawn
      const glow = dawn ? glows.dawn : glows.night;
      for (const m of motes) {
        if (!reducedMotion) {
          m.vx += Math.sin(t * 0.7 + m.phase) * 0.15;
          m.vy += Math.cos(t * 0.5 + m.phase) * 0.12 - (dawn ? 0.08 : 0);
          m.vx *= 0.985;
          m.vy *= 0.985;
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          if (m.x < -30) m.x = width + 30;
          if (m.x > width + 30) m.x = -30;
          if (m.y < -30) m.y = height + 30;
          if (m.y > height + 30) m.y = -30;
        }
        const pulse = reducedMotion ? 0.6 : 0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + m.phase));
        ctx.globalAlpha = (dawn ? 0.45 : 0.75) * pulse;
        ctx.drawImage(glow, m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
      }

      // Occasional shooting star (night only)
      if (!dawn && !reducedMotion) {
        if (!shooter && t > nextShooter) {
          shooter = { x: Math.random() * width * 0.7, y: Math.random() * height * 0.35, vx: 520 + Math.random() * 260, vy: 190 + Math.random() * 90, life: 1 };
          nextShooter = t + 7 + Math.random() * 7;
        }
        if (shooter) {
          shooter.x += shooter.vx * dt;
          shooter.y += shooter.vy * dt;
          shooter.life -= dt * 1.2;
          const tail = ctx.createLinearGradient(shooter.x, shooter.y, shooter.x - shooter.vx * 0.22, shooter.y - shooter.vy * 0.22);
          tail.addColorStop(0, 'rgba(255,248,241,0.95)');
          tail.addColorStop(1, 'rgba(255,248,241,0)');
          ctx.globalAlpha = Math.max(0, shooter.life);
          ctx.strokeStyle = tail;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(shooter.x, shooter.y);
          ctx.lineTo(shooter.x - shooter.vx * 0.22, shooter.y - shooter.vy * 0.22);
          ctx.stroke();
          if (shooter.life <= 0) shooter = null;
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      raf = 0;
      // 30 fps is plenty for a drifting sky and keeps phones cool.
      if (now - last >= 33) {
        const dt = Math.min(0.1, (now - last) / 1000 || 0.033);
        last = now;
        draw(now / 1000, dt);
      }
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (started) return;
      started = true;
      seed();
      if (reducedMotion) {
        draw(0, 0);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => {
      if (started && !reducedMotion && !document.hidden && !raf) raf = requestAnimationFrame(loop);
    };
    const onResize = () => {
      if (!started) return;
      seed();
      if (reducedMotion) draw(0, 0);
    };
    const onScroll = () => {
      if (started && reducedMotion) draw(0, 0);
    };

    // Wait until the page has loaded and settled so first paint stays fast.
    let delay = 0;
    let idle = 0;
    const kickoff = () => {
      delay = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(start, { timeout: 2500 });
        else start();
      }, 2500);
    };
    if (document.readyState === 'complete') kickoff();
    else window.addEventListener('load', kickoff, { once: true });

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(delay);
      if (idle) window.cancelIdleCallback(idle);
      window.removeEventListener('load', kickoff);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none" />;
};
