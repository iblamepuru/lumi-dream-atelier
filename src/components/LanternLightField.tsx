import React, { useEffect, useRef } from 'react';
import { useAtelier } from '../context/AtelierContext';

export const LanternLightField: React.FC = () => {
  const { state } = useAtelier();
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--cursor-x', `${clientX}px`);
          document.documentElement.style.setProperty('--cursor-y', `${clientY}px`);
          rafId.current = null;
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchstart', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchstart', handlePointerMove);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, []);

  // Intensity is higher in midnight mode to create deep ambient immersion
  const opacity = state.theme === 'midnight' ? 0.22 : 0.12;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-700"
      style={{
        background: `radial-gradient(650px circle at var(--cursor-x, 50vw) var(--cursor-y, 50vh), rgba(244, 201, 107, ${opacity}), transparent 70%)`,
      }}
    />
  );
};
