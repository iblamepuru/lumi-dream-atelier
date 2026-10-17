import React, { useEffect, useRef } from 'react';
import { useAtelier } from '../context/AtelierContext';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
}

const PALETTE = [
  '#F4C96B', // Gold
  '#FFE699', // Pale Gold
  '#D995B7', // Rose
  '#B9A5E8', // Lavender
  '#93C5FD', // Ice Blue
  '#FFFFFF', // Starlight White
];

export const SparkleTrail: React.FC = () => {
  const { prefs } = useAtelier();
  const prefersReduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isEnabled = prefs.sparkleTrail && !prefersReduced && !prefs.forceReducedMotion;

  useEffect(() => {
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let lastX = -100;
    let lastY = -100;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const spawnStar = (x: number, y: number) => {
      const count = Math.floor(Math.random() * 2) + 1; // 1-2 particles per move tick
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.2 + 0.3;
        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.3, // slight upward float
          size: Math.random() * 3.5 + 2,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          alpha: 1,
          decay: Math.random() * 0.025 + 0.02,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.1,
        });
      }
      if (particles.length > 70) {
        particles.splice(0, particles.length - 70);
      }
    };

    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist > 8) {
        lastX = e.clientX;
        lastY = e.clientY;
        spawnStar(e.clientX, e.clientY);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Draw 4-point sparkle star
    const drawSparkle = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rot: number,
      color: string,
      alpha: number
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.globalAlpha = Math.max(0, alpha);
      c.fillStyle = color;
      c.shadowColor = color;
      c.shadowBlur = 4;

      c.beginPath();
      // 4-point star path
      for (let i = 0; i < 4; i++) {
        c.lineTo(Math.cos((i * Math.PI) / 2) * size, Math.sin((i * Math.PI) / 2) * size);
        c.lineTo(
          Math.cos((i * Math.PI) / 2 + Math.PI / 4) * (size * 0.28),
          Math.sin((i * Math.PI) / 2 + Math.PI / 4) * (size * 0.28)
        );
      }
      c.closePath();
      c.fill();
      c.restore();
    };

    let lastTime = performance.now();
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;
        p.alpha -= p.decay * dt;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        drawSparkle(ctx, p.x, p.y, p.size, p.rotation, p.color, p.alpha);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(animId);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-40 select-none"
    />
  );
};
