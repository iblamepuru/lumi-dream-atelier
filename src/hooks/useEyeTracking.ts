import { useEffect, useRef, useState, type RefObject } from 'react';

const CENTRED = { x: 0, y: 0 };

interface EyeOffset {
  x: number;
  y: number;
}

/**
 * Bounded pupil tracking. Pupils translate toward the pointer but never more than `maxRadius`
 * SVG units. Pointer events are coalesced into one state update per animation frame.
 * Touch: pupils glance toward the last tap, then drift back to centre.
 */
export function useEyeTracking(
  enabled: boolean = true,
  maxRadius: number = 4
): { targetRef: RefObject<SVGSVGElement | null>; pupilOffset: EyeOffset } {
  const targetRef = useRef<SVGSVGElement | null>(null);
  const [pupilOffset, setPupilOffset] = useState<EyeOffset>({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const resetTimer = useRef<number | null>(null);
  const latest = useRef<EyeOffset>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const schedule = () => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        const next = latest.current;
        setPupilOffset((prev) => (Math.abs(prev.x - next.x) < 0.05 && Math.abs(prev.y - next.y) < 0.05 ? prev : next));
      });
    };

    const handlePointer = (e: PointerEvent) => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Skip work when Lumi is far off-screen
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.5;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 1) {
        latest.current = { x: 0, y: 0 };
      } else {
        const r = Math.min(dist * 0.02, maxRadius);
        latest.current = { x: (dx / dist) * r, y: (dy / dist) * r };
      }
      schedule();

      if (e.pointerType === 'touch') {
        if (resetTimer.current) window.clearTimeout(resetTimer.current);
        resetTimer.current = window.setTimeout(() => {
          latest.current = { x: 0, y: 0 };
          schedule();
        }, 1600);
      }
    };

    window.addEventListener('pointermove', handlePointer, { passive: true });
    window.addEventListener('pointerdown', handlePointer, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('pointerdown', handlePointer);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      rafId.current = null;
    };
  }, [enabled, maxRadius]);

  return { targetRef, pupilOffset: enabled ? pupilOffset : CENTRED };
}
